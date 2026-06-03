# Mestiza Studio — Contexto do Projeto

## O que é isso
Site + identidade digital do **Mestiza**, um studio criativo. Este repositório hospeda o site no GitHub Pages.

Contato principal: `vilkervs@gmail.com` / Vilker Silva

---

## Decisões já tomadas (não re-perguntar)

| Tópico | Decisão |
|---|---|
| Domínio | `mestiza.work` na GoDaddy (.ai ficou caro — mínimo 2 anos ~US$160) |
| Email | `hablar@mestiza.work` via **Google Workspace Business Starter** (~US$7/mês) |
| Hospedagem | **GitHub Pages** — branch `main`, pasta raiz ou `/docs` |
| Referência visual | [Gentle Cowboys](https://www.gentlecowboys.com/about) — estrutura similar, layout diferente para não parecer cópia |
| Hero element | Moeda animada girando conforme o scroll (image sequence on scroll, estilo Apple) |
| Conteúdo 1ª versão | **Lorem ipsum** — estrutura real, texto provisório |
| Assets locais | Estão em `/Users/vilker.silva/Documents/ClaudeProjects/_mestiza` na máquina do Vilker. Para usar no site, precisam ser **commitados no repositório** |

---

## Assets necessários (Vilker precisa subir)

- `coin.png` — PNG flat da moeda, fundo transparente
- `studio-flat.png` — PNG flat do studio logo
- Frames da moeda girando (se já tiver, ou a gente gera)
- Fotos da equipe (seção About)
- PNGs de portfolio (projetos)
- Logos de marcas que o studio já trabalhou

> **Como subir:** arraste os arquivos pro repositório `vilkers/mestiza` pela interface do GitHub, ou use `git add` localmente.

---

## Estrutura do site (planejada)

```
/
├── index.html          # Home — hero com moeda animada
├── about.html          # Sobre o studio + fotos da equipe
├── work.html           # Portfolio — grid de projetos
├── contact.html        # Contato simples
├── css/
│   └── style.css
├── js/
│   └── scroll-coin.js  # Lógica de image sequence on scroll
├── assets/
│   ├── coin/           # Frames da moeda (coin_000.png … coin_059.png)
│   ├── logo/           # Logotipo SVG/PNG
│   ├── team/           # Fotos da equipe
│   └── work/           # Imagens dos projetos
└── CLAUDE.md           # Este arquivo
```

---

## Seções do site

### Home (`index.html`)
- Hero full-height: moeda animada no centro, nome "Mestiza" abaixo, tagline curta
- Moeda gira conforme o scroll (image sequence — sem vídeo, mais leve e controlável)

### About
- Parágrafo curto sobre o studio (sem bullshit, direto)
- Fotos + mini-bio da equipe
- Logos das marcas que já trabalharam

### Work
- Grid de projetos: imagem + título + categoria
- Clique expande ou leva pra página individual (fase 2)

### Contact
- Apenas o email `hablar@mestiza.work` e redes sociais
- Sem formulário por enquanto

---

## Técnica da moeda animada (scroll)

Não usar vídeo. Usar **image sequence on scroll**:
1. Gerar N frames do PNG da moeda girando (60–120 frames, PNG com transparência)
2. Carregar todos via JS, trocar o frame conforme `scrollY`
3. Moeda fica "pinned" no topo enquanto o conteúdo passa
4. Resultado: rotação fluida e totalmente controlada pelo usuário

Para gerar os frames:
- Opção A: Vilker exporta de ferramenta 3D/After Effects
- Opção B: CSS 3D transform puro (mais leve, funciona se o logo for flat/simples)
- Opção C: Magnific MCP (avaliar quando os assets chegarem)

---

## Setup de infraestrutura (pendente — Vilker executa)

### 1. Registrar `mestiza.work` na GoDaddy
- Recusar todos os upsells (email, website builder, proteção premium)
- Só WHOIS Privacy se for barato

### 2. Google Workspace Business Starter
- Assinar em `workspace.google.com`, NÃO pelo botão da GoDaddy
- Criar conta como `hablar@mestiza.work`
- Plano Flexible (mensal) para começar

### 3. DNS na GoDaddy (após ativar Workspace)
```
# Verificação de domínio Google
TXT  @  google-site-verification=<código do Google>

# MX (receber email)
MX  @  prioridade:1  smtp.google.com

# SPF (envio autorizado)
TXT  @  v=spf1 include:_spf.google.com ~all

# DKIM — gerar no Admin Console > Gmail > Authenticate email
TXT  google._domainkey  v=DKIM1; k=rsa; p=<chave>

# DMARC (modo observação)
TXT  _dmarc  v=DMARC1; p=none; rua=mailto:hablar@mestiza.work
```

### 4. Teste de entregabilidade
- Enviar email de teste e checar em `mail-tester.com`

---

## Assinatura de email (pendente — aguardando dados do Vilker)
Precisa de: nome/cargo, telefone (se quiser expor), redes do studio.
Será entregue em HTML para colar no Gmail (Configurações → Assinatura).

---

## Fases do projeto

- [x] **Fase 0:** Decisões de domínio, email, hospedagem
- [ ] **Fase 1:** Setup domínio + Google Workspace (Vilker executa, Claude apoia)
- [ ] **Fase 2:** Assinatura de email HTML
- [ ] **Fase 3:** Site esqueleto em lorem ipsum no GitHub Pages
- [ ] **Fase 4:** Assets chegam → integração real (moeda animada, fotos, logos)
- [ ] **Fase 5:** Textos reais (sobre o studio, bio da equipe, projetos)
- [ ] **Fase 6:** Domínio customizado apontando pro GitHub Pages

---

## Stack do site
- HTML/CSS/JS puro (sem frameworks — site pequeno, hospedagem estática no GitHub Pages)
- Sem build step, sem dependências
- Google Fonts (tipografia a definir conforme identidade visual)
- Nenhum cookie, nenhum tracker por enquanto

---

## Branch de trabalho
`claude/youthful-maxwell-4f05x` → merge em `main` quando pronto para ir ao ar
