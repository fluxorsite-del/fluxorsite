(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const desktop = window.matchMedia('(min-width: 951px)').matches;
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  // Cursor personalizado — ativado apenas em dispositivos com mouse.
  const dot = $('.cursor-dot');
  const ring = $('.cursor-ring');
  if (finePointer && dot && ring && !reduceMotion) {
    let mouseX = innerWidth / 2;
    let mouseY = innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let cursorFrame = 0;

    const renderCursor = () => {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      cursorFrame = requestAnimationFrame(renderCursor);
    };

    window.addEventListener('pointermove', (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      document.body.classList.add('cursor-ready');
    }, { passive: true });

    $$('a, button, input, .service-card, .project, .price-card, .testimonial, .faq-item').forEach((element) => {
      element.addEventListener('pointerenter', () => ring.classList.add('hover'));
      element.addEventListener('pointerleave', () => ring.classList.remove('hover'));
    });

    document.addEventListener('mouseleave', () => document.body.classList.remove('cursor-ready'));
    document.addEventListener('mouseenter', () => document.body.classList.add('cursor-ready'));
    renderCursor();
    window.addEventListener('pagehide', () => cancelAnimationFrame(cursorFrame), { once: true });
  } else {
    document.body.classList.add('cursor-disabled');
  }

  // Entradas durante a rolagem.
  const revealElements = $$('.reveal');
  revealElements.forEach((element, index) => {
    if (!element.dataset.reveal) {
      element.dataset.reveal = ['up', 'left', 'scale', 'right'][index % 4];
    }
  });

  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add('visible'));
  }

  // Cabeçalho: fundo, ocultação suave e seção ativa sem conflito de transform.
  const header = $('.site-header');
  const sections = $$('main section[id]');
  const navLinks = $$('.desktop-nav a[href^="#"]');
  let previousScroll = window.scrollY;
  let scrollTicking = false;

  const updateHeader = () => {
    if (!header) return;
    const currentScroll = Math.max(window.scrollY, 0);
    header.classList.toggle('scrolled', currentScroll > 30);
    const scrollingDown = currentScroll > previousScroll + 4;
    const scrollingUp = currentScroll < previousScroll - 4;
    if (scrollingDown && currentScroll > 520) header.classList.add('header-hidden');
    if (scrollingUp || currentScroll < 120) header.classList.remove('header-hidden');
    previousScroll = currentScroll;
    scrollTicking = false;
  };

  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      requestAnimationFrame(updateHeader);
      scrollTicking = true;
    }
  }, { passive: true });
  updateHeader();

  if ('IntersectionObserver' in window && sections.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${visible.target.id}`);
      });
    }, { rootMargin: '-28% 0px -58% 0px', threshold: [0, 0.2, 0.5] });
    sections.forEach((section) => sectionObserver.observe(section));
  }

  // Menu móvel.
  const toggle = $('.menu-toggle');
  const nav = $('.desktop-nav');
  if (toggle && nav) {
    const closeMenu = () => {
      nav.classList.remove('open');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    };
    toggle.addEventListener('click', () => {
      const willOpen = !nav.classList.contains('open');
      nav.classList.toggle('open', willOpen);
      toggle.classList.toggle('active', willOpen);
      toggle.setAttribute('aria-expanded', String(willOpen));
      document.body.classList.toggle('menu-open', willOpen);
    });
    $$('a', nav).forEach((link) => link.addEventListener('click', closeMenu));
    window.addEventListener('resize', () => { if (innerWidth > 950) closeMenu(); }, { passive: true });
  }

  // FAQ com altura animada estável.
  $$('.faq-item').forEach((item) => {
    const button = $('button', item);
    const answer = $('.faq-answer', item);
    const symbol = button ? $('span', button) : null;
    if (!button || !answer) return;

    button.setAttribute('aria-expanded', 'false');
    answer.style.maxHeight = '0px';

    button.addEventListener('click', () => {
      const opening = !item.classList.contains('active');
      $$('.faq-item.active').forEach((other) => {
        if (other === item) return;
        other.classList.remove('active');
        const otherButton = $('button', other);
        const otherAnswer = $('.faq-answer', other);
        const otherSymbol = otherButton ? $('span', otherButton) : null;
        otherButton?.setAttribute('aria-expanded', 'false');
        if (otherAnswer) otherAnswer.style.maxHeight = '0px';
        if (otherSymbol) otherSymbol.textContent = '+';
      });

      item.classList.toggle('active', opening);
      button.setAttribute('aria-expanded', String(opening));
      answer.style.maxHeight = opening ? `${answer.scrollHeight}px` : '0px';
      if (symbol) symbol.textContent = opening ? '−' : '+';
    });
  });

  // Efeito magnético sem sobrescrever transformações de hover.
  if (finePointer && !reduceMotion) {
    $$('.magnetic').forEach((button) => {
      let frame = 0;
      button.addEventListener('pointermove', (event) => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          const rect = button.getBoundingClientRect();
          const x = (event.clientX - rect.left - rect.width / 2) * 0.10;
          const y = (event.clientY - rect.top - rect.height / 2) * 0.14;
          button.style.setProperty('--magnetic-x', `${x}px`);
          button.style.setProperty('--magnetic-y', `${y}px`);
        });
      });
      button.addEventListener('pointerleave', () => {
        button.style.removeProperty('--magnetic-x');
        button.style.removeProperty('--magnetic-y');
      });
    });
  }

  // Luz que acompanha o mouse nos cartões, com atualização limitada a um frame.
  if (finePointer && !reduceMotion) {
    $$('.service-card, .price-card, .testimonial, .project').forEach((card) => {
      let frame = 0;
      card.addEventListener('pointermove', (event) => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          card.style.setProperty('--mouse-x', `${event.clientX - rect.left}px`);
          card.style.setProperty('--mouse-y', `${event.clientY - rect.top}px`);
        });
      });
    });
  }

  // Iluminação suave que acompanha o mouse no CTA final.
  const ctaCard = $('.cta-card');
  if (ctaCard && finePointer && !reduceMotion) {
    let ctaFrame = 0;
    ctaCard.addEventListener('pointermove', (event) => {
      cancelAnimationFrame(ctaFrame);
      ctaFrame = requestAnimationFrame(() => {
        const rect = ctaCard.getBoundingClientRect();
        ctaCard.style.setProperty('--cta-x', `${event.clientX - rect.left}px`);
        ctaCard.style.setProperty('--cta-y', `${event.clientY - rect.top}px`);
      });
    });
    ctaCard.addEventListener('pointerleave', () => {
      ctaCard.style.setProperty('--cta-x', '50%');
      ctaCard.style.setProperty('--cta-y', '50%');
    });
  }

  // Paralaxe do hero usando variáveis CSS para preservar rotações originais.
  const heroVisual = $('.hero-visual');
  if (heroVisual && desktop && finePointer && !reduceMotion) {
    const pieces = $$('.card-dashboard, .card-phone, .floating-tag, .floating-icon, .orb-main', heroVisual);
    let frame = 0;
    heroVisual.addEventListener('pointermove', (event) => {
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
    });
    heroVisual.addEventListener('pointerleave', () => {
      pieces.forEach((piece) => {
        piece.style.removeProperty('--parallax-x');
        piece.style.removeProperty('--parallax-y');
      });
    });
  }

  // Ondulação nos botões.
  $$('.btn, .newsletter button').forEach((button) => {
    button.addEventListener('click', (event) => {
      if (reduceMotion) return;
      const rect = button.getBoundingClientRect();
      const wave = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      wave.className = 'ripple';
      wave.style.width = wave.style.height = `${size}px`;
      wave.style.left = `${event.clientX - rect.left - size / 2}px`;
      wave.style.top = `${event.clientY - rect.top - size / 2}px`;
      button.appendChild(wave);
      wave.addEventListener('animationend', () => wave.remove(), { once: true });
    });
  });

  // Newsletter.
  const newsletter = $('.newsletter');
  if (newsletter) {
    newsletter.addEventListener('submit', (event) => {
      event.preventDefault();
      newsletter.classList.add('success');
      newsletter.innerHTML = '<span class="newsletter-success">Cadastro realizado com sucesso ✓</span>';
    });
  }
})();
