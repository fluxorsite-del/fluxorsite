'use client';

import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const dot = dotRef.current;
    const ring = ringRef.current;

    if (!finePointer || !dot || !ring || reduceMotion) {
      document.body.classList.add('cursor-disabled');
      return;
    }

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let cursorFrame = 0;

    const renderCursor = () => {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;
      if (dot) dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      if (ring) ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      cursorFrame = requestAnimationFrame(renderCursor);
    };

    const handlePointerMove = (event: PointerEvent) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      document.body.classList.add('cursor-ready');
    };

    const handleMouseLeave = () => document.body.classList.remove('cursor-ready');
    const handleMouseEnter = () => document.body.classList.add('cursor-ready');

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    const interactiveElements = document.querySelectorAll(
      'a, button, input, .service-card, .project, .price-card, .testimonial, .faq-item'
    );

    const onEnter = () => ring?.classList.add('hover');
    const onLeave = () => ring?.classList.remove('hover');

    interactiveElements.forEach((element) => {
      element.addEventListener('pointerenter', onEnter);
      element.addEventListener('pointerleave', onLeave);
    });

    renderCursor();

    return () => {
      cancelAnimationFrame(cursorFrame);
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      interactiveElements.forEach((element) => {
        element.removeEventListener('pointerenter', onEnter);
        element.removeEventListener('pointerleave', onLeave);
      });
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
    </>
  );
}
