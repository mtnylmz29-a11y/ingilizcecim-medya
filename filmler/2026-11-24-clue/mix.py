"""Clue (pixel-rpg) miksi: Gemini 'Kore' anlatımı + özgün chiptune (pulse kurşun, üçgen bas, LFSR gürültü davulu, SNES tarzı eko) + efektler.
1590'lar bölümünde müzik boğuklaşır (azaltılmış palet = azaltılmış ses). teslim.sh: <LIB>/.venv/bin/python <film>/mix.py <film> <cikti.wav>"""
import json, os, sys, wave
import numpy as np
sys.path.insert(0, os.getcwd())
from core.audio import sfx as F

FILM, OUTW = sys.argv[1].rstrip("/"), sys.argv[2]
SR = 48000
Z = json.load(open(f"{FILM}/ses/zaman.json", encoding="utf-8"))
E = json.load(open(f"{FILM}/events.json")) if os.path.exists(f"{FILM}/events.json") else {"ev": []}
dur = max(float(E.get("dur") or 0), Z["dur"])
N = int(dur * SR) + SR
L = {l["id"]: l for l in Z["satirlar"]}


def oku(y):
    with wave.open(y) as w:
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
        sr = w.getframerate()
    return np.interp(np.arange(int(len(x) * SR / sr)) / SR, np.arange(len(x)) / sr, x)


ses = np.zeros(N)
for l in Z["satirlar"]:
    x = oku(f"{FILM}/ses/{l['id']}.wav"); a = int(l["t0"] * SR)
    ses[a:a + len(x)] += x[:N - a]

# ---------- chiptune ----------
def hz(m): return 440 * 2 ** ((m - 69) / 12)
def pulse(m, d, duty=.25, v=.5):
    t = np.arange(int(d * SR)) / SR; ph = (t * hz(m)) % 1
    y = np.where(ph < duty, 1.0, -1.0) * v
    e = np.minimum(1, np.arange(len(t)) / (SR * .004)) * np.exp(-t / max(.08, d * .9)); return y * e
def tri(m, d, v=.6):
    t = np.arange(int(d * SR)) / SR; ph = (t * hz(m)) % 1
    y = (np.round((1 - 4 * np.abs(ph - .5)) * 7) / 7) * v  # 4-bit steps
    e = np.minimum(1, np.arange(len(t)) / (SR * .003)) * np.minimum(1, (len(t) - np.arange(len(t))) / (SR * .01)); return y * e
def noise(d, v=.3, short=False):
    n = int(d * SR); reg = 1; out = np.zeros(n); step = 0; per = 24 if short else 60
    for i in range(0, n, per):
        b = (reg ^ (reg >> (6 if short else 1))) & 1; reg = (reg >> 1) | (b << 14); out[i:i + per] = 1 if reg & 1 else -1
    return out * v * np.exp(-np.arange(n) / SR / (d * .35))
def put(buf, x, t):
    a = int(t * SR)
    if 0 <= a < len(buf): buf[a:a + len(x)] += x[:len(buf) - a]

lead, bass, drum = np.zeros(N), np.zeros(N), np.zeros(N)
bpm = 112; beat = 60 / bpm
# sections: modern (C), myth (A minor-ish adventure), maze (D minor tense), 1590s (muffled F), end (C fanfare)
T = lambda i: L[i]["t0"] - .2
secs = [(0, 60, [0, 9, 5, 7]), (T("s03"), 57, [0, 8, 3, 7]), (T("s09"), 62, [0, 10, 8, 7]), (T("s10"), 65, [0, 9, 5, 7]), (T("s11"), 60, [0, 9, 5, 7]), (T("s14"), 60, [5, 7, 0, 0])]
rng = np.random.default_rng(24)
motif = [0, 4, 7, 9, 7, 4, 2, 4]   # original 8-step motif (scale degrees in semitones over the chord root)
for k, (st, key, prog) in enumerate(secs):
    en = secs[k + 1][0] if k + 1 < len(secs) else dur - .8
    t = st; n = 0
    while t < en - .05:
        bar = n // 8; root = key + prog[bar % 4]
        if n % 2 == 0: put(bass, tri(root - 24, beat * .9, .5), t)
        if n % 8 in (0, 3, 6): put(lead, pulse(root + motif[n % 8] + (12 if k == 5 else 0), beat * .45, .125 if k in (1, 2) else .25, .22), t)
        elif n % 4 == 1: put(lead, pulse(root + 12 + motif[(n + bar) % 8], beat * .3, .5, .12), t)
        put(drum, noise(.05 if n % 2 else .12, .14 if n % 4 else .22, short=n % 2 == 1), t)
        t += beat / 2; n += 1
# item-get fanfare punctuation on dings
for e in E.get("ev", []):
    if e.get("type") == "ding":
        for i, m in enumerate([72, 76, 79, 84]): put(lead, pulse(m, .12, .25, .18), float(e["t"]) + i * .07)
mus = lead + bass + drum
# SNES-style echo: taps 0.19/0.31 s, feedback 0.4, low-passed loop
ec = np.zeros_like(mus)
for d, g in ((.19, .35), (.31, .25)):
    s = int(d * SR); ec[s:] += mus[:-s] * g
ec = F.lp(ec, 3500); mus = mus + ec
# 1590s section muffled
a, b = int(T("s10") * SR), int(T("s11") * SR); mus[a:b] = F.lp(mus[a:b], 1200) * 1.3
mus = F.compress(mus, thr=.3, ratio=3)
mus = mus / (np.abs(mus).max() + 1e-9) * 10 ** (-19 / 20)
zarf = np.convolve(np.abs(ses), np.ones(SR // 10) / (SR // 10), mode="same")
duk = np.clip(zarf / (zarf.max() + 1e-9) * 6, 0, 1)
mus *= 1 - 0.6 * np.convolve(duk, np.ones(SR // 5) / (SR // 5), mode="same")

efk = np.zeros(N)
for e in E.get("ev", []):
    ty, t = e.get("type"), float(e["t"])
    f = {"whoosh": lambda: F.whoosh(.3), "ding": lambda: F.ding(), "thump": lambda: F.thump(), "click": lambda: F.click(), "pop": lambda: F.pop()}.get(ty)
    if f:
        y = np.asarray(f(), dtype=np.float64); y = y if y.ndim == 1 else y.mean(1)
        y = np.round(y * 16) / 16  # bit-crushed foley
        put(efk, y * 10 ** (-22 / 20), t)

mix = ses * 0.92 + mus + efk
mix = mix[:int(dur * SR)]
son = int((dur - 1.5) * SR); mix[son:] *= np.linspace(1, 0, len(mix) - son) ** .5
mix /= max(1.0, np.abs(mix).max() / 0.95)
st = (np.repeat(mix[:, None], 2, 1) * 32767).astype(np.int16)
with wave.open(OUTW, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(st.tobytes())
print(f"miks: {OUTW} {dur:.2f} sn")
