"""Satır sonu ses parazitini arar (18 Kasım 2026, Metin: "her cümlenin sonundaki o çirkin ses").
Gemini TTS bazı satırların sonuna ~160 ms, tam seviyede bir patlama ekliyor; ses.py artık onu susturuyor.
Bu betik filmde kullanılan satır seslerini (ses/zaman.json'daki id'ler) tek tek kontrol eder.
Kullanım: python3 sistem/lemo/ses_kontrol.py filmler/<klasör>
Çıktı: 'SES KONTROL: temiz' ya da 'SES PARAZITI: s04, s05 ...' (çıkış kodu 5) → Denetmen DUZELT verir
(düzeltme: Lemo render asama=hepsi; ses önbellekten gelir, kota harcamaz)."""
import json, sys, wave
import numpy as np


def _db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9) if len(x) else -200.0


def parazit_var(y, sr=24000):
    n = int(.01 * sr); L = len(y); bas = max(0, L - int(.6 * sr))
    env = np.array([_db(y[i:i + n]) for i in range(bas, L - n + 1, n)]); sess = env < -45; k = 0
    while k < len(env):
        if sess[k]:
            j = k
            while j < len(env) and sess[j]: j += 1
            if j - k >= 6 and j < len(env) and len(env) - j <= 25 and env[j:].max() > -30: return True
            k = j
        else: k += 1
    return False


f = sys.argv[1].rstrip("/")
ids = [l["id"] for l in json.load(open(f"{f}/ses/zaman.json", encoding="utf-8"))["satirlar"]]
kotu = []
for i in ids:
    with wave.open(f"{f}/ses/{i}.wav") as w:
        y = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    if parazit_var(y, w.getframerate()): kotu.append(i)
if kotu:
    print("SES PARAZITI: " + ", ".join(kotu)); sys.exit(5)
print(f"SES KONTROL: temiz ({len(ids)} satır)")
