'use client';

import { useEffect, useRef } from 'react';

interface CTAProps {
  onOpenEstimator: (pkg?: string) => void;
}

export default function CTA({ onOpenEstimator }: CTAProps) {
  const ctaCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const ctaCard = ctaCardRef.current;

    if (!ctaCard || !finePointer || reduceMotion) return;

    let ctaFrame = 0;

    const handlePointerMove = (event: PointerEvent) => {
      cancelAnimationFrame(ctaFrame);
      ctaFrame = requestAnimationFrame(() => {
        const rect = ctaCard.getBoundingClientRect();
        ctaCard.style.setProperty('--cta-x', `${event.clientX - rect.left}px`);
        ctaCard.style.setProperty('--cta-y', `${event.clientY - rect.top}px`);
      });
    };

    const handlePointerLeave = () => {
      ctaCard.style.setProperty('--cta-x', '50%');
      ctaCard.style.setProperty('--cta-y', '50%');
    };

    ctaCard.addEventListener('pointermove', handlePointerMove);
    ctaCard.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      cancelAnimationFrame(ctaFrame);
      ctaCard.removeEventListener('pointermove', handlePointerMove);
      ctaCard.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, []);

  return (
    <section className="cta-section section" id="contato">
      <div ref={ctaCardRef} className="container cta-card reveal">
        <div className="cta-glow" />
        <span className="eyebrow">Agendar conversa</span>
        <h2>
          Vamos construir sua próxima <span>história de sucesso?</span>
        </h2>
        <p>Fale com nosso time e descubra como podemos alavancar sua marca.</p>
        <button
          type="button"
          className="btn btn-primary magnetic"
          onClick={() => onOpenEstimator()}
        >
          Simular Diagnóstico no WhatsApp <span>↗</span>
        </button>
      </div>
    </section>
  );
}
