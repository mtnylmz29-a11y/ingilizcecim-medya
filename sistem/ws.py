"""İlkokul çalışma kâğıdı: A4 PDF + Instagram önizleme slaytları.
Kullanım: python3 ws.py <worksheet.json> <out_dir>
Çıktı: <out_dir>/<slug>.pdf, <out_dir>/<slug>_ig_01..03.jpg, JSON özet stdout'a."""
import json, html, os, sys, pathlib

ROOT = pathlib.Path(__file__).parent
FONT_DIR = os.environ.get("FONT_DIR", str(ROOT / "fonts"))
LATIN = "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD"
LATINEXT = "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF"
FF = []
for fam, slug, ws in [("Baloo 2", "baloo-2", [600, 800]), ("Nunito", "nunito", [600, 700, 800])]:
    for w in ws:
        for sub, rng in [("latin", LATIN), ("latin-ext", LATINEXT)]:
            FF.append(f'@font-face{{font-family:"{fam}";font-weight:{w};src:url("file://{FONT_DIR}/{slug}-{sub}-{w}.woff2") format("woff2");unicode-range:{rng}}}')
FONTCSS = "".join(FF)

O, G, INK = "#FF7A00", "#22A55B", "#3A2A10"

def art(name, size=90):
    p, ink = O, INK
    s = {
        "robot": f'<rect x="70" y="40" width="160" height="120" rx="28" fill="{p}"/><circle cx="120" cy="100" r="20" fill="#fff"/><circle cx="180" cy="100" r="20" fill="#fff"/><circle cx="124" cy="104" r="9" fill="{ink}"/><circle cx="184" cy="104" r="9" fill="{ink}"/><rect x="125" y="132" width="50" height="10" rx="5" fill="#fff"/><line x1="150" y1="40" x2="150" y2="12" stroke="{ink}" stroke-width="8"/><circle cx="150" cy="10" r="11" fill="{G}"/><rect x="90" y="170" width="120" height="90" rx="22" fill="{p}" opacity=".85"/><rect x="40" y="180" width="36" height="70" rx="14" fill="#9AA5B1"/><rect x="224" y="180" width="36" height="70" rx="14" fill="#9AA5B1"/><path d="M44 250 L58 292 L72 250 Z" fill="#FF4D4D"/><path d="M228 250 L242 292 L256 250 Z" fill="#FF4D4D"/>',
        "cat": f'<path d="M80 110 L95 35 L140 85 Z" fill="#F4A261"/><path d="M220 110 L205 35 L160 85 Z" fill="#F4A261"/><circle cx="150" cy="150" r="95" fill="#F4A261"/><circle cx="115" cy="140" r="14" fill="{ink}"/><circle cx="185" cy="140" r="14" fill="{ink}"/><path d="M140 170 L160 170 L150 182 Z" fill="#E76F51"/><path d="M150 182 Q135 200 120 190 M150 182 Q165 200 180 190" stroke="{ink}" stroke-width="5" fill="none"/><line x1="60" y1="165" x2="105" y2="170" stroke="{ink}" stroke-width="4"/><line x1="195" y1="170" x2="240" y2="165" stroke="{ink}" stroke-width="4"/>',
        "dog": f'<ellipse cx="80" cy="120" rx="32" ry="60" fill="#8D6E63"/><ellipse cx="220" cy="120" rx="32" ry="60" fill="#8D6E63"/><circle cx="150" cy="140" r="90" fill="#D7B49E"/><circle cx="118" cy="125" r="13" fill="{ink}"/><circle cx="182" cy="125" r="13" fill="{ink}"/><ellipse cx="150" cy="170" rx="22" ry="16" fill="{ink}"/><path d="M130 195 Q150 215 170 195" stroke="{ink}" stroke-width="6" fill="none"/><path d="M150 195 L150 230 Q150 245 162 240" stroke="#E57373" stroke-width="14" fill="none" stroke-linecap="round"/>',
        "fish": f'<path d="M60 150 Q150 50 240 150 Q150 250 60 150 Z" fill="#4FC3F7"/><path d="M235 150 L290 105 L290 195 Z" fill="#29B6F6"/><circle cx="110" cy="135" r="15" fill="#fff"/><circle cx="106" cy="136" r="8" fill="{ink}"/><path d="M150 100 Q165 150 150 200" stroke="#fff" stroke-width="6" fill="none" opacity=".7"/>',
        "turtle": f'<path d="M50 180 Q150 40 250 180 Z" fill="#43A047"/><path d="M95 175 Q150 95 205 175" stroke="#2E7D32" stroke-width="8" fill="none"/><line x1="150" y1="100" x2="150" y2="178" stroke="#2E7D32" stroke-width="8"/><circle cx="270" cy="160" r="30" fill="#9CCC65"/><circle cx="280" cy="152" r="7" fill="{ink}"/><rect x="75" y="175" width="30" height="35" rx="12" fill="#9CCC65"/><rect x="195" y="175" width="30" height="35" rx="12" fill="#9CCC65"/>',
        "bird": f'<ellipse cx="150" cy="170" rx="85" ry="65" fill="#FFCA28"/><circle cx="205" cy="115" r="45" fill="#FFCA28"/><circle cx="218" cy="105" r="9" fill="{ink}"/><path d="M245 115 L285 125 L245 135 Z" fill="{p}"/><path d="M110 150 Q60 80 150 120 Z" fill="#FFB300"/><path d="M70 190 L30 175 L45 210 Z" fill="#FFB300"/>',
        "penguin": f'<ellipse cx="150" cy="170" rx="80" ry="110" fill="#37474F"/><ellipse cx="150" cy="190" rx="55" ry="85" fill="#fff"/><circle cx="125" cy="110" r="10" fill="{ink}"/><circle cx="175" cy="110" r="10" fill="{ink}"/><path d="M135 130 L165 130 L150 150 Z" fill="{p}"/><ellipse cx="120" cy="280" rx="25" ry="10" fill="{p}"/><ellipse cx="180" cy="280" rx="25" ry="10" fill="{p}"/>',
    }[name]
    return f'<svg viewBox="0 0 300 300" width="{size}" height="{size}">{s}</svg>'

def mark(ok):
    return (f'<svg viewBox="0 0 40 40" width="34" height="34"><circle cx="20" cy="20" r="18" fill="{G}"/><path d="M11 21 L18 28 L30 13" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'
            if ok else
            '<svg viewBox="0 0 40 40" width="34" height="34"><circle cx="20" cy="20" r="18" fill="#E53935"/><path d="M13 13 L27 27 M27 13 L13 27" stroke="#fff" stroke-width="5" stroke-linecap="round"/></svg>')

def e(s):
    return html.escape(s)

def blank(text):
    return e(text).replace("______", '<span class="blank"></span>')

def activity(i, a):
    head = f'<div class="ah"><span class="no">{i}</span><h2>{e(a["title"])}</h2><span class="tr">{e(a.get("tr",""))}</span></div>'
    k = a["kind"]
    if k == "look_write":
        cells = "".join(f'<div class="lw">{art(it["art"],66)}<div class="mk">{mark(it["ok"])}</div><p>{blank(it["text"])}</p></div>' for it in a["items"])
        body = f'<div class="grid4">{cells}</div>'
    elif k == "match":
        pics = "".join(f'<div class="mp">{art(it["art"],56)}<span class="dot"></span></div>' for it in a["items"])
        words = "".join(f'<div class="mw"><span class="dot"></span>{e(w)}</div>' for w in a["pool"])
        body = f'<div class="match"><div class="col">{pics}</div><div class="col">{words}</div></div>'
    elif k == "circle":
        rows = "".join(f'<li>{e(it["text"]).replace("(can / can&#x27;t)", "<b class=ch>can</b> / <b class=ch>can&#x27;t</b>")}</li>' for it in a["items"])
        body = f'<ol class="circ">{rows}</ol>'
    elif k == "write":
        rows = "".join(f'<div class="wl">{blank(l)}</div>' for l in a["lines"])
        body = f'<div class="write">{rows}</div>'
    return f'<section class="act">{head}{body}</section>'

CSS = f"""{FONTCSS}
*{{box-sizing:border-box;margin:0}}
@page{{size:A4;margin:0}}
body{{font-family:"Nunito",sans-serif;color:{INK};background:#fff}}
.page{{width:794px;height:1123px;padding:30px 40px 26px;display:flex;flex-direction:column;gap:12px;position:relative;overflow:hidden;page-break-after:always}}
.top{{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid {O};padding-bottom:10px}}
.logo{{font:800 26px "Baloo 2"}} .logo b{{color:{O}}}
.nm{{font:700 14px "Nunito";display:flex;gap:18px}} .nm span{{border-bottom:2px dotted #B9A27E;min-width:150px;display:inline-block}}
.title{{display:flex;justify-content:space-between;align-items:flex-end}}
h1{{font:800 38px/1 "Baloo 2"}}
.tag{{font:800 14px "Nunito";background:{O};color:#fff;border-radius:999px;padding:5px 14px}}
.sub{{font:700 15px "Nunito";color:#8A6A3A}}
.act{{border:2.5px solid #F3D9A8;border-radius:18px;padding:12px 16px 14px;display:flex;flex-direction:column;gap:10px}}
.ah{{display:flex;align-items:center;gap:10px}}
.no{{width:30px;height:30px;border-radius:50%;background:{O};color:#fff;display:grid;place-items:center;font:800 17px "Baloo 2"}}
h2{{font:800 19px "Nunito"}} .tr{{font:600 13px "Nunito";color:#8A6A3A}}
.grid4{{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}}
.lw{{background:#FFF7E6;border-radius:14px;padding:8px;display:flex;flex-direction:column;align-items:center;gap:4px;position:relative}}
.lw .mk{{position:absolute;top:6px;right:6px}}
.lw p{{font:700 15px/1.35 "Nunito";text-align:center}}
.blank{{display:inline-block;width:58px;border-bottom:2px solid {INK};margin:0 3px;transform:translateY(-3px)}}
.match{{display:flex;justify-content:space-between;padding:0 30px}}
.col{{display:flex;flex-direction:column;gap:4px}}
.mp{{display:flex;align-items:center;gap:16px}}
.mw{{display:flex;align-items:center;gap:16px;font:800 21px "Nunito";height:56px}}
.dot{{width:14px;height:14px;border-radius:50%;background:{INK}}}
.circ{{font:700 18px/1.6 "Nunito";padding-left:24px}}
.ch{{border:2px dashed #C9B48F;border-radius:10px;padding:0 8px;font-weight:800}}
.write{{display:flex;flex-direction:column;gap:10px;font:700 18px "Nunito"}}
.wl .blank{{width:300px}}
.foot{{margin-top:auto;display:flex;justify-content:space-between;font:700 12px "Nunito";color:#8A6A3A}}
.key h2{{margin-bottom:6px}} .key li{{font:700 16px/1.8 "Nunito"}}
"""

def page_html(ws):
    acts = "".join(activity(i + 1, a) for i, a in enumerate(ws["activities"]))
    head = f'''<div class="top"><div class="logo">ingilizcecim<b>.</b>com</div><div class="nm">Name: <span></span> Class: <span style="min-width:70px"></span></div></div>
<div class="title"><div><h1>{e(ws["title"])}</h1><div class="sub">{e(ws["theme"])} · {e(ws["focus"])}</div></div><div class="tag">{e(ws["grade"]).upper()}</div></div>'''
    foot = f'<div class="foot"><span>© ingilizcecim.com · Ücretsiz eğitim materyali · Satılamaz</span><span>{e(ws["level"])}</span></div>'
    p1 = f'<div class="page">{head}{acts}{foot}</div>'
    keys = "".join(f'<li><b>{i+1}. {e(a["title"])}:</b> {e(a["key"])}</li>' for i, a in enumerate(ws["activities"]))
    p2 = f'<div class="page key"><div class="top"><div class="logo">ingilizcecim<b>.</b>com</div><div class="tag">CEVAP ANAHTARI</div></div><h2>{e(ws["title"])} · {e(ws["grade"])}</h2><ol style="list-style:none;padding:0">{keys}</ol>{foot}</div>'
    return f'<!DOCTYPE html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>{p1}{p2}</body></html>'

def ig_html(ws, img_uri, n):
    base = f'''<!DOCTYPE html><html><head><meta charset="utf-8"><style>{FONTCSS}
*{{box-sizing:border-box;margin:0}} body{{width:1080px;height:1350px;background:#FFF3D1;color:{INK};font-family:"Nunito";overflow:hidden}}
.s{{padding:60px 70px;height:1350px;display:flex;flex-direction:column;gap:30px}}
.top{{display:flex;justify-content:space-between;align-items:center}} .logo{{font:800 44px "Baloo 2"}} .logo b{{color:{O}}}
.badge{{font:800 28px "Baloo 2";background:{O};color:#fff;padding:8px 26px;border-radius:999px}}
h1{{font:800 96px/1 "Baloo 2"}} .k{{font:800 34px "Baloo 2";color:{O};letter-spacing:2px;text-transform:uppercase}}
.cta{{background:{O};color:#fff;border-radius:30px;padding:28px 36px;font:800 46px/1.2 "Baloo 2"}}
.sheet{{background:#fff;border-radius:20px;box-shadow:0 18px 40px rgba(58,42,16,.18);overflow:hidden}}
.big{{font:800 52px/1.25 "Nunito"}} .step{{display:flex;gap:26px;align-items:center;font:700 42px/1.3 "Nunito"}} .step b{{flex:none;width:86px;height:86px;border-radius:50%;background:{O};color:#fff;display:grid;place-items:center;font:800 46px "Baloo 2"}}
</style></head><body><div class="s"><div class="top"><div class="logo">ingilizcecim<b>.</b>com</div><div class="badge">{e(ws["grade"]).upper()} · ÇALIŞMA KÂĞIDI</div></div>'''
    if n == 1:
        body = f'''<div class="k">{e(ws["theme"])}</div><h1>{e(ws["title"])}</h1>
<div style="display:flex;gap:36px;align-items:flex-start"><div class="sheet" style="width:520px;transform:rotate(-3deg)"><img src="{img_uri}" style="width:100%;display:block"></div>
<div style="display:flex;flex-direction:column;gap:22px;font:800 38px/1.25 'Nunito'"><span>✏️ 4 etkinlik</span><span>📄 A4, yazdırmaya hazır</span><span>✅ Cevap anahtarlı</span><span>🎁 Ücretsiz</span></div></div>
<div class="cta">PDF'i almak için yorumlara <u>PDF</u> yaz, DM'den gönderelim! 👇</div>'''
    elif n == 2:
        body = f'<div class="sheet" style="flex:1"><img src="{img_uri}" style="width:100%;display:block"></div>'
    else:
        body = f'''<h1 style="font-size:84px">PDF nasıl alınır?</h1>
<div class="step"><b>1</b>Bu gönderiye <u>PDF</u> yazarak yorum yap.</div>
<div class="step"><b>2</b>Birkaç saat içinde DM kutuna indirme bağlantısı gelir.</div>
<div class="step"><b>3</b>Yazdır, sınıfta ya da evde kullan. 🎉</div>
<div class="big" style="margin-top:auto;color:#8A6A3A;font-size:36px">Öğretmenler: Dilediğiniz kadar çoğaltabilirsiniz. Daha fazlası ingilizcecim.com'da.</div>'''
    return base + body + '</div></body></html>'

if __name__ == "__main__":
    ws = json.loads(pathlib.Path(sys.argv[1]).read_text())
    out = pathlib.Path(sys.argv[2]).resolve(); out.mkdir(parents=True, exist_ok=True)
    slug = ws["slug"]
    from playwright.sync_api import sync_playwright
    with sync_playwright() as pw:
        b = pw.chromium.launch()
        pg = b.new_page(viewport={"width": 794, "height": 1123}, device_scale_factor=2)
        hp = out / f"{slug}.html"; hp.write_text(page_html(ws))
        pg.goto("file://" + str(hp)); pg.evaluate("document.fonts.ready")
        over = pg.evaluate("[...document.querySelectorAll('.page')].map(p=>p.scrollHeight>1123)")
        pg.pdf(path=str(out / f"{slug}.pdf"), format="A4", print_background=True)
        png = out / f"{slug}_p1.png"
        pg.locator(".page").first.screenshot(path=str(png))
        ig = b.new_page(viewport={"width": 1080, "height": 1350})
        jpgs = []
        for n in (1, 2, 3):
            f = out / f"{slug}_ig_{n:02d}.html"; f.write_text(ig_html(ws, "file://" + str(png), n))
            ig.goto("file://" + str(f)); ig.evaluate("document.fonts.ready")
            j = out / f"{slug}_ig_{n:02d}.jpg"; ig.screenshot(path=str(j), type="jpeg", quality=90); jpgs.append(str(j))
        b.close()
    print(json.dumps({"pdf": str(out / f"{slug}.pdf"), "jpgs": jpgs, "overflow": over}))
