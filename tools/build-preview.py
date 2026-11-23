"""Monta a prévia privada (artifact do claude.ai) da home na direção papel.
Uso: python3 tools/build-preview.py <pasta-de-saída>
- Converte inicio/index.html para o formato do artifact (sem doctype/head/body, sem senha).
- Copia só os arquivos usados, mantendo os caminhos relativos à raiz do repositório.
- A Guaviari entra apenas na prévia privada; continua fora do git."""
import os, re, shutil, sys
SRC = 'inicio/index.html'
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
html = open(SRC, encoding='utf-8').read()
head = re.search(r'<head>(.*?)</head>', html, re.S).group(1)
body = re.search(r'<body[^>]*>(.*)</body>', html, re.S).group(1)
links = ''.join(re.findall(r'<link rel="(?:stylesheet|preload)"[^>]*>', head))
scripts = ''.join(s for s in re.findall(r'<script src="[^"]*"[^>]*></script>', head) if 'access-gate' not in s)
page = ('<title>Redesign Mestiza</title>\n<meta name="theme-color" content="#F2EDE4">\n'
        + links + '\n<script>document.body.classList.add("papel")</script>\n' + scripts + '\n' + body)
page = page.replace('../', '')
for route in ['trabalhos', 'projetos-especiais', 'vireachave']:
    page = page.replace(f'href="{route}/"', f'href="#{route}"')
page = page.replace('href="admin/skills/"', 'href="#skills"').replace('href="./"', 'href="#"')
open(os.path.join(out, 'index.html'), 'w', encoding='utf-8').write(page)
refs = set(re.findall(r'(?:src|href|data-[a-z-]+|poster)="((?:assets|css|js)/[^"?#]+)', page))
refs |= {'assets/fonts/guaviari-bt.otf', 'assets/fonts/sans.woff2'}
refs |= {f'assets/coin/scroll-alpha/{i:02d}.webp' for i in range(30)}
refs |= {f'assets/logo/parts/{n}.png' for n in ['m', 'e', 's', 't', 't-solo', 'tl', 'i', 'za']}
for r in sorted(refs):
    d = os.path.join(out, r); os.makedirs(os.path.dirname(d), exist_ok=True); shutil.copy2(r, d)
print('\n'.join(sorted(refs)))
