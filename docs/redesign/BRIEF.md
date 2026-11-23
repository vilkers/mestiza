# Redesign Mestiza · passagem para a nova sessão

Pedido de Vilker em 23/11/2026. Ajustar 100% o visual do site antes de publicar.
Tudo é editado e revisado em prévia; nada vai para `main` sem o ok dele.

## Ponto de partida

- Repositório `vilkers/mestiza`, branch de trabalho `claude/bold-archimedes-ykpxle`.
  Último commit desta rodada: `d84e884`. `main` (no ar) continua em `9d8dc11`.
- Arquitetura no ar: `index.html` e `/em-construcao/` são a entrada pública; a home
  completa está em `/inicio/`; páginas internas usam `js/access-gate.js` (senha) e `noindex`.
  Case publicado: `/vireachave/` (Grupo Boticário). Também existem `/trabalhos/`,
  `/projetos-especiais/`, `/projetos/*`, `/admin/` (editor oculto) e `/estudos/*`.
- Protótipo anterior (tema terra + VHS): `/prototipo/` e `/prototipo/vireachave/`,
  gerados por `tools/build-prototipo.py`. Prévia: https://claude.ai/artifact/YATngB2pwE2oA2ZML7tmpP
  A direção nova substitui a paleta terra; os efeitos podem ser reaproveitados.

## Referência: jeppesen.dev

Usar como referência de estrutura, ritmo, paleta e direção de arte.
Reescrever com código, textos e imagens da Mestiza. Não copiar código, textos,
imagens, logos nem fontes do site de referência (as fontes dele, Clash Grotesk e
Author, não entram; a fonte principal é a Guaviari BT).

Estrutura da home de referência, de cima para baixo:

1. Cabeçalho mínimo: isotipo (asterisco) à esquerda; à direita, botão pequeno escuro
   "Talk to…" e botão "Menu". Fixo, discreto.
2. Hero: wordmark gigante ocupando a largura, com o isotipo entrando no lugar de
   parte de uma letra. Fundo papel.
3. Mídia de destaque logo abaixo: card grande com vídeo/produto, que cresce com o scroll.
4. Frase-manifesto grande com destaque em cinza na última palavra, revelada por
   escrita (write-on) no scroll, e uma linha fina abaixo.
5. Seção escura: grade de logos de clientes à esquerda e carrossel de depoimentos
   à direita (contador 01/03 e setas).
6. Serviços: lista de títulos grandes; o item ativo fica escuro e os outros em cinza,
   trocando com o scroll, com uma prévia de imagem à direita.
7. Trabalho em destaque: card grande com imagem/vídeo, nome do cliente, texto curto,
   botão "Live site" e métricas.
8. Sequência do isotipo: o asterisco aparece em relevo (embossed) no papel e vira
   sólido com o scroll.
9. Sobre: isotipo grande, retrato e ficha (nome, função, base, idiomas).
10. FAQ em seção escura com imagem à esquerda e acordeão.
11. CTA final centralizado (frase grande + botão escuro com isotipo).
12. Rodapé escuro com links e botão de voltar ao topo.

Tokens medidos no CSS da referência:

| Token | Valor |
| --- | --- |
| Fundo papel | `#F2EDE4` |
| Papel 2 (cards) | `#E9E2D5` |
| Tinta / seções escuras | `#252525` (texto sobre papel quase preto) |
| Cinza de texto secundário | `#5B5B5B` |
| Raio | 2.5px a 4px (cantos quase retos) |
| Margem lateral | `clamp(1rem, .47rem + 2.25vw, 2.5rem)` |
| Seção alta / média / baixa | `clamp(5rem, 3rem + 8vw, 10rem)` / `clamp(4rem, 3rem + 4vw, 7rem)` / `clamp(3rem, 2.3rem + 3vw, 5rem)` |

## Decisões de Vilker para a Mestiza

- **Isotipo:** a moeda da Mestiza entra no lugar do asterisco em todos os usos
  (cabeçalho, hero, sequência em relevo, CTA). Usar os quadros com transparência
  `assets/coin/scroll-alpha/00–29.webp` (30 quadros) e `assets/coin/mestiza-coin-spin.webp`.
  A sequência do item 8 pode virar a moeda girando com o scroll.
- **Menu:** manter o menu glass e os efeitos glass atuais do site, recoloridos em âmbar.
  Ponto de partida do âmbar: `#C9A86A` (accent atual); ajustar para ler bem sobre o papel.
- **Fonte principal:** Guaviari BT (Bastarda Type Foundry), em caixa alta nos títulos,
  wordmark, menu e chamadas. Texto corrido em sans legível.
  Licença: fonte comercial ("All rights reserved"). O arquivo fica fora do git
  (`.gitignore`: `assets/fonts/guaviari-bt.*`) até Vilker confirmar licença de webfont.
  Cópia local para prévia: pedir o `.otf` de novo se a sessão nova não tiver o arquivo.
- **Cores e direção de arte:** seguir a referência (papel quente + grafite), com âmbar
  só no glass e em detalhes.
- **Home:** o vídeo do Boticário ilustra a home (item 3 da estrutura):
  `assets/cases/boticario/video/banner-selecao-desktop.mp4` e `-mobile.mp4`.
- **Arquitetura:** manter a do ar (home, trabalhos, especiales, case `/vireachave/`,
  contato, entrada pública e senha da prévia).
- **Área administrativa:** link no site para uma página de skills que Vilker vai criar.
  Já existe `/admin/` (editor oculto); confirmar com ele se a página de skills fica ali
  ou numa rota nova, e se o link é visível ou discreto (ex.: rodapé).
- **Moeda:** permanece no site (cabeçalho, rodapé/contato e sequência do scroll).

## Material já pronto para reaproveitar

- `js/site-shell.js`: renderização da moeda por scroll já limpa o canvas (aceita transparência).
- `js/lj-grain.js`, `js/lj-ui.js` (etiqueta de cursor, texto datilografado),
  `js/grain-type.js` (letras que se desfazem em grão), `js/lj-vhs-wall.js`: efeitos do
  estudo anterior, opcionais na direção nova.

## Próximos passos sugeridos

1. Confirmar com Vilker: como a moeda entra no wordmark (no lugar de uma letra ou entre
   letras), rota da página de skills e se o âmbar substitui todo o glass.
2. Montar tokens (papel, grafite, âmbar, Guaviari) num CSS próprio da direção nova.
3. Construir a home nova em uma rota de prévia, seção por seção, com conteúdo real da Mestiza.
4. Aplicar a mesma linguagem em `/trabalhos/`, `/vireachave/` e páginas de projeto.
5. Publicar prévia (artifact privado) para Vilker revisar no Safari do iPhone e do Mac.
6. Só depois do ok: merge em `main`.
