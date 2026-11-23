"""Divide o logo horizontal da Mestiza em letras (M E S T I ZA) por crescimento
geodésico a partir de sementes desenhadas no esqueleto de cada letra.
Saída: assets/logo/parts/<letra>.png (mesmo tamanho do logo, só a letra) e
um preview colorido para conferência."""
import sys, collections
import numpy as np
from PIL import Image, ImageDraw

SRC = 'assets/logo/logo-horizontal.png'
SEEDS = {
 'm': [[(100,100),(100,350)],[(175,60),(210,300)],[(300,200),(370,90)],[(335,120),(320,350)]],
 'e': [[(420,250),(450,330),(520,375),(600,330)],[(470,120),(530,70),(610,55)],[(480,185),(545,150)],[(548,160),(550,260)]],
 's': [[(690,90),(650,160),(720,250),(790,320),(760,395),(680,390)],[(632,300),(632,395)],[(700,79),(768,76)]],
 't': [[(840,85),(995,82)],[(915,120),(915,380)],[(850,402),(980,402)],[(800,110),(795,200)],[(998,88),(1015,120),(1027,200)]],
 'i': [[(1062,60),(1062,345)],[(1010,44),(1105,44)],[(1005,357),(1105,357)]],
 'za': [[(1135,85),(1320,85)],[(1310,95),(1150,390)],[(1150,397),(1380,400)],[(1117,95),(1110,195)],[(1092,405),(1125,355)],
        [(1370,92),(1450,130),(1550,400)],[(1300,310),(1440,280)],[(1420,150),(1330,260)],[(1485,100),(1540,100)]],
}
def main(out='assets/logo/parts'):
    import os; os.makedirs(out, exist_ok=True)
    im = Image.open(SRC).convert('RGBA'); a = np.array(im)[:,:,3]
    ink = a > 8; H, W = a.shape
    lab = np.full((H,W), -1, np.int16); names = list(SEEDS)
    q = collections.deque()
    for k,n in enumerate(names):
        m = Image.new('L',(W,H),0); d = ImageDraw.Draw(m)
        for line in SEEDS[n]: d.line(line, fill=255, width=7)
        ys,xs = np.nonzero((np.array(m)>0) & ink)
        for y,x in zip(ys,xs):
            if lab[y,x] < 0: lab[y,x] = k; q.append((y,x))
    nb = [(-1,0),(1,0),(0,-1),(0,1),(-1,-1),(-1,1),(1,-1),(1,1)]
    while q:
        y,x = q.popleft(); k = lab[y,x]
        for dy,dx in nb:
            yy,xx = y+dy,x+dx
            if 0<=yy<H and 0<=xx<W and ink[yy,xx] and lab[yy,xx] < 0:
                lab[yy,xx] = k; q.append((yy,xx))
    # pixels de tinta isolados (SM): vão para o grupo mais próximo em x
    rest = ink & (lab<0)
    lab[rest] = names.index('za')
    px = np.array(im)
    pal = [(220,60,60),(60,140,220),(40,160,90),(200,140,30),(150,60,200),(30,30,30)]
    prev = np.zeros((H,W,4),np.uint8); prev[...,:3]=(242,237,228); prev[...,3]=255
    for k,n in enumerate(names):
        part = px.copy(); part[...,3] = np.where(lab==k, a, 0)
        Image.fromarray(part).save(f'{out}/{n}.png', optimize=True)
        sel = lab==k; al = a[sel][:,None]/255
        prev[sel,:3] = (prev[sel,:3]*(1-al) + np.array(pal[k])*al).astype(np.uint8)
    Image.fromarray(prev).convert('RGB').save(sys.argv[1] if len(sys.argv)>1 else '/tmp/split-preview.png')
main()

def extras(out='assets/logo/parts'):
    """t-solo.png: T sem o I ao lado (opção A). O braço direito do T se funde ao I no
    logo; espelhamos a metade esquerda do próprio T (x 798–915) para fechar a letra.
    Também remove respingos soltos (< 150 px) que ficaram na divisão."""
    from scipy import ndimage
    for n in ['m','e','s','t','i','za']:
        im = Image.open(f'{out}/{n}.png'); px = np.array(im); a = px[...,3] > 20
        lab, k = ndimage.label(a); sizes = ndimage.sum(a, lab, range(1, k+1))
        for j, s in enumerate(sizes, 1):
            if s < 150 and not (n == 'za' and lab[lab==j].size and np.nonzero(lab==j)[1].min() > 1470):
                px[lab==j, 3] = 0
        Image.fromarray(px).save(f'{out}/{n}.png', optimize=True)
    t = np.array(Image.open(f'{out}/t.png')); cx = 915
    solo = np.zeros_like(t)
    solo[:, 798:cx+1] = t[:, 798:cx+1]
    for x in range(cx+1, min(t.shape[1], 2*cx-798+1)):
        solo[:, x] = t[:, 2*cx - x]
    Image.fromarray(solo).save(f'{out}/t-solo.png', optimize=True)
extras()

def t_left(out='assets/logo/parts'):
    """tl.png: pedaço do T à esquerda de x=798 (curva que encosta no S)."""
    t = np.array(Image.open(f'{out}/t.png')); tl = np.zeros_like(t); tl[:, :798] = t[:, :798]
    Image.fromarray(tl).save(f'{out}/tl.png', optimize=True)
t_left()
