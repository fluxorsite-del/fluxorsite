import React, { useEffect, useRef, useState } from "react";
import "./CircularGallery.css";
import useMediaQuery from "./useMediaQuery";

const wrap = (value, length) => ((value % length) + length) % length;

export default function CircularGallery({ items = [], bend = 3, scrollSpeed = 1, scrollEase = .075 }) {
  const galleryRef = useRef(null);
  const targetRef = useRef(0);
  const currentRef = useRef(0);
  const dragRef = useRef(null);
  const [position, setPosition] = useState(0);
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const frameRef = useRef(0);
  const animateRef = useRef(null);

  useEffect(() => {
    const tick = () => {
      frameRef.current = 0;
      const remaining = targetRef.current - currentRef.current;
      currentRef.current = reduced || Math.abs(remaining) < .001 ? targetRef.current : currentRef.current + remaining * scrollEase;
      setPosition(currentRef.current);
      if (currentRef.current !== targetRef.current) frameRef.current = requestAnimationFrame(tick);
    };
    animateRef.current = () => { if (!frameRef.current) frameRef.current = requestAnimationFrame(tick); };
    animateRef.current();
    return () => cancelAnimationFrame(frameRef.current);
  }, [scrollEase, reduced]);

  const moveTo = next => { targetRef.current = next; animateRef.current?.(); };
  const onWheel = event => {
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.shiftKey) {
      moveTo(targetRef.current + (event.deltaX || event.deltaY) * .006 * scrollSpeed);
    }
  };
  const onPointerDown = event => {
    if (event.target.closest('button,a') || event.button !== 0) return;
    dragRef.current = { x: event.clientX, start: targetRef.current };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = event => {
    if (!dragRef.current) return;
    moveTo(dragRef.current.start + (dragRef.current.x - event.clientX) / 260 * scrollSpeed);
  };
  const onPointerUp = event => {
    if (!dragRef.current) return;
    dragRef.current = null;
    moveTo(Math.round(targetRef.current));
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  };
  const onKeyDown = event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') event.preventDefault();
    if (event.key === "ArrowRight") moveTo(Math.round(targetRef.current) + 1);
    if (event.key === "ArrowLeft") moveTo(Math.round(targetRef.current) - 1);
  };

  return <div ref={galleryRef} className="circular-gallery" tabIndex="0" role="region" aria-label="Recomendações de clientes. Arraste ou use as setas." onWheel={onWheel} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onKeyDown={onKeyDown}>
    <div className="circular-gallery-stage">
      {items.map((item, index) => {
        let offset = wrap(index - position + items.length / 2, items.length) - items.length / 2;
        const distance = Math.abs(offset);
        const x = offset * 32;
        const y = distance * distance * bend * 2.7;
        const rotate = offset * bend * -1.8;
        const scale = Math.max(.7, 1 - distance * .11);
        const opacity = Math.max(.18, 1 - distance * .24);
        return <article key={item.name} className="testimonial-card" style={{ "--card-x": `${x}vw`, "--card-y": `${y}px`, "--card-rotate": `${rotate}deg`, "--card-scale": scale, "--card-opacity": opacity, zIndex: 20 - Math.round(distance * 2) }} aria-hidden={distance > 2.2}>
          <div className="testimonial-card-top"><span className="testimonial-avatar" aria-hidden="true">{item.name.split(' ').map(part => part[0]).slice(0,2).join('')}</span><div><strong>{item.name}</strong><span>{item.role}</span></div><span className="testimonial-quote">“</span></div>
          <div className="testimonial-stars" aria-label="5 de 5 estrelas">★★★★★</div>
          <p>{item.quote}</p>
          <small>PROJETO / {String(index + 1).padStart(2, "0")}</small>
        </article>;
      })}
    </div>
    <div className="circular-gallery-controls"><button type="button" onClick={() => moveTo(Math.round(targetRef.current) - 1)} aria-label="Depoimento anterior">←</button><span>ARRASTE PARA NAVEGAR</span><button type="button" onClick={() => moveTo(Math.round(targetRef.current) + 1)} aria-label="Próximo depoimento">→</button></div>
  </div>;
}
