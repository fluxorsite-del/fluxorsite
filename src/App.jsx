import VideoPaintReveal from "./VideoPaintReveal";
import ProjectDialog from "./ProjectDialog";
import React, { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import projectVeil from "./assets/project-veil-optimized.webp";
import projectMateria from "./assets/project-materia-optimized.webp";
import projectSignal from "./assets/project-signal-optimized.webp";
import useOne from "./assets/use1-optimized.webp";
import useTwo from "./assets/use2-optimized.webp";
import useThree from "./assets/use3-optimized.webp";
import scrollExpandVideo from "./assets/evolution-optimized.mp4";
import scrollExpandPoster from "./assets/evolution-poster.webp";
import sectionTwo from "./assets/section2-optimized.webp";
import ElasticMesh from "./ElasticMesh";
import ScrollExpand from "./ScrollExpand";
import ScrollCharacterReveal from "./ScrollCharacterReveal";
import MeteorScrollSection from "./MeteorScrollSection";
import ServiceHoverLink from "./ServiceHoverLink";
import { FooterDoodles, SocialIcon } from "./FooterDoodles";
import CircularGallery from "./CircularGallery";
import ScrollSyncedText from "./ScrollSyncedText";
import MenuDoodles from "./MenuDoodles";
import serviceWebDesign from "./assets/services/web-design.webp";
import serviceCreative from "./assets/services/desenvolvimento-criativo.webp";
import serviceLanding from "./assets/services/landing-pages.webp";
import serviceExperience from "./assets/services/experiencias-digitais.webp";
import serviceCommerce from "./assets/services/ecommerce.webp";
import servicePerformance from "./assets/services/performance.webp";

const MorphSlider = lazy(() => import("./MorphSlider"));
const whatsappLink = message => `https://wa.me/5571981987777?text=${encodeURIComponent(message)}`;
const WHATSAPP_URL = whatsappLink("Olá, vim pelo site da Fluxor e quero conversar sobre um projeto.");

const services = [
  { title: "Design para Web", description: "Interfaces autorais que traduzem estratégia em presença digital.", image: serviceWebDesign },
  { title: "Desenvolvimento Criativo", description: "Tecnologia, movimento e interação construídos sob medida.", image: serviceCreative },
  { title: "Landing Pages", description: "Narrativas digitais focadas em clareza, desejo e conversão.", image: serviceLanding },
  { title: "Experiências Digitais", description: "Experiências imersivas que aproximam pessoas e marcas.", image: serviceExperience },
  { title: "Comércio Digital", description: "Lojas digitais expressivas, intuitivas e preparadas para crescer.", image: serviceCommerce },
  { title: "Performance e Evolução", description: "Acompanhamento contínuo para manter tudo rápido e relevante.", image: servicePerformance },
];
const projectSlides = [
  { image: projectVeil, caption: "VÉU / IDENTIDADE DIGITAL", name: "Véu", discipline: "Identidade digital", challenge: "Transformar uma presença discreta em uma marca reconhecível e contemporânea.", solution: "Sistema visual modular, direção de arte e interface com movimento controlado.", outcome: "Uma presença coesa, expressiva e pronta para crescer em diferentes canais." },
  { image: projectMateria, caption: "MATÉRIA / EXPERIÊNCIA EDITORIAL", name: "Matéria", discipline: "Experiência editorial", challenge: "Organizar conteúdo denso sem perder ritmo, personalidade ou clareza.", solution: "Arquitetura editorial, tipografia responsiva e navegação guiada pela leitura.", outcome: "Uma experiência mais fluida, acessível e consistente do primeiro contato ao conteúdo final." },
  { image: projectSignal, caption: "SINAL / CULTURA EM MOVIMENTO", name: "Sinal", discipline: "Cultura em movimento", challenge: "Criar uma identidade capaz de acompanhar lançamentos, eventos e novas narrativas.", solution: "Linguagem cinética, componentes flexíveis e um sistema digital de alta presença.", outcome: "Uma marca viva, adaptável e reconhecível em múltiplos formatos." }
];
const pricingPlans = [
  { number: "01", name: "Essencial", price: "A partir de R$ 4,8 mil", description: "Para marcas que precisam organizar sua presença e entrar no digital com clareza.", features: ["Direção visual", "Landing page autoral", "Experiência responsiva", "Publicação e suporte"] },
  { number: "02", name: "Presença", price: "A partir de R$ 8,9 mil", description: "Uma experiência completa para transformar posicionamento em uma presença digital memorável.", features: ["Estratégia e arquitetura", "Website personalizado", "Movimento e interações", "CMS e acompanhamento"], featured: true },
  { number: "03", name: "Ecossistema", price: "Sob consulta", description: "Para projetos com identidade, produto e tecnologia funcionando como um único sistema.", features: ["Imersão estratégica", "Identidade ou evolução", "Plataforma sob medida", "Evolução contínua"] }
];
const testimonials = [
  { name: "Marina Costa", role: "Fundadora, Nativa", quote: "A Fluxor conseguiu traduzir uma ideia difícil de explicar em uma presença que parece exatamente nossa." },
  { name: "Rafael Moura", role: "Diretor, Norte", quote: "O cuidado com estratégia, interação e performance mudou completamente a percepção da nossa marca." },
  { name: "Camila Prado", role: "Marketing, Soma", quote: "O processo foi próximo, transparente e muito preciso. Recebemos mais do que um site: ganhamos direção." },
  { name: "Lucas Ferreira", role: "Sócio, Onda", quote: "Cada detalhe tem intenção. A nova experiência nos deixou mais confiantes para apresentar e vender nosso trabalho." },
  { name: "Bianca Alves", role: "CEO, Essenza", quote: "A equipe entendeu rapidamente o nosso universo e construiu algo bonito, consistente e realmente funcional." }
];

function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .14 });
    document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeMenuLink, setActiveMenuLink] = useState("");
  const navRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const nav = navRef.current;
    const background = [...document.querySelectorAll('main,.hero,.whatsapp-float,.skip-link')];
    const previous = background.map(el => el.inert);
    background.forEach(el => { el.inert = true; });
    const focusables = [...nav.querySelectorAll('a,button')];
    const trap = event => {
      if (event.key !== 'Tab') return;
      const index = focusables.indexOf(document.activeElement);
      if (event.shiftKey && index <= 0) { event.preventDefault(); focusables.at(-1).focus(); }
      else if (!event.shiftKey && (index === focusables.length - 1 || index < 0)) { event.preventDefault(); focusables[0].focus(); }
    };
    nav.querySelector('.menu-links a').focus({ preventScroll: true });
    nav.addEventListener('keydown', trap);
    return () => {
      background.forEach((el, i) => { el.inert = previous[i]; });
      nav.removeEventListener('keydown', trap);
      nav.querySelector('.menu-toggle').focus({ preventScroll: true });
    };
  }, [menuOpen]);

  useEffect(() => {
    const onKeyDown = event => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const scrollY = window.scrollY;
    const previous = {
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
      overflow: document.body.style.overflow
    };
    document.documentElement.classList.add("menu-lock");
    document.body.classList.add("menu-lock-body");
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.classList.remove("menu-lock");
      document.body.classList.remove("menu-lock-body");
      Object.assign(document.body.style, previous);
      window.scrollTo(0, scrollY);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);
  return <nav ref={navRef} className={`nav ${menuOpen ? "menu-is-open" : ""}`} aria-label="Navegação principal">
    <a className="brand" data-mask-contrast href="#top" aria-label="Fluxor, início" onClick={closeMenu}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3h18v5H9v4h10v5H9v4H3z"/></svg><span>FLUXOR<sup>®</sup></span></a>
    <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="fullscreen-menu" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} onClick={() => setMenuOpen(open => !open)}>
      <span/><span/><span className="menu-toggle-label">MENU</span>
    </button>
    <div className="menu-panel" id="fullscreen-menu" aria-hidden={!menuOpen} inert={!menuOpen}>
      <div className="menu-panel-meta"><span>NAVEGAÇÃO / 2026</span><span>ESTÚDIO DIGITAL INDEPENDENTE</span></div>
      <MenuDoodles active={activeMenuLink} />
      <div className="menu-links">
        <a href="#work" onMouseEnter={() => setActiveMenuLink("work")} onMouseLeave={() => setActiveMenuLink("")} onFocus={() => setActiveMenuLink("work")} onClick={closeMenu}><small>01 / SELEÇÃO</small><span>Projetos</span><i>↗</i></a>
        <a href="#studio" onMouseEnter={() => setActiveMenuLink("studio")} onMouseLeave={() => setActiveMenuLink("")} onFocus={() => setActiveMenuLink("studio")} onClick={closeMenu}><small>02 / SOBRE</small><span>Estúdio</span><i>↗</i></a>
        <a href="#services" onMouseEnter={() => setActiveMenuLink("services")} onMouseLeave={() => setActiveMenuLink("")} onFocus={() => setActiveMenuLink("services")} onClick={closeMenu}><small>03 / CAPACIDADES</small><span>Serviços</span><i>↗</i></a>
        <a href="#contact" onMouseEnter={() => setActiveMenuLink("contact")} onMouseLeave={() => setActiveMenuLink("")} onFocus={() => setActiveMenuLink("contact")} onClick={closeMenu}><small>04 / CONVERSA</small><span>Contato</span><i>↗</i></a>
        <a className="menu-whatsapp-link" href={WHATSAPP_URL} target="_blank" rel="noreferrer" onMouseEnter={() => setActiveMenuLink("contact")} onMouseLeave={() => setActiveMenuLink("")} onFocus={() => setActiveMenuLink("contact")} onClick={closeMenu}><small>05 / DIRETO</small><span>WhatsApp</span><i>↗</i></a>
      </div>
      <div className="menu-footer">
        <span>FLUXOR® — SALVADOR, BR · <a href="tel:+5571981987777">+55 71 98198-7777</a></span>
        <a className="menu-footer-whatsapp" href={WHATSAPP_URL} target="_blank" rel="noreferrer" onClick={closeMenu}>INICIAR NO WHATSAPP <i>↗</i></a>
      </div>
    </div>
  </nav>;
}

function Hero() {
  const heroRef = useRef(null);
  const alignmentDebug = import.meta.env.DEV && new URLSearchParams(window.location.search).has("align");

  useEffect(() => {
    const hero = heroRef.current;
    const shell = hero.closest(".hero-transition-shell");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return undefined;
    let frame = 0;
    const update = () => {
      frame = 0;
      const range = Math.max(1, shell.offsetHeight - window.innerHeight);
      const progress = Math.max(0, Math.min(1, -shell.getBoundingClientRect().top / range));
      const eased = 1 - Math.pow(1 - progress, 3);
      const isUltrawide = window.innerWidth / window.innerHeight >= 2;
      const horizontalTravel = isUltrawide ? window.innerHeight * .28 : window.innerWidth * .25;
      hero.style.setProperty("--hero-scale", (1 - eased * .41).toFixed(4));
      hero.style.setProperty("--hero-x", `${eased * horizontalTravel}px`);
      hero.style.setProperty("--hero-y", `${eased * -5}vh`);
      hero.style.setProperty("--hero-rotate", `${eased * 2.4}deg`);
      hero.style.setProperty("--hero-radius", `${eased * 34}px`);
      hero.style.setProperty("--hero-opacity", (1 - eased * .46).toFixed(3));
    };
    const requestUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  return <header ref={heroRef} className="hero" id="top">
    <h1 className="sr-only">Fluxor — Estúdio de design e experiências digitais</h1>
    <div className="hero-intro reveal-late"><p data-mask-contrast>Não fazemos só sites.<br />Criamos experiências que ficam.</p><div className="hero-actions"><a data-mask-contrast data-mask-button href="#studio">Conheça a Fluxor <span>↗</span></a><a className="hero-whatsapp" href={WHATSAPP_URL} target="_blank" rel="noreferrer">Fale conosco <span>↗</span></a></div></div>
    <div className={`hero-stage ${alignmentDebug ? "debug-align" : ""}`} aria-label="Fluxor">
      <div className="word-wrap word-back">
        <div className="hero-word" aria-hidden="true">
          {"FLUXOR".split("").map((letter, index) => (
            <span key={letter + index} aria-hidden="true" style={{ "--letter-index": index }}>{letter}</span>
          ))}
        </div>
      </div>
    </div>
    <VideoPaintReveal />
    <div className="paint-hint" aria-hidden="true"><span>MOVE TO REVEAL</span><i>↗</i></div>
    <div className="hero-meta reveal-late"><p data-mask-contrast>DIGITAL STUDIO<br />SALVADOR — BR<br />MMXXVI</p><p className="hero-index" data-mask-contrast>INDEPENDENT<br />CREATIVE PRACTICE</p></div>
    <div className="hero-rule" aria-hidden="true" />
  </header>;
}

function Studio() {
  const sectionRef = useRef(null);
  const dragCursorRef = useRef(null);
  const [sliderReady, setSliderReady] = useState(false);
  const topCopy = "Criamos experiências digitais e identidades visuais";
  const bottomCopy = "que acompanham a forma como marcas, pessoas e tecnologia estão em constante transformação.";

  useEffect(() => {
    const section = sectionRef.current;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    const clamp = value => Math.max(0, Math.min(1, value));
    const ease = value => 1 - Math.pow(1 - value, 3);
    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const range = Math.max(1, rect.height - window.innerHeight);
      const progress = clamp(-rect.top / range);
      const studioProgress = clamp(progress / .46);
      const handoff = reduced ? 1 : ease(clamp((progress - .42) / .16));
      const nextHandoff = reduced ? 1 : ease(clamp((progress - .7) / .16));
      const workVisibility = handoff * (1 - nextHandoff);
      const projectEnter = reduced ? 1 : ease(clamp(studioProgress / .34));
      const topEnter = reduced ? 1 : ease(clamp((studioProgress - .08) / .22));
      const bottomEnter = reduced ? 1 : ease(clamp((studioProgress - .27) / .24));
      const gridEnter = reduced ? 1 : ease(clamp((studioProgress - .025) / .3));
      const tagOneEnter = reduced ? 1 : ease(clamp((studioProgress - .16) / .16));
      const tagTwoEnter = reduced ? 1 : ease(clamp((studioProgress - .34) / .16));
      const exit = handoff;
      section.style.setProperty("--story-progress", studioProgress.toFixed(4));
      section.style.setProperty("--chapter-x", `${(handoff + nextHandoff) * -100}vw`);
      section.style.setProperty("--work-copy-opacity", workVisibility.toFixed(3));
      section.style.setProperty("--work-copy-x", `${(1 - handoff) * 90}px`);
      section.style.setProperty("--work-slider-scale", (.82 + handoff * .18 - nextHandoff * .08).toFixed(4));
      section.style.setProperty("--work-slider-rotate", `${(1 - handoff) * 5.5 - nextHandoff * 3}deg`);
      section.style.setProperty("--use-opacity", nextHandoff.toFixed(3));
      section.style.setProperty("--use-copy-x", `${(1 - nextHandoff) * 110}px`);
      section.style.setProperty("--use-one-y", `${(1 - nextHandoff) * 18}vh`);
      section.style.setProperty("--use-two-y", `${(1 - nextHandoff) * -15}vh`);
      section.style.setProperty("--use-three-x", `${(1 - nextHandoff) * 14}vw`);
      section.style.setProperty("--project-scale", (.68 + projectEnter * .32 - exit * .06).toFixed(4));
      section.style.setProperty("--project-y", `${(1 - projectEnter) * 13 - exit * 16}vh`);
      section.style.setProperty("--project-rotate", `${(1 - projectEnter) * -4.2 + exit * 2}deg`);
      section.style.setProperty("--project-opacity", (.35 + projectEnter * .65 - exit * .42).toFixed(3));
      section.style.setProperty("--project-blur", `${(1 - projectEnter) * 2.2 + exit * 1.5}px`);
      section.style.setProperty("--media-scale", (1.09 - projectEnter * .055 + exit * .025).toFixed(4));
      section.style.setProperty("--media-y", `${(1 - projectEnter) * 4 - exit * 3}%`);
      section.style.setProperty("--top-opacity", (topEnter * (1 - exit)).toFixed(3));
      section.style.setProperty("--top-y", `${(1 - topEnter) * 55 - exit * 45}px`);
      section.style.setProperty("--top-clip", `${(1 - topEnter) * 105}%`);
      section.style.setProperty("--bottom-opacity", (bottomEnter * (1 - exit)).toFixed(3));
      section.style.setProperty("--bottom-y", `${(1 - bottomEnter) * 60 - exit * 40}px`);
      section.style.setProperty("--bottom-clip", `${(1 - bottomEnter) * 105}%`);
      section.style.setProperty("--grid-opacity", (gridEnter * (1 - exit * .75)).toFixed(3));
      section.style.setProperty("--grid-scale", (.82 + gridEnter * .18 + exit * .08).toFixed(4));
      section.style.setProperty("--grid-rotate", `${(1 - gridEnter) * -7 + exit * 3}deg`);
      section.style.setProperty("--tag-one-opacity", (tagOneEnter * (1 - exit)).toFixed(3));
      section.style.setProperty("--tag-one-x", `${(1 - tagOneEnter) * -46 - exit * 30}px`);
      section.style.setProperty("--tag-two-opacity", (tagTwoEnter * (1 - exit)).toFixed(3));
      section.style.setProperty("--tag-two-x", `${(1 - tagTwoEnter) * 48 + exit * 30}px`);
    };
    const requestUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const mediaObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setSliderReady(true);
    }, { rootMargin: "240px 0px" });
    mediaObserver.observe(section);
    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      mediaObserver.disconnect();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const cursor = dragCursorRef.current;
    if (!section || !cursor || matchMedia("(pointer: coarse)").matches) return undefined;
    const initialized = new Map();
    const initTarget = target => {
      if (initialized.has(target)) return;
      target.classList.add("drag-cursor-target");
      const enter = () => {
        cursor.classList.add("is-visible");
      };
      const move = event => {
        cursor.style.transform = `translate3d(${event.clientX + 16}px,${event.clientY + 16}px,0)`;
      };
      const leave = () => {
        cursor.classList.remove("is-visible");
      };
      target.addEventListener("pointerenter", enter);
      target.addEventListener("pointermove", move);
      target.addEventListener("pointerleave", leave);
      initialized.set(target, { enter, move, leave });
    };
    const refresh = () => section.querySelectorAll(".morph-slider-stage").forEach(initTarget);
    const observer = new MutationObserver(refresh);
    observer.observe(section, { childList: true, subtree: true });
    refresh();
    return () => {
      observer.disconnect();
      initialized.forEach(({ enter, move, leave }, target) => {
        target.removeEventListener("pointerenter", enter);
        target.removeEventListener("pointermove", move);
        target.removeEventListener("pointerleave", leave);
      });
    };
  }, []);

  return <section ref={sectionRef} className="company-intro" id="studio">
    <div className="company-journey-sticky">
      <div className="company-track">
        <div className="company-intro-sticky">
      <div className="intro-atmosphere" aria-hidden="true">
        <span className="aurora aurora-one" />
        <span className="aurora aurora-two" />
        <div className="intro-grid" />
      </div>
      <div className="section-label intro-label"><span>01</span><span>ESTÚDIO</span></div>
      <div className="intro-progress" aria-hidden="true"><span /></div>
      <div className="intro-project" aria-label="Projeto Fluxor de identidade digital">
        <img className="intro-project-media" src={sectionTwo} alt="" loading="lazy" decoding="async" aria-hidden="true" />
        <div className="intro-project-wash" aria-hidden="true" />
        <span className="intro-project-index">PROJETO / 01</span>
        <span className="intro-project-type">IDENTIDADE + DIGITAL</span>
      </div>
      <p className="intro-copy intro-copy-top"><span>{topCopy}</span><mark>DESIGN + TECNOLOGIA</mark></p>
      <p className="intro-copy intro-copy-bottom"><span>{bottomCopy}</span></p>
      <div className="intro-tags" aria-hidden="true">
        <span className="intro-tag intro-tag-one">ESTRATÉGIA COM PULSO <i>◆</i></span>
        <span className="intro-tag intro-tag-two">EM CONSTANTE EVOLUÇÃO <i>▲</i></span>
        <em>feito para mover marcas</em>
      </div>
          <span className="intro-mark" aria-hidden="true">FLX / EM MOVIMENTO</span>
        </div>
        <section className="horizontal-work" id="work" aria-labelledby="work-title">
          <div className="horizontal-work-head section-label"><span>02</span><span>PROJETOS SELECIONADOS</span></div>
          <p className="horizontal-work-count">03 PROJETOS<br />2024—26</p>
          <div className="horizontal-work-copy">
            <span>Um design que chama atenção e cria conexão não nasce apenas da estética.</span>
            <em id="work-title">Ele começa com propósito, estratégia e uma compreensão real de quem está do outro lado.</em>
          </div>
          <div className="horizontal-slider-shell">
            {sliderReady ? <Suspense fallback={<img className="horizontal-slider-fallback" src={projectVeil} alt="Projeto Véu" />}><MorphSlider items={projectSlides} autoplay autoplayDelay={2.9} /></Suspense> : <img className="horizontal-slider-fallback" src={projectVeil} alt="Projeto Véu" />}
          </div>
          <span className="horizontal-drag-hint" aria-hidden="true">ARRASTE PARA EXPLORAR ↔</span>
        </section>
        <section className="horizontal-use" aria-labelledby="use-title">
          <div className="horizontal-use-head section-label"><span>03</span><span>EXPERIÊNCIAS EM USO</span></div>
          <p className="horizontal-use-meta">INTERFACES / IDENTIDADES<br />SISTEMAS DIGITAIS</p>
          <h2 id="use-title" className="horizontal-use-copy">
            <span>Transformamos essas ideias em interfaces, identidades e experiências</span>
            <em>cuidadosamente construídas para funcionar, comunicar e permanecer relevantes.</em>
          </h2>
          <div className="use-collage" aria-label="Seleção de interfaces e experiências Fluxor">
            <figure className="use-frame use-frame-one"><img src={useOne} alt="Projeto de interface Fluxor, composição vertical" loading="lazy" decoding="async" /><ElasticMesh image={useOne} className="use-elastic" showGrid={false} resolution={18} tilt={5} shading={.34} grabRadius={.42} pull={.3} /><figcaption>01 / INTERFACE</figcaption></figure>
            <figure className="use-frame use-frame-two"><img src={useTwo} alt="Identidade visual Fluxor, composição vertical" loading="lazy" decoding="async" /><ElasticMesh image={useTwo} className="use-elastic" showGrid={false} resolution={18} tilt={5} shading={.34} grabRadius={.42} pull={.3} /><figcaption>02 / IDENTIDADE</figcaption></figure>
            <figure className="use-frame use-frame-three"><img src={useThree} alt="Experiência digital Fluxor, composição horizontal" loading="lazy" decoding="async" /><ElasticMesh image={useThree} className="use-elastic" showGrid={false} resolution={18} tilt={4} shading={.32} grabRadius={.4} pull={.28} /><figcaption>03 / EXPERIÊNCIA</figcaption></figure>
          </div>
          <span className="horizontal-use-mark" aria-hidden="true">FORMA, FUNÇÃO E MOVIMENTO — 2026</span>
        </section>
      </div>
      <div ref={dragCursorRef} className="drag-media-cursor" aria-hidden="true"><span>ARRASTE</span><i>→</i></div>
    </div>
  </section>;
}

function CaseStudies() {
  const [selected, setSelected] = useState(null);
  return <section className="case-studies section-pad" aria-labelledby="case-studies-title">
    <div className="case-studies-head"><div className="section-label"><span>03.1</span><span>PROJETOS EM CONTEXTO</span></div><h2 id="case-studies-title">Design bonito.<br /><em>Decisões que funcionam.</em></h2><p>Cada projeto nasce de um desafio real e se transforma em uma solução clara, expressiva e preparada para evoluir.</p></div>
    <div className="case-grid">{projectSlides.map((project, index) => <a className="case-card" key={project.name} href={`#projeto-${index}`} onClick={event => { event.preventDefault(); setSelected(project); }} aria-haspopup="dialog" aria-label={`Ver detalhes do projeto ${project.name}`}>
      <div className="case-card-media"><img src={project.image} alt={`Projeto ${project.name}`} loading="lazy" decoding="async" /><span>0{index + 1}</span></div>
      <div className="case-card-copy"><small>{project.discipline}</small><h3>{project.name}</h3><dl><div><dt>Desafio</dt><dd>{project.challenge}</dd></div><div><dt>Solução</dt><dd>{project.solution}</dd></div><div><dt>Entrega</dt><dd>{project.outcome}</dd></div></dl><strong>Conheça o projeto <i>↗</i></strong></div>
    </a>)}</div>
    <ProjectDialog project={selected} onClose={() => setSelected(null)} contactUrl={whatsappLink(`Olá, vi o projeto ${selected?.name || ""} no site da Fluxor e quero conversar sobre algo nessa direção.`)} />
  </section>;
}

function DigitalEvolution() {
  return <section className="digital-evolution" aria-label="Evolução contínua">
    <div className="digital-evolution-head section-label"><span>04</span><span>EVOLUÇÃO CONTÍNUA</span></div>
    <ScrollExpand src={scrollExpandVideo} poster={scrollExpandPoster} mediaType="video" title="O digital não para de evoluir." scrollHint="ROLE PARA EXPANDIR" startWidth={44} startHeight={46} startRadius={18} endRadius={0} endBottomRadius={28} mediaZoom={1.12} scrollDistance={2.6} holdDistance={.55} smoothing={.16} overlayScrim={.68} useWindowScroll>
      <h2 className="digital-expanded-copy">Nosso trabalho também não.</h2>
      <span className="digital-expanded-mark">FLX / SEM ESTADO FINAL</span>
    </ScrollExpand>
    <div className="digital-evolution-outro" data-scroll-reveal-section>
      <div className="digital-evolution-outro-sticky">
        <div className="digital-evolution-outro-label section-label"><span>04.1</span><span>PROXIMIDADE REAL</span></div>
        <div className="digital-evolution-outro-copy">
          <ScrollCharacterReveal progressStart={0} progressEnd={.64}>Trabalhamos com um número limitado de projetos por vez para mergulhar de verdade em cada marca, entender suas necessidades e cuidar de cada detalhe do processo.</ScrollCharacterReveal>
          <ScrollCharacterReveal className="digital-evolution-outro-secondary" progressStart={.38} progressEnd={1}>Do conceito à entrega final, mantemos uma comunicação próxima e um acompanhamento constante para criar experiências digitais e visuais com intenção, consistência e personalidade.</ScrollCharacterReveal>
          <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="digital-evolution-cta">Vamos falar no WhatsApp <span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </div>
    <MeteorScrollSection />
  </section>;
}

function Services() {
  return <section className="services section-pad" id="services"><div className="section-label reveal"><span>05</span><span>O QUE FAZEMOS</span></div><div className="service-list">{services.map((service, i) => <ServiceHoverLink key={service.title} index={i} {...service} />)}</div><div className="services-contact"><span>Tem uma ideia e não sabe por onde começar?</span><a href={WHATSAPP_URL} target="_blank" rel="noreferrer">Conte para a gente no WhatsApp <i>↗</i></a></div></section>;
}

function Process() {
  return <section className="process pricing section-pad" id="process">
    <div className="section-label reveal"><span>06</span><span>FORMATOS DE PROJETO</span></div>
    <div className="pricing-head"><span>INVESTIMENTO COM CONTEXTO</span><h2>Escolha um ponto<br />de <em>partida.</em></h2><p>Cada projeto é dimensionado depois da imersão. Estes formatos ajudam a entender escopo e investimento inicial.</p></div>
    <div className="pricing-grid">{pricingPlans.map(plan => <article key={plan.name} className={`pricing-card${plan.featured ? " is-featured" : ""}`}><span className="pricing-number">{plan.number}</span>{plan.featured && <span className="pricing-tag">MAIS ESCOLHIDO</span>}<h3>{plan.name}</h3><p>{plan.description}</p><strong>{plan.price}</strong><ul>{plan.features.map(feature => <li key={feature}>{feature}<span>↗</span></li>)}</ul><a href={whatsappLink(`Olá, quero conversar sobre o formato ${plan.name} da Fluxor.`)} target="_blank" rel="noreferrer">Conversar no WhatsApp <span>→</span></a></article>)}</div>
    <p className="pricing-note">* Os valores são referências iniciais. Escopo, prazo e necessidades técnicas definem a proposta final.</p>
  </section>;
}

function Testimonials() {
  return <section className="testimonials" aria-labelledby="testimonials-title"><div className="testimonials-head section-pad"><div className="section-label"><span>07</span><span>QUEM CRIOU COM A GENTE</span></div><h2 id="testimonials-title">Palavras que<br /><em>ficaram.</em></h2><p>Histórias reais de processos construídos com proximidade, intenção e confiança.</p></div><CircularGallery items={testimonials} bend={3} scrollSpeed={1.15} scrollEase={.07} /></section>;
}

function Contact() {
  const socials = [["Instagram", "https://www.instagram.com/fluxorstudio/"], ["Behance", "https://www.behance.net/bertdsgn"]];
  return <footer className="contact" id="contact">
    <FooterDoodles />
    <div className="contact-topline"><a href="#work">PROJETOS</a><span>FLUXOR® / ESTÚDIO CRIATIVO</span><a href="#top">TOPO ↑</a></div>
    <div className="contact-center">
      <span className="contact-kicker">UMA IDEIA EM MOVIMENTO?</span>
      <h2>Vamos criar<br /><em>algo vivo.</em></h2>
      <div className="contact-actions">
        <a className="contact-mail" href="mailto:hello@fluxor.studio"><span>hello@fluxor.studio</span><i aria-hidden="true">↗</i></a>
        <a className="contact-mail contact-phone" href="tel:+5571981987777"><span>+55 71 98198-7777</span><i aria-hidden="true">↗</i></a>
        <a className="contact-mail contact-whatsapp" href={WHATSAPP_URL} target="_blank" rel="noreferrer"><span>Falar no WhatsApp</span><i aria-hidden="true">↗</i></a>
      </div>
    </div>
    <div className="contact-bottom">
      <span>FLUXOR® / 2026</span>
      <nav className="contact-socials" aria-label="Redes sociais">{socials.map(([name, href]) => <a key={name} href={href} target="_blank" rel="noreferrer" aria-label={name}><SocialIcon name={name} /><span>{name}</span></a>)}</nav>
      <span>SALVADOR — BRASIL</span>
    </div>
  </footer>;
}

export default function App() {
  useLayoutEffect(() => {
    if (window.location.hash) return undefined;
    const previous = history.scrollRestoration;
    history.scrollRestoration = "manual";
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    const frame = requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "instant" }));
    return () => {
      cancelAnimationFrame(frame);
      history.scrollRestoration = previous;
    };
  }, []);
  useReveal();
  return <><a className="skip-link" href="#studio">Pular para o conteúdo</a><div className="hero-transition-shell"><Nav/><Hero/></div><main><Studio/><CaseStudies/><DigitalEvolution/><Services/><Process/><Testimonials/><ScrollSyncedText/><Contact/></main><a className="whatsapp-float" href={WHATSAPP_URL} target="_blank" rel="noreferrer" aria-label="Falar com a Fluxor pelo WhatsApp"><span>WhatsApp</span><i aria-hidden="true">↗</i></a></>;
}
