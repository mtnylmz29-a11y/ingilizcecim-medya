"""Spec'i doğrular, edge-tts ile sesleri üretir, zaman çizelgesini yazar.
Kullanım: python ses.py <spec.json> <is_klasoru>   ->  <is>/veri.json ({"veri": {spec, tl}}) + <is>/ses/*.wav"""
import json, os, subprocess, sys, time

spec_yol, IS = sys.argv[1], sys.argv[2]
spec = json.load(open(spec_yol, encoding="utf-8"))
V = {"tr": "tr-TR-EmelNeural", "en": "en-US-AvaNeural"}
BOLUMLER = ["giris", "koken", "degisim", "ornek", "kapanis"]

# ---- doğrulama: hatalar Actions günlüğünde "SPEC HATASI" diye görünür ----
hata = []
ses = spec.get("ses", [])
ids = [l.get("id") for l in ses]
if len(set(ids)) != len(ids):
    hata.append("ses: id'ler benzersiz olmalı")
for l in ses:
    if l.get("dil") not in V:
        hata.append(f"ses {l.get('id')}: dil 'tr' ya da 'en' olmalı")
    if l.get("bolum") not in BOLUMLER:
        hata.append(f"ses {l.get('id')}: bolum {BOLUMLER} içinden olmalı")
    if not l.get("metin"):
        hata.append(f"ses {l.get('id')}: metin boş")
sira = [BOLUMLER.index(l["bolum"]) for l in ses if l.get("bolum") in BOLUMLER]
if sira != sorted(sira):
    hata.append("ses: bölümler giris → koken → degisim → ornek → kapanis sırasında olmalı")
for b in BOLUMLER:
    if b not in [l.get("bolum") for l in ses]:
        hata.append(f"ses: '{b}' bölümünde en az bir satır olmalı")
if not any(l.get("bolum") == "ornek" and l.get("dil") == "en" for l in ses):
    hata.append("ses: ornek bölümünde İngilizce örnek cümle satırı olmalı")


def cue(x, yer):
    if x and x not in ids:
        hata.append(f"{yer}: cue '{x}' ses listesinde yok")


k = spec.get("koken", {})
d = spec.get("degisim", {})
for p in k.get("parcalar", []):
    cue(p.get("cue"), "koken.parcalar")
if k.get("not"):
    cue(k["not"].get("cue"), "koken.not")
for o in k.get("olaylar", []):
    cue(o.get("cue"), f"koken.olaylar[{o.get('tip')}]")
for s in d.get("duraklar", []):
    cue(s.get("cue"), "degisim.duraklar")
for key in ("yeni_anlam", "eski_ikon", "karsilastirma"):
    if d.get(key):
        cue(d[key].get("cue"), f"degisim.{key}")
for x in (d.get("karsilastirma") or {}).get("kartlar", []):
    cue(x.get("cue"), "degisim.karsilastirma.kartlar")
if not d.get("duraklar"):
    hata.append("degisim.duraklar boş")
if not spec.get("ornek", {}).get("en") or not spec.get("ornek", {}).get("tr"):
    hata.append("ornek.en ve ornek.tr zorunlu")
if hata:
    print("SPEC HATASI:\n- " + "\n- ".join(hata))
    sys.exit(2)

# ---- ses ----
os.makedirs(f"{IS}/ses", exist_ok=True)
t, out = 0.3, []
for i, l in enumerate(ses):
    mp3 = f"{IS}/ses/{i:02d}_{l['id']}.mp3"
    wav = mp3[:-4] + ".wav"
    for _ in range(5):  # edge-tts bazen ses döndürmez; tekrar dene
        r = subprocess.run([sys.executable, "-m", "edge_tts", "--voice", V[l["dil"]], "--rate=-3%", "--text", l["metin"], "--write-media", mp3], capture_output=True)
        if r.returncode == 0 and os.path.exists(mp3) and os.path.getsize(mp3) > 1000:
            break
        time.sleep(3)
    else:
        sys.exit(f"edge-tts başarısız: {l['id']}")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", mp3, "-af",
                    "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,apad=pad_dur=0.04",
                    "-ar", "48000", "-ac", "1", wav], check=True)
    dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", wav]))
    out.append({"id": l["id"], "lang": l["dil"], "bolum": l["bolum"], "file": wav, "sub": l.get("altyazi", l["metin"]),
                "start": round(t, 3), "end": round(t + dur, 3)})
    t += dur + l.get("ara", 0.3)
tl = {"fps": 30, "dur": round(t + 0.2, 2), "lines": out}
json.dump({"veri": {"spec": spec, "tl": tl}}, open(f"{IS}/veri.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("sure", tl["dur"])
for o in out:
    print(f"  {o['id']:6} {o['bolum']:8} {o['start']:6.2f}-{o['end']:6.2f}")
if not 28 <= tl["dur"] <= 47:
    print(f"UYARI: süre {tl['dur']} sn (hedef 30–45). Metni kısalt ya da uzat.")
