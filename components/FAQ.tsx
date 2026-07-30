'use client';

import { useState } from 'react';

const faqItems = [
  {
    question: 'Dá pra ter uma estratégia visual de verdade sem levar meses?',
    answer:
      'Sim. Nosso processo reduz ruído e retrabalho. A pesquisa e o conceito são feitos com precisão; o prazo enxuto vem da organização, não da perda de qualidade.',
  },
  {
    question: 'Qual o prazo médio de entrega?',
    answer:
      'Projetos essenciais levam em média de 15 a 25 dias úteis. Escopos completos podem variar de 30 a 60 dias.',
  },
  {
    question: 'Como funciona o preço?',
    answer:
      'O investimento depende do escopo, complexidade e prazo. Após uma conversa inicial, enviamos uma proposta clara e detalhada.',
  },
  {
    question: 'Vocês cuidam da hospedagem também?',
    answer:
      'Sim. Podemos orientar a contratação, publicar o site e configurar domínio, SSL e ferramentas de análise.',
  },
  {
    question: 'Posso pedir alterações depois da entrega?',
    answer:
      'Sim. Cada pacote prevê rodadas de ajustes e também oferecemos suporte contínuo após a entrega.',
  },
];

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setActiveIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="section faq">
      <div className="container faq-grid">
        <div className="reveal">
          <span className="eyebrow">Perguntas frequentes</span>
          <h2>
            Dúvidas antes<br />
            de <span>começar.</span>
          </h2>
          <p>
            As respostas para o que mais perguntam antes de iniciar um projeto com a
            Fluxor.
          </p>
        </div>

        <div className="accordion reveal delay-1">
          {faqItems.map((item, index) => {
            const isOpen = activeIndex === index;
            return (
              <div
                key={index}
                className={`faq-item ${isOpen ? 'active' : ''}`}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  aria-expanded={isOpen}
                >
                  {item.question}
                  <span>{isOpen ? '−' : '+'}</span>
                </button>
                <div className="faq-answer">
                  <p>{item.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
