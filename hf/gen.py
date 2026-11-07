"""HyperFrames video uretici: python3 hf/gen.py <spec.json> <proje_klasoru>
Spec bicimi: sistem/ICERIK_BICIMI.md > HyperFrames. Sesler Kokoro-82M (Apache-2.0, yalnizca Ingilizce) ile uretilir.
Ciktiyi uretmek: cd <proje_klasoru> && npx hyperframes render -o out.mp4"""
import sys, os, json, html, shutil, pathlib, urllib.request, urllib.parse

HERE = pathlib.Path(__file__).resolve().parent
spec = json.loads(pathlib.Path(sys.argv[1]).read_text())
OUT = pathlib.Path(sys.argv[2]); (OUT / "assets/ses").mkdir(parents=True, exist_ok=True)
(OUT / "assets/ikon").mkdir(parents=True, exist_ok=True); (OUT / "assets/fonts").mkdir(parents=True, exist_ok=True)
e = html.escape
r = lambda x: round(x, 2)

PALET = {
    "ydt": dict(bg="#F4F1EA", card="#FFFFFF", ink="#1E1B16", muted="#6B6357", primary="#7A1F2B", soft="#EADFD2", accent="#B8862B", line="#DDD3C3", blob="#F1E3CF"),
    "gece": dict(bg="#141B2D", card="#1E2840", ink="#F5F2EA", muted="#A9B4CC", primary="#FF6B57", soft="#24304D", accent="#FFD166", line="#2E3A57", blob="#2A2440"),
    "nane": dict(bg="#E6F6F0", card="#FFFFFF", ink="#0B2E28", muted="#4E7068", primary="#0F766E", soft="#CDEDE3", accent="#F59E0B", line="#BFE3D6", blob="#FCEBC7"),
    "gunbatimi": dict(bg="#FFF0E6", card="#FFFFFF", ink="#3B1F12", muted="#8A5A44", primary="#C2410C", soft="#FFDCC7", accent="#7C3AED", line="#F6CDB4", blob="#EDE0FF"),
    "limon": dict(bg="#FFF6C7", card="#FFFFFF", ink="#1D1B16", muted="#6A6450", primary="#1D1B16", soft="#FFE98A", accent="#E11D48", line="#F0E08F", blob="#FFD9E2"),
    "okyanus": dict(bg="#E6F2FF", card="#FFFFFF", ink="#082F57", muted="#4A6A8C", primary="#0B4F8A", soft="#CFE4FA", accent="#00A6A6", line="#BCD7F2", blob="#CDF3F0"),
    "lavanta": dict(bg="#F1EDFF", card="#FFFFFF", ink="#24124F", muted="#6D5F99", primary="#5B21B6", soft="#E1D8FF", accent="#DB2777", line="#D6CCF7", blob="#F9DDEB"),
}
T = PALET[spec.get("palet", "lavanta")]
ON = "#fff" if spec.get("palet") != "gece" else T["bg"]  # vurgu kutusundaki yazi rengi

def indir(url, p):
    if not p.exists():
        urllib.request.urlretrieve(url, p)

G = "https://raw.githubusercontent.com/google/fonts/main/ofl/"
indir(G + "baloo2/Baloo2%5Bwght%5D.ttf", OUT / "assets/fonts/Baloo2.ttf")
indir(G + "nunito/Nunito%5Bwght%5D.ttf", OUT / "assets/fonts/Nunito.ttf")
shutil.copy(HERE / "gsap.min.js", OUT / "assets/gsap.min.js")

def ikon(ad):
    """Microsoft Fluent Emoji 3D (MIT). Bulunamazsa bos doner, sahne ikonsuz kalir."""
    if not ad: return ""
    fn = ad.lower().replace(" ", "_").replace("-", "_") + "_3d.png"
    try:
        indir("https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/" + urllib.parse.quote(ad) + "/3D/" + fn, OUT / "assets/ikon" / fn)
        return "assets/ikon/" + fn
    except Exception as ex:
        print("ikon yok:", ad, ex); return ""

# ---- ses (Kokoro)
SR = 24000
import numpy as np, soundfile as sf, hashlib, base64, time
# Ses motoru: GEMINI_API_KEY varsa Gemini TTS (Turkce + Ingilizce, ayni ses), yoksa Kokoro (yalnizca Ingilizce).
GKEY = os.environ.get("GEMINI_API_KEY", "")
MOTOR = spec.get("ses_motoru", "gemini" if GKEY else "kokoro")
GSES = spec.get("gemini_ses", "Kore")
GMODEL = spec.get("gemini_model", "gemini-2.5-flash-preview-tts")
USLUP = {"tr": "Sıcak, net ve enerjik bir öğretmen sesiyle Türkçe söyle: ",
         "en": "Say in clear, natural American English, like a friendly teacher: "}
_K = []
def kokoro():
    if not _K:
        import kokoro_onnx
        TD = pathlib.Path(os.environ.get("TTS_DIR", str(pathlib.Path.home() / ".cache/kokoro"))); TD.mkdir(parents=True, exist_ok=True)
        U = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/"
        for f in ("kokoro-v1.0.int8.onnx", "voices-v1.0.bin"):
            indir(U + f, TD / f)
        _K.append(kokoro_onnx.Kokoro(str(TD / "kokoro-v1.0.int8.onnx"), str(TD / "voices-v1.0.bin")))
    return _K[0]
def gemini(text, dil):
    body = json.dumps({"contents": [{"parts": [{"text": USLUP[dil] + text}]}],
                       "generationConfig": {"responseModalities": ["AUDIO"],
                                            "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": GSES}}}}}).encode()
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GMODEL}:generateContent"
    for deneme in range(5):
        try:
            req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/json", "x-goog-api-key": GKEY})
            d = json.loads(urllib.request.urlopen(req, timeout=120).read())
            pcm = base64.b64decode(d["candidates"][0]["content"]["parts"][0]["inlineData"]["data"])
            return np.frombuffer(pcm, dtype="<i2").astype(np.float32) / 32768.0
        except Exception as ex:
            ayr = ""
            try: ayr = ex.read().decode()[:600]
            except Exception: pass
            print("gemini tekrar", deneme + 1, type(ex).__name__, str(ex)[:120], ayr)
            if "PerDay" in ayr: raise SystemExit("Gemini gunluk kota doldu")
            time.sleep(25 * (deneme + 1))
    raise SystemExit("Gemini TTS basarisiz: " + text)
SES = []  # (id, baslangic, sure)
nses = [0]
def say(text, at, dil="en"):
    """Metni seslendirir (dil: en | tr), verilen anda baslatir, suresini doner."""
    if not text: return 0.0
    nses[0] += 1; i = f"ses{nses[0]:02d}"
    if MOTOR == "gemini":
        CD = pathlib.Path(os.environ.get("SES_CACHE", "ses_cache")); CD.mkdir(parents=True, exist_ok=True)
        cp = CD / (hashlib.md5(f"{GSES}|{dil}|{text}".encode()).hexdigest() + ".wav")
        if cp.exists():
            a, _ = sf.read(cp, dtype="float32")
        else:
            a = gemini(text, dil); sf.write(cp, a, SR); time.sleep(21)  # ucretsiz katman: dakikada ~3 istek
    elif dil == "en":
        a, _ = kokoro().create(text, voice=spec.get("ses_sesi", "af_heart"), speed=spec.get("ses_hizi", 0.95), lang="en-us")
    else:
        print("Turkce ses icin GEMINI_API_KEY gerekli, atlandi:", text); return 0.0
    sf.write(OUT / f"assets/ses/{i}.wav", a, SR); d = round(len(a) / SR, 2)
    SES.append((i, r(at), d)); return d

def words(text, cls="w", vurgu=()):
    vs = {v.lower().strip(".,!?") for v in vurgu}
    return " ".join(f'<span class="{cls}{" hl" if x.lower().strip(".,!?") in vs else ""}">{e(x)}</span>' for x in text.split())

clips, js = [], []
t = 0.0
for n, s in enumerate(spec["sahneler"]):
    k = s["tip"]; S = t; sid = f"s{n}"; ik = ikon(s.get("ikon"))
    img = f'<img id="i{n}" class="ik" src="{ik}">' if ik else ""
    ust = f'<div class="chip" id="c{n}">{e(s["ust"])}</div>' if s.get("ust") else ""
    J = []
    if k in ("kapak", "kapanis"):
        d = say(s.get("ses"), S + 0.45, s.get("ses_dil", "tr"))
        dur = max(s.get("sure", 4.0), 0.45 + d + (0.9 if k == "kapak" else 2.4))
        tag = "h1" if k == "kapak" else "h2"
        et = "".join(f"<span>{e(x)}</span>" for x in s.get("etiketler", []))
        clips.append(f'<div id="{sid}" class="clip sc" data-start="{r(S)}" data-duration="{r(dur)}" data-track-index="1"><div class="in">{img}'
                     f'<{tag} id="h{n}">{words(s["baslik"], vurgu=s.get("vurgu", []))}</{tag}>'
                     + (f'<div class="chips" id="cs{n}">{et}</div>' if et else "")
                     + f'<div id="a{n}" class="alt">{e(s.get("alt", "ingilizcecim.com"))}</div></div></div>')
        if ik:
            J.append(f'tl.fromTo("#i{n}",{{y:600,rotation:-30,scale:.6}},{{y:0,rotation:0,scale:1,duration:.9,ease:"back.out(1.6)"}},{r(S+.05)});' if k == "kapak"
                     else f'tl.fromTo("#i{n}",{{scale:0,rotation:25}},{{scale:1,rotation:0,duration:.8,ease:"elastic.out(1,0.5)"}},{r(S+.1)});')
            J.append(f'tl.to("#i{n}",{{y:-40,rotation:8,duration:{r(dur-1.4)},ease:"sine.inOut"}},{r(S+1.0)});')
        J.append(f'tl.fromTo("#h{n} .w",{{opacity:0,filter:"blur(10px)",y:30}},{{opacity:1,filter:"blur(0px)",y:0,duration:.35,stagger:.09,ease:"expo.out"}},{r(S+.35)});')
        J.append(f'tl.fromTo("#h{n} .hl",{{backgroundSize:"0% 100%"}},{{backgroundSize:"100% 100%",duration:.45,stagger:.08,ease:"power3.out"}},{r(S+1.0)});')
        if et: J.append(f'tl.fromTo("#cs{n} span",{{y:80,opacity:0}},{{y:0,opacity:1,duration:.5,stagger:.08,ease:"back.out(1.7)"}},{r(S+1.1)});')
        J.append(f'tl.fromTo("#a{n}",{{opacity:0,y:20}},{{opacity:1,y:0,duration:.4,ease:"power3.out"}},{r(S+1.25)});')
    elif k == "degis":  # bir kelimenin yerine digeri gelir (slot)
        va = 0.55; da = say(s.get("ses_eski", f'{s["once"]} {s["eski"]} {s["sonra"]}'), S + va)
        ra = va + da + 0.15; roll = ra + 0.45; vb = roll + 0.3
        db = say(s.get("ses_yeni", f'{s["once"]} {s["yeni"]} {s["sonra"]}'), S + vb)
        vt = vb + db + 0.35; dt = say(s.get("ses_tr"), S + vt, "tr")
        dur = max(vb + db + 1.7, vt + dt + 1.0)
        no = f'<div class="num" id="n{n}" data-layout-allow-overlap data-layout-allow-overflow>{e(str(s["no"]))}</div>' if s.get("no") else ""
        ik2 = f'<img class="ik2" id="k{n}" src="{ik}">' if ik else ""
        clips.append(f'<div id="{sid}" class="clip sc" data-start="{r(S)}" data-duration="{r(dur)}" data-track-index="1">{no}<div class="in">{ust}'
                     f'<div class="pre" id="p{n}">{words(s["once"])}</div>'
                     f'<div class="slot" id="sl{n}" data-layout-allow-overlap data-layout-allow-overflow><span class="pl" id="pl{n}">{e(s["eski"])}<i class="st" id="st{n}"></i></span>'
                     f'<span class="ac" id="ac{n}"><b class="fl" id="fl{n}"></b><em>{e(s["yeni"])}</em></span></div>'
                     f'<div class="pre" id="po{n}">{words(s["sonra"])}</div>'
                     f'<div class="card" id="cd{n}">{ik2}<div><small>{e(s["yeni"])}</small><br>{e(s["anlam"])}</div></div></div></div>')
        if no:
            J.append(f'tl.fromTo("#n{n}",{{x:300,opacity:0}},{{x:0,opacity:1,duration:.9,ease:"expo.out"}},{r(S)});')
            J.append(f'tl.to("#n{n}",{{x:-120,duration:{r(dur-1.25)},ease:"none"}},{r(S+.9)});')
        J.append(f'tl.fromTo("#p{n} .w, #pl{n}, #po{n} .w",{{opacity:0,filter:"blur(8px)"}},{{opacity:1,filter:"blur(0px)",duration:.16,stagger:.07,ease:"power2.out"}},{r(S+.2)});')
        J.append(f'tl.fromTo("#st{n}",{{scaleX:0}},{{scaleX:1,duration:.32,ease:"power3.inOut"}},{r(S+ra)});')
        J.append(f'tl.to("#pl{n}",{{yPercent:-110,filter:"blur(8px)",opacity:0,duration:.4,ease:"power3.in"}},{r(S+roll-.05)});')
        J.append(f'tl.fromTo("#ac{n}",{{yPercent:110,filter:"blur(8px)"}},{{yPercent:0,filter:"blur(0px)",duration:.55,ease:"expo.out"}},{r(S+roll+.12)});')
        J.append(f'tl.fromTo("#fl{n}",{{scaleX:0}},{{scaleX:1,duration:.45,ease:"power3.out"}},{r(S+roll+.2)});')
        J.append(f'tl.fromTo("#sl{n}",{{scale:1}},{{scale:1.06,duration:.18,yoyo:true,repeat:1,ease:"power2.out"}},{r(S+roll+.45)});')
        J.append(f'tl.fromTo("#cd{n}",{{y:260,opacity:0}},{{y:0,opacity:1,duration:.7,ease:"back.out(1.5)"}},{r(S+roll+.55)});')
        if ik: J.append(f'tl.fromTo("#k{n}",{{scale:0,rotation:-40}},{{scale:1,rotation:0,duration:.6,ease:"elastic.out(1,0.55)"}},{r(S+roll+.7)});')
    elif k == "donusum":  # cumle once/sonra: kelimeler bulanip yeni cumle gelir, vurgu kutulari dolar
        va = 0.45; da = say(s["once"], S + va); sw = va + da + 0.35; vb = sw + 0.35
        db = say(s["sonra"], S + vb); nt = vb + db + 0.2
        tt = say(s.get("ses_tr"), S + nt + 0.4, "tr"); nt2 = nt + (tt + 0.6 if tt else 0); dur = max(nt2 + 1.0, nt + max(2.6, 0.9 + 0.06 * len(s.get("not", ""))))
        clips.append(f'<div id="{sid}" class="clip sc" data-start="{r(S)}" data-duration="{r(dur)}" data-track-index="1"><div class="in">{ust}'
                     f'<div class="pair" data-layout-allow-overlap><div class="sent" id="bo{n}">{words(s["once"])}</div>'
                     f'<div class="sent" id="so{n}">{words(s["sonra"], vurgu=s.get("vurgu", []))}</div></div>'
                     + (f'<div class="card" id="cd{n}"><div>{e(s["not"])}</div></div>' if s.get("not") else "") + '</div></div>')
        J.append(f'tl.fromTo("#bo{n} .w",{{opacity:0,filter:"blur(8px)",y:24}},{{opacity:1,filter:"blur(0px)",y:0,duration:.25,stagger:.07,ease:"expo.out"}},{r(S+.2)});')
        J.append(f'tl.fromTo("#so{n} .w",{{opacity:0}},{{opacity:0,duration:.01}},{r(S)});')
        J.append(f'tl.to("#bo{n} .w",{{opacity:0,filter:"blur(10px)",y:-40,duration:.25,stagger:.03,ease:"power3.in"}},{r(S+sw)});')
        J.append(f'tl.fromTo("#so{n} .w",{{opacity:0,filter:"blur(10px)",y:40}},{{opacity:1,filter:"blur(0px)",y:0,duration:.35,stagger:.06,ease:"expo.out"}},{r(S+sw+.25)});')
        J.append(f'tl.fromTo("#so{n} .hl",{{backgroundSize:"0% 100%"}},{{backgroundSize:"100% 100%",duration:.4,stagger:.08,ease:"power3.out"}},{r(S+sw+.7)});')
        if s.get("not"): J.append(f'tl.fromTo("#cd{n}",{{y:220,opacity:0}},{{y:0,opacity:1,duration:.7,ease:"back.out(1.5)"}},{r(S+nt)});')
    elif k == "maddeler":
        d = say(s.get("ses"), S + 0.5, s.get("ses_dil", "tr")); dur = max(s.get("sure", 6), 0.5 + d + 1.2)
        sat = s["satirlar"]; step = max(0.5, (dur - 2.0) / max(1, len(sat)))
        clips.append(f'<div id="{sid}" class="clip sc" data-start="{r(S)}" data-duration="{r(dur)}" data-track-index="1"><div class="in">{ust}'
                     f'<div class="bas" id="h{n}">{words(s.get("baslik", ""))}</div>'
                     + "".join(f'<div class="sat" id="m{n}_{j}"><b>{j+1}</b>{e(x)}</div>' for j, x in enumerate(sat)) + '</div></div>')
        J.append(f'tl.fromTo("#h{n} .w",{{opacity:0,filter:"blur(8px)"}},{{opacity:1,filter:"blur(0px)",duration:.25,stagger:.07,ease:"expo.out"}},{r(S+.2)});')
        for j in range(len(sat)):
            J.append(f'tl.fromTo("#m{n}_{j}",{{x:160,opacity:0}},{{x:0,opacity:1,duration:.6,ease:"back.out(1.4)"}},{r(S+.6+j*step)});')
    else:
        raise SystemExit(f"bilinmeyen sahne tipi: {k}")
    if ust: J.append(f'tl.fromTo("#c{n}",{{scale:.4,opacity:0}},{{scale:1,opacity:1,duration:.45,ease:"back.out(2)"}},{r(S+.1)});')
    if n > 0: J.insert(0, f'tl.fromTo("#{sid} .in",{{x:420,filter:"blur(14px)",opacity:0}},{{x:0,filter:"blur(0px)",opacity:1,duration:.4,ease:"expo.out"}},{r(S)});')
    if n < len(spec["sahneler"]) - 1:
        J.append(f'tl.to("#{sid} .in{", #n"+str(n) if k == "degis" and s.get("no") else ""}",{{x:-420,opacity:0,filter:"blur(14px)",duration:.28,ease:"power3.in"}},{r(S+dur-.3)});')
    js += J; t = S + dur

TOT = r(t)
js.append(f'tl.fromTo("#bar i",{{scaleX:0}},{{scaleX:1,duration:{TOT},ease:"none"}},0);')
js.append(f'tl.fromTo("#blob1",{{rotation:0,x:0}},{{rotation:120,x:-160,duration:{TOT},ease:"none"}},0);')
js.append(f'tl.fromTo("#blob2",{{rotation:0,y:0}},{{rotation:-90,y:-260,duration:{TOT},ease:"none"}},0);')
audio = "\n".join(f'<audio id="{i}" src="assets/ses/{i}.wav" data-start="{a}" data-duration="{d}" data-volume="1" data-track-index="{10 + j % 2}"></audio>' for j, (i, a, d) in enumerate(SES))
CSS = f'''
@font-face{{font-family:"Baloo 2";src:url("assets/fonts/Baloo2.ttf");font-weight:400 800}}
@font-face{{font-family:"NunitoX";src:url("assets/fonts/Nunito.ttf");font-weight:200 1000}}
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{width:1080px;height:1920px;overflow:hidden;background:{T["bg"]}}}
#root{{width:1080px;height:1920px;position:relative;font-family:"NunitoX";color:{T["ink"]}}}
#bg{{position:absolute;inset:0;overflow:hidden;background:{T["bg"]}}}
.blob{{position:absolute;border-radius:42% 58% 63% 37%/45% 40% 60% 55%;opacity:.55}}
#blob1{{width:900px;height:900px;left:420px;top:-260px;background:{T["soft"]}}}
#blob2{{width:760px;height:760px;left:-300px;top:1250px;background:{T["blob"]}}}
.logo{{position:absolute;top:150px;left:96px;font:800 46px "Baloo 2";z-index:5}}.logo b{{color:{T["accent"]}}}
#bar{{position:absolute;left:96px;right:96px;bottom:250px;height:12px;border-radius:6px;background:{T["line"]};z-index:5;overflow:hidden}}
#bar i{{display:block;height:100%;background:{T["primary"]};transform-origin:0 50%}}
.sc{{position:absolute;inset:0;z-index:2}}
.in{{position:absolute;left:96px;right:96px;top:330px;bottom:330px;display:flex;flex-direction:column;justify-content:center;gap:34px}}
.ik{{width:300px;height:300px;filter:drop-shadow(0 30px 40px rgba(0,0,0,.2))}}
h1{{font:800 140px/1.02 "Baloo 2"}}h2{{font:800 116px/1.05 "Baloo 2"}}
.hl{{color:{ON};padding:0 16px;border-radius:20px;background:linear-gradient({T["primary"]},{T["primary"]}) no-repeat left/0% 100%}}
.w{{display:inline-block}}
.alt{{font:800 50px "NunitoX";color:{T["muted"]}}}
.num{{position:absolute;right:40px;top:380px;font:800 620px/1 "Baloo 2";color:transparent;-webkit-text-stroke:6px {T["line"]};z-index:0}}
.chip{{align-self:flex-start;font:800 40px "Baloo 2";letter-spacing:3px;color:#fff;background:{T["accent"]};padding:10px 28px;border-radius:40px}}
.pre{{font:800 84px/1.15 "NunitoX"}}
.slot{{position:relative;height:190px;overflow:hidden;align-self:flex-start;min-width:860px}}
.pl,.ac{{position:absolute;left:0;top:0;font:800 150px/190px "Baloo 2";white-space:nowrap}}
.pl{{color:{T["muted"]}}}
.st{{position:absolute;left:-6px;right:-6px;top:50%;height:16px;margin-top:-4px;background:{T["accent"]};border-radius:8px;transform-origin:0 50%}}
.ac{{color:{ON};padding:0 26px}}.ac em{{font-style:normal;position:relative}}
.fl{{position:absolute;inset:14px 0;background:{T["primary"]};border-radius:30px;transform-origin:0 50%}}
.pair{{display:grid}}.pair>.sent{{grid-area:1/1}}
.sent{{font:800 92px/1.25 "NunitoX"}}.sent .hl{{border-radius:18px;padding:0 14px}}
.card{{display:flex;align-items:center;gap:30px;background:{T["card"]};border:5px solid {T["line"]};border-radius:36px;padding:28px 34px;font:800 54px/1.25 "NunitoX";box-shadow:0 24px 50px rgba(0,0,0,.12)}}
.card small{{font:800 38px "Baloo 2";color:{T["accent"]};letter-spacing:1px}}
.ik2{{width:150px;height:150px;flex:none}}
.bas{{font:800 92px/1.1 "Baloo 2"}}
.sat{{display:flex;gap:26px;align-items:center;font:800 54px/1.25 "NunitoX";background:{T["card"]};border:5px solid {T["line"]};border-radius:30px;padding:22px 30px}}
.sat b{{flex:none;width:78px;height:78px;border-radius:50%;background:{T["primary"]};color:{ON};font:800 46px/78px "Baloo 2";text-align:center}}
.chips{{display:flex;flex-wrap:wrap;gap:20px}}.chips span{{font:800 52px "Baloo 2";background:{T["card"]};border:5px solid {T["line"]};border-radius:30px;padding:8px 30px;color:{T["primary"]}}}
'''
H = f'''<!doctype html>
<html lang="tr" data-resolution="portrait">
<head><meta charset="UTF-8"><meta name="viewport" content="width=1080, height=1920">
<script src="assets/gsap.min.js"></script><style>{CSS}</style></head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{TOT}" data-width="1080" data-height="1920" data-motion-blur="on">
<div id="bg" data-motion-blur="off"><div class="blob" id="blob1"></div><div class="blob" id="blob2"></div></div>
<div class="logo">ingilizcecim<b>.</b>com</div><div id="bar"><i></i></div>
{chr(10).join(clips)}
{audio}
</div>
<script>
const tl = gsap.timeline({{ paused: true }});
{chr(10).join(js)}
window.__timelines = window.__timelines || {{}};
window.__timelines["main"] = tl;
tl.seek(0);
</script>
</body></html>'''
(OUT / "index.html").write_text(H)
shutil.copy(HERE / "hyperframes.json", OUT / "hyperframes.json")
(OUT / "meta.json").write_text(json.dumps({"id": OUT.name, "name": OUT.name}))
print(json.dumps({"sure": TOT, "ses": len(SES)}))
