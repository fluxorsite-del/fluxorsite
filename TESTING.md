# Verificação do site

Em um terminal, execute `npm run dev`. Em outro:

```sh
npm run test:responsive
npm run test:hero
npm run build
```

O teste usa o Chrome instalado. Para usar o Chromium do Playwright, instale-o com `npx playwright install chromium` e defina `PLAYWRIGHT_CHANNEL=chromium`. Para testar uma versão de produção ou outra porta, defina `FLUXOR_TEST_URL` com o endereço do preview.

## Cobertura

- 360×640, 360×800, 390×844, 540×900, 541×900, 768×1024, 900×900, 901×900, 1440×900, 1920×1080, 2560×1080 e 3440×1440.
- Contrato de cores e cobertura do hero; autoplay, loop, vídeo mudo e inline no mobile.
- Foco do menu, Escape, isolamento do conteúdo, abertura/fechamento e retorno de foco dos projetos.
- Texto dos cards, palavras dos serviços, leitura mobile, três capítulos e footer sem cortes horizontais.
- Meteoro separado do texto no mobile e cache limitado de frames decodificados.
- Movimento reduzido e fallback sem WebGL.
- Revelação nos quatro cantos do hero sem trocar o foco da janela, pausa em repouso, perda do contexto WebGL e recuperação de autoplay bloqueado.

## Comparação visual

As referências ficam em `tests/visual-baselines`. Resultados, capturas atuais e diferenças ficam em `artifacts/qa` (ignorado pelo Git). Após uma alteração visual intencional, inspecione as capturas e execute `npm run test:visual:update` para atualizar as referências.

As capturas de layout escondem o conteúdo variável dos vídeos; autoplay e loop são verificados separadamente. As capturas ultrawide são reduzidas para 1440 pixels de largura, mas os testes de limites usam a resolução integral. Referências de pixels devem ser comparadas no mesmo sistema operacional e versão de navegador. O limite de diferença é 1,5%, com tolerância de cor por pixel de 0,15.

Esses testes não substituem uma revisão em aparelhos físicos, Safari/iOS ou a medição de desempenho em uma GPU real. Economia de energia e políticas do navegador podem bloquear autoplay; nesse caso, o hero mobile mostra um botão de reprodução.

## Mídia e manutenção

`npm run optimize:media` requer FFmpeg no PATH e recria o vídeo mobile e as sequências leves do meteoro a partir dos arquivos-fonte preservados. Somente os arquivos gerados nos destinos definidos pelo script são sobrescritos.

O CSS global agora é um manifesto: `src/styles/base.css` contém tokens e seções compartilhadas, `responsive.css` reúne ajustes gerais, e `hero.css`, `cases.css`, `motion.css` e `accessibility.css` concentram as regras específicas. Os detalhes de projetos têm seu próprio componente e CSS.

Os textos de projetos e depoimentos são os já existentes, confirmados pelo responsável como reais e autorizados. As fotos genéricas foram removidas e substituídas por iniciais; não foram acrescentadas métricas nem associações entre clientes e projetos.
