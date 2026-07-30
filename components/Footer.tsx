'use client';

import { useState, FormEvent } from 'react';

export default function Footer() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
    }
  };

  return (
    <footer>
      <div className="container footer-grid">
        <div>
          <a className="brand" href="#inicio">
            <span className="brand-mark">F</span>
            <span>
              fluxor<span className="brand-light">studio</span>
            </span>
          </a>
          <p>
            Comunicação visual, sites e estratégia para negócios que querem crescer sem
            intermediários.
          </p>
        </div>

        <div>
          <h4>Navegação</h4>
          <a href="#inicio">Início</a>
          <a href="#processo">Como funciona</a>
          <a href="#portfolio">Portfólio</a>
          <a href="#pacotes">Pacotes</a>
        </div>

        <div>
          <h4>Contato</h4>
          <a href="tel:+5511999999999">(11) 99999-9999</a>
          <a href="mailto:contato@fluxorstudio.com.br">
            contato@fluxorstudio.com.br
          </a>
          <span>São Paulo, SP — Brasil</span>
        </div>

        <div>
          <h4>Receba novidades</h4>
          {isSubscribed ? (
            <div className="newsletter success">
              <span className="newsletter-success">
                Cadastro realizado com sucesso ✓
              </span>
            </div>
          ) : (
            <form className="newsletter" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Seu melhor e-mail"
                aria-label="Seu melhor e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" aria-label="Cadastrar e-mail">
                →
              </button>
            </form>
          )}
          <div className="social-links">
            <a href="#">Instagram</a>
            <a href="#">Behance</a>
          </div>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© 2026 Fluxor Studio. Todos os direitos reservados.</span>
        <span>Design que chama atenção. Estratégia que gera ação.</span>
      </div>
    </footer>
  );
}
