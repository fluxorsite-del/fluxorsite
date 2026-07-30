'use client';

import { useEffect, useRef } from 'react';

export default function Portfolio() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const container = containerRef.current;

    if (!container || !finePointer || reduceMotion) return;

    const projects = container.querySelectorAll<HTMLElement>('.project');
    const cleanups: (() => void)[] = [];

    projects.forEach((card) => {
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
    <section className="section portfolio" id="portfolio">
      <div className="container" ref={containerRef}>
        <div className="section-heading reveal">
          <div>
            <span className="eyebrow">Portfólio</span>
            <h2>
              Projetos que viram<br />
              <span>referência.</span>
            </h2>
          </div>
          <a className="text-link" href="#contato">
            Ver todos os projetos ↗
          </a>
        </div>

        <div className="projects-grid">
          <article className="project project-large reveal">
            <div className="project-art art-one">
              <div className="mockup-logo">CR</div>
              <div className="mockup-lines" />
            </div>
            <div className="project-meta">
              <div>
                <h3>Clube de Remada</h3>
                <p>Identidade Visual + Gestão de Redes Sociais</p>
              </div>
              <span>↗</span>
            </div>
          </article>

          <article className="project reveal delay-1">
            <div className="project-art art-two">
              <div className="building" />
              <strong>REMAX</strong>
            </div>
            <div className="project-meta">
              <div>
                <h3>REMAX Silver</h3>
                <p>Marketing Imobiliário</p>
              </div>
              <span>↗</span>
            </div>
          </article>

          <article className="project reveal">
            <div className="project-art art-three">
              <div className="bottle" />
              <b>NUTRIDERM</b>
            </div>
            <div className="project-meta">
              <div>
                <h3>Nutriderm</h3>
                <p>Gestão de Redes Sociais</p>
              </div>
              <span>↗</span>
            </div>
          </article>

          <article className="project project-wide reveal delay-1">
            <div className="project-art art-four">
              <div className="laptop">
                <div />
              </div>
              <span>REPROGRAME</span>
            </div>
            <div className="project-meta">
              <div>
                <h3>Reprograme</h3>
                <p>Página de Conversão</p>
              </div>
              <span>↗</span>
            </div>
          </article>
        </div>

        <div className="benefits reveal">
          <span>✓ Consulta gratuita, sem compromisso</span>
          <span>✓ Estratégia validada com dados</span>
          <span>✓ Suporte pós-venda incluso</span>
        </div>
      </div>
    </section>
  );
}
