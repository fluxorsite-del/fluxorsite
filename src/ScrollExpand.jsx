import React, { useCallback, useEffect, useRef } from "react";
import "./ScrollExpand.css";

const clamp = (value, min, max) => value < min ? min : value > max ? max : value;
const smoothstep = (edge0, edge1, value) => {
  const amount = clamp((value - edge0) / (edge1 - edge0 || 1e-6), 0, 1);
  return amount * amount * (3 - 2 * amount);
};

export default function ScrollExpand({
  src = "",
  mediaType = "image",
  poster = "",
  alt = "",
  title = "",
  scrollHint = "",
  startWidth = 42,
  startHeight = 58,
  startRadius = 24,
  endRadius = 0,
  endBottomRadius = endRadius,
  mediaZoom = 1.35,
  scrollDistance = 1.2,
  holdDistance = .35,
  smoothing = .1,
  overlayScrim = .45,
  useWindowScroll = false,
  enabled = true,
  children,
  className = "",
  style,
}) {
  const rootRef = useRef(null);
  const trackRef = useRef(null);
  const stageRef = useRef(null);
  const frameRef = useRef(null);
  const mediaRef = useRef(null);
  const titleRef = useRef(null);
  const overlayRef = useRef(null);
  const scrimRef = useRef(null);
  const hintRef = useRef(null);
  const propsRef = useRef({});
  propsRef.current = { startWidth, startHeight, startRadius, endRadius, endBottomRadius, mediaZoom, scrollDistance, holdDistance, smoothing, overlayScrim, useWindowScroll, enabled };

  const applyProgress = useCallback((progress, exitProgress = 0) => {
    const frame = frameRef.current;
    const media = mediaRef.current;
    if (!frame || !media) return;
    const settings = propsRef.current;
    const eased = smoothstep(0, 1, progress);
    const exit = smoothstep(0, 1, exitProgress);
    const width = settings.startWidth + (100 - settings.startWidth) * eased;
    const height = settings.startHeight + (100 - settings.startHeight) * eased;
    const insetX = Math.max(0, (100 - width) / 2);
    const insetY = Math.max(0, (100 - height) / 2);
    const topRadius = settings.startRadius + (settings.endRadius - settings.startRadius) * eased;
    const bottomRadius = settings.startRadius + (settings.endBottomRadius - settings.startRadius) * eased;
    frame.style.clipPath = `inset(${insetY}% ${insetX}% ${insetY}% ${insetX}% round ${topRadius}px ${topRadius}px ${bottomRadius}px ${bottomRadius}px)`;
    frame.style.transform = `translate3d(0, ${-34 * exit}vh, 0) scale(${1 - .035 * exit})`;
    frame.style.opacity = `${1 - .18 * exit}`;
    media.style.transform = `scale(${settings.mediaZoom + (1 - settings.mediaZoom) * eased})`;
    if (scrimRef.current) scrimRef.current.style.opacity = `${settings.overlayScrim * eased}`;
    if (titleRef.current) {
      const fill = smoothstep(.06, .7, progress);
      const lift = smoothstep(.58, 1, progress);
      titleRef.current.style.setProperty("--se-title-fill", `${fill * 100}%`);
      titleRef.current.style.opacity = `${1 - .42 * exit}`;
      titleRef.current.style.transform = `translate3d(0, ${-18 * lift - 30 * exit}vh, 0)`;
    }
    if (hintRef.current) {
      const hidden = smoothstep(0, .12, progress);
      hintRef.current.style.opacity = `${1 - hidden}`;
      hintRef.current.style.transform = `translate3d(0, ${8 * hidden}px, 0)`;
    }
    if (overlayRef.current) {
      const entrance = smoothstep(.72, 1, progress);
      overlayRef.current.style.opacity = `${entrance}`;
      overlayRef.current.style.transform = `translate3d(0, ${24 * (1 - entrance)}px, 0)`;
      overlayRef.current.style.clipPath = `inset(${(1 - entrance) * 100}% 0 0 0)`;
    }
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!root || !track || !stage) return undefined;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let current = 0;
    let target = 0;
    let currentExit = 0;
    let targetExit = 0;
    let stageHeight = 0;
    let running = false;
    const measure = () => {
      const settings = propsRef.current;
      stageHeight = settings.useWindowScroll ? innerHeight : root.clientHeight;
      if (stageHeight <= 0) return;
      stage.style.height = `${stageHeight}px`;
      track.style.height = `${stageHeight * (1 + Math.max(0, settings.scrollDistance) + Math.max(0, settings.holdDistance))}px`;
      stage.style.setProperty("--se-title-size", `${clamp((root.clientWidth || stageHeight) * .075, 32, 108)}px`);
    };
    const readProgress = () => {
      const settings = propsRef.current;
      if (!settings.enabled) return { expansion: 1, exit: 1 };
      const distance = settings.useWindowScroll ? -track.getBoundingClientRect().top / stageHeight : root.scrollTop / stageHeight;
      const expansionSpan = Math.max(.01, settings.scrollDistance);
      const exitSpan = Math.max(.01, settings.holdDistance);
      return {
        expansion: clamp(distance / expansionSpan, 0, 1),
        exit: settings.holdDistance > 0 ? clamp((distance - expansionSpan) / exitSpan, 0, 1) : 0,
      };
    };
    const tick = () => {
      const settings = propsRef.current;
      const amount = settings.smoothing <= 0 ? 1 : 1 - Math.exp(-1 / (60 * settings.smoothing));
      current += (target - current) * amount;
      currentExit += (targetExit - currentExit) * amount;
      if (Math.abs(target - current) < .0004 && Math.abs(targetExit - currentExit) < .0004) { current = target; currentExit = targetExit; running = false; }
      applyProgress(current, currentExit);
      raf = running ? requestAnimationFrame(tick) : 0;
    };
    const onScroll = () => {
      const phases = readProgress();
      target = phases.expansion;
      targetExit = phases.exit;
      if (propsRef.current.smoothing <= 0 || reduced) { current = target; currentExit = targetExit; applyProgress(current, currentExit); return; }
      if (!running) { running = true; raf = requestAnimationFrame(tick); }
    };
    const onResize = () => { measure(); const phases = readProgress(); target = phases.expansion; targetExit = phases.exit; current = target; currentExit = targetExit; applyProgress(current, currentExit); };
    measure();
    const initialPhases = readProgress();
    target = initialPhases.expansion;
    targetExit = initialPhases.exit;
    current = target;
    currentExit = targetExit;
    applyProgress(current, currentExit);
    const scroller = useWindowScroll ? window : root;
    scroller.addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onResize);
    const observer = new ResizeObserver(onResize);
    observer.observe(root);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      scroller.removeEventListener("scroll", onScroll);
      removeEventListener("resize", onResize);
      observer.disconnect();
    };
  }, [applyProgress, useWindowScroll]);

  useEffect(() => {
    const media = mediaRef.current;
    if (mediaType !== "video" || !media) return undefined;
    media.muted = true;
    media.volume = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) media.play().catch(() => {});
      else media.pause();
    }, { threshold: .04, rootMargin: "100px 0px" });
    observer.observe(media);
    return () => observer.disconnect();
  }, [mediaType, src]);

  const media = mediaType === "video"
    ? <video ref={mediaRef} className="scroll-expand__media" src={src} poster={poster} autoPlay muted loop playsInline preload="metadata" disablePictureInPicture onLoadedMetadata={event => { event.currentTarget.muted = true; event.currentTarget.volume = 0; }} />
    : <img ref={mediaRef} className="scroll-expand__media" src={src} alt={alt} draggable={false} />;

  return <div ref={rootRef} className={`scroll-expand ${useWindowScroll ? "" : "scroll-expand--scroller"} ${className}`.trim()} style={style}>
    <div ref={trackRef} className="scroll-expand__track">
      <div ref={stageRef} className="scroll-expand__stage">
        <div ref={frameRef} className="scroll-expand__frame">
          {media}
          <div ref={scrimRef} className="scroll-expand__scrim" />
          {children ? <div ref={overlayRef} className="scroll-expand__overlay">{children}</div> : null}
        </div>
        {title ? <div ref={titleRef} className="scroll-expand__title">{title}</div> : null}
        {scrollHint ? <div ref={hintRef} className="scroll-expand__hint">{scrollHint}</div> : null}
      </div>
    </div>
  </div>;
}
