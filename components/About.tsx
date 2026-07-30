export default function About() {
  return (
    <section className="section about" id="sobre">
      <div className="container about-grid">
        <div className="about-art reveal">
          <div className="about-orb" />
          <div className="studio-card">
            <span>FLUXOR</span>
            <h3>
              Direção<br />
              criativa.
            </h3>
            <small>São Paulo — Brasil</small>
          </div>
        </div>

        <div className="about-copy reveal delay-1">
          <span className="eyebrow">Sobre</span>
          <h2>
            Um time só, do diagnóstico à entrega — <span>sem terceirização.</span>
          </h2>
          <p>
            Já ajudamos mais de 100 negócios a trocar uma presença digital que não
            convertia por uma estratégia visual construída com pesquisa de verdade.
          </p>

          <div className="stats">
            <div>
              <strong>100+</strong>
              <span>Projetos entregues</span>
            </div>
            <div>
              <strong>5 anos</strong>
              <span>de experiência</span>
            </div>
            <div>
              <strong>4.9/5</strong>
              <span>avaliação média</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
