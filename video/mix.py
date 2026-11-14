"""Telifsiz (kodla üretilmiş) hafif müzik + efektler + ses -> <is>/mix.wav
Kullanım: python mix.py <is_klasoru>"""
import json, sys
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt

IS = sys.argv[1]
TL = json.load(open(f"{IS}/veri.json", encoding="utf-8"))["veri"]["tl"]
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


music, sfx, voice, act = (np.zeros(N) for _ in range(4))
# ukulele benzeri akorlar + bas + shaker, C – Am – F – G, 104 bpm
beat = 60 / 104
chords = [[48, 60, 64, 67], [45, 57, 60, 64], [41, 57, 60, 65], [43, 55, 59, 62]]
for k in range(int(DUR / beat) + 1):
    ch = chords[(k // 4) % 4]; t = tt(0.6)
    if k % 4 in (0, 2):
        put(music, np.sin(2 * np.pi * hz(ch[0]) * t) * np.exp(-t * 5) * 0.18, k * beat)
    for j, m in enumerate(ch[1:]):
        x = (np.sin(2 * np.pi * hz(m) * t) + 0.4 * np.sin(4 * np.pi * hz(m) * t) + 0.15 * np.sin(6 * np.pi * hz(m) * t)) * np.exp(-t * 7)
        put(music, x * (0.06 if k % 2 else 0.08), k * beat + j * 0.012)
    if k % 2:
        put(music, bp(rng.standard_normal(len(tt(0.05))), 5000, 9000) * 0.03, k * beat)


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
for b in ("koken", "degisim", "ornek", "kapanis"):
    put(sfx, whoosh(0.8, 0.5), basla[b] - 0.6)
put(sfx, bell(84, 0.4), 0.2)
if len(L) > 1:
    put(sfx, pop(79, 0.4), L[1]["start"])
for l in L:
    if l["start"] not in basla.values():
        put(sfx, pop(76, 0.12), l["start"])
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
print("mix tamam", DUR)
