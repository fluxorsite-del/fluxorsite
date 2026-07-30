'use client';

import { useEffect, useRef } from 'react';

const servicesData = [
  {
    num: '01',
    icon: '◉',
    title: 'Diagnóstico de Marca',
    desc: 'Analisamos onde sua presença visual está travando conversão.',
    delay: false,
  },
  {
    num: '02',
    icon: '✦',
    title: 'Gestão de Redes Sociais',
    desc: 'Conteúdo estratégico para Instagram e Facebook, sem achismo.',
    delay: true,
  },
  {
    num: '03',
    icon: '↗',
    title: 'Tráfego Pago',
    desc: 'Campanhas orientadas por dados para validar e escalar sua oferta.',
    delay: false,
  },
  {
    num: '04',
    icon: '◇',
    title: 'Direção de Arte',
    desc: 'Identidade visual sob medida, aplicável desde o primeiro dia.',
    delay: true,
  },
  {
    num: '05',
    icon: '⌁',
    title: 'Estratégia de Conteúdo',
    desc: 'Pesquisa, planejamento e posicionamento antes de qualquer peça.',
    delay: false,
  },
  {
    num: '06',
    icon: '◎',
    title: 'Sites e Páginas de Conversão',
    desc: 'Experiências rápidas, responsivas e construídas para converter.',
    delay: true,
  },
];

export default function Services() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const container = containerRef.current;

    if (!container || !finePointer || reduceMotion) return;

    const cards = container.querySelectorAll<HTMLElement>('.service-card');

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
    <section className="section services" id="servicos">
      <div className="container" ref={containerRef}>
        <div className="section-heading reveal">
          <div>
            <span className="eyebrow">O que fazemos</span>
            <h2>
              O que entregamos pro<br />
              seu negócio crescer <span>de verdade.</span>
            </h2>
          </div>
        </div>

        <div className="service-grid">
          {servicesData.map((item, i) => (
            <article
              key={i}
              className={`service-card reveal ${item.delay ? 'delay-1' : ''}`}
            >
              <span>{item.num}</span>
              <div className="icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
