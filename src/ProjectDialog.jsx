import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "./ProjectDialog.css";

export default function ProjectDialog({ project, onClose, contactUrl }) {
  const ref=useRef(null);
  useEffect(()=>{
    if(!project) return;
    const dialog=ref.current, previous=document.activeElement;
    const overflow=document.body.style.overflow;
    document.body.style.overflow="hidden";
    dialog.showModal();
    return ()=>{
      dialog.close();document.body.style.overflow=overflow;
      previous?.focus({preventScroll:true});
    };
  },[project]);
  if(!project) return null;
  return createPortal(<dialog ref={ref} className="project-dialog" aria-labelledby="project-dialog-title" onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)onClose();}}}>
    <div className="project-dialog-bar"><span>FLUXOR® / PROJETO EM CONTEXTO</span><button type="button" onClick={onClose} aria-label="Fechar detalhes do projeto" autoFocus>FECHAR ×</button></div>
    <header className="project-dialog-head"><span>{project.discipline}</span><h2 id="project-dialog-title">{project.name}</h2><p>{project.challenge}</p></header>
    <figure><img src={project.image} alt={`Direção visual do projeto ${project.name}`} /><figcaption>{project.caption}</figcaption></figure>
    <div className="project-dialog-story">
      <section><span>01 / CONTEXTO</span><h3>O ponto de partida.</h3><p>{project.challenge}</p></section>
      <section><span>02 / DECISÕES</span><h3>A direção escolhida.</h3><p>{project.solution}</p></section>
      <section><span>03 / ENTREGA</span><h3>O que ganhou forma.</h3><p>{project.outcome}</p></section>
    </div>
    <footer><p>Vamos construir a próxima história?</p><a href={contactUrl} target="_blank" rel="noreferrer">Conversar sobre meu projeto <span aria-hidden="true">↗</span></a></footer>
  </dialog>,document.body);
}
