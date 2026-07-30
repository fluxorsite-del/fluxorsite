'use client';

import { useEffect, useRef } from 'react';

interface PricingProps {
  onOpenEstimator: (pkg?: string) => void;
}

export default function Pricing({ onOpenEstimator }: PricingProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const container = containerRef.current;

    if (!container || !finePointer || reduceMotion) return;

    const cards = container.querySelectorAll<HTMLElement>('.price-card');
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
    <section className="section pricing" id="pacotes">
      <div className="container" ref={containerRef}>
        <div className="center-heading reveal">
          <span className="eyebrow">Pacotes</span>
          <h2>
            Escolha o ponto de<br />
            <span>partida da sua marca.</span>
          </h2>
        </div>

        <div className="pricing-grid">
          <article className="price-card reveal">
            <span className="plan-label">ESSENCIAL</span>
            <h3>Partida</h3>
            <div className="price">R$4.500</div>
            <p>Presença profissional para começar com direção.</p>
            <ul>
              <li>Diagnóstico inicial</li>
              <li>Identidade visual essencial</li>
              <li>Conjunto para redes sociais</li>
              <li>Manual de uso</li>
            </ul>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => onOpenEstimator('Partida')}
            >
              Quero esse pacote
            </button>
          </article>

          <article className="price-card featured reveal delay-1">
            <div className="recommended">
              <span aria-hidden="true">★</span> MAIS ESCOLHIDO
            </div>
            <span className="plan-label">CRESCIMENTO</span>
            <h3>Impulso</h3>
            <div className="price">R$8.900</div>
            <p>Marca completa, conteúdo e site para acelerar resultados.</p>
            <ul>
              <li>Identidade visual completa</li>
              <li>Página de conversão responsiva</li>
              <li>Estratégia de conteúdo</li>
              <li>30 dias de acompanhamento</li>
            </ul>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onOpenEstimator('Impulso')}
            >
              Quero esse pacote
            </button>
          </article>

          <article className="price-card reveal">
            <span className="plan-label">SOB MEDIDA</span>
            <h3>Estúdio</h3>
            <div className="price">R$18.000+</div>
            <p>Time dedicado e execução contínua para marcas em expansão.</p>
            <ul>
              <li>Escopo personalizado</li>
              <li>Direção criativa contínua</li>
              <li>Gestão de campanhas</li>
              <li>Relatórios e otimização</li>
            </ul>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => onOpenEstimator('Estúdio')}
            >
              Quero esse pacote
            </button>
          </article>
        </div>
      </div>
    </section>
  );
}
