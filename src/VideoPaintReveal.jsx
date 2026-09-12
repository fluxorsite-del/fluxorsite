import React, { useEffect, useRef, useState } from "react";
import useMediaQuery from "./useMediaQuery";
import createFluidRenderer from "./fluid/createFluidRenderer";
import desktopVideo from "./assets/hero-liquid-optimized.mp4";
import mobileVideo from "./assets/hero-mobile.mp4";
import poster from "./assets/hero-mobile-poster.webp";

export default function VideoPaintReveal() {
  const mobile = useMediaQuery("(max-width: 900px)");
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const wrapRef = useRef(null), videoRef = useRef(null), canvasRef = useRef(null);
  const [fallback, setFallback] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const wrap=wrapRef.current, video=videoRef.current, canvas=canvasRef.current;
    const hero=wrap.closest(".hero"), shell=hero.closest(".hero-transition-shell");
    let disposed=false, visible=true, frame=0, fluid=null, lastInput=0, lastPointer=null;
    const contrastNodes=[...shell.querySelectorAll("[data-mask-contrast]")];
    const contrastTimers=new Map();
    let moving=false;
    const play=()=>{
      if(disposed||reduced||!visible||document.hidden) return;
      video.muted=true;
      video.play().then(()=>{if(!disposed)setBlocked(false);}).catch(()=>{if(!disposed&&mobile)setBlocked(true);});
    };
    const tick=now=>{
      frame=0;
      if(!visible||document.hidden||!fluid) return;
      fluid.render(now);
      if(now-lastInput<1800) frame=requestAnimationFrame(tick);
      else {fluid.clear();video.pause();}
    };
    const wake=()=>{
      play();
      if(fluid&&!frame) frame=requestAnimationFrame(tick);
    };
    const size=()=>{
      fluid?.resize(wrap.clientWidth,wrap.clientHeight);
    };
    if(!mobile&&!reduced&&!fallback){
      try{fluid=createFluidRenderer(canvas,video);canvas.dataset.renderer="webgl";size();}
      catch {setFallback(true);}
    }
    const move=e=>{
      if(mobile||reduced||!visible||e.target.closest(".menu-panel,.menu-toggle")) return;
      const rect=wrap.getBoundingClientRect();
      if(e.clientY<rect.top||e.clientY>rect.bottom) return;
      const x=(e.clientX-rect.left)/rect.width, y=(e.clientY-rect.top)/rect.height;
      const reach=Math.max(92,Math.min(150,Math.min(rect.width,rect.height)*.14));
      contrastNodes.forEach(node=>{
        const box=node.getBoundingClientRect();
        const dx=Math.max(box.left-e.clientX,0,e.clientX-box.right);
        const dy=Math.max(box.top-e.clientY,0,e.clientY-box.bottom);
        if(Math.hypot(dx,dy)>reach) return;
        node.classList.add("is-in-mask");
        clearTimeout(contrastTimers.get(node));
        contrastTimers.set(node,setTimeout(()=>node.classList.remove("is-in-mask"),1500));
      });
      const previous=lastPointer||[x,y];
      fluid?.move(x,y,x-previous[0],y-previous[1]);
      lastPointer=[x,y];lastInput=performance.now();moving=true;
      wrap.style.setProperty("--pointer-x",x*100+"%");
      wrap.style.setProperty("--pointer-y",y*100+"%");
      wrap.classList.add("is-active");hero.classList.add("paint-is-active");wake();
    };
    const leave=()=>{lastPointer=null;moving=false;wrap.classList.remove("is-active");hero.classList.remove("paint-is-active");if(!fluid&&!mobile)video.pause();};
    const onVisibility=()=>{
      if(document.hidden){video.pause();cancelAnimationFrame(frame);frame=0;}
      else if(visible){if(mobile)play();else if(moving)wake();}
    };
    const onReady=()=>{if(mobile)play();else if(lastInput)wake();};
    const lost=e=>{e.preventDefault();setFallback(true);};
    const observer=new IntersectionObserver(([entry])=>{
      visible=entry.isIntersecting;
      if(visible){if(mobile)play();}
      else {video.pause();cancelAnimationFrame(frame);frame=0;fluid?.clear();leave();}
    },{threshold:.01});
    observer.observe(hero);
    const resizeObserver=new ResizeObserver(size);resizeObserver.observe(wrap);
    shell.addEventListener("pointermove",move,{passive:true});
    shell.addEventListener("pointerleave",leave);
    canvas.addEventListener("webglcontextlost",lost);
    video.addEventListener("loadeddata",onReady);
    video.addEventListener("canplay",onReady);
    document.addEventListener("visibilitychange",onVisibility);
    window.addEventListener("pageshow",onVisibility);
    window.addEventListener("focus",onVisibility);
    if(mobile)play();else video.pause();
    return ()=>{
      disposed=true;cancelAnimationFrame(frame);fluid?.destroy();video.pause();
      observer.disconnect();resizeObserver.disconnect();
      shell.removeEventListener("pointermove",move);shell.removeEventListener("pointerleave",leave);
      canvas.removeEventListener("webglcontextlost",lost);
      video.removeEventListener("loadeddata",onReady);video.removeEventListener("canplay",onReady);
      document.removeEventListener("visibilitychange",onVisibility);
      window.removeEventListener("pageshow",onVisibility);window.removeEventListener("focus",onVisibility);
      contrastTimers.forEach(clearTimeout);contrastNodes.forEach(node=>node.classList.remove("is-in-mask"));
    };
  },[mobile,reduced,fallback]);

  const playManually=()=>videoRef.current.play().then(()=>setBlocked(false)).catch(()=>setBlocked(true));
  return <div ref={wrapRef} className={`paint-stage${mobile?" is-touch":""}${reduced?" is-static":""}${fallback?" is-fallback":""}`} data-testid="paint-stage">
    <video ref={videoRef} className="paint-source" src={mobile?mobileVideo:desktopVideo} autoPlay={mobile&&!reduced} muted loop playsInline preload={mobile&&!reduced?"auto":"metadata"} poster={poster} aria-hidden="true" />
    <canvas ref={canvasRef} className="video-reveal" aria-hidden="true" />
    {mobile&&blocked&&!reduced&&<button type="button" className="hero-play" onClick={playManually}>Reproduzir animação <span aria-hidden="true">▶</span></button>}
  </div>;
}
