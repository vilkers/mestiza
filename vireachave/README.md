# Grupo Boticário — Vire a chave

Página estática em `/vireachave/`, integrada à estrutura do mestiza.work. A página inicial e os demais projetos permanecem intactos.

## Conteúdo

- 24 KVs: arquivos finais da pasta fornecida pelo cliente, em WebP com versões responsivas.
- Filme hero horizontal: `BOTI V4_a_16X9.mp4` (Drive).
- Filmes verticais: `BOTICARIO_30SET_12H_.mp4`, `BOTI_YUMI_23SET2.mp4` e `BOTI_wallace_25set 4.mp4` (Desktop). O primeiro é identificado como Marinete a partir do material visual.
- Fotografias: 60 imagens extraídas exclusivamente dos slides 04–18. Retratos em faixa horizontal e demais registros em seção expansível.
- Mapping: GIF original do slide 20, convertido em WebP animado (8 frames), preservando o movimento.
- Contexto: slide 02. Os números e alegações de redução de custo/prazo foram excluídos. Créditos de criação da campanha atribuídos à Creative House.

Apresentação: https://docs.google.com/presentation/d/1FySRxsFyzlIV4Wh7vKXLHKLPq_URbA_wiAJSmUcNCag/edit

## Vídeos e hospedagem

Os quatro filmes têm cópias H.264/AAC otimizadas, com fast start, controles nativos e carregamento somente sob demanda. A abertura usa cinco recortes selecionados pelo cliente no seletor: Marinete (0–2,42 s), hero (0–1,17 s), Anna Yumi (4,17–8,50 s), Wallace (13,04–14,67 s) e caixa Eudora no hero (11,92–13,08 s). Há versões horizontal e vertical, renderizadas dos masters com os enquadramentos aprovados, selecionadas conforme a proporção da tela; respeita redução de movimento e economia de dados. Não há dependência de URLs temporárias do Drive.

Vimeo é opcional, não um pré-requisito. Para uma futura migração, subir os quatro masters originais, permitir incorporação em `mestiza.work` (e `www.mestiza.work`, se usado), verificar o plano e fornecer os quatro códigos completos de incorporação, inclusive hashes de vídeos não listados. Substituir apenas os players dos filmes; o loop da abertura pode continuar local. Nunca usar a privacidade “Private” para um filme destinado ao público do case.

Referências oficiais: https://help.vimeo.com/hc/en-us/articles/12426259908881-How-to-embed-my-video e https://help.vimeo.com/hc/en-us/articles/12426275096337-Embedding-features-by-plan-type

## Design e manutenção

Fundo preto, logotipo original da Mestiza, STIX Two Text e Inter. A referência usa PP Fragment, uma fonte comercial: os arquivos dessa fonte não foram copiados do site. A pilha CSS já permite PP Fragment quando houver arquivo licenciado; STIX Two Text é a serifada ativa.

Galeria com ampliação, setas e Escape; navegação por âncoras; layout responsivo; nenhuma biblioteca ou etapa de build. CSS e JS exclusivos deste case.

As fotografias extraídas do Slides são adequadas para a seção de processo. Se versões de câmera com maior resolução forem fornecidas, podem substituir os WebPs correspondentes.
