export default function Process() {
  const steps = [
    {
      num: '01',
      title: 'Imersão inicial',
      desc: 'Entendemos seu negócio, objetivo e onde você quer chegar.',
    },
    {
      num: '02',
      title: 'Pesquisa de mercado',
      desc: 'Analisamos concorrência, público, tendências e oportunidades.',
    },
    {
      num: '03',
      title: 'Desenvolvimento do conceito',
      desc: 'Construímos a estratégia visual e a linguagem da marca.',
    },
    {
      num: '04',
      title: 'Entrega',
      desc: 'Você recebe um sistema pronto para aplicar e gerar resultado.',
    },
  ];

  return (
    <section className="section process" id="processo">
      <div className="container process-wrap">
        <div className="process-intro reveal">
          <span className="eyebrow">Como funciona</span>
          <h2>
            Do diagnóstico ao<br />
            conceito pronto pra<br />
            <span>aplicar.</span>
          </h2>
          <p>
            Um processo enxuto e estratégico para transformar boas ideias em marcas
            que geram percepção e resultado.
          </p>
        </div>

        <div className="timeline">
          {steps.map((step, i) => (
            <article key={i} className="timeline-item reveal">
              <div className="timeline-number">{step.num}</div>
              <div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
