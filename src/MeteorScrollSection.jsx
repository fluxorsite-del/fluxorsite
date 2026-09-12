import React, { useEffect, useRef } from 'react';
import useMediaQuery from './useMediaQuery';
import './MeteorScrollSection.css';

const ordered = modules => Object.entries(modules).sort(([a],[b]) => a.localeCompare(b)).map(([,url]) => url);
const desktopFrames = ordered(import.meta.glob('./meteor-desktop/*.webp', { eager: true, query: '?url', import: 'default' }));
const mobileFrames = ordered(import.meta.glob('./meteor-mobile/*.webp', { eager: true, query: '?url', import: 'default' }));
const clamp = n => Math.max(0, Math.min(1,n));

export default function MeteorScrollSection() {
  const sectionRef = useRef(null), canvasRef = useRef(null), textRef = useRef(null);
  const mobile = useMediaQuery('(max-width: 900px)');
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const frames = mobile ? mobileFrames : desktopFrames;

  useEffect(() => {
    const section = sectionRef.current, canvas = canvasRef.current, text = textRef.current;
    const context = canvas.getContext('2d', { alpha: true });
    const cache = new Map(), loading = new Map();
    let active = false, disposed = false, raf = 0, wanted = 0, displayed = -1;
    const draw = index => {
      const image = cache.get(index);
      if (!image) return false;
      const scale = Math.min(canvas.width/image.naturalWidth, canvas.height/image.naturalHeight) * (mobile ? 2.4 : 1);
      const w = image.naturalWidth*scale, h = image.naturalHeight*scale;
      context.clearRect(0,0,canvas.width,canvas.height);
      context.drawImage(image,(canvas.width-w)/2+(mobile?0:canvas.width*.2),(canvas.height-h)/2,w,h);
      displayed = index;
      return true;
    };
    const prune = () => {
      for (const index of cache.keys()) if (Math.abs(index-wanted)>8 && index!==displayed) cache.delete(index);
      section.dataset.cachedFrames = String(cache.size);
    };
    const load = index => {
      if (disposed || index<0 || index>=frames.length || cache.has(index) || loading.has(index) || loading.size>=6) return;
      const image = new Image();
      loading.set(index,image); image.decoding = 'async';
      image.onload = () => {
        loading.delete(index);
        if (disposed) return;
        cache.set(index,image);
        if (index===wanted || displayed<0) draw(index);
        prune();
        if (active) request();
      };
      image.onerror = () => { loading.delete(index); };
      image.src = frames[index];
    };
    const render = () => {
      raf = 0;
      if (!active || disposed) return;
      const rect = section.getBoundingClientRect();
      const progress = reduced ? .45 : clamp(-rect.top/Math.max(1,section.offsetHeight-innerHeight));
      wanted = Math.round(progress*(frames.length-1));
      section.dataset.frame = String(wanted);
      load(wanted);
      if (!reduced) for (let offset=1;offset<=4;offset++) { load(wanted+offset);load(wanted-offset); }
      if (!draw(wanted) && cache.size) draw([...cache.keys()].sort((a,b)=>Math.abs(a-wanted)-Math.abs(b-wanted))[0]);
      prune();
      const entrance = mobile||reduced ? 1 : clamp((progress-.16)/.28);
      const exit = mobile||reduced ? 0 : clamp((progress-.88)/.11);
      text.style.opacity = String(entrance*(1-exit));
      text.style.transform = `translateY(${(1-entrance)*80-exit*46}px)`;
      section.style.setProperty('--meteor-progress',String(progress));
    };
    function request() { if (active && !raf) raf=requestAnimationFrame(render); }
    const resize = () => {
      const r=canvas.getBoundingClientRect();
      const dpr=Math.min(devicePixelRatio||1,mobile?1:1.5,Math.sqrt(3200000/Math.max(1,r.width*r.height)));
      canvas.width=Math.max(1,Math.round(r.width*dpr));canvas.height=Math.max(1,Math.round(r.height*dpr));
      draw(displayed);request();
    };
    const observer=new IntersectionObserver(([entry])=>{
      active=entry.isIntersecting;
      if(active) request();
      else {cancelAnimationFrame(raf);raf=0;}
    },{rootMargin:'50% 0px'});
    const resizer=new ResizeObserver(resize);
    observer.observe(section);resizer.observe(canvas);resize();
    if(!reduced) addEventListener('scroll',request,{passive:true});
    return ()=>{
      disposed=true;cancelAnimationFrame(raf);observer.disconnect();resizer.disconnect();
      removeEventListener('scroll',request);
      loading.forEach(image=>{image.onload=null;image.onerror=null;});loading.clear();cache.clear();
    };
  },[frames,mobile,reduced]);

  return <section ref={sectionRef} className="meteor-scroll" aria-labelledby="meteor-title">
    <div className="meteor-scroll__sticky">
      <canvas ref={canvasRef} className="meteor-scroll__canvas" aria-hidden="true" />
      <div className="meteor-scroll__shade" aria-hidden="true" />
      <div className="meteor-scroll__label section-label"><span>04.2</span><span>IDENTIDADE EM MOVIMENTO</span></div>
      <h2 ref={textRef} id="meteor-title" className="meteor-scroll__title">Moldamos uma identidade de marca completa, feita para transmitir confiança e presença.</h2>
      <span className="meteor-scroll__counter" aria-hidden="true">001 — {String(frames.length).padStart(3,'0')}</span>
    </div>
  </section>;
}
