"""Sınav sorusu biçimi (sinav_<ad>.json): spec'i doğrular, props'u yazar, seslendirmesiz ses bandını üretir.
Metin, 18 Kasım 2026: "Sorularda seslendirme kullanmayalım. Sadece az bir müzik olabilir… tik tak sesleri falan."
Kullanım: python sinav.py <spec.json> <is_klasoru>  ->  <is>/props.json, <is>/kapak.json, <is>/kapak_kare, <is>/mix.wav
Zamanlama src/sinavZaman.json'dan (Sinav.tsx ile aynı kaynak). TTS yok: internet, kota ve GPU gerekmez; bulutta ve bilgisayarda aynı çalışır."""
import json, os, re, sys
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt

spec_yol, IS = sys.argv[1], sys.argv[2]
HERE = os.path.dirname(os.path.abspath(__file__))
spec = json.load(open(spec_yol, encoding="utf-8"))
Z = json.load(open(os.path.join(HERE, "src", "sinavZaman.json"), encoding="utf-8"))
ikon_src = open(os.path.join(HERE, "src", "sinavIkon.tsx"), encoding="utf-8").read()
IKON = set(re.findall(r'"([A-Za-z]+)"', re.search(r"IKON_ADLARI = \[(.*?)\] as const", ikon_src, re.S).group(1)))

# ---- doğrulama: hatalar Actions günlüğünde "SPEC HATASI" diye görünür ----
hata = []
def alan(k, tip=str, en_cok=None):
    v = spec.get(k)
    if not isinstance(v, tip) or (tip is str and not v.strip()):
        hata.append(f"{k} zorunlu ({tip.__name__})"); return None
    if en_cok and tip is str and len(v) > en_cok:
        hata.append(f"{k}: en fazla {en_cok} karakter (şu an {len(v)})")
    return v
alan("etiket", str, 26); alan("soru", str, 170); alan("kural", str, 60); alan("kuralOrnek", str, 40)
if not isinstance(spec.get("soruNo"), int): hata.append("soruNo tam sayı olmalı")
if spec.get("ikon") not in IKON: hata.append(f"ikon '{spec.get('ikon')}' yok (geçerli: {', '.join(sorted(IKON))})")
sec = spec.get("secenekler")
if not (isinstance(sec, list) and len(sec) == 5 and all(isinstance(s, str) and s.strip() for s in sec)):
    hata.append("secenekler: tam 5 dolu metin")
else:
    for i, s in enumerate(sec):
        if len(s) > 24: hata.append(f"secenekler[{i}]: en fazla 24 karakter")
d = spec.get("dogru")
if not (isinstance(d, int) and 0 <= d <= 4): hata.append("dogru: 0–4 (A=0 … E=4)")
el = spec.get("eleme")
if not (isinstance(el, list) and 1 <= len(el) <= 4): hata.append("eleme: 1–4 kayıt")
else:
    siklar = [e.get("sik") for e in el]
    if len(set(siklar)) != len(siklar): hata.append("eleme: aynı şık iki kez elenemez")
    for e in el:
        if not (isinstance(e.get("sik"), int) and 0 <= e["sik"] <= 4): hata.append("eleme.sik: 0–4")
        elif e["sik"] == d: hata.append("eleme: doğru şık elenemez")
        if not e.get("neden"): hata.append(f"eleme[{e.get('sik')}]: neden zorunlu")
        elif len(e["neden"]) > 32: hata.append(f"eleme[{e.get('sik')}].neden: en fazla 32 karakter (tek satır kalsın)")
k = spec.get("kural", "")
if any(len(x) > 26 for x in k.split("\n")): hata.append("kural: her satır en fazla 26 karakter (satır sonu \\n)")
kp = spec.get("kapak")
if not (isinstance(kp, dict) and kp.get("baslik")): hata.append("kapak.baslik zorunlu (kapak görseli için)")
elif len(kp["baslik"]) > 12: hata.append("kapak.baslik: en fazla 12 karakter (150 px tek satır)")
if hata:
    print("SPEC HATASI:\n- " + "\n- ".join(hata)); sys.exit(2)

# ---- zaman (Sinav.tsx sinavAnlar ile aynı) ----
fps = Z["fps"]; n = len(el)
tSure = Z["giris"] + Z["oku"]; tEleme = tSure + Z["sure"]; tDogru = tEleme + n * Z["elemeHer"]
tKural = tDogru + Z["dogru"]; tSon = tKural + Z["kural"]; toplam = tSon + Z["son"]
s_ = lambda kare: kare / fps

props = {k: spec[k] for k in ("etiket", "soruNo", "soru", "ikon", "secenekler", "dogru", "eleme", "kural", "kuralOrnek")}
os.makedirs(IS, exist_ok=True)
json.dump(props, open(f"{IS}/props.json", "w", encoding="utf-8"), ensure_ascii=False)
json.dump(dict(props, kapak=kp), open(f"{IS}/kapak.json", "w", encoding="utf-8"), ensure_ascii=False)
open(f"{IS}/kapak_kare", "w").write(str(tDogru + 30))    # elemeler + daire + dolu optik form: konunun en dolu karesi

# ---- ses bandı: kısık müzik + tik tak + efektler (hepsi kodla üretilir, telifsiz) ----
SR = 48000; DUR = s_(toplam); N = int(DUR * SR)
rng = np.random.default_rng(7)
tt = lambda d: np.arange(int(d * SR)) / SR
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
lp = lambda x, f: sosfilt(butter(2, f, "low", fs=SR, output="sos"), x)
hp = lambda x, f: sosfilt(butter(2, f, "high", fs=SR, output="sos"), x)
bp = lambda x, a, b: sosfilt(butter(2, [a, b], "band", fs=SR, output="sos"), x)
music, sfx = np.zeros(N), np.zeros(N)
def put(buf, x, at, g=1.0):
    i = int(at * SR); j = min(N, i + len(x))
    if 0 <= i < N: buf[i:j] += x[: j - i] * g

# müzik: sakin marimba + yumuşak pad (85 BPM); geri sayımda geri çekilir ki tik tak öne çıksın
bpm = 85; beat = 60 / bpm
prog = [[45, 57, 60, 64], [41, 57, 60, 65], [48, 55, 60, 64], [43, 55, 59, 62]]   # Am F C G
for kb in range(int(DUR / beat) + 1):
    ch = prog[(kb // 4) % 4]; t = tt(1.2); at = kb * beat
    if kb % 4 == 0:
        T = tt(beat * 4 + .6); env = np.minimum(1, T / .6) * np.minimum(1, (beat * 4 + .6 - T) / .6)
        put(music, lp(sum(np.sin(2 * np.pi * hz(m) * (1 + dd) * T) for m in ch[1:] for dd in (-.002, .002)), 1500) * env * .045, at)
        put(music, np.sin(2 * np.pi * hz(ch[0]) * tt(1.6)) * np.exp(-tt(1.6) * 2.5) * .12, at)
    m = ch[1 + [0, 2, 1, 2][kb % 4]] + 12
    put(music, (np.sin(2 * np.pi * hz(m) * t) + .25 * np.sin(2 * np.pi * hz(m) * 3.9 * t) * np.exp(-t * 20)) * np.exp(-t * 6) * .07, at)
geri = np.ones(N)
a, b = int(s_(tSure) * SR), int(s_(tEleme) * SR); r = int(.4 * SR)
geri[a:b] = .35; geri[max(0, a - r):a] = np.linspace(1, .35, min(r, a)); geri[b:b + r] = np.linspace(.35, 1, r)
music *= geri

def tik(f, g):   # mekanik saat: kısa rezonanslı tık
    t = tt(.05); return bp(rng.standard_normal(len(t)), f * .7, f * 1.4) * np.exp(-t * 160) * g + np.sin(2 * np.pi * f * t) * np.exp(-t * 90) * g * .4
def bell(m, g, d=1.4):
    t = tt(d); f = hz(m); return (np.sin(2 * np.pi * f * t) + .45 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 4)) * np.exp(-t * 3.5) * g
def whoosh(d, g):
    t = tt(d); return bp(rng.standard_normal(len(t)), 400, 3000) * np.sin(np.pi * t / d) ** 2 * g
def kalem(d, g):  # kalem çiziği: kesik kesik bant gürültüsü
    t = tt(d); return bp(rng.standard_normal(len(t)), 1800, 6000) * (.5 + .5 * np.abs(np.sin(2 * np.pi * 11 * t))) * np.minimum(1, t / .02) * np.minimum(1, (d - t) / .05) * g
def pop(m, g):
    t = tt(.16); return np.sin(2 * np.pi * hz(m) * (1 + .7 * np.exp(-t * 40)) * t) * np.exp(-t * 26) * g

put(sfx, whoosh(.7, .35), 0.0)                                       # kâğıt masaya kayar
for i in range(5): put(sfx, pop(72 + 2 * i, .10), s_(12 + i * 4))     # şıklar
for k in range(int(Z["sure"] / fps * 2)):                            # tik tak: yarım saniyede bir; son 2 saniye daha belirgin
    at = s_(tSure) + k * .5; son = at >= s_(tEleme) - 2
    put(sfx, tik(2600 if k % 2 == 0 else 1700, .55 if son else .38), at)
put(sfx, bell(81, .35, 1.0), s_(tEleme))                              # süre bitti
for k in range(n):                                                    # her eleme: kalem çiziği + alçak "yanlış" tonu
    at = s_(tEleme + k * Z["elemeHer"])
    put(sfx, kalem(.35, .22), at); put(sfx, pop(55, .14), at + .02)
put(sfx, bell(84, .4), s_(tDogru)); put(sfx, bell(91, .3), s_(tDogru) + .12)   # doğru: iki nota yukarı
put(sfx, kalem(.45, .16), s_(tDogru + 15))                                       # optik form kurşun kalemle doldurulur
put(sfx, whoosh(.5, .25), s_(tKural) - .2); put(sfx, pop(79, .25), s_(tKural))
for m in (72, 76, 79, 84): put(sfx, bell(m, .16, 2.2), s_(tSon) + .05)          # kapanış akoru

fade = np.ones(N); fn = int(1.0 * SR); fade[-fn:] = np.linspace(1, 0, fn)
out = (music + sfx) * fade
out /= np.abs(out).max() / .89
sf.write(f"{IS}/mix.wav", np.stack([out, out], 1), SR, subtype="PCM_24")
print(f"sinav tamam: {DUR:.1f} sn, {n} eleme, kapak karesi {tDogru + 30}")
