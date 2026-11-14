"""Spec'i doğrular, edge-tts ile sesleri üretir, zaman çizelgesini yazar.
Kullanım: python ses.py <spec.json> <is_klasoru>   ->  <is>/veri.json ({"veri": {spec, tl}}) + <is>/ses/*.wav
Biçimler: "bicim": "etym" (varsayılan, Kelimelerin Tarihçesi) ya da "dunya" (Dünya turu)."""
import json, os, re, subprocess, sys, time

spec_yol, IS = sys.argv[1], sys.argv[2]
spec = json.load(open(spec_yol, encoding="utf-8"))
BICIM = spec.get("bicim", "etym")
V = {"tr": "tr-TR-EmelNeural", "en": "en-US-AvaNeural", "us": "en-US-AvaNeural", "gb": "en-GB-SoniaNeural",
     "ja": "ja-JP-NanamiNeural", "zh": "zh-CN-XiaoxiaoNeural", "ar": "ar-AE-FatimaNeural", "fr": "fr-FR-DeniseNeural",
     "de": "de-DE-KatjaNeural", "es": "es-ES-ElviraNeural", "it": "it-IT-ElsaNeural", "ru": "ru-RU-SvetlanaNeural",
     "ko": "ko-KR-SunHiNeural", "pt": "pt-BR-FranciscaNeural", "el": "el-GR-AthinaNeural", "hi": "hi-IN-SwaraNeural",
     "nl": "nl-NL-ColetteNeural", "pl": "pl-PL-ZofiaNeural", "sv": "sv-SE-SofieNeural", "he": "he-IL-HilaNeural",
     "th": "th-TH-PremwadeeNeural", "fa": "fa-IR-DilaraNeural", "cs": "cs-CZ-VlastaNeural"}
BOLUMLER = {"etym": ["giris", "koken", "degisim", "ornek", "kapanis"], "dunya": ["giris", "tur", "ders", "kapanis"]}
SURE = {"etym": (28, 47), "dunya": (24, 50)}

# kataloglar video/src/kit.tsx'teki listelerden okunur (tek kaynak)
kit = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "src", "kit.tsx"), encoding="utf-8").read()
def katalog(ad):
    m = re.search(r"export const %s = \[(.*?)\] as const" % ad, kit, re.S)
    return set(re.findall(r'"([a-z_]+)"', m.group(1))) if m else set()
ZEMIN, KOSTUM, IKON = katalog("ZEMINLER"), katalog("KOSTUMLER"), katalog("IKONLAR")
TEMA = set(re.findall(r"^  ([a-z]+): \{ vurgu", kit, re.M))
OLAY = {"yagmur", "dusunce", "damga", "ziplat", "kayan", "sayac", "parilti", "bol", "iplik", "sars", "perde"}
YAZI_TIPI = {"jp", "sc", "ar", "kr", "hi", "he", "th", "noto"}

# ---- doğrulama: hatalar Actions günlüğünde "SPEC HATASI" diye görünür ----
hata = []
if BICIM not in BOLUMLER:
    sys.exit(f"SPEC HATASI:\n- bicim 'etym' ya da 'dunya' olmalı (yazılan: {BICIM})")
B = BOLUMLER[BICIM]
ses = spec.get("ses", [])
ids = [l.get("id") for l in ses]
if len(set(ids)) != len(ids):
    hata.append("ses: id'ler benzersiz olmalı")
for l in ses:
    if l.get("dil") not in V:
        hata.append(f"ses {l.get('id')}: dil {sorted(V)} içinden olmalı")
    if l.get("bolum") not in B:
        hata.append(f"ses {l.get('id')}: bolum {B} içinden olmalı")
    if not l.get("metin"):
        hata.append(f"ses {l.get('id')}: metin boş")
sira = [B.index(l["bolum"]) for l in ses if l.get("bolum") in B]
if sira != sorted(sira):
    hata.append("ses: bölümler " + " → ".join(B) + " sırasında olmalı")
for b in B:
    if b not in [l.get("bolum") for l in ses]:
        hata.append(f"ses: '{b}' bölümünde en az bir satır olmalı")


def cue(x, yer):
    if x and x not in ids:
        hata.append(f"{yer}: cue '{x}' ses listesinde yok")


def ad(x, kume, tur, yer):
    if x and x not in kume:
        hata.append(f"{yer}: '{x}' {tur} kataloğunda yok (geçerli: {', '.join(sorted(kume))})")


if spec.get("tema"):
    ad(spec["tema"], TEMA, "tema", "tema")

if BICIM == "etym":
    if not any(l.get("bolum") == "ornek" and l.get("dil") == "en" for l in ses):
        hata.append("ses: ornek bölümünde İngilizce örnek cümle satırı olmalı")
    if any(l.get("dil") not in ("tr", "en") for l in ses):
        hata.append("ses: bu biçimde dil yalnızca 'tr' ya da 'en'")
    k, d, o = spec.get("koken", {}), spec.get("degisim", {}), spec.get("ornek", {})
    g = spec.get("giris", {})
    if g.get("stil") and g["stil"] not in ("isik", "harfler", "parsomen"):
        hata.append("giris.stil: isik | harfler | parsomen")
    for i in g.get("ikonlar", []):
        ad(i, IKON, "ikon", "giris.ikonlar")
    ad(k.get("zemin"), ZEMIN, "zemin", "koken.zemin")
    if not k.get("zemin"):
        hata.append("koken.zemin zorunlu")
    for kk in ("karakter", "karakter2"):
        if k.get(kk):
            ad(k[kk].get("kostum"), KOSTUM, "kostüm", f"koken.{kk}")
            cue(k[kk].get("cue"), f"koken.{kk}")
    for p in k.get("parcalar", []):
        cue(p.get("cue"), "koken.parcalar")
    if k.get("not"):
        cue(k["not"].get("cue"), "koken.not")
    for x in k.get("dekor", []):
        ad(x.get("ikon"), IKON, "ikon", "koken.dekor")
    for yer, ol in (("koken", k.get("olaylar", [])), ("degisim", d.get("olaylar", []))):
        for e in ol:
            if e.get("tip") not in OLAY:
                hata.append(f"{yer}.olaylar: tip '{e.get('tip')}' yok (geçerli: {', '.join(sorted(OLAY))})")
            cue(e.get("cue"), f"{yer}.olaylar[{e.get('tip')}]")
            if not e.get("cue"):
                hata.append(f"{yer}.olaylar[{e.get('tip')}]: cue zorunlu")
            ad(e.get("ikon"), IKON, "ikon", f"{yer}.olaylar[{e.get('tip')}]")
            for it in e.get("ikonlar", []):
                if len(it) > 2:
                    ad(it.split(":")[0], IKON, "ikon", f"{yer}.olaylar[dusunce]")
            if e.get("tip") == "iplik" and k.get("zemin") != "labirent" and yer == "koken":
                hata.append("koken.olaylar[iplik]: yalnızca 'labirent' zemininde anlamlı")
    for s in d.get("duraklar", []):
        cue(s.get("cue"), "degisim.duraklar")
        ad(s.get("zemin"), ZEMIN, "zemin", "degisim.duraklar")
        ad(s.get("kostum"), KOSTUM, "kostüm", "degisim.duraklar")
        y = s.get("yer")
        if y and not (isinstance(y.get("lon"), (int, float)) and isinstance(y.get("lat"), (int, float)) and y.get("ad")):
            hata.append(f"degisim.duraklar[{s.get('kelime')}].yer: ad, lon, lat zorunlu")
    yerli = [s for s in d.get("duraklar", []) if s.get("yer")]
    if yerli and len(yerli) < 2:
        hata.append("degisim.duraklar: harita için en az 2 durakta 'yer' olmalı")
    for key in ("yeni_anlam", "eski_ikon", "karsilastirma"):
        if d.get(key):
            cue(d[key].get("cue"), f"degisim.{key}")
    if d.get("eski_ikon"):
        ad(d["eski_ikon"].get("ikon"), IKON, "ikon", "degisim.eski_ikon")
    for x in (d.get("karsilastirma") or {}).get("kartlar", []):
        cue(x.get("cue"), "degisim.karsilastirma.kartlar")
        ad(x.get("ikon"), IKON, "ikon", "degisim.karsilastirma.kartlar")
    if not d.get("duraklar"):
        hata.append("degisim.duraklar boş")
    if not o.get("en") or not o.get("tr"):
        hata.append("ornek.en ve ornek.tr zorunlu")
    ad(o.get("zemin"), ZEMIN, "zemin", "ornek.zemin")
    ad(o.get("ikon"), IKON, "ikon", "ornek.ikon")
    ad(o.get("kostum"), KOSTUM, "kostüm", "ornek.kostum")
else:
    sehirler = spec.get("sehirler", [])
    if len(sehirler) < 3:
        hata.append("sehirler: en az 3 şehir")
    sid = [c.get("id") for c in sehirler]
    for c in sehirler:
        for alan in ("id", "ad", "dil_adi", "yazi"):
            if not c.get(alan):
                hata.append(f"sehirler[{c.get('id')}]: '{alan}' zorunlu")
        if not (isinstance(c.get("lon"), (int, float)) and isinstance(c.get("lat"), (int, float))):
            hata.append(f"sehirler[{c.get('id')}]: lon ve lat sayı olmalı")
        if c.get("yazi_tipi") and c["yazi_tipi"] not in YAZI_TIPI:
            hata.append(f"sehirler[{c.get('id')}]: yazi_tipi {sorted(YAZI_TIPI)} içinden")
        n = [l for l in ses if l.get("sehir") == c.get("id")]
        if len(n) != 1:
            hata.append(f"sehirler[{c.get('id')}]: tam bir ses satırında 'sehir' olarak geçmeli ({len(n)} bulundu)")
    sira_ses = [l["sehir"] for l in ses if l.get("sehir")]
    if [x for x in sid if x in sira_ses] != sira_ses:
        hata.append("ses: şehir satırları 'sehirler' listesiyle aynı sırada olmalı")
    if not spec.get("baslik", {}).get("ust"):
        hata.append("baslik.ust zorunlu")
    ders = spec.get("ders", {})
    if not ders.get("satirlar"):
        hata.append("ders.satirlar boş")
    for r in ders.get("satirlar", []):
        cue(r.get("cue"), "ders.satirlar")
        if ders.get("saat") and not (isinstance(r.get("saat"), list) and len(r["saat"]) == 2):
            hata.append(f"ders.satirlar[{r.get('en')}]: saat: [başlangıç, bitiş] zorunlu (ders.saat açık)")
    if not spec.get("kapanis", {}).get("soru"):
        hata.append("kapanis.soru zorunlu")
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
        r = subprocess.run([sys.executable, "-m", "edge_tts", "--voice", V[l["dil"]], f"--rate={l.get('hiz', '-3%')}", "--text", l["metin"], "--write-media", mp3], capture_output=True)
        if r.returncode == 0 and os.path.exists(mp3) and os.path.getsize(mp3) > 1000:
            break
        time.sleep(3)
    else:
        sys.exit(f"edge-tts başarısız: {l['id']}")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", mp3, "-af",
                    "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,apad=pad_dur=0.04",
                    "-ar", "48000", "-ac", "1", wav], check=True)
    dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", wav]))
    satir = {"id": l["id"], "lang": l["dil"], "bolum": l["bolum"], "file": wav, "sub": l.get("altyazi", l["metin"]),
             "start": round(t, 3), "end": round(t + dur, 3)}
    if l.get("sehir"):
        satir["sehir"] = l["sehir"]
    out.append(satir)
    t += dur + l.get("ara", 0.3)
tl = {"fps": 30, "dur": round(t + 0.2, 2), "lines": out}
json.dump({"veri": {"spec": spec, "tl": tl}}, open(f"{IS}/veri.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("sure", tl["dur"])
for o in out:
    print(f"  {o['id']:6} {o['bolum']:8} {o['start']:6.2f}-{o['end']:6.2f}")
lo, hi = SURE[BICIM]
if not lo <= tl["dur"] <= hi:
    print(f"UYARI: süre {tl['dur']} sn (hedef {lo + 2}–{hi - 2}). Metni kısalt ya da uzat.")
