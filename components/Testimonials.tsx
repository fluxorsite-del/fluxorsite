'use client';

import { useEffect, useRef } from 'react';

const testimonials = [
  {
    quote:
      '“A Fluxor transformou nossa marca de verdade. O resultado ficou muito acima do que esperávamos.”',
    name: 'Marina Alves',
    role: 'Diretora, Clube de Remada',
    delay: false,
  },
  {
    quote:
      '“Time profissional do início ao fim. Entregaram estratégia, clareza e muito mais do que o combinado.”',
    name: 'Rafael Santos',
    role: 'Diretor executivo, Reprograme',
    delay: true,
  },
  {
    quote:
      '“Finalmente nossa identidade representa a qualidade do serviço que entregamos todos os dias.”',
    name: 'Camila Rocha',
    role: 'Fundadora, Nutriderm',
    delay: false,
  },
];

export default function Testimonials() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const container = containerRef.current;

    if (!container || !finePointer || reduceMotion) return;

    const cards = container.querySelectorAll<HTMLElement>('.testimonial');
    const cleanups: (() => void)[] = [];

    cards.forEach((card) => {
      let frame = 0;
      const handlePointerMove = (event: PointerEvent) => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          card.style.setProperty('--mouse-x', `${event.clientX - rect.left}px`);
          card.style.setProperty('--mouse-y', `${event.clientY - rect.top}px`);
        });
      };

      card.addEventListener('pointermove', handlePointerMove);
      cleanups.push(() => {
        cancelAnimationFrame(frame);
        card.removeEventListener('pointermove', handlePointerMove);
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <section className="section testimonials">
      <div className="container" ref={containerRef}>
        <div className="section-heading reveal">
          <div>
            <span className="eyebrow">Depoimentos</span>
            <h2>
              Nossos clientes<br />
              <span>recomendam.</span>
            </h2>
          </div>
        </div>

        <div className="testimonial-track">
          {testimonials.map((t, i) => (
            <article
              key={i}
              className={`testimonial reveal ${t.delay ? 'delay-1' : ''}`}
            >
              <div className="stars">★★★★★</div>
              <p>{t.quote}</p>
              <div>
                <b>{t.name}</b>
                <span>{t.role}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
