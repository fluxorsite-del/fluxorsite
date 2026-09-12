import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const browser=await chromium.launch({headless:true,channel:process.env.PLAYWRIGHT_CHANNEL==='chromium'?undefined:(process.env.PLAYWRIGHT_CHANNEL||'chrome')});
const url=process.env.FLUXOR_TEST_URL||'http://127.0.0.1:5173';
try {
  const page=await browser.newPage({viewport:{width:2560,height:1080}});
  await page.goto(url,{waitUntil:'networkidle'});
  await page.waitForTimeout(1200);
  const firstFold=await page.evaluate(()=>({
    heroHeight:document.querySelector('.hero').getBoundingClientRect().height,
    wordWidth:document.querySelector('.hero-word').getBoundingClientRect().width,
    studioTop:document.querySelector('#studio').getBoundingClientRect().top,
    viewportWidth:innerWidth,viewportHeight:innerHeight
  }));
  assert.equal(firstFold.heroHeight,firstFold.viewportHeight);
  assert.ok(firstFold.wordWidth>firstFold.viewportWidth*.9,'Wordmark should dominate the first fold');
  assert.ok(firstFold.studioTop>=firstFold.viewportHeight,'Next section entered the first fold');
  await page.evaluate(()=>scrollTo(0,700));
  await page.reload({waitUntil:'networkidle'});
  await page.waitForTimeout(100);
  assert.equal(await page.evaluate(()=>scrollY),0,'Direct preview should reopen at the top of the hero');
  const intro=page.locator('.hero-intro > p');
  const firstButton=page.locator('.hero-actions a').first();
  const beforeButton=await firstButton.evaluate(el=>({color:getComputedStyle(el).color,background:getComputedStyle(el).backgroundColor}));
  assert.deepEqual(beforeButton,{color:'rgb(17, 17, 15)',background:'rgba(0, 0, 0, 0)'});
  assert.equal(await intro.evaluate(el=>getComputedStyle(el).color),'rgb(17, 17, 15)');
  await firstButton.hover();
  await page.waitForTimeout(250);
  assert.deepEqual(await firstButton.evaluate(el=>({color:getComputedStyle(el).color,background:getComputedStyle(el).backgroundColor,border:getComputedStyle(el).borderColor})),{
    color:'rgb(17, 17, 15)',background:'rgb(255, 255, 255)',border:'rgb(255, 255, 255)'
  });
  const introBox=await intro.boundingBox();
  await page.mouse.move(introBox.x+introBox.width+75,introBox.y+introBox.height/2);
  await page.waitForTimeout(250);
  assert.equal(await intro.evaluate(el=>getComputedStyle(el).color),'rgb(255, 255, 255)');
  const buttonBox=await firstButton.boundingBox();
  await page.mouse.move(buttonBox.x+buttonBox.width+55,buttonBox.y+buttonBox.height/2);
  await page.waitForTimeout(50);
  assert.deepEqual(await firstButton.evaluate(el=>({color:getComputedStyle(el).color,background:getComputedStyle(el).backgroundColor,border:getComputedStyle(el).borderColor})),{
    color:'rgb(17, 17, 15)',background:'rgb(255, 255, 255)',border:'rgb(255, 255, 255)'
  });
  // No browser-focus change or click is performed before revealing each edge.
  for(const [x,y] of [[12,140],[2548,140],[12,950],[2548,950],[1280,540]]) {
    await page.mouse.move(x,y);
    const alpha=await page.locator('.video-reveal').evaluate((canvas,[x,y])=>new Promise(resolve=>requestAnimationFrame(()=>{
      const gl=canvas.getContext('webgl'), rect=canvas.getBoundingClientRect(), pixel=new Uint8Array(4);
      gl.readPixels(Math.floor((x-rect.left)/rect.width*canvas.width),Math.floor((rect.bottom-y)/rect.height*canvas.height),1,1,gl.RGBA,gl.UNSIGNED_BYTE,pixel);
      resolve(pixel[3]);
    })),[x,y]);
    assert.ok(alpha>180,`No fluid at ${x},${y}: alpha ${alpha}`);
  }
  await page.waitForTimeout(2000);
  assert.ok(await page.locator('.paint-source').evaluate(video=>video.paused),'Idle renderer should pause video');
  await page.locator('.video-reveal').evaluate(canvas=>canvas.getContext('webgl').getExtension('WEBGL_lose_context').loseContext());
  await page.waitForFunction(()=>document.querySelector('.paint-stage').classList.contains('is-fallback'));
  await page.mouse.move(640,450);
  assert.ok(await page.locator('.paint-stage').evaluate(el=>el.classList.contains('is-active')));
  await page.close();

  // Some ultrawide Windows setups expose `prefers-reduced-motion: reduce` even
  // when the user expects the full desktop experience. Large/wide viewports
  // must keep the hero mask, horizontal chapters and scroll-driven meteor.
  const ultrawideReduced=await browser.newPage({
    viewport:{width:2560,height:1080},
    reducedMotion:'reduce'
  });
  await ultrawideReduced.goto(url,{waitUntil:'networkidle'});
  await ultrawideReduced.waitForTimeout(1200);
  assert.equal(await ultrawideReduced.locator('.video-reveal').getAttribute('data-renderer'),'webgl');
  assert.equal(await ultrawideReduced.locator('.company-track').evaluate(el=>getComputedStyle(el).display),'flex');
  const company=ultrawideReduced.locator('.company-intro');
  await company.evaluate(el=>scrollTo(0,scrollY+el.getBoundingClientRect().top+(el.offsetHeight-innerHeight)*.58));
  await ultrawideReduced.waitForTimeout(250);
  assert.notEqual(await company.evaluate(el=>getComputedStyle(el).getPropertyValue('--chapter-x').trim()),'0vw');
  const meteor=ultrawideReduced.locator('.meteor-scroll');
  await meteor.evaluate(el=>scrollTo(0,scrollY+el.getBoundingClientRect().top+(el.offsetHeight-innerHeight)*.24));
  await ultrawideReduced.waitForTimeout(500);
  const meteorFrameStart=Number(await meteor.getAttribute('data-frame'));
  await meteor.evaluate(el=>scrollTo(0,scrollY+el.getBoundingClientRect().top+(el.offsetHeight-innerHeight)*.72));
  await ultrawideReduced.waitForTimeout(500);
  const meteorFrameEnd=Number(await meteor.getAttribute('data-frame'));
  assert.ok(Number.isFinite(meteorFrameStart)&&Number.isFinite(meteorFrameEnd)&&meteorFrameEnd>meteorFrameStart,
    `Ultrawide meteor remained static: ${meteorFrameStart} -> ${meteorFrameEnd}`);
  await ultrawideReduced.close();

  const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  await mobile.addInitScript(()=>{
    window.__blockHeroPlay=true;
    const play=HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play=function(){return this.classList.contains('paint-source')&&window.__blockHeroPlay?Promise.reject(new DOMException('Autoplay blocked','NotAllowedError')):play.call(this);};
  });
  await mobile.goto(url,{waitUntil:'networkidle'});
  await mobile.waitForTimeout(1000);
  assert.ok(await mobile.getByRole('button',{name:'Reproduzir animação'}).isVisible());
  await mobile.evaluate(()=>{window.__blockHeroPlay=false;});
  await mobile.getByRole('button',{name:'Reproduzir animação'}).click();
  await mobile.waitForFunction(()=>!document.querySelector('.paint-source').paused);
  await mobile.locator('.services').scrollIntoViewIfNeeded();
  await mobile.waitForFunction(()=>document.querySelector('.paint-source').paused);
  await mobile.close();
  console.log('Hero: fullscreen reveal, ultrawide reduced-motion override, horizontal chapters, meteor animation, context fallback and mobile autoplay passed.');
} finally { await browser.close(); }
