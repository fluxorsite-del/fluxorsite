import React, { useEffect, useRef } from "react";
import useMediaQuery from './useMediaQuery';

const chapters = [
  { index: "01", title: "Escutamos antes de criar.", copy: "Toda boa experiência começa entendendo o contexto, as pessoas e o que a marca realmente precisa comunicar." },
  { index: "02", title: "Estratégia vira linguagem.", copy: "Transformamos direção em identidade, interface, movimento e uma presença digital reconhecível em cada ponto de contato." },
  { index: "03", title: "O lançamento não é o fim.", copy: "Observamos, refinamos e mantemos o trabalho em evolução para que ele continue relevante depois de entrar no mundo." }
];

export default function ScrollSyncedText() {
  const sectionRef = useRef(null);
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  useEffect(() => {
    if (reduced) return;
    const section = sectionRef.current;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const progress = Math.max(0, Math.min(.999, -rect.top / Math.max(1, rect.height - innerHeight)));
      section.style.setProperty("--synced-progress", progress.toFixed(3));
      section.dataset.active = String(Math.min(chapters.length - 1, Math.floor(progress * chapters.length)));
    };
    const request = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    addEventListener("scroll", request, { passive: true });
    addEventListener("resize", request);
    return () => { cancelAnimationFrame(frame); removeEventListener("scroll", request); removeEventListener("resize", request); };
  }, [reduced]);
  return <section ref={sectionRef} className="scroll-synced" aria-label="Nosso jeito de trabalhar">
    <div className="scroll-synced-sticky">
      <div className="section-label"><span>08</span><span>NOSSO JEITO</span></div>
      <p className="scroll-synced-side">DO PRIMEIRO CONTATO<br />À EVOLUÇÃO CONTÍNUA</p>
      <div className="scroll-synced-track" aria-hidden="true"><span /></div>
      <div className="scroll-synced-chapters">{chapters.map((chapter, index) => <article key={chapter.index} className="scroll-synced-chapter" data-index={index}><span>{chapter.index}</span><h2>{chapter.title}</h2><p>{chapter.copy}</p></article>)}</div>
      <span className="scroll-synced-hint">CONTINUE ROLANDO ↓</span>
    </div>
  </section>;
}
