import React, { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "fluxor-preloader-seen-v1";

export default function SitePreloader() {
  const [visible, setVisible] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) !== "true"; }
    catch { return true; }
  });
  const [leaving, setLeaving] = useState(false);
  const progressRef = useRef(null);
  const countRef = useRef(null);

  useEffect(() => {
    if (!visible) return undefined;
    document.documentElement.classList.add("preloader-lock");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const startedAt = performance.now();
    const duration = reduced ? 350 : 1900;
    let frame = 0;
    let loadReady = document.readyState === "complete";
    const onLoad = () => { loadReady = true; };
    addEventListener("load", onLoad, { once: true });
    const tick = now => {
      const elapsed = now - startedAt;
      const timed = Math.min(1, elapsed / duration);
      const progress = loadReady ? timed : Math.min(timed, .88);
      const eased = 1 - Math.pow(1 - progress, 3);
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${eased})`;
      if (countRef.current) countRef.current.textContent = String(Math.round(eased * 100)).padStart(3, "0");
      if (progress >= 1) {
        try { localStorage.setItem(STORAGE_KEY, "true"); } catch {}
        setLeaving(true);
        setTimeout(() => {
          document.documentElement.classList.remove("preloader-lock");
          setVisible(false);
        }, reduced ? 180 : 850);
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("load", onLoad);
      document.documentElement.classList.remove("preloader-lock");
    };
  }, [visible]);

  if (!visible) return null;
  return <div className={`site-preloader${leaving ? " is-leaving" : ""}`} role="status" aria-live="polite" aria-label="Carregando experiência Fluxor">
    <div className="preloader-orbit" aria-hidden="true"><span /><i /><b /></div>
    <div className="preloader-center"><span className="preloader-code">FLX / CARREGANDO EXPERIÊNCIA</span><div className="preloader-word">FLUXOR<sup>®</sup></div></div>
    <div className="preloader-bottom"><span ref={countRef}>000</span><div className="preloader-rule"><i ref={progressRef} /></div><span>ENTRAR EM MOVIMENTO</span></div>
  </div>;
}
