import React, { useEffect, useRef } from "react";

export default function ServiceHoverLink({ index, title, description, image }) {
  const linkRef = useRef(null);
  const imageRef = useRef(null);
  const stateRef = useRef({ x: 0, y: 0, tx: 0, ty: 0, raf: 0, active: false });

  useEffect(() => () => {
    if (stateRef.current.raf) cancelAnimationFrame(stateRef.current.raf);
  }, []);

  const animate = () => {
    const state = stateRef.current;
    const imageElement = imageRef.current;
    if (!imageElement) return;
    state.x += (state.tx - state.x) * .14;
    state.y += (state.ty - state.y) * .14;
    imageElement.style.setProperty("--hover-x", `${state.x}px`);
    imageElement.style.setProperty("--hover-y", `${state.y}px`);
    if (state.active || Math.abs(state.tx - state.x) > .1 || Math.abs(state.ty - state.y) > .1) state.raf = requestAnimationFrame(animate);
    else state.raf = 0;
  };

  const onPointerMove = event => {
    if (event.pointerType === "touch" || matchMedia('(max-width: 900px), (prefers-reduced-motion: reduce) and (max-width: 1920px) and (max-aspect-ratio: 199 / 100)').matches) return;
    const rect = linkRef.current.getBoundingClientRect();
    const state = stateRef.current;
    state.tx = (event.clientX - rect.left - rect.width * .67) * .18;
    state.ty = (event.clientY - rect.top - rect.height * .5) * .25;
    if (!state.raf) state.raf = requestAnimationFrame(animate);
  };

  const onPointerEnter = () => {
    if (matchMedia('(max-width: 900px), (prefers-reduced-motion: reduce) and (max-width: 1920px) and (max-aspect-ratio: 199 / 100)').matches) return;
    stateRef.current.active = true;
    if (!stateRef.current.raf) stateRef.current.raf = requestAnimationFrame(animate);
  };

  const onPointerLeave = () => {
    const state = stateRef.current;
    state.active = false;
    state.tx = 0;
    state.ty = 0;
    if (!state.raf) state.raf = requestAnimationFrame(animate);
  };

  return <a ref={linkRef} className="service-link" href="#contact" onPointerMove={onPointerMove} onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave}>
    <span className="service-no">{String(index + 1).padStart(2, "0")}</span>
    <span className="service-link-copy">
      <span className="service-heading" aria-label={title}>{title.split(' ').map((word, wordIndex) => <React.Fragment key={wordIndex}>{wordIndex>0?' ':null}<span className="service-heading-word" aria-hidden="true">{[...word].map((character, characterIndex) => <span className="service-heading-char" key={characterIndex} style={{ '--char-index': title.split(' ').slice(0,wordIndex).join(' ').length + characterIndex }}>{character}</span>)}</span></React.Fragment>)}</span>
      <span className="service-description">{description}</span>
    </span>
    <img ref={imageRef} className="service-hover-image" src={image} alt="" loading="lazy" decoding="async" aria-hidden="true" />
    <span className="service-arrow" aria-hidden="true">→</span>
  </a>;
}
