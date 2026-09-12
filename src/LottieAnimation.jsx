import React, { useEffect, useRef } from "react";
import lottie from "lottie-web/build/player/lottie_light";

export function LottieAnimation({ animationData, className = "", loop = true, autoplay = true, ariaLabel }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animation = lottie.loadAnimation({
      container: containerRef.current,
      renderer: "svg",
      loop: reducedMotion ? false : loop,
      autoplay: reducedMotion ? false : autoplay,
      animationData,
      rendererSettings: { preserveAspectRatio: "xMidYMid meet", progressiveLoad: true }
    });

    if (reducedMotion) animation.goToAndStop(0, true);
    return () => animation.destroy();
  }, [animationData, autoplay, loop]);

  return <span ref={containerRef} className={`lottie-animation ${className}`.trim()} aria-hidden={ariaLabel ? undefined : true} role={ariaLabel ? "img" : undefined} aria-label={ariaLabel} />;
}

export function LottieToggleIcon({ animationData, active, className = "" }) {
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const firstRenderRef = useRef(true);

  useEffect(() => {
    const animation = lottie.loadAnimation({
      container: containerRef.current,
      renderer: "svg",
      loop: false,
      autoplay: false,
      animationData,
      rendererSettings: { preserveAspectRatio: "xMidYMid meet" }
    });
    animationRef.current = animation;
    animation.goToAndStop(0, true);
    return () => {
      animationRef.current = null;
      animation.destroy();
    };
  }, [animationData]);

  useEffect(() => {
    const animation = animationRef.current;
    if (!animation) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      animation.goToAndStop(active ? animation.totalFrames - 1 : 0, true);
      return;
    }
    if (reducedMotion) animation.goToAndStop(active ? animation.totalFrames - 1 : 0, true);
    else animation.playSegments(active ? [0, animation.totalFrames - 1] : [animation.totalFrames - 1, 0], true);
  }, [active]);

  return <span ref={containerRef} className={`lottie-animation ${className}`.trim()} aria-hidden="true" />;
}
