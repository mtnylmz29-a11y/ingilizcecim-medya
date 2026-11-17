"""Standart miks: zaman.json'daki yerlerine sesler + isteğe bağlı yumuşak fon + sayfanın EV olaylarından küçük efektler.
Kullanım: python sistem/lemo/mix.py <film> <cikti.wav>
<film>/miks.json (isteğe bağlı): {"fon": "yumusak"|"yok", "fon_db": -26, "akorlar": [[57,60,64],[53,57,60],...], "efekt_db": -14}
<film>/events.json (events.mjs yazar, isteğe bağlı): {"dur", "ev": [{"t", "type": "pop|whoosh|ding|thump|click"}]}
Filmin kendi <film>/mix.py dosyası varsa teslim.sh onu kullanır; bu dosya varsayılandır."""
import json, os, sys, wave
import numpy as np

FILM, OUTW = sys.argv[1].rstrip("/"), sys.argv[2]
Z = json.load(open(f"{FILM}/ses/zaman.json", encoding="utf-8"))
M = json.load(open(f"{FILM}/miks.json")) if os.path.exists(f"{FILM}/miks.json") else {}
SR = 48000
if os.path.exists(f"{FILM}/events.json"):
    E = json.load(open(f"{FILM}/events.json"))
    dur = max(float(E.get("dur", 0)), Z["dur"])
else:
    E, dur = {"ev": []}, Z["dur"]
N = int(dur * SR) + SR
ses = np.zeros(N); fon = np.zeros(N); efk = np.zeros(N)


def oku(y):
    with wave.open(y) as w:
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
        sr = w.getframerate()
    return np.interp(np.arange(int(len(x) * SR / sr)) / SR, np.arange(len(x)) / sr, x)


for l in Z["satirlar"]:
    x = oku(f"{FILM}/ses/{l['id']}.wav"); a = int(l["t0"] * SR)
    ses[a:a + len(x)] += x[:N - a]

# fon: yumuşak pad (sinüs + ikinci harmonik, yavaş akor geçişleri)
if M.get("fon", "yumusak") != "yok":
    ak = M.get("akorlar", [[57, 60, 64], [53, 57, 60], [55, 59, 62], [52, 55, 60]])
    blok = 4.0; t = np.arange(N) / SR
    for i in range(int(dur / blok) + 2):
        a, b = int(i * blok * SR), int(min(N, (i + 1) * blok * SR + SR))
        if a >= N: break
        tt = t[a:b] - i * blok
        env = np.minimum(1, tt / 1.2) * np.minimum(1, np.maximum(0, (blok + 1 - tt) / 1.2))
        for m in ak[i % len(ak)]:
            f = 440 * 2 ** ((m - 69) / 12)
            fon[a:b] += env * (np.sin(2 * np.pi * f * tt) + 0.25 * np.sin(4 * np.pi * f * tt)) / 3
    fon *= 10 ** (M.get("fon_db", -26) / 20) / (np.abs(fon).max() + 1e-9)
    # konuşurken fonu kıs (ducking)
    zarf = np.convolve(np.abs(ses), np.ones(SR // 10) / (SR // 10), mode="same")
    duk = np.clip(zarf / (zarf.max() + 1e-9) * 6, 0, 1)
    fon *= 1 - 0.55 * np.convolve(duk, np.ones(SR // 5) / (SR // 5), mode="same")
    son = int((dur - 2.0) * SR); fon[son:] *= np.linspace(1, 0, N - son)


def efekt(tip):
    n = int(0.35 * SR); t = np.arange(n) / SR
    if tip == "whoosh":
        g = np.random.default_rng(1).standard_normal(n); g = np.convolve(g, np.ones(40) / 40, "same")
        return g * np.sin(np.pi * t / t[-1]) * 0.6
    if tip == "ding": return np.sin(2 * np.pi * 1320 * t) * np.exp(-t * 9)
    if tip == "thump": return np.sin(2 * np.pi * (90 - 40 * t) * t) * np.exp(-t * 14)
    if tip == "click": return np.sin(2 * np.pi * 2000 * t) * np.exp(-t * 120)
    return np.sin(2 * np.pi * (520 + 900 * t) * t) * np.exp(-t * 18)  # pop


g = 10 ** (M.get("efekt_db", -14) / 20)
for e in E.get("ev", []):
    if e.get("type") in ("pop", "whoosh", "ding", "thump", "click"):
        x = efekt(e["type"]) * g; a = int(float(e["t"]) * SR)
        if a < N: efk[a:a + len(x)] += x[:N - a]

mix = ses * 0.9 + fon + efk
mix = mix[:int(dur * SR)]
mix /= max(1.0, np.abs(mix).max() / 0.95)
st = (np.repeat(mix[:, None], 2, 1) * 32767).astype(np.int16)
with wave.open(OUTW, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(st.tobytes())
print(f"miks: {OUTW} {dur:.2f} sn")
