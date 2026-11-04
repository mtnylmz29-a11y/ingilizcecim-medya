"""Animasyonlu Reels: python3 anim.py <anim.json> <out.mp4> [kare_klasoru]  (1080x1920, sessiz ses izi)
Bicim: sistem/ICERIK_BICIMI.md > Animasyonlu Reels. Sahne tipleri: kapak, donusum, maddeler, kapanis."""
import sys, json, os, re, shutil, subprocess, tempfile, pathlib, html
from playwright.sync_api import sync_playwright
P = pathlib.Path(__file__).parent
src = (P / "build.py").read_text()
ns = {"os": os}
exec(src[src.index("THEMES = {"):src.index("def art(")], ns)
THEMES, ikon = ns["THEMES"], ns["ikon"]
spec = json.loads(pathlib.Path(sys.argv[1]).read_text()); out = sys.argv[2]
t = THEMES[spec.get("palet", "okyanus")]
FPS = 15
F = os.environ.get("FONT_DIR", str(P / "fonts"))
ff = "".join(f'@font-face{{font-family:"{fam}";font-weight:{w};src:url("file://{F}/{s}-latin-{w}.woff2");unicode-range:U+0000-00FF,U+2000-206F,U+2190-2193}}@font-face{{font-family:"{fam}";font-weight:{w};src:url("file://{F}/{s}-latin-ext-{w}.woff2");unicode-range:U+0100-02FF}}' for fam, s in [("Baloo 2", "baloo-2"), ("Nunito", "nunito")] for w in (700, 800))
e = html.escape
sc = []
for i, s in enumerate(spec["sahneler"]):
    k = s["tip"]; ust = f'<div class="ust">{e(s.get("ust",""))}</div>' if s.get("ust") else ""
    ik = ikon(s["ikon"], 300) if s.get("ikon") else ""
    if k == "kapak":
        b = f'<div class="pop" data-at=".15">{ik}</div><h1 class="pop" data-at=".5">{e(s["baslik"])}</h1><div class="alt pop" data-at="1.1">{e(s.get("alt",""))}</div>'
    elif k == "donusum":
        b = f'{ust}<div class="donusum" data-once="{e(s["once"])}" data-sonra="{e(s["sonra"])}" data-vurgu="{e(json.dumps(s.get("vurgu",[])))}"></div><div class="not pop" data-at="{s.get("sure",7)-2.8}">{e(s.get("not",""))}</div>'
    elif k == "maddeler":
        step = (s.get("sure", 7) - 2.0) / max(1, len(s["satirlar"]))
        b = f'{ust}<div class="bas">{e(s.get("baslik",""))}</div>' + "".join(f'<div class="sat pop" data-at="{.6+j*step:.2f}">{e(x)}</div>' for j, x in enumerate(s["satirlar"]))
    else:
        b = f'<div class="pop" data-at=".1">{ik}</div><h2 class="pop" data-at=".4">{e(s["baslik"])}</h2><div class="alt pop" data-at="1">{e(s.get("alt","ingilizcecim.com"))}</div>'
    sc.append(f'<section class="sc" data-sure="{s.get("sure",7)}">{b}</section>')
CSS = f"""*{{box-sizing:border-box;margin:0}}body{{width:1080px;height:1920px;background:{t['bg']};color:{t['ink']};font-family:Nunito;overflow:hidden;position:relative}}
.logo{{position:absolute;top:150px;left:90px;font:800 44px 'Baloo 2'}}.logo b{{color:{t['primary']}}}
.bar{{position:absolute;left:90px;right:90px;bottom:300px;height:10px;background:{t['line']};border-radius:5px}}.bar i{{display:block;height:10px;background:{t['primary']};border-radius:5px;width:0}}
.sc{{position:absolute;left:90px;right:90px;top:300px;bottom:360px;display:flex;flex-direction:column;justify-content:center;gap:40px;opacity:0}}
h1{{font:800 124px/1 'Baloo 2'}}h2{{font:800 96px/1.05 'Baloo 2';color:{t['primary']}}}.alt{{font:800 48px Nunito;color:{t['muted']}}}
.ust{{font:800 38px 'Baloo 2';color:{t['primary']};text-transform:uppercase;letter-spacing:2px}}.bas{{font:800 66px/1.1 'Baloo 2'}}
.sat{{font:700 56px/1.25 Nunito;background:{t['card']};border:4px solid {t['line']};border-radius:26px;padding:24px 30px}}
.not{{font:700 50px/1.28 Nunito;background:{t['soft']};border-radius:24px;padding:26px 30px}}
.donusum{{position:relative;height:420px}}.w{{position:absolute;font:800 80px/1.2 Nunito;white-space:pre;left:0;top:0;padding:0 8px;border-radius:12px}}
.m{{position:absolute;visibility:hidden;width:900px;font:800 80px/1.2 Nunito}}.m span{{display:inline-block;padding:0 8px}}"""
JS = r"""
const ease=x=>1-Math.pow(1-Math.min(1,Math.max(0,x)),3), norm=w=>w.toLowerCase().replace(/[^\w']/g,'');
const S=[...document.querySelectorAll('.sc')].map(el=>({el,sure:+el.dataset.sure,pops:[...el.querySelectorAll('.pop')].map(p=>({p,at:+p.dataset.at}))}));
let tot=0;S.forEach(s=>{s.start=tot;tot+=s.sure});window.TOTAL=tot;
function ms(par,ws){const d=document.createElement('div');d.className='m';ws.forEach(w=>{const s=document.createElement('span');s.textContent=w;d.append(s,' ')});par.append(d);return [...d.querySelectorAll('span')].map(s=>({x:s.offsetLeft,y:s.offsetTop}))}
window.init=()=>S.forEach(s=>{const D=s.el.querySelector('.donusum');if(!D)return;
 const A=D.dataset.once.split(' '),B=D.dataset.sonra.split(' '),V=JSON.parse(D.dataset.vurgu).map(norm);const pa=ms(D,A),pb=ms(D,B),used=new Set();
 s.w=A.map((w,i)=>{let j=B.findIndex((b,k)=>!used.has(k)&&norm(b)==norm(w));const e=document.createElement('div');e.className='w';e.textContent=w;D.append(e);if(j>=0)used.add(j);return{e,a:pa[i],b:j>=0?pb[j]:pa[i],tx:j>=0?B[j]:w,orig:w,gone:j<0,hit:j>=0&&V.includes(norm(w)),n:i}});
 s.yeni=B.map((w,j)=>{if(used.has(j))return null;const e=document.createElement('div');e.className='w';e.textContent=w;D.append(e);return{e,b:pb[j]}}).filter(Boolean)});
window.seek=T=>{document.querySelector('.bar i').style.width=(100*T/tot)+'%';
 S.forEach(s=>{const r=T-s.start;const on=r>=0&&r<s.sure;s.el.style.opacity=on?Math.min(1,r/.25,(s.sure-r)/.2):0;if(!on)return;
  s.pops.forEach(({p,at})=>{const k=ease((r-at)/.45);p.style.opacity=k;p.style.transform=`translateY(${(1-k)*50}px) scale(${.92+.08*k})`});
  if(s.w){const m0=1.8,m=ease((r-m0)/1.1);s.w.forEach(w=>{const x=w.a.x+(w.b.x-w.a.x)*m,y=w.a.y+(w.b.y-w.a.y)*m;const lift=w.hit?Math.sin(Math.min(1,Math.max(0,(r-m0)/1.1))*Math.PI)*-70:0;
    w.e.style.transform=`translate(${x}px,${y+lift}px)`;w.e.textContent=r>m0+.55?w.tx:w.orig;w.e.style.opacity=w.gone?1-m:1;w.e.style.background=(w.hit&&r>m0)?'HL':'transparent';w.e.style.color=(w.hit&&r>m0)?'#fff':''});
   (s.yeni||[]).forEach(w=>{w.e.style.transform=`translate(${w.b.x}px,${w.b.y}px)`;w.e.style.opacity=m})}})};
""".replace("HL", t["primary"])
page = f'<!DOCTYPE html><html><head><meta charset="utf-8"><style>{ff}{CSS}</style></head><body><div class="logo">ingilizcecim<b>.</b>com</div>{"".join(sc)}<div class="bar"><i></i></div><script>{JS}</script></body></html>'
tmp = tempfile.mkdtemp(); hp = f"{tmp}/a.html"; pathlib.Path(hp).write_text(page)
with sync_playwright() as pw:
    b = pw.chromium.launch(); pg = b.new_page(viewport={"width": 1080, "height": 1920})
    pg.goto("file://" + hp)
    pg.evaluate("Promise.all(['700 48px Nunito','800 80px Nunito','800 66px \\'Baloo 2\\''].map(f=>document.fonts.load(f))).then(()=>document.fonts.ready).then(()=>init())")
    T = pg.evaluate("TOTAL"); n = int(T * FPS)
    for i in range(n):
        pg.evaluate(f"seek({i/FPS})"); pg.screenshot(path=f"{tmp}/f{i:05d}.jpg", type="jpeg", quality=88)
    b.close()
try:
    import imageio_ffmpeg; FF = imageio_ffmpeg.get_ffmpeg_exe()
except Exception:
    FF = shutil.which("ffmpeg")
r = subprocess.run([FF, "-y", "-framerate", str(FPS), "-i", f"{tmp}/f%05d.jpg", "-f", "lavfi", "-t", str(T), "-i", "anullsrc=r=44100:cl=stereo",
  "-vf", "fps=30,format=yuv420p", "-c:v", "libx264", "-preset", "veryfast", "-crf", "22", "-c:a", "aac", "-b:a", "96k", "-t", str(T), "-movflags", "+faststart", out], capture_output=True, text=True)
if r.returncode: print(r.stderr[-1200:]); sys.exit(1)
print(out, os.path.getsize(out), f"{T}s")
if len(sys.argv) > 3: shutil.copytree(tmp, sys.argv[3], dirs_exist_ok=True)
