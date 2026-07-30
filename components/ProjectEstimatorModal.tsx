'use client';

import { useState, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPackage?: string;
}

const servicesOptions = [
  { id: 'identidade', label: 'Identidade Visual Completa', icon: '🎨' },
  { id: 'site', label: 'Site / Landing Page de Conversão', icon: '💻' },
  { id: 'conteudo', label: 'Estratégia & Redes Sociais', icon: '✦' },
  { id: 'combo', label: 'Combo Completo (Marca + Site)', icon: '⚡' },
];

const stageOptions = [
  { id: 'novo', label: 'Nova empresa / Lançamento', icon: '🌱' },
  { id: 'rebranding', label: 'Rebranding / Evolução de marca existente', icon: '🔄' },
  { id: 'escala', label: 'Empresa consolidada buscando escala', icon: '📈' },
];

const budgetOptions = [
  { id: 'b1', label: 'R$ 4.500 — R$ 8.000 (Essencial)', detail: 'Ideal para começar com direção' },
  { id: 'b2', label: 'R$ 8.000 — R$ 15.000 (Impulso)', detail: 'Mais escolhido para acelerar' },
  { id: 'b3', label: 'R$ 15.000+ (Estúdio / Sob Medida)', detail: 'Time dedicado e alta complexidade' },
];

export default function ProjectEstimatorModal({ isOpen, onClose, initialPackage }: ModalProps) {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedBudget, setSelectedBudget] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');

  useEffect(() => {
    if (initialPackage) {
      if (initialPackage === 'Partida') {
        setSelectedBudget('R$ 4.500 — R$ 8.000 (Essencial)');
      } else if (initialPackage === 'Impulso') {
        setSelectedBudget('R$ 8.000 — R$ 15.000 (Impulso)');
      } else if (initialPackage === 'Estúdio') {
        setSelectedBudget('R$ 15.000+ (Estúdio / Sob Medida)');
      }
    }
  }, [initialPackage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSendWhatsApp = () => {
    const message = `Olá Fluxor Studio! Fiz o diagnóstico no site:

• *Objetivo:* ${selectedService || 'Não especificado'}
• *Estágio:* ${selectedStage || 'Não especificado'}
• *Investimento estimado:* ${selectedBudget || 'A combinar'}
${name ? `• *Nome:* ${name}\n` : ''}${company ? `• *Empresa:* ${company}\n` : ''}
Gostaria de agendar uma conversa para o meu projeto!`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/5511999999999?text=${encoded}`, '_blank', 'noopener,noreferrer');
    onClose();
  };

  const isStep1Valid = selectedService !== '';
  const isStep2Valid = selectedStage !== '';

  return (
    <div className="estimator-overlay" onClick={onClose}>
      <div className="estimator-modal" onClick={(e) => e.stopPropagation()}>
        <button className="estimator-close" onClick={onClose} aria-label="Fechar">
          ✕
        </button>

        {/* Progress Bar */}
        <div className="estimator-progress">
          <div className="progress-bar" style={{ width: `${(step / 3) * 100}%` }} />
        </div>

        <div className="estimator-header">
          <span className="eyebrow">Simulador de Projeto</span>
          <h2>
            {step === 1 && 'O que sua empresa precisa hoje?'}
            {step === 2 && 'Qual o momento atual do negócio?'}
            {step === 3 && 'Qual sua expectativa de investimento?'}
          </h2>
          <p>
            {step === 1 && 'Selecione o serviço principal que busca para transformar sua presença.'}
            {step === 2 && 'Isso nos ajuda a personalizar a proposta técnica ideal.'}
            {step === 3 && 'Tudo pronto! Insira seus dados para gerar a mensagem personalizada.'}
          </p>
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="estimator-grid">
            {servicesOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`estimator-option ${selectedService === opt.label ? 'active' : ''}`}
                onClick={() => setSelectedService(opt.label)}
              >
                <span className="option-icon">{opt.icon}</span>
                <span className="option-label">{opt.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="estimator-stack">
            {stageOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`estimator-option stack-option ${selectedStage === opt.label ? 'active' : ''}`}
                onClick={() => setSelectedStage(opt.label)}
              >
                <span className="option-icon">{opt.icon}</span>
                <span className="option-label">{opt.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="estimator-step-3">
            <div className="estimator-stack">
              {budgetOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`estimator-option budget-option ${selectedBudget === opt.label ? 'active' : ''}`}
                  onClick={() => setSelectedBudget(opt.label)}
                >
                  <div>
                    <strong className="option-label">{opt.label}</strong>
                    <small>{opt.detail}</small>
                  </div>
                </button>
              ))}
            </div>

            <div className="estimator-inputs">
              <input
                type="text"
                placeholder="Seu nome (opcional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Nome da sua marca / empresa (opcional)"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Footer Controls */}
        <div className="estimator-footer">
          {step > 1 ? (
            <button type="button" className="btn btn-ghost btn-small" onClick={() => setStep(step - 1)}>
              ← Voltar
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              className="btn btn-primary btn-small"
              disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
              onClick={() => setStep(step + 1)}
            >
              Próximo →
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={handleSendWhatsApp}>
              Enviar Diagnóstico no WhatsApp 🚀
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
