"""Telifsiz (kodla üretilmiş) müzik + efektler + ses -> <is>/mix.wav
Kullanım: python mix.py <is_klasoru>
Spec'te "muzik": "neseli" (varsayılan) | "gizemli" | "macera" | "sakin"."""
import json, sys
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt

IS = sys.argv[1]
VERI = json.load(open(f"{IS}/veri.json", encoding="utf-8"))["veri"]
TL, SPEC = VERI["tl"], VERI["spec"]
SR = 48000
DUR = TL["dur"]
N = int(DUR * SR)
rng = np.random.default_rng(7)
tt = lambda d: np.arange(int(d * SR)) / SR
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
lp = lambda x, f: sosfilt(butter(2, f, "low", fs=SR, output="sos"), x)
bp = lambda x, a, b: sosfilt(butter(2, [a, b], "band", fs=SR, output="sos"), x)


def put(buf, x, at, g=1.0):
    i = int(at * SR); j = min(N, i + len(x))
    if 0 <= i < N:
        buf[i:j] += x[: j - i] * g


# her stil: bpm, akorlar (bas + 3 nota), tını, vuruş
STIL = {
    "neseli": (104, [[48, 60, 64, 67], [45, 57, 60, 64], [41, 57, 60, 65], [43, 55, 59, 62]], "uke", False),
    "gizemli": (84, [[45, 57, 60, 64], [41, 57, 60, 65], [48, 55, 60, 64], [40, 56, 59, 64]], "marimba", False),
    "macera": (120, [[50, 62, 66, 69], [47, 59, 62, 66], [43, 59, 62, 67], [45, 57, 61, 64]], "uke", True),
    "sakin": (92, [[50, 57, 62, 66], [45, 52, 61, 64], [47, 54, 62, 66], [43, 50, 59, 62]], "pad", False),
}
bpm, chords, tini, davul = STIL.get(SPEC.get("muzik", "neseli"), STIL["neseli"])
beat = 60 / bpm
music, sfx, voice, act = (np.zeros(N) for _ in range(4))
for k in range(int(DUR / beat) + 1):
    ch = chords[(k // 4) % 4]; t = tt(0.9)
    if k % 4 in (0, 2):
        put(music, np.sin(2 * np.pi * hz(ch[0]) * t) * np.exp(-t * 5) * 0.18, k * beat)
    if tini == "pad":
        if k % 4 == 0:
            T = tt(beat * 4 + 0.6); env = np.minimum(1, T / 0.5) * np.minimum(1, (beat * 4 + 0.6 - T) / 0.6)
            x = sum(np.sin(2 * np.pi * hz(m) * (1 + d) * T) for m in ch[1:] for d in (-0.002, 0.002))
            put(music, lp(x, 1800) * env * 0.05, k * beat)
        m = ch[1 + [0, 2, 1, 2][k % 4]] + 12; x = (np.sin(2 * np.pi * hz(m) * t) + 0.3 * np.sin(4 * np.pi * hz(m) * t)) * np.exp(-t * 9)
        put(music, x * 0.07, k * beat)
    elif tini == "marimba":
        m = ch[1 + k % 3] + (12 if k % 2 else 0)
        x = (np.sin(2 * np.pi * hz(m) * t) + 0.25 * np.sin(2 * np.pi * hz(m) * 3.9 * t) * np.exp(-t * 20)) * np.exp(-t * 6)
        put(music, x * 0.11, k * beat)
        if k % 2:
            put(music, np.sin(2 * np.pi * hz(ch[2] + 12) * t) * np.exp(-t * 6) * 0.05, k * beat + beat / 2)
    else:
        for j, m in enumerate(ch[1:]):
            x = (np.sin(2 * np.pi * hz(m) * t) + 0.4 * np.sin(4 * np.pi * hz(m) * t) + 0.15 * np.sin(6 * np.pi * hz(m) * t)) * np.exp(-t * 7)
            put(music, x * (0.06 if k % 2 else 0.08), k * beat + j * 0.012)
    if k % 2:
        put(music, bp(rng.standard_normal(len(tt(0.05))), 5000, 9000) * 0.03, k * beat)
    if davul and k % 2 == 0:
        T = tt(0.25); put(music, np.sin(2 * np.pi * (55 + 90 * np.exp(-T * 30)) * T) * np.exp(-T * 14) * 0.2, k * beat)


def bell(m, g):
    t = tt(1.4); f = hz(m)
    return (np.sin(2 * np.pi * f * t) + 0.45 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 4)) * np.exp(-t * 3.5) * g


def whoosh(d, g):
    t = tt(d)
    return bp(rng.standard_normal(len(t)), 400, 3000) * np.sin(np.pi * t / d) ** 2 * g


def pop(m, g):
    t = tt(0.16)
    return np.sin(2 * np.pi * hz(m) * (1 + 0.7 * np.exp(-t * 40)) * t) * np.exp(-t * 26) * g


L = TL["lines"]
basla = {}
for l in L:
    basla.setdefault(l["bolum"], l["start"])
ilk = L[0]["bolum"] if L else None
for b, at in basla.items():
    if b != ilk:
        put(sfx, whoosh(0.8, 0.5), at - 0.6)
put(sfx, bell(84, 0.4), 0.2)
if len(L) > 1:
    put(sfx, pop(79, 0.4), L[1]["start"])
olcek = [74, 76, 78, 79, 81, 83, 86, 88, 90, 91]  # şehirler: her durakta bir nota yükselen zil
sehirli = [l for l in L if l.get("sehir")]
for i, l in enumerate(sehirli):
    put(sfx, bell(olcek[min(i, len(olcek) - 1)], 0.42), l["start"] - 0.03)
for l in L:
    if l["start"] not in basla.values() and not l.get("sehir"):
        put(sfx, pop(76, 0.12), l["start"])
if "kapanis" in basla:
    put(sfx, bell(88, 0.35), basla["kapanis"] + 0.2)
for l in L:
    v, sr = sf.read(l["file"])
    assert sr == SR
    v = v if v.ndim == 1 else v.mean(1)
    put(voice, v, l["start"]); put(act, np.ones(len(v)), l["start"])
k = int(0.15 * SR)
duck = np.convolve(np.minimum(act, 1), np.ones(k) / k, "same")
music = lp(music, 6000) * (1 - 0.6 * duck)
fade = np.ones(N); fn = int(1.0 * SR); fade[-fn:] = np.linspace(1, 0, fn)
out = (music + sfx * 0.6 + voice) * fade
out /= np.abs(out).max() / 0.89
sf.write(f"{IS}/mix.wav", np.stack([out, out], 1), SR, subtype="PCM_24")
print("mix tamam", DUR, SPEC.get("muzik", "neseli"))
