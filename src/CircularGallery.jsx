import React, { useEffect, useRef, useState } from "react";
import "./CircularGallery.css";

const wrap = (value, length) => ((value % length) + length) % length;

export default function CircularGallery({ items = [], bend = 3, scrollSpeed = 1, scrollEase = .075 }) {
  const galleryRef = useRef(null);
  const targetRef = useRef(0);
  const currentRef = useRef(0);
  const dragRef = useRef(null);
  const [position, setPosition] = useState(0);

  useEffect(() => {
    let frame;
    const tick = () => {
      currentRef.current += (targetRef.current - currentRef.current) * scrollEase;
      setPosition(currentRef.current);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [scrollEase]);

  const moveTo = next => { targetRef.current = next; };
  const onWheel = event => {
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.shiftKey) {
      event.preventDefault();
      moveTo(targetRef.current + (event.deltaX || event.deltaY) * .006 * scrollSpeed);
    }
  };
  const onPointerDown = event => {
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
          <div className="testimonial-card-top"><img src={item.image} alt={`Retrato de ${item.name}`} loading="lazy" /><div><strong>{item.name}</strong><span>{item.role}</span></div><span className="testimonial-quote">“</span></div>
          <div className="testimonial-stars" aria-label="5 de 5 estrelas">★★★★★</div>
          <p>{item.quote}</p>
          <small>PROJETO / {String(index + 1).padStart(2, "0")}</small>
        </article>;
      })}
    </div>
    <div className="circular-gallery-controls"><button type="button" onClick={() => moveTo(Math.round(targetRef.current) - 1)} aria-label="Depoimento anterior">←</button><span>ARRASTE PARA NAVEGAR</span><button type="button" onClick={() => moveTo(Math.round(targetRef.current) + 1)} aria-label="Próximo depoimento">→</button></div>
  </div>;
}
