"""Robot (sessiz film) miksi: Gemini 'Kore' anlatımı + sinema piyanosu (FreePats honky_tonk, CC0) + projektör uğultusu + efektler.
teslim.sh bunu lemo kökünden çağırır: <LIB>/.venv/bin/python <film>/mix.py <film> <cikti.wav>"""
import json, os, sys, wave
import numpy as np
sys.path.insert(0, os.getcwd())
from core.audio import sampler as S
from core.audio import sfx as F

FILM, OUTW = sys.argv[1].rstrip("/"), sys.argv[2]
SR = 48000
Z = json.load(open(f"{FILM}/ses/zaman.json", encoding="utf-8"))
E = json.load(open(f"{FILM}/events.json")) if os.path.exists(f"{FILM}/events.json") else {"ev": []}
dur = float(E.get("dur") or Z["dur"])
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

# --- piano score by mood section (photoplay cue-sheet idea), original stride pattern ---
S.seed(7)
def t0(i): return L[i]["t0"] - .25 if i in L else 0
secs = [  # (start, chords as (bass, [chord]), tempo bpm, vel)
    (0, [("C3", ["E4", "G4", "C5"]), ("G2", ["D4", "F4", "B4"])], 112, .42),                 # comic
    (t0("s02"), [("A2", ["C4", "E4", "A4"]), ("E2", ["B3", "D4", "G#4"])], 92, .36),          # misterioso
    (t0("s05"), [("D3", ["F4", "A4", "D5"]), ("A2", ["C#4", "E4", "G4"])], 84, .36),          # weary
    (t0("s07"), [("F2", ["A3", "C4", "F4"]), ("C3", ["E4", "G4", "Bb4"])], 104, .4),         # theatre
    (t0("s09"), [("D2", ["D4", "F4", "Ab4"]), ("D2", ["D4", "F4", "B4"])], 150, .5),         # agitato
    (t0("s10"), [("Bb2", ["D4", "F4", "Bb4"]), ("F2", ["C4", "Eb4", "A4"])], 120, .42),      # march
    (t0("s13"), [("C3", ["E4", "G4", "C5"]), ("F2", ["A3", "C4", "F4"]), ("G2", ["B3", "D4", "F4"])], 100, .4),  # tender end
]
ev = []
for k, (st, chords, bpm, vel) in enumerate(secs):
    en = secs[k + 1][0] if k + 1 < len(secs) else dur - .6
    beat = 60 / bpm; t = st; n = 0
    while t < en - .05:
        bass, ch = chords[(n // 4) % len(chords)]
        if n % 2 == 0:
            ev.append((t, "honky_tonk", bass, beat * .9, vel, -.2))
        else:
            for p in ch: ev.append((t, "honky_tonk", p, beat * .7, vel * .8, .2))
        if n % 4 == 3 and k in (0, 5, 6):  # little melodic pickup
            ev.append((t + beat * .5, "honky_tonk", ch[-1], beat * .4, vel * .7, .3))
        t += beat; n += 1
# final rolled chord
ev += [(dur - 2.2 + i * .05, "honky_tonk", p, 2.0, .5, 0) for i, p in enumerate(["C3", "G3", "C4", "E4", "G4", "C5"])]
mus = S.render(ev, dur=N / SR, master=True).astype(np.float64)
mus = mus[:N] if len(mus) >= N else np.pad(mus, ((0, N - len(mus)), (0, 0)))
mus = F.compress(mus.mean(1), thr=.3, ratio=3)
mus = mus / (np.abs(mus).max() + 1e-9) * 10 ** (-17 / 20)
# ducking under the voice
zarf = np.convolve(np.abs(ses), np.ones(SR // 10) / (SR // 10), mode="same")
duk = np.clip(zarf / (zarf.max() + 1e-9) * 6, 0, 1)
mus *= 1 - 0.6 * np.convolve(duk, np.ones(SR // 5) / (SR // 5), mode="same")

# projector purr (claw + motor) — soft
rng = np.random.default_rng(3); tt = np.arange(N) / SR
pro = F.lp(rng.standard_normal(N), 900) * (0.5 + 0.5 * (np.sin(2 * np.pi * 24 * tt) > 0.6))
pro = pro / (np.abs(pro).max() + 1e-9) * 10 ** (-38 / 20)

efk = np.zeros(N)
def put(x, t, g):
    a = int(t * SR)
    if 0 <= a < N: efk[a:a + len(x)] += (x * g)[:N - a]
for e in E.get("ev", []):
    ty, t = e.get("type"), float(e["t"])
    x = {"whoosh": lambda: F.whoosh(.35), "ding": lambda: F.ding(), "thump": lambda: F.thump(), "click": lambda: F.click(), "pop": lambda: F.pop()}.get(ty)
    if x:
        y = np.asarray(x(), dtype=np.float64)
        put(y if y.ndim == 1 else y.mean(1), t, 10 ** (-20 / 20))

mix = ses * 0.92 + mus + pro + efk
mix = mix[:int(dur * SR)]
son = int((dur - 1.5) * SR); mix[son:] *= np.linspace(1, 0, len(mix) - son) ** .5
mix /= max(1.0, np.abs(mix).max() / 0.95)
st = (np.repeat(mix[:, None], 2, 1) * 32767).astype(np.int16)
with wave.open(OUTW, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(st.tobytes())
print(f"miks: {OUTW} {dur:.2f} sn")
