import React, { useEffect, useMemo, useRef } from "react";
import "./MeteorScrollSection.css";

const frameModules = import.meta.glob("./assets_meteoro/frame_*_delay-0.04s.webp", {
  eager: true,
  query: "?url",
  import: "default",
});

const clamp = value => Math.max(0, Math.min(1, value));
const smoothstep = (start, end, value) => {
  const progress = clamp((value - start) / Math.max(.0001, end - start));
  return progress * progress * (3 - 2 * progress);
};

export default function MeteorScrollSection() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const textRef = useRef(null);
  const frames = useMemo(() => Object.entries(frameModules)
    .sort(([first], [second]) => first.localeCompare(second))
    .map(([, url]) => url), []);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const text = textRef.current;
    if (!section || !canvas || !text || !frames.length) return undefined;

    const context = canvas.getContext("2d", { alpha: true });
    const images = new Array(frames.length);
    const loading = new Set();
    let displayedFrame = 0;
    let wantedFrame = 0;
    let playhead = 0;
    let targetFrame = 0;
    let previousTarget = 0;
    let frameVelocity = 0;
    let scrollDirection = 0;
    let playheadReady = false;
    let raf = 0;
    let idleHandle = 0;
    let preloadStarted = false;
    let disposed = false;

    const draw = index => {
      const image = images[index];
      if (!image?.complete || !image.naturalWidth) return false;
      const width = canvas.width;
      const height = canvas.height;
      const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
      const drawWidth = image.naturalWidth * scale;
      const drawHeight = image.naturalHeight * scale;
      context.clearRect(0, 0, width, height);
      context.drawImage(image, (width - drawWidth) / 2 + width * .2, (height - drawHeight) / 2, drawWidth, drawHeight);
      displayedFrame = index;
      return true;
    };

    const ensureFrame = index => {
      if (index < 0 || index >= frames.length || images[index] || loading.has(index)) return;
      loading.add(index);
      const image = new Image();
      image.decoding = "async";
      image.onload = () => {
        loading.delete(index);
        images[index] = image;
        if (!disposed && (index === wantedFrame || !images[displayedFrame])) draw(index);
      };
      image.onerror = () => loading.delete(index);
      image.src = frames[index];
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      draw(displayedFrame);
    };

    const render = () => {
      raf = 0;
      const rect = section.getBoundingClientRect();
      const distance = Math.max(1, section.offsetHeight - innerHeight);
      const progress = clamp(-rect.top / distance);
      targetFrame = progress * (frames.length - 1);
      if (!playheadReady) {
        playhead = targetFrame;
        previousTarget = targetFrame;
        playheadReady = true;
      }
      const scrollImpulse = targetFrame - previousTarget;
      previousTarget = targetFrame;
      if (Math.abs(scrollImpulse) > .005) {
        scrollDirection = Math.sign(scrollImpulse);
        const impulse = Math.max(-4.2, Math.min(4.2, scrollImpulse * .3));
        frameVelocity = Math.sign(impulse) === Math.sign(frameVelocity)
          ? frameVelocity * .58 + impulse
          : impulse;
        playhead = scrollDirection > 0
          ? Math.max(playhead, targetFrame)
          : Math.min(playhead, targetFrame);
      } else {
        frameVelocity *= .955;
      }
      playhead = Math.max(0, Math.min(frames.length - 1, playhead + frameVelocity));
      if (Math.abs(frameVelocity) < .004) frameVelocity = 0;
      wantedFrame = Math.round(playhead);
      section.dataset.frame = String(wantedFrame);
      ensureFrame(wantedFrame);
      for (let offset = 1; offset <= 5; offset++) {
        ensureFrame(wantedFrame + offset);
        ensureFrame(wantedFrame - offset);
      }
      if (!draw(wantedFrame)) {
        for (let radius = 1; radius < frames.length; radius++) {
          if (draw(wantedFrame - radius) || draw(wantedFrame + radius)) break;
        }
      }
      const entrance = smoothstep(.16, .44, progress);
      const exit = smoothstep(.88, .99, progress);
      text.style.opacity = `${entrance * (1 - exit)}`;
      text.style.transform = `translate3d(0, ${(1 - entrance) * 80 - exit * 46}px, 0)`;
      text.style.clipPath = `inset(0 0 ${Math.max((1 - entrance) * 100, exit * 100)}% 0)`;
      section.style.setProperty("--meteor-progress", progress.toFixed(4));
      if (frameVelocity !== 0) raf = requestAnimationFrame(render);
    };

    const requestRender = () => { if (!raf) raf = requestAnimationFrame(render); };
    const preloadRest = deadline => {
      let loaded = 0;
      while (loaded < 6 && (!deadline || deadline.timeRemaining() > 2)) {
        const next = images.findIndex((image, index) => !image && !loading.has(index));
        if (next < 0) return;
        ensureFrame(next);
        loaded++;
      }
      idleHandle = "requestIdleCallback" in window
        ? requestIdleCallback(preloadRest, { timeout: 1200 })
        : setTimeout(() => preloadRest(), 180);
    };

    ensureFrame(0);
    resize();
    render();
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        requestRender();
        if (!preloadStarted) {
          preloadStarted = true;
          idleHandle = "requestIdleCallback" in window
            ? requestIdleCallback(preloadRest, { timeout: 1200 })
            : setTimeout(() => preloadRest(), 180);
        }
      }
    }, { rootMargin: "100% 0px" });
    observer.observe(section);
    addEventListener("scroll", requestRender, { passive: true });
    addEventListener("resize", resize);
    return () => {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      if ("cancelIdleCallback" in window) cancelIdleCallback(idleHandle);
      else clearTimeout(idleHandle);
      observer.disconnect();
      removeEventListener("scroll", requestRender);
      removeEventListener("resize", resize);
    };
  }, [frames]);

  return <section ref={sectionRef} className="meteor-scroll" aria-labelledby="meteor-title">
    <div className="meteor-scroll__sticky">
      <canvas ref={canvasRef} className="meteor-scroll__canvas" aria-hidden="true" />
      <div className="meteor-scroll__shade" aria-hidden="true" />
      <div className="meteor-scroll__label section-label"><span>04.2</span><span>IDENTIDADE EM MOVIMENTO</span></div>
      <h2 ref={textRef} id="meteor-title" className="meteor-scroll__title">Moldamos uma identidade de marca completa, feita para transmitir confiança e presença.</h2>
      <span className="meteor-scroll__counter" aria-hidden="true">001 — 192</span>
    </div>
  </section>;
}
