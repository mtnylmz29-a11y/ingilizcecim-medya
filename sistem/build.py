import json, html, pathlib, sys, os

ROOT = pathlib.Path(__file__).parent
data = json.loads(pathlib.Path(os.environ.get("CONTENT", str(ROOT / "content.json"))).read_text())
OUT = pathlib.Path(os.environ.get("OUT_DIR", str(ROOT / "out")))
OUT.mkdir(exist_ok=True)

THEMES = {
    "ilkokul": dict(bg="#FFF3D1", card="#FFFFFF", ink="#3A2A10", muted="#8A6A3A", primary="#FF7A00", soft="#FFE2B8", accent="#22A55B", line="#F3D9A8"),
    "ortaokul": dict(bg="#E9F0FF", card="#FFFFFF", ink="#0E1E45", muted="#51628A", primary="#1D4ED8", soft="#D3E0FF", accent="#F59E0B", line="#C8D6F5"),
    "lise": dict(bg="#0E1A33", card="#17284A", ink="#F2F5FB", muted="#9FB0CF", primary="#E63946", soft="#2A1B33", accent="#7DD3FC", line="#2A3D66"),
}

def art(name, size=360, t=None):
    p, a, ink = t["primary"], t["accent"], t["ink"]
    s = {
        "robot": f'''<rect x="70" y="40" width="160" height="120" rx="28" fill="{p}"/><circle cx="120" cy="100" r="20" fill="#fff"/><circle cx="180" cy="100" r="20" fill="#fff"/><circle cx="124" cy="104" r="9" fill="{ink}"/><circle cx="184" cy="104" r="9" fill="{ink}"/><rect x="125" y="132" width="50" height="10" rx="5" fill="#fff"/><line x1="150" y1="40" x2="150" y2="12" stroke="{ink}" stroke-width="8" stroke-linecap="round"/><circle cx="150" cy="10" r="11" fill="{a}"/><rect x="90" y="170" width="120" height="90" rx="22" fill="{p}" opacity=".85"/><rect x="40" y="180" width="36" height="70" rx="14" fill="#9AA5B1"/><rect x="224" y="180" width="36" height="70" rx="14" fill="#9AA5B1"/><path d="M44 250 L58 292 L72 250 Z" fill="#FF4D4D"/><path d="M228 250 L242 292 L256 250 Z" fill="#FF4D4D"/><path d="M50 250 L58 276 L66 250 Z" fill="#FFD23F"/><path d="M234 250 L242 276 L250 250 Z" fill="#FFD23F"/>''',
        "cat": f'''<path d="M80 110 L95 35 L140 85 Z" fill="#F4A261"/><path d="M220 110 L205 35 L160 85 Z" fill="#F4A261"/><circle cx="150" cy="150" r="95" fill="#F4A261"/><circle cx="115" cy="140" r="14" fill="{ink}"/><circle cx="185" cy="140" r="14" fill="{ink}"/><circle cx="119" cy="135" r="4" fill="#fff"/><circle cx="189" cy="135" r="4" fill="#fff"/><path d="M140 170 L160 170 L150 182 Z" fill="#E76F51"/><path d="M150 182 Q135 200 120 190 M150 182 Q165 200 180 190" stroke="{ink}" stroke-width="5" fill="none" stroke-linecap="round"/><line x1="60" y1="165" x2="105" y2="170" stroke="{ink}" stroke-width="4"/><line x1="195" y1="170" x2="240" y2="165" stroke="{ink}" stroke-width="4"/><path d="M60 270 Q150 230 240 270" stroke="#4FC3F7" stroke-width="14" fill="none" stroke-linecap="round"/>''',
        "dog": f'''<ellipse cx="80" cy="120" rx="32" ry="60" fill="#8D6E63"/><ellipse cx="220" cy="120" rx="32" ry="60" fill="#8D6E63"/><circle cx="150" cy="140" r="90" fill="#D7B49E"/><circle cx="118" cy="125" r="13" fill="{ink}"/><circle cx="182" cy="125" r="13" fill="{ink}"/><ellipse cx="150" cy="170" rx="22" ry="16" fill="{ink}"/><path d="M130 195 Q150 215 170 195" stroke="{ink}" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M150 195 L150 230 Q150 245 162 240" stroke="#E57373" stroke-width="14" fill="none" stroke-linecap="round"/><line x1="20" y1="280" x2="90" y2="280" stroke="{p}" stroke-width="8" stroke-linecap="round"/><line x1="40" y1="255" x2="100" y2="255" stroke="{p}" stroke-width="8" stroke-linecap="round" opacity=".6"/>''',
        "fish": f'''<path d="M60 150 Q150 50 240 150 Q150 250 60 150 Z" fill="#4FC3F7"/><path d="M235 150 L290 105 L290 195 Z" fill="#29B6F6"/><circle cx="110" cy="135" r="15" fill="#fff"/><circle cx="106" cy="136" r="8" fill="{ink}"/><path d="M150 100 Q165 150 150 200" stroke="#fff" stroke-width="6" fill="none" opacity=".7"/><circle cx="50" cy="80" r="12" fill="none" stroke="#4FC3F7" stroke-width="5"/><circle cx="30" cy="45" r="8" fill="none" stroke="#4FC3F7" stroke-width="4"/><path d="M20 270 Q60 250 100 270 T180 270 T260 270" stroke="#4FC3F7" stroke-width="8" fill="none" stroke-linecap="round"/>''',
        "turtle": f'''<ellipse cx="150" cy="190" rx="110" ry="25" fill="#000" opacity=".08"/><path d="M50 180 Q150 40 250 180 Z" fill="#43A047"/><path d="M95 175 Q150 95 205 175" stroke="#2E7D32" stroke-width="8" fill="none"/><line x1="150" y1="100" x2="150" y2="178" stroke="#2E7D32" stroke-width="8"/><circle cx="270" cy="160" r="30" fill="#9CCC65"/><circle cx="280" cy="152" r="7" fill="{ink}"/><rect x="75" y="175" width="30" height="35" rx="12" fill="#9CCC65"/><rect x="195" y="175" width="30" height="35" rx="12" fill="#9CCC65"/><text x="20" y="80" font-size="54" font-family="Baloo 2" font-weight="800" fill="{p}">z z</text>''',
        "heart": f'''<path d="M150 260 C40 180 40 70 105 60 C135 55 150 80 150 95 C150 80 165 55 195 60 C260 70 260 180 150 260 Z" fill="{p}"/><path d="M60 160 L110 160 L130 120 L150 200 L170 140 L185 160 L240 160" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/>''',
        "leaf": f'''<circle cx="150" cy="150" r="120" fill="none" stroke="{a}" stroke-width="6" opacity=".5"/><path d="M150 250 Q60 180 90 80 Q170 70 210 140 Q230 210 150 250 Z" fill="{p}"/><path d="M150 250 Q140 170 110 100" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity=".8"/>''',
    }[name]
    return f'<svg viewBox="0 0 300 300" width="{size}" height="{size}" xmlns="http://www.w3.org/2000/svg">{s}</svg>'

import os
LATIN="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD"
LATINEXT="U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF"
FONT_DIR = os.environ.get("FONT_DIR", str(ROOT / "fonts"))
_ff = []
for fam, slug in [("Baloo 2", "baloo-2"), ("Nunito", "nunito")]:
    for w in ([600, 800] if slug == "baloo-2" else [600, 700, 800]):
        for sub, rng in [("latin", LATIN), ("latin-ext", LATINEXT)]:
            _ff.append(f'@font-face{{font-family:"{fam}";font-weight:{w};font-style:normal;src:url("file://{FONT_DIR}/{slug}-{sub}-{w}.woff2") format("woff2");unicode-range:{rng}}}')
CSS_FONTS = "<style>" + "".join(_ff) + "</style>"

def esc(s):
    return html.escape(s).replace("\n", "<br>")

def page(post, t, inner, idx, total):
    dots = "".join(f'<i class="{"on" if i == idx else ""}"></i>' for i in range(total))
    return f'''<!DOCTYPE html><html><head><meta charset="utf-8">{CSS_FONTS}<style>
*{{box-sizing:border-box;margin:0}}
body{{width:1080px;height:1350px;background:{t["bg"]};color:{t["ink"]};font-family:"Nunito",sans-serif;overflow:hidden}}
.s{{width:1080px;height:1350px;padding:64px 72px 56px;display:flex;flex-direction:column;gap:36px;position:relative}}
.top{{display:flex;justify-content:space-between;align-items:center}}
.logo{{font:800 44px "Baloo 2";letter-spacing:-.5px}} .logo b{{color:{t["primary"]}}}
.badge{{font:800 28px "Baloo 2";background:{t["primary"]};color:#fff;padding:8px 26px;border-radius:999px;letter-spacing:.5px}}
.main{{flex:1;display:flex;flex-direction:column;gap:30px;justify-content:center}}
.foot{{display:flex;justify-content:space-between;align-items:center;font:700 30px "Nunito";color:{t["muted"]}}}
.dots{{display:flex;gap:12px}} .dots i{{width:14px;height:14px;border-radius:50%;background:{t["line"]}}} .dots i.on{{background:{t["primary"]};width:40px;border-radius:7px}}
.kicker{{font:800 34px "Baloo 2";color:{t["primary"]};text-transform:uppercase;letter-spacing:2px}}
h1{{font:800 128px/0.98 "Baloo 2";letter-spacing:-2px}}
.sub{{font:700 44px "Nunito";color:{t["muted"]}}}
.meta{{display:flex;gap:16px;flex-wrap:wrap}} .meta span{{font:800 32px "Nunito";background:{t["card"]};border:3px solid {t["line"]};padding:10px 24px;border-radius:18px}}
.cta{{font:800 40px "Baloo 2";color:{t["primary"]}}}
.qn{{font:800 34px "Baloo 2";color:{t["primary"]}}}
.q{{font:800 {"58" if post["id"]!="lise" else "50"}px/1.22 "Nunito"}}
.opts{{display:flex;flex-direction:column;gap:20px}}
.o{{display:flex;align-items:center;gap:26px;background:{t["card"]};border:4px solid {t["line"]};border-radius:28px;padding:{"26px 30px" if post["id"]=="ilkokul" else "18px 26px"};font:700 {"48" if post["id"]=="ilkokul" else ("40" if post["id"]=="ortaokul" else "36")}px/1.2 "Nunito"}}
.L{{flex:none;width:{"72" if post["id"]=="ilkokul" else "62"}px;height:{"72" if post["id"]=="ilkokul" else "62"}px;border-radius:50%;background:{t["primary"]};color:#fff;display:grid;place-items:center;font:800 36px "Baloo 2"}}
.qrow{{display:flex;gap:30px;align-items:center}} .qrow .q{{flex:1}}
.key{{display:flex;flex-direction:column;gap:18px}}
.k{{display:grid;grid-template-columns:70px 1fr;gap:22px;align-items:start;background:{t["card"]};border-radius:24px;padding:20px 26px;border:3px solid {t["line"]}}}
.k .L{{width:62px;height:62px;background:{t["accent"]};color:{"#0E1A33" if post["id"]=="lise" else "#fff"}}}
.k b{{font:800 36px "Nunito";display:block}} .k span{{font:600 30px/1.3 "Nunito";color:{t["muted"]}}}
</style></head><body><div class="s">
<div class="top"><div class="logo">ingilizcecim<b>.</b>com</div><div class="badge">{post["grade"].upper()} · QUIZ</div></div>
<div class="main">{inner}</div>
<div class="foot"><span>{esc(post["theme"])}</span><div class="dots">{dots}</div></div>
</div></body></html>'''

def build(post):
    t = THEMES[post["id"]]
    qs = post["questions"]
    total = len(qs) + 2
    pages = []
    cover = f'''<div class="kicker">{esc(post["theme"])}</div>
<div style="display:flex;align-items:center;justify-content:space-between;gap:20px">
<h1>{esc(post["title"])}</h1>{art(post["art"], 330, t)}</div>
<div class="sub">{esc(post["subtitle"])}</div>
<div class="meta"><span>{post["grade"]}</span><span>{post["level"]}</span><span>5 soru</span></div>
<div class="cta">Cevapların son slaytta · Kaydır →</div>'''
    pages.append(cover)
    for i, q in enumerate(qs):
        letters = "ABCDE"
        opts = "".join(f'<div class="o"><span class="L">{letters[j]}</span>{esc(o)}</div>' for j, o in enumerate(q["o"]))
        qtext = f'<div class="q" style="{"font-size:44px" if len(q["q"])>150 else ""}">{esc(q["q"])}</div>'
        if q.get("art"):
            qtext = f'<div class="qrow">{qtext}{art(q["art"], 250, t)}</div>'
        pages.append(f'<div class="qn">SORU {i+1} / {len(qs)}</div>{qtext}<div class="opts">{opts}</div>')
    keys = "".join(
        f'<div class="k"><span class="L">{q["a"]}</span><div><b>{i+1}. {esc(q["o"]["ABCDE".index(q["a"])])}</b><span>{esc(q["why"])}</span></div></div>'
        for i, q in enumerate(qs))
    pages.append(f'<div class="kicker">Cevap anahtarı</div><div class="key">{keys}</div><div class="cta">Kaç doğru yaptın? Yorumlara yaz! 👇</div>')
    files = []
    for i, inner in enumerate(pages):
        f = OUT / f'{data["date"]}_{post["id"]}_{i+1:02d}.html'
        f.write_text(page(post, t, inner, i, total))
        files.append(str(f))
    return files

all_files = []
for p in data["posts"]:
    all_files += build(p)
(OUT / "list.txt").write_text("\n".join(all_files))
print(len(all_files), "pages")
