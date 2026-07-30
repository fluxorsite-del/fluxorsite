'use client';

import { useState, useEffect } from 'react';

interface HeaderProps {
  onOpenEstimator: (pkg?: string) => void;
}

export default function Header({ onOpenEstimator }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    let scrollTicking = false;

    const handleScroll = () => {
      if (!scrollTicking) {
        requestAnimationFrame(() => {
          const currentScroll = Math.max(window.scrollY, 0);
          setIsScrolled(currentScroll > 30);
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Section Observer for active links
    const sections = Array.from(document.querySelectorAll<HTMLElement>('main section[id]'));
    let sectionObserver: IntersectionObserver | null = null;

    if ('IntersectionObserver' in window && sections.length) {
      sectionObserver = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

          if (visible) {
            setActiveSection(visible.target.id);
          }
        },
        { rootMargin: '-28% 0px -58% 0px', threshold: [0, 0.2, 0.5] }
      );

      sections.forEach((section) => sectionObserver?.observe(section));
    }

    const handleResize = () => {
      if (window.innerWidth > 950) {
        setIsMenuOpen(false);
        document.body.classList.remove('menu-open');
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (sectionObserver) sectionObserver.disconnect();
    };
  }, []);

  const toggleMenu = () => {
    const nextState = !isMenuOpen;
    setIsMenuOpen(nextState);
    if (nextState) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    document.body.classList.remove('menu-open');
  };

  return (
    <header className={`site-header ${isScrolled ? 'scrolled' : ''}`}>
      <a className="brand" href="#inicio" aria-label="Fluxor Studio - início">
        <span className="brand-mark">F</span>
        <span>
          fluxor<span className="brand-light">studio</span>
        </span>
      </a>

      <nav
        className={`desktop-nav ${isMenuOpen ? 'open' : ''}`}
        aria-label="Navegação principal"
      >
        <a
          href="#servicos"
          className={activeSection === 'servicos' ? 'active' : ''}
          onClick={closeMenu}
        >
          <span>Serviços</span>
        </a>
        <a
          href="#portfolio"
          className={activeSection === 'portfolio' ? 'active' : ''}
          onClick={closeMenu}
        >
          <span>Portfólio</span>
        </a>
        <a
          href="#processo"
          className={activeSection === 'processo' ? 'active' : ''}
          onClick={closeMenu}
        >
          <span>Processo</span>
        </a>
        <a
          href="#pacotes"
          className={activeSection === 'pacotes' ? 'active' : ''}
          onClick={closeMenu}
        >
          <span>Pacotes</span>
        </a>
        <a
          href="#sobre"
          className={activeSection === 'sobre' ? 'active' : ''}
          onClick={closeMenu}
        >
          <span>Sobre</span>
        </a>
      </nav>

      <button
        type="button"
        className="btn btn-small btn-primary header-cta-btn"
        onClick={() => onOpenEstimator()}
      >
        Diagnóstico WhatsApp <span>↗</span>
      </button>

      <button
        className={`menu-toggle ${isMenuOpen ? 'active' : ''}`}
        aria-label="Abrir menu"
        aria-expanded={isMenuOpen}
        onClick={toggleMenu}
      >
        <span />
        <span />
      </button>
    </header>
  );
}
