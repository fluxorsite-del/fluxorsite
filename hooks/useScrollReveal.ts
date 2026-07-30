'use client';

import { useEffect } from 'react';

export function useScrollReveal() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const revealElements = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));

    revealElements.forEach((element, index) => {
      if (!element.dataset.reveal) {
        element.dataset.reveal = ['up', 'left', 'scale', 'right'][index % 4];
      }
    });

    if ('IntersectionObserver' in window && !reduceMotion) {
      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
      );

      revealElements.forEach((element) => revealObserver.observe(element));

      return () => revealObserver.disconnect();
    } else {
      revealElements.forEach((element) => element.classList.add('visible'));
    }
  }, []);
}
