'use client';

import { useEffect, useRef } from 'react';

interface HeroProps {
  onOpenEstimator: (pkg?: string) => void;
}

export default function Hero({ onOpenEstimator }: HeroProps) {
  const heroVisualRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const desktop = window.matchMedia('(min-width: 951px)').matches;
    const heroVisual = heroVisualRef.current;

    if (!heroVisual || !desktop || !finePointer || reduceMotion) return;

    const pieces = heroVisual.querySelectorAll<HTMLElement>(
      '.card-dashboard, .card-phone, .floating-tag, .floating-icon, .orb-main'
    );

    let frame = 0;

    const handlePointerMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = heroVisual.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;

        pieces.forEach((piece, index) => {
          const depth = 4 + index * 2.5;
          piece.style.setProperty('--parallax-x', `${x * depth}px`);
          piece.style.setProperty('--parallax-y', `${y * depth}px`);
        });
      });
    };

    const handlePointerLeave = () => {
      pieces.forEach((piece) => {
        piece.style.removeProperty('--parallax-x');
        piece.style.removeProperty('--parallax-y');
      });
    };

    heroVisual.addEventListener('pointermove', handlePointerMove);
    heroVisual.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      cancelAnimationFrame(frame);
      heroVisual.removeEventListener('pointermove', handlePointerMove);
      heroVisual.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, []);

  return (
    <section className="hero section" id="inicio">
      <div className="hero-glow glow-one" />
      <div className="hero-glow glow-two" />

      <div className="container hero-grid">
        <div className="hero-copy reveal">
          <span className="eyebrow">
            <i /> Agência de comunicação visual
          </span>
          <h1>
            Menos aparência.<br />
            <span>Mais atenção.</span>
          </h1>
          <p>
            Sua marca merece ser impossível de ignorar. Criamos identidades visuais,
            sites e estratégias que transformam empresas em referências.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary magnetic" href="#portfolio">
              Ver projetos <span>↗</span>
            </a>
            <button
              type="button"
              className="btn btn-ghost magnetic"
              onClick={() => onOpenEstimator()}
            >
              Simular meu projeto
            </button>
          </div>
          <div className="social-proof">
            <div className="avatars">
              <span>A</span>
              <span>B</span>
              <span>C</span>
              <span>D</span>
            </div>
            <div>
              <strong>+100 clientes</strong>
              <small>confiam no nosso trabalho</small>
            </div>
          </div>
        </div>

        <div
          ref={heroVisualRef}
          className="hero-visual reveal delay-1"
          aria-label="Composição visual de projetos da Fluxor Studio"
        >
          <div className="orb orb-main" />

          <div className="glass-card card-dashboard">
            <div className="mini-header">
              <span />
              <span />
              <span />
            </div>
            <div className="dash-title">Sistemas de marca</div>
            <div className="dash-chart">
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
            <div className="dash-row">
              <b />
              <b />
              <b />
            </div>
          </div>

          <div className="glass-card card-phone">
            <div className="phone-notch" />
            <div className="phone-screen">
              <span>FLUXOR</span>
              <b>
                Design que<br />
                movimenta marcas.
              </b>
              <i />
            </div>
          </div>

          <div className="floating-tag tag-one">IDENTIDADE</div>
          <div className="floating-tag tag-two">ESTRATÉGIA</div>
          <div className="floating-icon">✦</div>
        </div>
      </div>

      <div className="scroll-line">
        <span>ROLE PARA EXPLORAR</span>
        <i />
      </div>
    </section>
  );
}
