"""Canlı Sözlük miksi: anlatım (ses/zaman.json) + sentez müzik (örnek ses yok, indirme yok) + sayfanın EV efektleri.
Kullanım: python muzik.py <film> <cikti.wav>   (filmin mix.py'si bunu çağırır; teslim.sh mix.py'yi çalıştırır)
Müzik seçimi sozluk.json "muzik": "gece" (müzik kutusu + arp, re minör) | "col" (ud + darbuka, re hicaz) | "bando" (çizgi film: tuba, banço, ksilofon)
  + isteğe bağlı "enstruman": "mandolin" | "ud" | "yok" (kelimenin kültürü). Varsayılan: işık-kutusu → gece, cizgi-film → bando.
Anlatım varken müzik ≈ 8 dB kısılır; çizgi filmde EV "durak" olayları bandoyu susturur (seyirciye bakış)."""
import json, os, sys, wave
import numpy as np
from scipy.signal import butter, sosfilt
SR = 48000
rng = np.random.default_rng(5)
NOTE = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}


def hz(n):
    s = 1 if '#' in n else -1 if 'b' in n[1:] else 0
    return 440 * 2 ** ((12 * (int(n[-1]) + 1) + NOTE[n[0]] + s - 69) / 12)
def tt(d): return np.arange(int(d * SR)) / SR
def lp(x, f): return sosfilt(butter(2, f, 'low', fs=SR, output='sos'), x)
def hp(x, f): return sosfilt(butter(2, f, 'high', fs=SR, output='sos'), x)
def bp(x, a, b): return sosfilt(butter(2, [a, b], 'band', fs=SR, output='sos'), x)
def nz(d): return rng.standard_normal(int(d * SR))


# —— çalgılar ——
def ks(f, d, bright=.6, decay=.997):   # Karplus-Strong tel, bir periyot birden
    N = max(2, int(SR / f)); buf = lp(rng.uniform(-1, 1, N * 4), 1000 + 9000 * bright)[-N:]; out = []
    for _ in range(int(d * SR) // N + 1): out.append(buf); buf = decay * .5 * (buf + np.roll(buf, -1))
    y = np.concatenate(out)[:int(d * SR)]; return y / (np.abs(y).max() + 1e-9)
def modal(f, d, parts):
    x = tt(d); return sum(a * np.sin(2 * np.pi * f * p * x) * np.exp(-x / tau) for p, a, tau in parts) * (1 - np.exp(-x * 1500))
def musicbox(f, d=1.6): return modal(f, d, [(1, 1, .9), (2.756, .35, .25), (5.404, .12, .09)])
def xylo(f, d=.7): return modal(f, d, [(1, 1, .22), (3.93, .5, .06), (9.5, .2, .02)])
def tuba(f, d=.35): x = tt(d); return lp(2 * ((x * f) % 1) - 1, 500) * np.minimum(1, x * 60) * np.exp(-x / .25)
def brass(fs, d=1.4):
    x = tt(d); y = sum(lp(2 * ((x * f * (1 + .004 * np.sin(2 * np.pi * 5.5 * x))) % 1) - 1, 1800) for f in fs)
    return y * np.minimum(1, x * 30) * np.minimum(1, (d - x) * 4)
def clarinet(f, d):
    x = tt(d); return lp(np.sign(np.sin(2 * np.pi * f * x * (1 + .006 * np.sin(2 * np.pi * 5 * x)))), 1600) * np.minimum(1, x * 25) * np.minimum(1, (d - x) * 12)
# —— efektler ——
def click(): return bp(nz(.05), 2000, 6000) * np.exp(-tt(.05) / .006)
def shimmer(d=1.4, up=True):
    x = tt(d); y = sum(np.sin(2 * np.pi * f * (1 + (.25 if up else -.2) * x / d) * x) * np.exp(-((x - d * i / 6) ** 2) / .02) for i, f in enumerate([1320, 1760, 1980, 2640, 2960, 3520]))
    return y * .3 * np.minimum(1, (d - x) * 3)
def lamp(): s = np.pad(shimmer(), (int(.05 * SR), 0)); s[:len(click())] += click(); return s
def paper(d=.32): x = tt(d); return bp(nz(d), 1500, 7000) * np.sin(np.pi * x / d) ** 2 * .5
def thump(f=60, d=.5): x = tt(d); return np.sin(2 * np.pi * f * x * (1 + 1.5 * np.exp(-x / .02))) * np.exp(-x / .12)
def stamp(): return thump(70) + .6 * np.pad(bp(nz(.08), 300, 2500) * np.exp(-tt(.08) / .015), (0, int(.42 * SR)))
def ding(f=2400): x = tt(.8); return np.sin(2 * np.pi * f * x) * np.exp(-x / .25) * .3
def whistle(f0, f1, d):
    x = tt(d); f = f0 * (f1 / f0) ** (x / d) * (1 + .02 * np.sin(2 * np.pi * 7 * x)); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.minimum(1, x * 40) * np.minimum(1, (d - x) * 20)
def woodblock(f=1100): x = tt(.12); return np.sin(2 * np.pi * f * x) * np.exp(-x / .02)
def boing(): x = tt(.6); return np.sin(2 * np.pi * np.cumsum(160 + 90 * np.sin(2 * np.pi * 14 * x) * np.exp(-x / .2)) / SR) * np.exp(-x / .25)
def whoosh(d=.6): x = tt(d); return bp(nz(d), 300, 3000) * np.sin(np.pi * x / d) ** 2 * .6
def gurgle(d=1.0):
    y = np.zeros(int(d * SR))
    for a, f in zip(np.sort(rng.uniform(0, d - .1, 14)), rng.uniform(300, 900, 14)): add1(y, whistle(f, f * 1.8, .06) * .5, a)
    return y
def seq(parts):   # [(ses, saniye)] → tek dizi (farklı uzunluklar güvenle toplanır)
    y = np.zeros(max(int(a * SR) + len(x) for x, a in parts))
    for x, a in parts: add1(y, x, a)
    return y
def add1(buf, x, at, g=1.0):
    i = int(max(0, at) * SR); n = min(len(x), len(buf) - i)
    if n > 0: buf[i:i + n] += x[:n] * g


FX = {   # EV adı → (ses, kazanç). Işık kutusu: lamba serit pencere sahne muhur son · çizgi film: aşağıdakiler
    'lamba': (lamp, .45), 'serit': (paper, .3), 'pencere': (lambda: ding(2600 + rng.uniform(-300, 300)), .25), 'sahne': (lambda: shimmer(1.0, False), .3),
    'muhur': (stamp, .8), 'son': (lambda: shimmer(1.4, False), .3),
    'iris': (lambda: seq([(xylo(hz(n)), i * .05) for i, n in enumerate(['C5', 'E5', 'G5', 'C6', 'E6', 'G6'])]), .3),
    'pop': (boing, .4), 'uzan': (lambda: whistle(400, 1500, .9), .25), 'kac': (lambda: whistle(500, 2600, .18) + paper(.18), .45), 'tak': (woodblock, .35),
    'carp': (lambda: thump(120, .2), .45), 'egil': (lambda: whistle(1200, 500, .7), .22), 'gurul': (gurgle, .35), 'kayma': (lambda: paper(.4), .5),
    'yaylan': (boing, .3), 'whoosh': (whoosh, .4), 'irisout': (lambda: np.pad(brass([hz('C4'), hz('E4'), hz('G4'), hz('C5')], 1.3), (int(.5 * SR), 0)), .18),
    'bakis': (lambda: seq([(woodblock(1300), i * .25) for i in range(3)]), .35),
    'huzun': (lambda: np.concatenate([clarinet(hz(n), .45 if i < 3 else 1.1) for i, n in enumerate(['Bb3', 'A3', 'Ab3', 'G3'])]), .16),
}


class Mix:
    def __init__(s, dur): s.L = np.zeros(int(dur * SR) + SR); s.R = np.zeros_like(s.L)
    def add(s, x, at, g=1.0, pan=0.0):
        a = np.cos((pan + 1) * np.pi / 4) * g * 1.414, np.sin((pan + 1) * np.pi / 4) * g * 1.414
        add1(s.L, x, at, a[0]); add1(s.R, x, at, a[1])


def gece(m, dur, ens):   # re minör: müzik kutusu ezgisi + arp akorları (+ mandolin tremolo)
    b = 60 / 72; mel = ['D5', 'F5', 'A5', 'G5', 'F5', 'E5', 'D5', 'A4', 'Bb4', 'D5', 'F5', 'E5', 'C5', 'D5', 'E5', 'F5', 'A5', 'G5', 'F5', 'E5', 'D5', 'A4', 'D5', 'D5']
    ch = [['D3', 'A3', 'F4'], ['Bb2', 'F3', 'D4'], ['C3', 'G3', 'E4'], ['A2', 'E3', 'C#4']]
    n = int((dur - 3) / b)
    for i in range(n): m.add(musicbox(hz(mel[i % len(mel)])), 1.2 + i * b, .32 if (i // 24) % 2 == 0 else .22, .2)
    for i in range(n // 4 + 1):
        for j, nn in enumerate(ch[i % 4] + ch[i % 4][1:2]): m.add(ks(hz(nn), b * 2, .4, .996), 1.2 + i * b * 4 + j * b, .22, -.25)
    if ens == 'mandolin':
        for i in range(int((dur - 8) / (b * 8))):
            for k, nn in enumerate(['A4', 'A4', 'Bb4', 'A4']):
                for r in range(int(b * 14)): m.add(ks(hz(nn), .12, .8, .99) * np.exp(-tt(.12) / .05), 6 + i * b * 8 + k * b + r / 14, .08, .3)
    m.add(musicbox(hz('D4'), 3) + musicbox(hz('A4'), 3) + musicbox(hz('D5'), 3), dur - 2.6, .3)
    x = tt(dur); bed = lp(np.cumsum(nz(dur)), 380); m.add(bed / np.abs(bed).max() * (.6 + .4 * np.sin(2 * np.pi * .25 * x)), 0, .06)


def col(m, dur, ens):   # re hicaz: ud ezgisi + darbuka (düm . tek tek) + müzik kutusu cevapları
    b = 60 / 80; oud = lambda f, d: ks(f, d, .35, .995)
    phr = ['D4', 'Eb4', 'F#4', 'G4', 'A4', 'G4', 'F#4', 'Eb4', 'D4', 'D4', 'A4', 'Bb4', 'A4', 'G4', 'F#4', 'G4', 'F#4', 'Eb4', 'D4', 'C4', 'D4', 'D4']
    n = int((dur - 3) / b)
    for i in range(n): m.add((oud if ens != 'yok' else (lambda f, d: musicbox(f * 2, d)))(hz(phr[i % len(phr)]), 1.2), 1.0 + i * b, .28, -.15)
    for i, nn in enumerate((['A5', 'G5', 'F#5', 'D5', 'A5', 'Bb5', 'A5', 'D5'] * 8)[:int((dur - 4) / (b * 2))]): m.add(musicbox(hz(nn)), 3.0 + i * b * 2, .18, .3)
    for bar in range(int((dur - 2) / (b * 4))):
        t0 = 1.0 + bar * b * 4; m.add(thump(90, .4), t0, .32); m.add(thump(90, .4), t0 + b * 2.5, .22)
        for k in (1, 1.5, 3, 3.5): m.add(woodblock(2600) * .5 + bp(nz(.12), 3000, 9000) * np.exp(-tt(.12) / .01), t0 + k * b, .1, .2)
    m.add(oud(hz('D3'), 3) + oud(hz('A3'), 3), dur - 2.8, .35)
    x = tt(dur); w = bp(nz(dur), 250, 1400) * (.5 + .5 * np.sin(2 * np.pi * .13 * x) ** 2); m.add(w / np.abs(w).max(), 0, .05)


def bando(m, dur, ens, duraklar):   # 120 bpm oom-pah: tuba 1&3, banço 2&4, ksilofon ezgisi; "durak" pencerelerinde susar
    b = .5; roots = ['C3', 'G2', 'C3', 'G2', 'F2', 'C3', 'G2', 'C3']
    chords = {'C3': ['E4', 'G4', 'C5'], 'G2': ['D4', 'G4', 'B4'], 'F2': ['F4', 'A4', 'C5']}
    tune = ['E5', 'G5', 'C6', 'G5', 'A5', 'G5', 'E5', 'D5', 'E5', 'F5', 'D5', 'B4', 'C5', 'E5', 'G5', 'E5']
    for bar in range(int((dur - 1.5) / (b * 4))):
        t0 = .9 + bar * b * 4; r = roots[bar % 8]
        if any(a - b * 4 < t0 < z for a, z in duraklar): continue
        for k in (0, 2): m.add(tuba(hz(r) * (1 if k == 0 else 1.5)), t0 + k * b, .5)
        for k in (1, 3):
            for j, n in enumerate(chords[r]): m.add(ks(hz(n), .3, .9, .985), t0 + k * b + j * .012, .11, .3)
        for k in range(4): m.add(xylo(hz(tune[(bar * 4 + k) % 16])), t0 + k * b, .26, -.2)


def oku(y):
    with wave.open(y) as w:
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768; sr = w.getframerate()
    return np.interp(np.arange(int(len(x) * SR / sr)) / SR, np.arange(len(x)) / sr, x)


if __name__ == '__main__':
    FILM, OUT = sys.argv[1].rstrip('/'), sys.argv[2]
    D = json.load(open(f'{FILM}/sozluk.json', encoding='utf-8'))
    Z = json.load(open(f'{FILM}/ses/zaman.json', encoding='utf-8'))
    E = json.load(open(f'{FILM}/events.json', encoding='utf-8')) if os.path.exists(f'{FILM}/events.json') else {'dur': Z['dur'] + 2.4, 'ev': []}
    dur = max(float(E.get('dur') or 0), Z['dur']); ev = E.get('ev', [])
    tur = D.get('muzik') or ('bando' if D.get('sablon') == 'cizgi-film' else 'gece'); ens = D.get('enstruman', 'mandolin' if tur == 'gece' else 'ud')
    mus, fx = Mix(dur), Mix(dur)
    if tur == 'bando':
        dur_ = [(e['t'], e['t'] + e.get('sure', 1.6)) for e in ev if e.get('k') == 'durak']; bando(mus, dur, ens, dur_)
    elif tur == 'col': col(mus, dur, ens)
    else: gece(mus, dur, ens)
    for e in ev:
        k = e.get('k') or e.get('type')
        if k in FX: f, g = FX[k]; fx.add(f(), e['t'], g, float(rng.uniform(-.3, .3)))
    voice = np.zeros_like(mus.L)
    for l in Z['satirlar']:
        p = f"{FILM}/ses/{l['id']}.wav"
        if os.path.exists(p): add1(voice, oku(p), l['t0'])
    env = np.convolve(np.abs(voice), np.ones(int(.15 * SR)) / int(.15 * SR), 'same'); duck = 1 - .6 * np.clip(env / (env.max() + 1e-9) * 6, 0, 1)   # anlatım varken müzik ≈ −8 dB
    mn = max(np.abs(mus.L).max(), np.abs(mus.R).max(), 1e-9)
    L = mus.L / mn * .3 * duck + fx.L * .5 + voice * .95; R = mus.R / mn * .3 * duck + fx.R * .5 + voice * .95
    y = np.stack([L, R], 1)[:int(dur * SR)]; y = y / max(np.abs(y).max(), 1e-9) * .89
    with wave.open(OUT, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((y * 32767).astype('<i2').tobytes())
    print('muzik:', tur, ens, f'{dur:.1f} sn ->', OUT)
