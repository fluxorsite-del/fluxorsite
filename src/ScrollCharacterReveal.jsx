import React, { useEffect, useMemo, useRef } from "react";
import "./ScrollCharacterReveal.css";

const clamp = value => Math.max(0, Math.min(1, value));

export default function ScrollCharacterReveal({ children, className = "", progressStart = 0, progressEnd = 1 }) {
  const rootRef = useRef(null);
  const text = typeof children === "string" ? children : "";
  const characters = useMemo(() => [...text], [text]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const scrollSection = root.closest("[data-scroll-reveal-section]");
    const spans = [...root.querySelectorAll(".scroll-character-reveal__char")];
    let raf = 0;

    const render = () => {
      raf = 0;
      const rect = scrollSection?.getBoundingClientRect() || root.getBoundingClientRect();
      const distance = scrollSection
        ? Math.max(1, scrollSection.offsetHeight - innerHeight)
        : innerHeight * .68;
      const sectionProgress = scrollSection
        ? clamp(-rect.top / distance)
        : clamp((innerHeight * .84 - rect.top) / distance);
      const progress = clamp((sectionProgress - progressStart) / Math.max(.0001, progressEnd - progressStart));
      const spread = .22;
      spans.forEach((span, index) => {
        const point = spans.length > 1 ? index / (spans.length - 1) : 0;
        const local = clamp((progress - point * (1 - spread)) / spread);
        span.style.setProperty("--char-reveal", local.toFixed(3));
      });
    };

    const requestRender = () => {
      if (!raf) raf = requestAnimationFrame(render);
    };

    render();
    addEventListener("scroll", requestRender, { passive: true });
    addEventListener("resize", requestRender);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      removeEventListener("scroll", requestRender);
      removeEventListener("resize", requestRender);
    };
  }, [characters, progressStart, progressEnd]);

  return <p ref={rootRef} className={`scroll-character-reveal ${className}`.trim()} aria-label={text}>
    <span aria-hidden="true">
      {characters.map((character, index) => <span className="scroll-character-reveal__char" key={`${character}-${index}`}>{character}</span>)}
    </span>
  </p>;
}
