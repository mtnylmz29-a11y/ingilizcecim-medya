"""Bulut lemo filmi için seslendirme: Gemini TTS, ses 'Kore' (Metin, 15 Kasım 2026). Kota dolarsa sıradaki ücretsiz modele geçer.
Kullanım: python sistem/lemo/ses.py <film_klasoru>
Okur:  <film>/ses.json   {"satirlar": [{"id": "s01", "dil": "tr"|"en", "metin": "...", "okunus": "(isteğe bağlı, okunacak metin)"}],
                          "bas": 0.6, "ara": 0.35, "son": 2.8, "araliklar": {"s03": 0.9}}
Yazar: <film>/ses/<id>.wav (24 kHz mono) ve <film>/ses/zaman.json:
       {"dur": toplam_sn, "satirlar": [{"id","dil","metin","t0","t1","kelimeler":[{"w","t0","t1"}]}]}
       t0/t1 filmin zaman çizelgesindeki yerdir; sayfa ve miks bu dosyadan okur (tek kaynak).
Önbellek: hf/ses_cache/<md5(ses|dil|okunacak metin)>.wav — aynı satır asla iki kez üretilmez.
Hiçbir ses alınamazsa çıkış kodu 3 ve 'SES KOTASI' yazar; yedek/ticari olmayan sese geçilmez."""
import base64, hashlib, json, os, sys, time, urllib.request, wave
import numpy as np

FILM = sys.argv[1].rstrip("/")
S = json.load(open(f"{FILM}/ses.json", encoding="utf-8"))
SAT = S["satirlar"]
KEY = os.environ.get("GEMINI_API_KEY") or sys.exit("SES HATASI: GEMINI_API_KEY yok")
SES = S.get("gemini_ses", "Kore")
CD = os.environ.get("SES_CACHE", "hf/ses_cache"); os.makedirs(CD, exist_ok=True)
OUT = f"{FILM}/ses"; os.makedirs(OUT, exist_ok=True)
# 2.5 modeli üslup önekini okumaz, sesi ona göre ayarlar; yeni modeller öneki de seslendirir, o yüzden onlara düz metin gider
MODELLER = [("gemini-2.5-flash-preview-tts", True), ("gemini-3.8-flash-tts", False), ("gemini-3.1-flash-tts-preview", False)]
USLUP = {"tr": "Sıcak, net ve enerjik bir öğretmen sesiyle Türkçe söyle: ",
         "en": "Say in clear, natural American English, like a friendly teacher: "}
biten = set()


def pcm_wav(pcm, yol):
    with wave.open(yol, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(24000); w.writeframes(pcm)


def gemini(metin, dil):
    for model, onek in MODELLER:
        if model in biten:
            continue
        txt = (USLUP.get(dil, "") + metin) if onek else metin
        body = json.dumps({"contents": [{"parts": [{"text": txt}]}], "generationConfig": {"responseModalities": ["AUDIO"],
                           "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": SES}}}}}).encode()
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
        for deneme in range(4):
            try:
                r = urllib.request.Request(url, data=body, headers={"Content-Type": "application/json", "x-goog-api-key": KEY})
                d = json.loads(urllib.request.urlopen(r, timeout=180).read())
                time.sleep(21)  # ücretsiz katman: dakikada ~3 istek
                return base64.b64decode(d["candidates"][0]["content"]["parts"][0]["inlineData"]["data"]), model
            except Exception as ex:
                kod = getattr(ex, "code", 0); ayr = ""
                try: ayr = ex.read().decode()[:300]
                except Exception: pass
                print(f"  {model} hata {kod} {str(ex)[:80]} {ayr}", flush=True)
                if kod == 429 and ("PerDay" in ayr or "per_day" in ayr.lower() or deneme >= 1):
                    biten.add(model); break
                if kod in (400, 403, 404):
                    biten.add(model); break
                time.sleep(25 * (deneme + 1))
        else:
            biten.add(model)
    return None, None


# 1) sesler
for l in SAT:
    say = l.get("okunus") or l["metin"]
    h = hashlib.md5(f"{SES}|{l['dil']}|{say}".encode()).hexdigest()
    cp = f"{CD}/{h}.wav"
    if not os.path.exists(cp):
        print(f"ses {l['id']} ({l['dil']}): {say}", flush=True)
        pcm, model = gemini(say, l["dil"])
        if pcm is None:
            print(f"SES KOTASI: Gemini modellerinin günlük kotası doldu ({l['id']}). Hazır satırlar önbellekte; kota açılınca aynı komut kaldığı yerden devam eder.")
            sys.exit(3)
        pcm_wav(pcm, cp)
        if not dict(MODELLER)[model]:
            open(cp + ".kirp", "w").write(model)  # yeni modeller sona kısa parazit ekler: whisper ile kırpılır
    l["_cache"] = cp

# 2) kelime zamanları (faster-whisper) ve kırpma
from faster_whisper import WhisperModel
wm = WhisperModel(os.environ.get("WHISPER_MODEL", "small"), device="cpu", compute_type="int8")


def oku(yol):
    with wave.open(yol) as w:
        return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768


uyari = []
for l in SAT:
    x = oku(l["_cache"])
    segs, _ = wm.transcribe(x, language=l["dil"], word_timestamps=True, beam_size=5, vad_filter=False)
    kel = [{"w": w.word.strip(), "t0": round(w.start, 3), "t1": round(w.end, 3)} for s in segs for w in (s.words or [])]
    if not kel:
        uyari.append(f"{l['id']}: whisper hiç kelime duymadı")
        bas, son = 0.0, len(x) / 24000
    else:
        bas = max(0.0, kel[0]["t0"] - 0.08)
        son = min(len(x) / 24000, kel[-1]["t1"] + (0.22 if os.path.exists(l["_cache"] + ".kirp") else 0.35))
    y = x[int(bas * 24000):int(son * 24000)]
    n = min(len(y), 240); y[:n] *= np.linspace(0, 1, n); y[len(y) - n:] *= np.linspace(1, 0, n)
    l["_x"] = y
    l["kelimeler"] = [{"w": k["w"], "t0": round(k["t0"] - bas, 3), "t1": round(k["t1"] - bas, 3)} for k in kel]
    duyulan = " ".join(k["w"] for k in kel)
    l["duyulan"] = duyulan
    print(f"  {l['id']} {len(y)/24000:.2f} sn | duyulan: {duyulan}", flush=True)

# 3) zaman çizelgesi
t = float(S.get("bas", 0.6)); ara = float(S.get("ara", 0.35)); ozel = S.get("araliklar", {})
cikti = []
for i, l in enumerate(SAT):
    if i: t += float(ozel.get(l["id"], ara))
    d = len(l["_x"]) / 24000
    yol = f"{OUT}/{l['id']}.wav"
    pcm_wav((np.clip(l["_x"], -1, 1) * 32767).astype(np.int16).tobytes(), yol)
    cikti.append({"id": l["id"], "dil": l["dil"], "metin": l["metin"], "t0": round(t, 3), "t1": round(t + d, 3),
                  "kelimeler": [{"w": k["w"], "t0": round(t + k["t0"], 3), "t1": round(t + k["t1"], 3)} for k in l["kelimeler"]],
                  "duyulan": l["duyulan"]})
    t += d
dur = round(t + float(S.get("son", 2.8)), 3)
json.dump({"dur": dur, "satirlar": cikti, "uyarilar": uyari}, open(f"{OUT}/zaman.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"tamam: {len(SAT)} satır, film {dur} sn; uyarılar: {uyari or 'yok'}")
