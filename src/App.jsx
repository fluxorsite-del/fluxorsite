import React, { lazy, Suspense, useEffect, useRef, useState } from "react";
import projectVeil from "./assets/project-veil-optimized.webp";
import projectMateria from "./assets/project-materia-optimized.webp";
import projectSignal from "./assets/project-signal-optimized.webp";
import useOne from "./assets/use1-optimized.webp";
import useTwo from "./assets/use2-optimized.webp";
import useThree from "./assets/use3-optimized.webp";
import scrollExpandVideo from "./assets/scrollexpand1.webm";
import ElasticMesh from "./ElasticMesh";
import ScrollExpand from "./ScrollExpand";
import ScrollCharacterReveal from "./ScrollCharacterReveal";
import MeteorScrollSection from "./MeteorScrollSection";
import ServiceHoverLink from "./ServiceHoverLink";
import { FooterDoodles, SocialIcon } from "./FooterDoodles";
import CircularGallery from "./CircularGallery";
import ScrollSyncedText from "./ScrollSyncedText";
import MenuDoodles from "./MenuDoodles";
import heroVideoUrl from "../fluxor-bg.mp4";
import serviceWebDesign from "./assets/services/web-design.webp";
import serviceCreative from "./assets/services/desenvolvimento-criativo.webp";
import serviceLanding from "./assets/services/landing-pages.webp";
import serviceExperience from "./assets/services/experiencias-digitais.webp";
import serviceCommerce from "./assets/services/ecommerce.webp";
import servicePerformance from "./assets/services/performance.webp";

const MorphSlider = lazy(() => import("./MorphSlider"));

const services = [
  { title: "Design para Web", description: "Interfaces autorais que traduzem estratégia em presença digital.", image: serviceWebDesign },
  { title: "Desenvolvimento Criativo", description: "Tecnologia, movimento e interação construídos sob medida.", image: serviceCreative },
  { title: "Landing Pages", description: "Narrativas digitais focadas em clareza, desejo e conversão.", image: serviceLanding },
  { title: "Experiências Digitais", description: "Experiências imersivas que aproximam pessoas e marcas.", image: serviceExperience },
  { title: "Comércio Digital", description: "Lojas digitais expressivas, intuitivas e preparadas para crescer.", image: serviceCommerce },
  { title: "Performance e Evolução", description: "Acompanhamento contínuo para manter tudo rápido e relevante.", image: servicePerformance },
];
const projectSlides = [
  { image: projectVeil, caption: "VÉU / IDENTIDADE DIGITAL" },
  { image: projectMateria, caption: "MATÉRIA / EXPERIÊNCIA EDITORIAL" },
  { image: projectSignal, caption: "SINAL / CULTURA EM MOVIMENTO" }
];
const pricingPlans = [
  { number: "01", name: "Essencial", price: "A partir de R$ 4,8 mil", description: "Para marcas que precisam organizar sua presença e entrar no digital com clareza.", features: ["Direção visual", "Landing page autoral", "Experiência responsiva", "Publicação e suporte"] },
  { number: "02", name: "Presença", price: "A partir de R$ 8,9 mil", description: "Uma experiência completa para transformar posicionamento em uma presença digital memorável.", features: ["Estratégia e arquitetura", "Website personalizado", "Movimento e interações", "CMS e acompanhamento"], featured: true },
  { number: "03", name: "Ecossistema", price: "Sob consulta", description: "Para projetos com identidade, produto e tecnologia funcionando como um único sistema.", features: ["Imersão estratégica", "Identidade ou evolução", "Plataforma sob medida", "Evolução contínua"] }
];
const testimonials = [
  { name: "Marina Costa", role: "Fundadora, Nativa", image: "https://i.pravatar.cc/400?img=47", quote: "A Fluxor conseguiu traduzir uma ideia difícil de explicar em uma presença que parece exatamente nossa." },
  { name: "Rafael Moura", role: "Diretor, Norte", image: "https://i.pravatar.cc/400?img=12", quote: "O cuidado com estratégia, interação e performance mudou completamente a percepção da nossa marca." },
  { name: "Camila Prado", role: "Marketing, Soma", image: "https://i.pravatar.cc/400?img=32", quote: "O processo foi próximo, transparente e muito preciso. Recebemos mais do que um site: ganhamos direção." },
  { name: "Lucas Ferreira", role: "Sócio, Onda", image: "https://i.pravatar.cc/400?img=68", quote: "Cada detalhe tem intenção. A nova experiência nos deixou mais confiantes para apresentar e vender nosso trabalho." },
  { name: "Bianca Alves", role: "CEO, Essenza", image: "https://i.pravatar.cc/400?img=45", quote: "A equipe entendeu rapidamente o nosso universo e construiu algo bonito, consistente e realmente funcional." }
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

function VideoPaintReveal() {
  const wrapRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const hero = wrap.closest(".hero");
    const alignmentStage = hero.querySelector(".hero-stage");
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const fine = matchMedia("(pointer: fine)").matches;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    const renderContext = canvas.getContext("2d", { alpha: true });
    const maskCanvas = document.createElement("canvas");
    const maskContext = maskCanvas.getContext("2d", { alpha: true });
    let bounds = wrap.getBoundingClientRect();
    let dpr = 1;
    let target = { x: 0, y: 0 };
    let brush = { x: 0, y: 0 };
    let previousBrush = { x: 0, y: 0 };
    let rawPointer = { x: 0, y: 0 };
    let previousPointer = { x: 0, y: 0 };
    let velocity = { x: 0, y: 0 };
    let pointerSpeed = 0;
    let lastPointerTime = 0;
    let pointerInside = false;
    let hasBrushPosition = false;
    let stamps = [];
    let stampIndex = 0;
    let raf = 0;
    let lastTime = performance.now();

    const random = () => {
      const value = Math.sin(++stampIndex * 12.9898) * 43758.5453;
      return value - Math.floor(value);
    };

    const fluidBlob = (x, y, radius, alpha, softness = .06, stretch = 1, angle = 0) => {
      maskContext.save();
      maskContext.translate(x, y);
      maskContext.rotate(angle);
      maskContext.scale(stretch, 1);
      const gradient = maskContext.createRadialGradient(0, 0, radius * (1 - softness), 0, 0, radius);
      gradient.addColorStop(0, `rgba(255,255,255,${alpha})`);
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      maskContext.fillStyle = gradient;
      maskContext.beginPath();
      maskContext.arc(0, 0, radius, 0, Math.PI * 2);
      maskContext.fill();
      maskContext.restore();
    };

    const brushRadius = () => Math.max(42, Math.min(68, Math.min(bounds.width, bounds.height) * .075));

    const addStamp = (x, y, speed, direction, now) => {
      const speedFactor = Math.min(speed / 1500, 1);
      const radius = brushRadius() * (1.08 - speedFactor * .18) * (.95 + random() * .1);
      const edgeBlobs = [];
      for (let index = 0; index < 3; index += 1) {
        const angle = random() * Math.PI * 2;
        const distance = radius * (.68 + random() * .2);
        edgeBlobs.push({
          x: Math.cos(angle) * distance + (random() - .5) * 4,
          y: Math.sin(angle) * distance + (random() - .5) * 4,
          radius: radius * (.17 + random() * .14)
        });
      }
      let droplet = null;
      if (speed > 560 && random() < .025) {
        const angle = random() * Math.PI * 2;
        const distance = radius + 20 + random() * 35;
        droplet = { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance, radius: 4 + random() * 10 };
      }
      stamps.push({
        x: x + (random() - .5) * 5,
        y: y + (random() - .5) * 5,
        radius,
        angle: direction + (random() - .5) * .14,
        stretch: 1.18 + speedFactor * .55 + random() * .12,
        flow: Math.min(48, speed * .028) * (.82 + random() * .36),
        wobble: random() * Math.PI * 2,
        born: now,
        life: 560 + random() * 160,
        edgeBlobs,
        droplet
      });
      if (stamps.length > 280) stamps.splice(0, stamps.length - 280);
    };

    const paintSegment = (from, to, speed, now) => {
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const distance = Math.hypot(dx, dy);
      if (distance < .4) return;
      const direction = Math.atan2(dy, dx);
      const spacing = Math.max(3, Math.min(7, brushRadius() * .075));
      const steps = Math.max(1, Math.ceil(distance / spacing));
      for (let step = 1; step <= steps; step += 1) {
        const progress = step / steps;
        addStamp(from.x + dx * progress, from.y + dy * progress, speed, direction, now);
      }
    };

    const drawTemporalMask = now => {
      maskContext.clearRect(0, 0, bounds.width, bounds.height);
      stamps = stamps.filter(stamp => now - stamp.born < stamp.life);
      stamps.forEach(stamp => {
        const progress = (now - stamp.born) / stamp.life;
        const fade = progress < .36 ? 1 : Math.max(0, 1 - (progress - .36) / .64);
        const shrink = 1 - Math.pow(progress, 1.55) * .76;
        const radius = stamp.radius * shrink;
        const forward = stamp.flow * Math.sin(progress * Math.PI * .72);
        const ripple = Math.sin(progress * Math.PI * 2 + stamp.wobble) * 3.5 * progress;
        const drawX = stamp.x + Math.cos(stamp.angle) * forward - Math.sin(stamp.angle) * ripple;
        const drawY = stamp.y + Math.sin(stamp.angle) * forward + Math.cos(stamp.angle) * ripple;
        const fluidStretch = stamp.stretch * (1 + progress * .34);
        fluidBlob(drawX, drawY, radius, fade, .05, fluidStretch, stamp.angle);
        stamp.edgeBlobs.forEach(blob => fluidBlob(
          drawX + blob.x * shrink,
          drawY + blob.y * shrink,
          blob.radius * shrink,
          fade,
          .075,
          .72 + (blob.radius / stamp.radius) * 1.4,
          stamp.angle + blob.x * .018
        ));
        if (stamp.droplet) fluidBlob(
          drawX + stamp.droplet.x + Math.cos(stamp.angle) * forward * .3,
          drawY + stamp.droplet.y + Math.sin(stamp.angle) * forward * .3,
          stamp.droplet.radius * Math.max(.35, shrink),
          fade,
          .09,
          1.35,
          stamp.angle
        );
      });
    };

    const resize = () => {
      const previousWidth = bounds.width;
      const previousHeight = bounds.height;
      bounds = wrap.getBoundingClientRect();
      const scaleX = previousWidth ? bounds.width / previousWidth : 1;
      const scaleY = previousHeight ? bounds.height / previousHeight : 1;
      const radiusScale = Math.min(scaleX, scaleY);
      stamps.forEach(stamp => {
        stamp.x *= scaleX;
        stamp.y *= scaleY;
        stamp.radius *= radiusScale;
      });
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.round(bounds.width * dpr));
      canvas.height = Math.max(1, Math.round(bounds.height * dpr));
      maskCanvas.width = canvas.width;
      maskCanvas.height = canvas.height;
      renderContext.setTransform(dpr, 0, 0, dpr, 0, 0);
      maskContext.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    let heroVisible = true;
    const tick = now => {
      raf = 0;
      const deltaTime = Math.min((now - lastTime) / 1000, .05);
      lastTime = now;
      if (pointerInside && hasBrushPosition) {
        previousBrush = { ...brush };
        const pointerIsMoving = now - lastPointerTime < 155 && pointerSpeed > 18;
        const damping = 1 - Math.exp(-(pointerIsMoving ? 24 : 30) * deltaTime);
        const destination = pointerIsMoving ? target : rawPointer;
        brush.x += (destination.x - brush.x) * damping;
        brush.y += (destination.y - brush.y) * damping;
        if (pointerIsMoving) paintSegment(previousBrush, brush, pointerSpeed, now);
        else {
          const velocityDecay = Math.exp(-12 * deltaTime);
          velocity.x *= velocityDecay;
          velocity.y *= velocityDecay;
          pointerSpeed = Math.hypot(velocity.x, velocity.y);
        }
      }

      drawTemporalMask(now);
      renderContext.clearRect(0, 0, bounds.width, bounds.height);
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth && video.videoHeight) {
        const stageBounds = alignmentStage.getBoundingClientRect();
        const scale = Math.min(stageBounds.width / video.videoWidth, stageBounds.height / video.videoHeight);
        const width = video.videoWidth * scale;
        const height = video.videoHeight * scale;
        const x = stageBounds.left - bounds.left + (stageBounds.width - width) / 2;
        const y = stageBounds.top - bounds.top + (stageBounds.height - height) / 2;
        renderContext.globalCompositeOperation = "source-over";
        renderContext.drawImage(video, x, y, width, height);
        renderContext.globalCompositeOperation = "destination-in";
        renderContext.drawImage(maskCanvas, 0, 0, maskCanvas.width, maskCanvas.height, 0, 0, bounds.width, bounds.height);
        renderContext.globalCompositeOperation = "source-over";
      }
      if (heroVisible) raf = requestAnimationFrame(tick);
    };

    const onMove = event => {
      const now = performance.now();
      const x = Math.max(0, Math.min(bounds.width, event.clientX - bounds.left));
      const y = Math.max(0, Math.min(bounds.height, event.clientY - bounds.top));
      const elapsed = Math.max((now - lastPointerTime) / 1000, 1 / 120);
      const instantX = (x - previousPointer.x) / elapsed;
      const instantY = (y - previousPointer.y) / elapsed;
      velocity.x += (instantX - velocity.x) * .42;
      velocity.y += (instantY - velocity.y) * .42;
      pointerSpeed = Math.hypot(velocity.x, velocity.y);
      const lead = Math.min(64, 8 + pointerSpeed * .04);
      const length = pointerSpeed || 1;
      rawPointer = { x, y };
      target = {
        x: Math.max(0, Math.min(bounds.width, x + velocity.x / length * lead)),
        y: Math.max(0, Math.min(bounds.height, y + velocity.y / length * lead))
      };
      previousPointer = { x, y };
      lastPointerTime = now;
      wrap.classList.add("is-active");
      hero.classList.add("paint-is-active");
    };
    const onEnter = event => {
      resize();
      const now = performance.now();
      rawPointer = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
      target = { ...rawPointer };
      brush = { ...target };
      previousBrush = { ...target };
      previousPointer = { ...rawPointer };
      velocity = { x: 0, y: 0 };
      pointerSpeed = 0;
      lastPointerTime = now;
      pointerInside = true;
      hasBrushPosition = true;
      video.play().catch(() => {});
    };
    const onLeave = () => {
      pointerInside = false;
      hasBrushPosition = false;
      velocity = { x: 0, y: 0 };
      pointerSpeed = 0;
    };
    const onScroll = () => {
      bounds = wrap.getBoundingClientRect();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(wrap);
    observer.observe(alignmentStage);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      heroVisible = entry.isIntersecting;
      if (heroVisible) {
        lastTime = performance.now();
        video.play().catch(() => {});
        if (!raf) raf = requestAnimationFrame(tick);
      } else {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        video.pause();
        stamps = [];
        renderContext.clearRect(0, 0, bounds.width, bounds.height);
      }
    }, { rootMargin: "120px 0px" });
    visibilityObserver.observe(hero);
    hero.addEventListener("pointermove", onMove, { passive: true });
    hero.addEventListener("pointerenter", onEnter);
    hero.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      visibilityObserver.disconnect();
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerenter", onEnter);
      hero.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div ref={wrapRef} className="paint-stage" data-testid="paint-stage">
      <video ref={videoRef} className="paint-source" autoPlay muted loop playsInline preload="metadata" aria-hidden="true">
        <source src={heroVideoUrl} type="video/mp4" />
      </video>
      <canvas ref={canvasRef} className="video-reveal" aria-hidden="true" />
    </div>
  );
}

function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeMenuLink, setActiveMenuLink] = useState("");

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
  return <nav className={`nav ${menuOpen ? "menu-is-open" : ""}`} aria-label="Navegação principal">
    <a className="brand" href="#top" aria-label="Fluxor, início" onClick={closeMenu}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3h18v5H9v4h10v5H9v4H3z"/></svg><span>FLUXOR<sup>®</sup></span></a>
    <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="fullscreen-menu" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} onClick={() => setMenuOpen(open => !open)}>
      <span/><span/><span className="menu-toggle-label">MENU</span>
    </button>
    <div className="menu-panel" id="fullscreen-menu" aria-hidden={!menuOpen}>
      <div className="menu-panel-meta"><span>NAVEGAÇÃO / 2026</span><span>ESTÚDIO DIGITAL INDEPENDENTE</span></div>
      <MenuDoodles active={activeMenuLink} />
      <div className="menu-links">
        <a href="#work" onMouseEnter={() => setActiveMenuLink("work")} onMouseLeave={() => setActiveMenuLink("")} onFocus={() => setActiveMenuLink("work")} onClick={closeMenu}><small>01 / SELEÇÃO</small><span>Projetos</span><i>↗</i></a>
        <a href="#studio" onMouseEnter={() => setActiveMenuLink("studio")} onMouseLeave={() => setActiveMenuLink("")} onFocus={() => setActiveMenuLink("studio")} onClick={closeMenu}><small>02 / SOBRE</small><span>Estúdio</span><i>↗</i></a>
        <a href="#services" onMouseEnter={() => setActiveMenuLink("services")} onMouseLeave={() => setActiveMenuLink("")} onFocus={() => setActiveMenuLink("services")} onClick={closeMenu}><small>03 / CAPACIDADES</small><span>Serviços</span><i>↗</i></a>
        <a href="#contact" onMouseEnter={() => setActiveMenuLink("contact")} onMouseLeave={() => setActiveMenuLink("")} onFocus={() => setActiveMenuLink("contact")} onClick={closeMenu}><small>04 / CONVERSA</small><span>Contato</span><i>↗</i></a>
      </div>
      <div className="menu-footer">
        <span>FLUXOR® — SALVADOR, BR</span>
        <a href="#contact" onClick={closeMenu}>INICIAR UM PROJETO <i>↗</i></a>
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
      hero.style.setProperty("--hero-scale", (1 - eased * .41).toFixed(4));
      hero.style.setProperty("--hero-x", `${eased * 25}vw`);
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
    <Nav />
    <div className="hero-intro reveal-late"><p>Não fazemos só sites.<br />Criamos experiências que ficam.</p><a href="#studio">Conheça a Fluxor <span>↗</span></a></div>
    <div className={`hero-stage ${alignmentDebug ? "debug-align" : ""}`} aria-label="Fluxor">
      <div className="word-wrap word-back">
        <h1 aria-label="FLUXOR">
          {"FLUXOR".split("").map((letter, index) => (
            <span key={letter + index} aria-hidden="true" style={{ "--letter-index": index }}>{letter}</span>
          ))}
        </h1>
      </div>
    </div>
    <VideoPaintReveal />
    <div className="paint-hint" aria-hidden="true"><span>MOVE TO REVEAL</span><i>↗</i></div>
    <div className="hero-meta reveal-late"><p>DIGITAL STUDIO<br />SALVADOR — BR<br />MMXXVI</p><p className="hero-index">INDEPENDENT<br />CREATIVE PRACTICE</p></div>
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
    const video = section.querySelector("video");
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
      if (entry.isIntersecting) {
        video.play().catch(() => {});
        setSliderReady(true);
      }
      else video.pause();
    }, { rootMargin: "240px 0px" });
    mediaObserver.observe(section);
    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      mediaObserver.disconnect();
      video.pause();
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
      <div className="intro-project" aria-label="Projeto Fluxor em movimento">
        <video muted loop playsInline preload="metadata" aria-hidden="true">
          <source src={heroVideoUrl} type="video/mp4" />
        </video>
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
            <figure className="use-frame use-frame-one"><img src={useOne} alt="Projeto de interface Fluxor, composição vertical" /><ElasticMesh image={useOne} className="use-elastic" showGrid={false} resolution={18} tilt={5} shading={.34} grabRadius={.42} pull={.3} /><figcaption>01 / INTERFACE</figcaption></figure>
            <figure className="use-frame use-frame-two"><img src={useTwo} alt="Identidade visual Fluxor, composição vertical" /><ElasticMesh image={useTwo} className="use-elastic" showGrid={false} resolution={18} tilt={5} shading={.34} grabRadius={.42} pull={.3} /><figcaption>02 / IDENTIDADE</figcaption></figure>
            <figure className="use-frame use-frame-three"><img src={useThree} alt="Experiência digital Fluxor, composição horizontal" /><ElasticMesh image={useThree} className="use-elastic" showGrid={false} resolution={18} tilt={4} shading={.32} grabRadius={.4} pull={.28} /><figcaption>03 / EXPERIÊNCIA</figcaption></figure>
          </div>
          <span className="horizontal-use-mark" aria-hidden="true">FORMA, FUNÇÃO E MOVIMENTO — 2026</span>
        </section>
      </div>
      <div ref={dragCursorRef} className="drag-media-cursor" aria-hidden="true"><span>ARRASTE</span><i>→</i></div>
    </div>
  </section>;
}

function DigitalEvolution() {
  return <section className="digital-evolution" aria-label="Evolução contínua">
    <div className="digital-evolution-head section-label"><span>04</span><span>EVOLUÇÃO CONTÍNUA</span></div>
    <ScrollExpand src={scrollExpandVideo} mediaType="video" title="O digital não para de evoluir." scrollHint="ROLE PARA EXPANDIR" startWidth={44} startHeight={46} startRadius={18} endRadius={0} endBottomRadius={28} mediaZoom={1.12} scrollDistance={2.6} holdDistance={.55} smoothing={.16} overlayScrim={.68} useWindowScroll>
      <h2 className="digital-expanded-copy">Nosso trabalho também não.</h2>
      <span className="digital-expanded-mark">FLX / SEM ESTADO FINAL</span>
    </ScrollExpand>
    <div className="digital-evolution-outro" data-scroll-reveal-section>
      <div className="digital-evolution-outro-sticky">
        <div className="digital-evolution-outro-label section-label"><span>04.1</span><span>PROXIMIDADE REAL</span></div>
        <div className="digital-evolution-outro-copy">
          <ScrollCharacterReveal progressStart={0} progressEnd={.64}>Trabalhamos com um número limitado de projetos por vez para mergulhar de verdade em cada marca, entender suas necessidades e cuidar de cada detalhe do processo.</ScrollCharacterReveal>
          <ScrollCharacterReveal className="digital-evolution-outro-secondary" progressStart={.38} progressEnd={1}>Do conceito à entrega final, mantemos uma comunicação próxima e um acompanhamento constante para criar experiências digitais e visuais com intenção, consistência e personalidade.</ScrollCharacterReveal>
          <a href="#contact" className="digital-evolution-cta">Vamos nos falar <span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </div>
    <MeteorScrollSection />
  </section>;
}

function Services() {
  return <section className="services section-pad" id="services"><div className="section-label reveal"><span>05</span><span>O QUE FAZEMOS</span></div><div className="service-list">{services.map((service, i) => <ServiceHoverLink key={service.title} index={i} {...service} />)}</div></section>;
}

function Process() {
  return <section className="process pricing section-pad" id="process">
    <div className="section-label reveal"><span>06</span><span>FORMATOS DE PROJETO</span></div>
    <div className="pricing-head"><span>INVESTIMENTO COM CONTEXTO</span><h2>Escolha um ponto<br />de <em>partida.</em></h2><p>Cada projeto é dimensionado depois da imersão. Estes formatos ajudam a entender escopo e investimento inicial.</p></div>
    <div className="pricing-grid">{pricingPlans.map(plan => <article key={plan.name} className={`pricing-card${plan.featured ? " is-featured" : ""}`}><span className="pricing-number">{plan.number}</span>{plan.featured && <span className="pricing-tag">MAIS ESCOLHIDO</span>}<h3>{plan.name}</h3><p>{plan.description}</p><strong>{plan.price}</strong><ul>{plan.features.map(feature => <li key={feature}>{feature}<span>↗</span></li>)}</ul><a href="#contact">Conversar sobre o projeto <span>→</span></a></article>)}</div>
    <p className="pricing-note">* Os valores são referências iniciais. Escopo, prazo e necessidades técnicas definem a proposta final.</p>
  </section>;
}

function Testimonials() {
  return <section className="testimonials" aria-labelledby="testimonials-title"><div className="testimonials-head section-pad"><div className="section-label"><span>07</span><span>QUEM CRIOU COM A GENTE</span></div><h2 id="testimonials-title">Palavras que<br /><em>ficaram.</em></h2><p>Histórias reais de processos construídos com proximidade, intenção e confiança.</p></div><CircularGallery items={testimonials} bend={3} scrollSpeed={1.15} scrollEase={.07} /></section>;
}

function Contact() {
  const socials = [["Instagram", "https://instagram.com"], ["Behance", "https://behance.net"], ["LinkedIn", "https://linkedin.com"]];
  return <footer className="contact" id="contact">
    <FooterDoodles />
    <div className="contact-topline"><a href="#work">PROJETOS</a><span>FLUXOR® / ESTÚDIO CRIATIVO</span><a href="#top">TOPO ↑</a></div>
    <div className="contact-center">
      <span className="contact-kicker">UMA IDEIA EM MOVIMENTO?</span>
      <h2>Vamos criar<br /><em>algo vivo.</em></h2>
      <a className="contact-mail" href="mailto:hello@fluxor.studio"><span>hello@fluxor.studio</span><i aria-hidden="true">↗</i></a>
    </div>
    <div className="contact-bottom">
      <span>FLUXOR® / 2026</span>
      <nav className="contact-socials" aria-label="Redes sociais">{socials.map(([name, href]) => <a key={name} href={href} target="_blank" rel="noreferrer" aria-label={name}><SocialIcon name={name} /><span>{name}</span></a>)}</nav>
      <span>SALVADOR — BRASIL</span>
    </div>
  </footer>;
}

export default function App() {
  useReveal();
  return <><a className="skip-link" href="#studio">Pular para o conteúdo</a><div className="hero-transition-shell"><Hero/></div><main><Studio/><DigitalEvolution/><Services/><Process/><Testimonials/><ScrollSyncedText/><Contact/></main></>;
}
