import { chromium } from 'playwright';
import sharp from 'sharp';
import pixelmatch from 'pixelmatch';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';

const update = process.argv.includes('--update');
const selectedWidths = process.env.FLUXOR_TEST_WIDTHS?.split(',').map(Number);
const url = process.env.FLUXOR_TEST_URL || 'http://127.0.0.1:5173';
const browser = await chromium.launch({ headless: true, channel: process.env.PLAYWRIGHT_CHANNEL === 'chromium' ? undefined : (process.env.PLAYWRIGHT_CHANNEL || 'chrome') });
const failures = [], results = [];
await fs.mkdir('artifacts/qa', { recursive: true });
await fs.mkdir('tests/visual-baselines', { recursive: true });
async function check(label, fn) {
  try { await fn(); results.push(label); }
  catch (error) { failures.push(`${label}: ${error.message}`); console.error('FAIL', label, error.message); }
}
async function snapshot(page, name) {
  await page.mouse.move(-20,-20);
  await page.evaluate(async () => {
    await document.fonts.ready;
    document.querySelectorAll('video').forEach(video => { video.pause(); video.style.visibility = 'hidden'; });
  });
  const buffer = await sharp(await page.screenshot({ animations: 'disabled' })).resize({ width: Math.min(1440,page.viewportSize().width) }).png().toBuffer();
  await fs.writeFile(`artifacts/qa/${name}.png`, buffer);
  const baseline = `tests/visual-baselines/${name}.png`;
  if (update) { await fs.writeFile(baseline, buffer); return; }
  const before = await sharp(baseline).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const after = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  assert.equal(after.info.width, before.info.width); assert.equal(after.info.height, before.info.height);
  const diff = Buffer.alloc(after.data.length);
  const pixels = pixelmatch(before.data,after.data,diff,after.info.width,after.info.height,{ threshold: .15 });
  if (pixels / (after.info.width*after.info.height) > .015) {
    await sharp(diff,{raw:{width:after.info.width,height:after.info.height,channels:4}}).png().toFile(`artifacts/qa/${name}-diff.png`);
    throw new Error(`Visual difference ${(100*pixels/(after.info.width*after.info.height)).toFixed(2)}%`);
  }
}
async function scrollSection(page, selector, progress=0) {
  await page.locator(selector).evaluate((el,p) => scrollTo({top:scrollY+el.getBoundingClientRect().top + p*Math.max(0,el.offsetHeight-innerHeight),behavior:'instant'}), progress);
  await page.waitForTimeout(850);
}
async function bounds(page, selector) {
  return page.locator(selector).evaluateAll(elements => elements.map(el => {
    const range=document.createRange();range.selectNodeContents(el);
    const r=range.getBoundingClientRect();
    return { text:el.textContent.slice(0,80),left:r.left,right:r.right,scroll:el.scrollWidth,width:el.clientWidth };
  }).filter(r => r.left < -2 || r.right > innerWidth+2 || r.scroll > r.width+2));
}

try {
  for (const [width,height] of [[360,640],[360,800],[390,844],[540,900],[541,900],[768,1024],[900,900],[901,900],[1440,900],[1920,1080],[2560,1080],[3440,1440]].filter(([width])=>!selectedWidths||selectedWidths.includes(width))) {
    const name=`${width}x${height}`, mobile=width<=900;
    const context=await browser.newContext({ viewport:{width,height}, deviceScaleFactor:1, hasTouch:mobile, isMobile:mobile });
    const page=await context.newPage(), errors=[];
    page.on('pageerror', error=>errors.push(error.message));
    await page.goto(url,{waitUntil:'networkidle'});
    await page.waitForTimeout(1200);
    await check(`${name} hero contract`,async()=>{
      const state=await page.evaluate(()=>{
        const v=document.querySelector('.paint-source'), stage=document.querySelector('.paint-stage');
        return { bg:getComputedStyle(document.querySelector('.hero')).backgroundColor, display:getComputedStyle(document.querySelector('.hero-stage')).display,
          src:v.currentSrc, paused:v.paused, loop:v.loop, muted:v.muted, inline:v.playsInline, renderer:stage.querySelector('canvas').dataset.renderer,
          canvas:stage.getBoundingClientRect().toJSON(), hero:document.querySelector('.hero').getBoundingClientRect().toJSON(), headings:document.querySelectorAll('h1').length };
      });
      assert.equal(state.headings,1);
      assert.equal(state.bg,mobile?'rgb(0, 0, 0)':'rgb(242, 240, 235)');
      assert.equal(state.display==='none',mobile);
      assert.equal(state.canvas.width,state.hero.width);assert.equal(state.canvas.height,state.hero.height);
      if(mobile){ assert.match(state.src,/hero-mobile/);assert.equal(state.paused,false);assert.ok(state.loop&&state.muted&&state.inline); }
      else {
        assert.equal(state.renderer,'webgl');assert.equal(state.paused,true);
        const meta=await page.locator('.hero-index').boundingBox(), contact=await page.locator('.whatsapp-float').boundingBox();
        assert.ok(meta.x+meta.width<contact.x,'Floating contact covers hero metadata');
      }
    });
    if(mobile) await check(`${name} autoplay and loop`,async()=>{
      const time=await page.locator('.paint-source').evaluate(v=>v.currentTime);
      await page.waitForTimeout(350);
      assert.notEqual(await page.locator('.paint-source').evaluate(v=>v.currentTime),time);
      await page.locator('.paint-source').evaluate(v=>{v.currentTime=v.duration-.15;});
      await page.waitForFunction(()=>document.querySelector('.paint-source').currentTime<1);
    });
    else await check(`${name} hover contrast`,async()=>{
      for(const selector of ['.brand','.hero-intro > p','.hero-meta p:first-child']){
        await page.locator(selector).hover();
        await page.waitForTimeout(250);
        assert.equal(await page.locator(selector).evaluate(el=>getComputedStyle(el).color),'rgb(255, 255, 255)');
      }
      const maskButton=page.locator('.hero-actions a:first-child');
      await maskButton.hover();
      await page.waitForTimeout(250);
      assert.deepEqual(await maskButton.evaluate(el=>({color:getComputedStyle(el).color,background:getComputedStyle(el).backgroundColor})),{
        color:'rgb(17, 17, 15)',background:'rgb(255, 255, 255)'
      });
      await page.mouse.move(width-5,height-5);
      await page.waitForTimeout(2000);
    });
    await check(`${name} menu keyboard`,async()=>{
      await page.getByRole('button',{name:'Abrir menu'}).click();
      await page.waitForTimeout(950);
      assert.ok(await page.locator('main').evaluate(el=>el.inert));
      for(let i=0;i<12;i++){
        await page.keyboard.press('Tab');
        assert.ok(await page.evaluate(()=>!!document.activeElement.closest('.nav')));
      }
      await page.keyboard.press('Escape');
      assert.equal(await page.evaluate(()=>document.activeElement.className),'menu-toggle');
      assert.equal(await page.locator('main').evaluate(el=>el.inert),false);
    });
    await page.mouse.move(0,0);
    await page.waitForTimeout(2000);
    await check(`${name} hero visual`,()=>snapshot(page,`${name}-hero`));
    await scrollSection(page,'.case-studies');
    await check(`${name} contextual cards`,async()=>{
      assert.equal(await page.locator('.case-card').count(),3);
      assert.deepEqual(await bounds(page,'.case-card-copy h3,.case-card-copy dd'),[]);
      for(const card of await page.locator('.case-card').all()) assert.equal(await card.locator('dd').count(),3);
    });
    await check(`${name} cases visual`,()=>snapshot(page,`${name}-cases`));
    await check(`${name} project modal`,async()=>{
      const link=page.locator('.case-card').first();await link.click();
      assert.ok(await page.getByRole('dialog').isVisible());
      assert.equal(await page.getByRole('dialog').locator('h2').textContent(),'Véu');
      await page.keyboard.press('Escape');
      assert.equal(await page.getByRole('dialog').count(),0);
      assert.ok(await link.evaluate(el=>el===document.activeElement));
    });
    await scrollSection(page,'.services');
    await check(`${name} service words`,async()=>assert.deepEqual(await bounds(page,'.service-heading-word'),[]));
    await scrollSection(page,'.pricing');
    await check(`${name} pricing cards`,async()=>{
      assert.equal(await page.locator('.pricing-card').count(),3);
      assert.deepEqual(await bounds(page,'.pricing-card h3,.pricing-card > p,.pricing-card li,.pricing-card > a span'),[]);
      for(const card of await page.locator('.pricing-card').all()){
        const spacing=await card.evaluate(el=>{
          const last=el.querySelector('li:last-child').getBoundingClientRect();
          const cta=el.querySelector(':scope > a').getBoundingClientRect();
          const box=el.getBoundingClientRect();
          return {gap:cta.top-last.bottom,inside:cta.bottom<=box.bottom+1};
        });
        assert.ok(spacing.gap>=24,`Pricing CTA too close to feature list: ${spacing.gap}px`);
        assert.ok(spacing.inside,'Pricing CTA leaves card bounds');
      }
    });
    await scrollSection(page,'.digital-evolution-outro');
    if(mobile) await check(`${name} mobile reading`,async()=>{
      assert.deepEqual(await bounds(page,'.digital-evolution-outro-copy p'),[]);
      const section=await page.locator('.digital-evolution-outro').boundingBox();
      const cta=await page.locator('.digital-evolution-cta').boundingBox();
      assert.ok(cta.y+cta.height<section.y+section.height,'Reading content cropped');
    });
    await scrollSection(page,'.meteor-scroll',.5);
    await check(`${name} meteor cache`,async()=>{
      assert.ok(Number(await page.locator('.meteor-scroll').getAttribute('data-cached-frames'))<=18);
      if(mobile){
        const title=await page.locator('.meteor-scroll__title').boundingBox(), canvas=await page.locator('.meteor-scroll__canvas').boundingBox();
        assert.ok(title.y+title.height<=canvas.y+2,'Meteor overlaps mobile title');
      }
    });
    await check(`${name} meteor visual`,()=>snapshot(page,`${name}-meteor`));
    for(const progress of [.05,.5,.95]){
      await scrollSection(page,'.scroll-synced',progress);
      await check(`${name} chapter ${progress} text`,async()=>{
        const index=await page.locator('.scroll-synced').getAttribute('data-active');
        assert.deepEqual(await bounds(page,`.scroll-synced-chapter[data-index="${index}"] h2`),[]);
      });
    }
    await check(`${name} last chapter visual`,()=>snapshot(page,`${name}-chapter`));
    await scrollSection(page,'.contact');
    await check(`${name} footer layout`,async()=>{
      assert.deepEqual(await bounds(page,'.contact h2,.contact-mail span'),[]);
      assert.ok(await page.locator('.footer-doodle').count()>=5);
      assert.ok(await page.locator('.footer-doodle-fine,.footer-doodle-orbit,.footer-doodle-node').count()>=10);
    });
    await check(`${name} footer visual`,()=>snapshot(page,`${name}-footer`));
    await check(`${name} console`,async()=>assert.deepEqual(errors,[]));
    await context.close();
    console.log('Checked',name);
  }
  for(const width of [390,1440]){
    const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
    await page.goto(url,{waitUntil:'networkidle'});
    await check(`${width} reduced motion`,async()=>{
      assert.ok(await page.locator('.paint-source').evaluate(v=>v.paused));
      await scrollSection(page,'.digital-evolution');
      assert.ok(await page.locator('.scroll-expand__media').evaluate(v=>v.paused));
      await scrollSection(page,'.scroll-synced');
      assert.deepEqual(await page.locator('.scroll-synced-chapter').evaluateAll(els=>els.map(el=>getComputedStyle(el).opacity)),['1','1','1']);
    });
    await page.close();
  }
  const fallbackPage=await browser.newPage({viewport:{width:1440,height:900}});
  await fallbackPage.addInitScript(()=>{
    const get=HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext=function(type,...args){return this.classList.contains('video-reveal')&&type==='webgl'?null:get.call(this,type,...args);};
  });
  await fallbackPage.goto(url,{waitUntil:'networkidle'});
  await check('WebGL unavailable fallback',async()=>{
    await fallbackPage.mouse.move(600,450);
    await fallbackPage.waitForTimeout(100);
    assert.ok(await fallbackPage.locator('.paint-stage').evaluate(el=>el.classList.contains('is-fallback')&&el.classList.contains('is-active')));
  });
  await fallbackPage.close();
} finally {
  await browser.close();
  await fs.writeFile('artifacts/qa/results.json',JSON.stringify({date:new Date().toISOString(),passed:results.length,failures},null,2));
}
console.log(`${results.length} passed; ${failures.length} failed.`);
if(failures.length)process.exitCode=1;
