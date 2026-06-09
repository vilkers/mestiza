# Mestiza Studio — Contexto do Projeto

## O que é isso
Site + identidade digital do **Mestiza**, um studio criativo. Este repositório hospeda o site no GitHub Pages em **mestiza.work** (já no ar).

Contato principal: `vilkervs@gmail.com` / Vilker Silva

---

## Decisões já tomadas (não re-perguntar)

| Tópico | Decisão |
|---|---|
| Domínio | `mestiza.work` na GoDaddy |
| Email | `hablar@mestiza.work` via Google Workspace Business Starter |
| Hospedagem | GitHub Pages — branch `main`, pasta raiz |
| Stack | HTML/CSS/JS puro, sem frameworks, sem build step |
| Tipografia | **STIX Two Text** (serif) em toda a página; **Spline Sans Mono** disponível mas não usada no momento |
| Cores | `--bg:#000000` `--fg:#f4f1ea` (off-white) `--dim:#8a867d` `--accent:#c9a86a` |
| Logo | `assets/logo/logo-horizontal.png` — renderizada com `filter: brightness(0) invert(1) brightness(0.96) sepia(0.07)` (off-white) |
| Assets locais do Vilker | `/Users/vilker.silva/Documents/ClaudeProjects/_mestiza` — precisam ser commitados pro repo |

---

## Estado atual do site (junho 2026)

**mestiza.work está no ar** com uma página "em construção" (`index.html`).

### O que a página tem:
- Fundo: 3 colunas de imagens drifting (38 fotos em `assets/bg/`), drift bem lento (~10 min/ciclo), acelera ao rolar o mouse/trackpad
- Centro: logo off-white + "em construção" + `hablar@mestiza.work`
- Rodapé: "haz lo que quieras hacer" em STIX Two Text com letter-spacing largo
- Animação: JS/RAF time-based (px/ms, independente de Hz do monitor), sem CSS animations
- Loop sem pisca: imagens eager-loaded, posição em px fixos medidos após load

### Arquivos relevantes:
```
index.html               # página em construção (LIVE)
home-draft.html          # rascunho da homepage real (para Fase 3+)
assets/
  bg/01-38.jpg           # 38 fotos redimensionadas 900px q72 (~1.8MB total) — fundo animado
  work/01-38.jpg         # originais organizados (reserva para o site real)
  logo/logo-horizontal.png
  inbox/README.md        # pasta de upload — arraste assets aqui
tools/
  otimizar-imagens.jsx   # script Photoshop para batch resize (MAX_EDGE=2000, JPEG q9)
CNAME                    # mestiza.work
```

### Detalhes técnicos da animação (index.html):
- 3 colunas, cada uma com 38 imagens + 38 duplicadas (para loop seamless)
- Offsets de início: col 0 = img 1, col 1 = img 14, col 2 = img 27
- Velocidade base: 600s / 720s / 660s por ciclo (bem devagar)
- Boost no scroll: `vel = Math.min(vel + |deltaY| / 60 + 0.6, 10)`, decai com `0.94^(dt/16.67)`
- Wrapping: `if (spd < 0 && px <= -halfH) px += halfH` (e vice-versa para coluna que desce)

---

## Assets pendentes (Vilker precisa subir em `assets/inbox/`)

- **GIF da moeda** (`mestiza-coin-spin-2`) — ainda não subido. Quando chegar: extrair frames, remover fundo escuro (luminance key + feather), re-encodar como animated WebP com transparência, apontar `.coin` img src.
- Fotos da equipe
- Logos de marcas clientes
- PNGs de portfolio

---

## Fases do projeto

- [x] **Fase 0:** Decisões de domínio, email, hospedagem
- [x] **Fase 3:** Página em construção no ar (mestiza.work)
- [ ] **Fase 1:** Setup Google Workspace (Vilker executa)
- [ ] **Fase 2:** Assinatura de email HTML
- [ ] **Fase 4:** Assets chegam → GIF da moeda, fotos, logos integrados
- [ ] **Fase 5:** Site real (home com moeda animada, about, work, contact)
- [ ] **Fase 6:** Textos reais

---

## Estrutura planejada do site real

```
/
├── index.html      # Home — hero com moeda animada no scroll (image sequence)
├── about.html      # Studio + equipe + logos de clientes
├── work.html       # Grid de projetos
├── contact.html    # Só o email + redes
├── css/style.css
├── js/scroll-coin.js
└── assets/
    ├── coin/       # Frames PNG da moeda (coin_000.png … coin_059.png)
    ├── logo/
    ├── team/
    └── work/
```

### Hero da home (planejado)
- Moeda animada girando conforme o scroll (image sequence, estilo Apple — sem vídeo)
- Moeda "pinned" enquanto o conteúdo passa
- Frames: 60–120 PNGs com transparência

---

## Branch de trabalho
`claude/youthful-maxwell-4f05x` → merge em `main` para publicar

**Workflow de publicação:**
```bash
git add <arquivos>
git commit -m "mensagem"
git checkout main
git merge claude/youthful-maxwell-4f05x --no-edit
git push -u origin main
git checkout claude/youthful-maxwell-4f05x
git push -u origin claude/youthful-maxwell-4f05x
```
