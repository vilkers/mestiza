"""Gera /prototipo/ (home) e /prototipo/vireachave/ (case) a partir das páginas atuais,
aplicando o tema terra + Guaviari, o grão, a abertura VHS, o banner do Sobre e a moeda sem fundo.
As páginas de origem (inicio/ e vireachave/) não são alteradas. Rodar da raiz do repositório."""
import re, os

FX_CSS = '<link rel="stylesheet" href="{p}css/lj-fx.css?v=2"><link rel="stylesheet" href="{p}css/terra-guaviari.css?v=1">'
FX_JS = ''.join('<script src="{p}js/%s?v=2" defer></script>' % f for f in ['lj-grain.js', 'lj-vhs-wall.js', 'lj-ui.js', 'grain-type.js'])

def wall(letters, narrow, label):
    return ('<div class="lj-wall lj-wall--overlay" data-lj-wall data-handover="clear" data-letters="%s" data-letters-narrow="%s" aria-label="%s">'
            '<div class="lj-wall__grid"></div><div class="lj-wall__osd" aria-hidden="true"></div></div>') % (letters, narrow, label)

def common(s, p):
    s = s.replace('</head>', FX_CSS.format(p=p) + '</head>', 1)
    s = s.replace('</body>', FX_JS.format(p=p) + '</body>', 1)
    s = s.replace('coin/scroll/', 'coin/scroll-alpha/')
    s = s.replace('content="#080808"', 'content="#16100B"')
    return s

def sub1(s, a, b):
    assert a in s, a[:70]
    return s.replace(a, b, 1)

# ---------- home ----------
s = open('inicio/index.html').read()
s = sub1(s, '<title>Mestiza · AI creative studio</title>', '<title>Protótipo · Mestiza</title>')
s = common(s, '')
# vídeo do Boticário segue como destaque; a parede VHS abre por cima e sintoniza nele
s = sub1(s, '<div class="poster-bottom">', wall('MESTIZA|       | STUDIO', 'ME|ST|IZ|A ', 'Mestiza Studio') + '<div class="poster-bottom">')
s = sub1(s, '<a class="hero-project-cta" href="/trabalhos/">Ver trabalhos', '<a class="hero-project-cta" href="/prototipo/vireachave/" data-cursor-label="Ver o case">Vire a chave')
m = '<div class="marginal"><span>01 / Sobre</span><span>Lo que hacemos.</span></div>'
s = sub1(s, m, m + '<div class="lj-banner proto-banner"><div class="lj-banner__card"><p class="lj-sr">Haz lo que quieras hacer</p>'
         '<canvas data-grain-type data-lines="HAZ LO QUE|QUIERAS|HACER" aria-hidden="true"></canvas></div></div>')
blocks = ''.join('<div class="lj-stack__row">%s</div>' % ''.join('<div class="lj-stack__block" style="background-image:url(assets/bg/%s.jpg)"></div>' % i for i in row)
                 for row in [['06'], ['20', '13'], ['04', '21', '10']])
s = sub1(s, '<section class="clients-section"', '<section class="proto-today" aria-label="Hoje"><div><small>Hoje.</small>'
         '<p class="lj-typed" data-typed data-typed-mark="fácil">Fazer uma imagem nunca foi tão fácil...</p></div>'
         '<div class="lj-stack" data-lj-stack aria-hidden="true">' + blocks + '</div></section><section class="clients-section"')
os.makedirs('prototipo', exist_ok=True)
open('prototipo/index.html', 'w').write(s)

# ---------- case Vire a chave ----------
s = open('vireachave/index.html').read()
# um nível a mais de pasta: ajusta caminhos relativos só no início do valor do atributo
s = re.sub(r'(?<![./\w])\.\./', '../../', s)   # todo "../" (inclusive srcset) ganha um nível
s = re.sub(r'<link rel="canonical"[^>]*>', '', s)
s = common(s, '../../')
s = sub1(s, '<div class="opening-bottom">', wall('VIRE   |       |A CHAVE', 'VIR|E A|CHA|VE ', 'Vire a chave') + '<div class="opening-bottom">')
s = s.replace('data-lightbox', 'data-cursor-label="Ampliar" data-lightbox')
os.makedirs('prototipo/vireachave', exist_ok=True)
open('prototipo/vireachave/index.html', 'w').write(s)
print('ok')
