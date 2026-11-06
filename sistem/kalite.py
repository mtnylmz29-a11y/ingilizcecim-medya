#!/usr/bin/env python3
"""kalite.py — paylaşımdan önce ölçülebilir kalite kapısı (Editör'den ÖNCE çalışır).

  python3 kalite.py <gun_klasoru> [--kuyruk <yol|url>] [--gecmis <gunler_klasoru|raw_kok_url>] [--dilbilgisi]

<gun_klasoru> içinde content.json (anim: {"gonderi": {...}, "reels": {...}} ya da slayt: {"posts": [...]})
ve varsa gonderi.mp4 / reels.mp4 aranır. Açıklama metni content içinde (caption / aciklama) ya da
kuyruk.json'daki aynı günün kaydında bulunur.

Her kontrol GECTI / UYARI / KALDI verir. Yalnız KALDI yayını durdurur (çıkış kodu 1).
UYARI'lar Editör'e ve Metin'e önizlemede gösterilir; düzeltip düzeltmemek Editör'ün kararıdır.
Rapor: <gun_klasoru>/kalite.json  (Editör ve önizleme mesajı bu dosyayı okur)
"""
import argparse, datetime as dt, json, os, re, subprocess, sys, urllib.parse, urllib.request

# ---- eşikler (değişiklik İdareci önerisi + Metin onayıyla) -------------------------------------
ESIK = {
    "aciklama_max": 2200, "etiket_max": 15,
    "art_arda_harf_max": 3, "tek_harf_oran_uyari": 0.4,
    "bilgi_madde_max": 4, "bilgi_madde_karakter": 70, "slayt_max": 10,
    "anim_madde_max": 4, "anim_madde_karakter": 55,
    "donusum_satir_max": 3, "satir_karakter": 24, "not_karakter": 120,   # 1080 px'te satıra ~24 karakter sığar (5 Kas. karesi)
    "kapak_sure_uyari": 5,                  # kanca: kapak 5 sn'den uzunsa izleyici kaydırır
    "sure_oneri": (20, 45), "sure_max": 90,  # ICERIK_BICIMI: 25–35 sn önerilir
    "ilk_ses_sn": 1.5, "ses_tepe_dbfs": -1.0, "donma_sn": 6.0,
    "ikon_tekrar_gun": 7, "baslik_tekrar_gun": 14,
}
TR_HARF = re.compile(r"[çğıöşüÇĞİÖŞÜ]")
SONUC = []


def ekle(paylasim, kontrol, durum, ayrinti=""):
    SONUC.append({"paylasim": paylasim, "kontrol": kontrol, "durum": durum, "ayrinti": ayrinti})


def oku(kaynak):
    if not kaynak:
        return None
    try:
        if kaynak.startswith("http"):
            with urllib.request.urlopen(kaynak, timeout=20) as r:
                return json.loads(r.read().decode())
        with open(kaynak, encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return None


# ---- metin kontrolleri ---------------------------------------------------------------------------
def aciklama_kontrol(pid, metin, cevaplar=None):
    if not metin:
        ekle(pid, "açıklama", "UYARI", "açıklama metni bulunamadı (content ya da kuyruk)")
        return
    n = len(metin)
    ekle(pid, "açıklama uzunluğu", "KALDI" if n > ESIK["aciklama_max"] else "GECTI", f"{n}/{ESIK['aciklama_max']} karakter")
    et = re.findall(r"#\w+", metin)
    ekle(pid, "etiket sayısı", "KALDI" if len(et) > ESIK["etiket_max"] else "GECTI", f"{len(et)}/{ESIK['etiket_max']}")
    if len(set(e.lower() for e in et)) < len(et):
        ekle(pid, "tekrarlanan etiket", "UYARI", "aynı etiket iki kez var")
    ekle(pid, "ingilizcecim.com imzası", "GECTI" if "ingilizcecim.com" in metin else "KALDI")
    ekle(pid, "etkileşim sorusu", "GECTI" if "?" in metin else "UYARI", "" if "?" in metin else "açıklamada soru yok")
    if cevaplar:  # "örnek: 1A 2B" gibi bir örnek gerçek cevabı ele vermesin
        ele = [f"{i}{h}" for i, h in re.findall(r"\b([1-9])\s*[-.)]?\s*([A-E])\b", metin)
               if 0 < int(i) <= len(cevaplar) and cevaplar[int(i) - 1] == h]
        ekle(pid, "açıklama cevabı ele veriyor mu", "KALDI" if ele else "GECTI", ", ".join(ele))


def quiz_kontrol(pid, sorular, yds=True):
    harfler = []
    for i, s in enumerate(sorular, 1):
        o, a = s.get("o", []), s.get("a", "")
        beklenen = 5 if yds else len(o)
        if len(o) != beklenen:
            ekle(pid, f"soru {i} şık sayısı", "KALDI", f"{len(o)} şık; YDT/YDS 5 şık ister")
        if len(set(x.strip().lower() for x in o)) < len(o):
            ekle(pid, f"soru {i} aynı şık", "KALDI", "iki şık aynı")
        if a not in "ABCDE"[:len(o)] or not a:
            ekle(pid, f"soru {i} cevap harfi", "KALDI", f"'{a}' şıklarda yok")
        if not s.get("why"):
            ekle(pid, f"soru {i} açıklama", "UYARI", "why alanı boş")
        if s.get("q", "").count("___") != 1:
            ekle(pid, f"soru {i} boşluk", "UYARI", "soruda tam 1 boşluk (___) beklenir")
        harfler.append(a)
    en_uzun, seri = 1, 1
    for x, y in zip(harfler, harfler[1:]):
        seri = seri + 1 if x == y else 1
        en_uzun = max(en_uzun, seri)
    ekle(pid, "art arda aynı cevap harfi", "KALDI" if en_uzun > ESIK["art_arda_harf_max"] else "GECTI",
         f"en uzun seri {en_uzun} ({''.join(harfler)})")
    if len(harfler) >= 5:
        oran = max(harfler.count(h) for h in set(harfler)) / len(harfler)
        if oran > ESIK["tek_harf_oran_uyari"]:
            ekle(pid, "cevap harfi dağılımı", "UYARI", f"bir harf %{round(oran*100)}")
    return harfler


def havuz_kontrol(pid, obj):
    """Kelime havuzu soru/liste sırasını izlemesin (Metin'in kuralı)."""
    for k in ("pool", "havuz"):
        if isinstance(obj, dict) and isinstance(obj.get(k), list) and isinstance(obj.get("items"), list):
            havuz = [str(x).strip().lower() for x in obj[k]]
            hedef = [str(it.get("answer", it.get("cevap", it.get("word", "")))).strip().lower() for it in obj["items"]]
            hedef = [h for h in hedef if h]
            if hedef and havuz[:len(hedef)] == hedef and havuz != sorted(havuz):
                ekle(pid, "kelime havuzu sırası", "KALDI", "havuz soru sırasını izliyor; karıştır ya da alfabetik yap")
            else:
                ekle(pid, "kelime havuzu sırası", "GECTI")
    if isinstance(obj, dict):
        for v in obj.values():
            if isinstance(v, (dict, list)):
                havuz_kontrol(pid, v)
    elif isinstance(obj, list):
        for v in obj:
            havuz_kontrol(pid, v)


def bilgi_kontrol(pid, post):
    sl = post.get("slides", [])
    for i, s in enumerate(sl, 1):
        ln = s.get("lines", [])
        if len(ln) > ESIK["bilgi_madde_max"]:
            ekle(pid, f"slayt {i} madde sayısı", "KALDI", f"{len(ln)} > {ESIK['bilgi_madde_max']}")
        for m in ln:
            if len(m) > ESIK["bilgi_madde_karakter"]:
                ekle(pid, f"slayt {i} uzun madde", "UYARI", f"{len(m)} karakter: {m[:40]}…")
    toplam = 1 + len(sl) + (1 if post.get("ozet") else 0)
    ekle(pid, "toplam slayt", "KALDI" if toplam > ESIK["slayt_max"] else "GECTI", f"{toplam}/{ESIK['slayt_max']}")


def satir_tahmini(metin):
    """' | ' elle satır kırar; her parça ayrıca ~24 karakterde otomatik kırılır."""
    import textwrap
    return sum(max(1, len(textwrap.wrap(p.strip(), ESIK["satir_karakter"]))) for p in metin.split("|"))


def anim_kontrol(pid, spec):
    sah = spec.get("sahneler", [])
    if not sah:
        ekle(pid, "sahneler", "KALDI", "sahne yok")
        return
    sesli = bool(spec.get("ses"))
    if sah[0].get("tip") != "kapak":
        ekle(pid, "ilk sahne kapak", "UYARI", "ilk sahne kapak değil")
    elif sah[0].get("sure", 4) > ESIK["kapak_sure_uyari"]:
        ekle(pid, "kanca süresi", "UYARI", f"kapak {sah[0].get('sure')} sn; ≤{ESIK['kapak_sure_uyari']} sn önerilir")
    if sah[-1].get("tip") != "kapanis":
        ekle(pid, "son sahne kapanış", "UYARI", "kapanış sahnesi yok")
    for i, s in enumerate(sah, 1):
        t = s.get("tip")
        ad = f"sahne {i} ({t})"
        if sesli:
            okunan = []
            if t == "donusum":
                okunan = [s.get("once", ""), s.get("sonra", "")]
            elif t in ("kapak", "maddeler", "kapanis"):
                if not s.get("ses"):
                    ekle(pid, f"{ad} ses metni", "UYARI", "sesli videoda bu sahne sessiz kalır")
                okunan = [s.get("ses", "")]
            for o in okunan:
                if TR_HARF.search(o.replace("|", "")):
                    ekle(pid, f"{ad} okunan metin İngilizce mi", "KALDI", f"Kokoro Türkçe okuyamaz: {o[:50]}")
        if t == "donusum":
            if not s.get("once") or not s.get("sonra"):
                ekle(pid, f"{ad} once/sonra", "KALDI", "boş alan")
                continue
            for alan in ("once", "sonra"):
                n = satir_tahmini(s[alan])
                if n > ESIK["donusum_satir_max"]:
                    ekle(pid, f"{ad} {alan} satır", "KALDI", f"tahmini {n} satır > {ESIK['donusum_satir_max']}: {s[alan][:45]}…")
            sonra_k = re.findall(r"[\w']+", s["sonra"].lower())
            eksik = [v for v in s.get("vurgu", []) if v.lower() not in sonra_k]
            if eksik:
                ekle(pid, f"{ad} vurgu kelimesi", "KALDI", f"sonra cümlesinde yok: {eksik}")
            if s.get("sure") is not None and s["sure"] < 7:
                ekle(pid, f"{ad} süre", "UYARI", f"{s['sure']} sn; dönüşüm en az 7 sn")
            if len(s.get("not", "")) > ESIK["not_karakter"]:
                ekle(pid, f"{ad} not uzunluğu", "UYARI", f"{len(s['not'])} karakter")
            if s["once"].replace("|", "").split() == s["sonra"].replace("|", "").split():
                ekle(pid, f"{ad} dönüşüm", "KALDI", "once ve sonra aynı")
        elif t == "maddeler":
            sr = s.get("satirlar", [])
            if len(sr) > ESIK["anim_madde_max"]:
                ekle(pid, f"{ad} satır sayısı", "KALDI", f"{len(sr)} > {ESIK['anim_madde_max']}")
            uzun = [x for x in sr if len(x) > ESIK["anim_madde_karakter"]]
            if uzun:
                ekle(pid, f"{ad} satır uzunluğu", "UYARI", f"'{uzun[0]}' ({len(uzun[0])} kr.)")
    ekle(pid, "metin kontrolleri", "GECTI", f"{len(sah)} sahne tarandı")


# ---- çeşitlilik (geçmişe göre) --------------------------------------------------------------------
def gecmis_yukle(kaynak, gun, gun_sayisi):
    """Son günlerin content.json'larını getirir: {tarih: content}."""
    out = {}
    if not kaynak:
        return out
    g0 = dt.date.fromisoformat(gun)
    for k in range(1, gun_sayisi + 1):
        t = (g0 - dt.timedelta(days=k)).isoformat()
        yol = (kaynak.rstrip("/") + f"/{t}/content.json") if kaynak.startswith("http") else os.path.join(kaynak, t, "content.json")
        c = oku(yol)
        if c:
            out[t] = c
    return out


def paylasimlar(content):
    """content.json'dan [(pid, tür, spec)] çıkarır."""
    out = []
    for slot in ("gonderi", "reels"):
        if isinstance(content.get(slot), dict):
            out.append((slot, "anim", content[slot]))
    for p in content.get("posts", []) or []:
        out.append((p.get("id", "post"), "bilgi" if p.get("format") == "bilgi" else "quiz", p))
    return out


def ikonlar(spec):
    s = {spec.get("ikon")} | {x.get("ikon") for x in spec.get("sahneler", []) + spec.get("questions", []) + spec.get("slides", [])}
    return {x for x in s if x}


def baslik(spec):
    s = spec.get("title") or next((x.get("baslik") for x in spec.get("sahneler", []) if x.get("tip") == "kapak"), "")
    return (s or "").strip()


def cesitlilik_kontrol(gun, content, kuyruk, gecmis):
    bugun = paylasimlar(content)
    dun = (dt.date.fromisoformat(gun) - dt.timedelta(days=1)).isoformat()
    dun_palet = {pid: sp.get("palet") for pid, _, sp in paylasimlar(gecmis.get(dun, {}))}
    for k in kuyruk or []:
        if k.get("tarih") == dun and k.get("palet"):
            dun_palet.setdefault(k["id"].split("-")[-1], k["palet"])
    paletler = []
    for pid, _, sp in bugun:
        p = sp.get("palet")
        paletler.append(p)
        if not p:
            ekle(pid, "palet", "UYARI", "palet seçilmemiş")
        elif p in dun_palet.values():
            ekle(pid, "palet çeşitliliği", "KALDI", f"'{p}' dün de kullanıldı")
        else:
            ekle(pid, "palet çeşitliliği", "GECTI", p)
    if len(paletler) == 2 and paletler[0] and paletler[0] == paletler[1]:
        ekle("gün", "gönderi/Reels palet", "UYARI", "ikisi aynı palette")
    hafta = {}
    for t, c in gecmis.items():
        if (dt.date.fromisoformat(gun) - dt.date.fromisoformat(t)).days <= ESIK["ikon_tekrar_gun"]:
            for _, _, sp in paylasimlar(c):
                for i in ikonlar(sp):
                    hafta.setdefault(i, t)
    eski_basliklar = {baslik(sp).lower(): t for t, c in gecmis.items() for _, _, sp in paylasimlar(c)}
    eski_basliklar.update({(k.get("baslik") or "").lower(): k.get("tarih") for k in kuyruk or [] if k.get("tarih") != gun})
    for pid, _, sp in bugun:
        tekrar = sorted(i for i in ikonlar(sp) if i in hafta)
        ekle(pid, "ikon tekrarı (7 gün)", "UYARI" if tekrar else "GECTI", ", ".join(tekrar))
        b = baslik(sp).lower()
        ekle(pid, "konu tekrarı (14 gün)", "KALDI" if b and b in eski_basliklar else "GECTI",
             f"'{baslik(sp)}' {eski_basliklar.get(b)} tarihinde vardı" if b in eski_basliklar else "")


# ---- video kontrolleri ----------------------------------------------------------------------------
def ffmpeg_yolu():
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        return "ffmpeg"


def video_kontrol(pid, mp4, sesli):
    ff = ffmpeg_yolu()
    r = subprocess.run([ff, "-hide_banner", "-i", mp4,
                        "-vf", f"freezedetect=n=0.001:d={ESIK['donma_sn']},blackdetect=d=0.5:pix_th=0.08",
                        "-af", "astats=metadata=1:reset=0,silencedetect=n=-45dB:d=0.3",
                        "-f", "null", "-"], capture_output=True, text=True)
    e = r.stderr
    m = re.search(r"Duration: (\d+):(\d+):([\d.]+)", e)
    sure = int(m[1]) * 3600 + int(m[2]) * 60 + float(m[3]) if m else 0
    lo, hi = ESIK["sure_oneri"]
    ekle(pid, "video süresi", "KALDI" if sure > ESIK["sure_max"] or sure < 5 else ("UYARI" if not lo <= sure <= hi else "GECTI"),
         f"{sure:.1f} sn (öneri {lo}–{hi})")
    m = re.search(r"Video: .*?(\d{3,4})x(\d{3,4})", e)
    boyut = (int(m[1]), int(m[2])) if m else None
    ekle(pid, "çözünürlük", "GECTI" if boyut == (1080, 1920) else "KALDI", f"{boyut}")
    ses_var = "Audio:" in e
    if sesli:
        ekle(pid, "ses kanalı", "GECTI" if ses_var else "KALDI", "" if ses_var else "sesli üretildi ama videoda ses yok")
    if ses_var:
        tepe = [float(x) for x in re.findall(r"Peak level dB: (-?[\d.]+|-inf)", e) if x != "-inf"]
        if tepe:
            t = max(tepe)
            ekle(pid, "ses tepe düzeyi", "UYARI" if t > ESIK["ses_tepe_dbfs"] else "GECTI", f"{t:.1f} dBFS")
        ilk = sesli and re.search(r"silence_start: (-?[\d.]+)\s.*?silence_end: ([\d.]+)", e, re.S)
        if ilk and float(ilk[1]) <= 0.05:
            ekle(pid, "ilk ses (kanca)", "UYARI" if float(ilk[2]) > ESIK["ilk_ses_sn"] else "GECTI", f"{float(ilk[2]):.1f}. saniyede")
    donma = re.findall(r"freeze_duration: ([\d.]+)", e)
    if donma:
        ekle(pid, "donmuş görüntü", "UYARI", f"{len(donma)} yerde ≥{ESIK['donma_sn']} sn hareketsiz (en uzun {max(map(float, donma)):.1f} sn)")
    siyah = re.findall(r"black_start:([\d.]+)", e)
    if siyah:
        ekle(pid, "siyah kare", "KALDI" if float(siyah[0]) < 0.2 else "UYARI", f"{siyah[0]}. saniyede siyah ekran")


# ---- isteğe bağlı dil bilgisi (LanguageTool, yalnız UYARI) -----------------------------------------
def ingilizce_metinler(spec):
    out = []
    for s in spec.get("sahneler", []):
        for k in ("once", "sonra", "ses"):
            if s.get(k) and not TR_HARF.search(s[k]):
                out.append(s[k].replace(" | ", " ").replace("|", " "))
    for q in spec.get("questions", []):
        out.append(q.get("q", "").replace("___", (q.get("o") or ["it"])["ABCDE".find(q.get("a", "A")) if q.get("a") in "ABCDE" else 0]))
    return [x for x in out if x.strip()]


def dilbilgisi_kontrol(pid, spec):
    for cumle in ingilizce_metinler(spec):
        try:
            veri = urllib.parse.urlencode({"text": cumle, "language": "en-US"}).encode()
            with urllib.request.urlopen("https://api.languagetool.org/v2/check", veri, timeout=15) as r:
                bulgular = [m for m in json.loads(r.read().decode()).get("matches", [])
                            if m.get("rule", {}).get("issueType") in ("grammar", "misspelling", "typographical")]
        except Exception as ex:
            ekle(pid, "dil bilgisi", "UYARI", f"LanguageTool'a ulaşılamadı ({type(ex).__name__}); Editör elle baksın")
            return
        for b in bulgular[:2]:
            ekle(pid, "dil bilgisi (LanguageTool)", "UYARI", f"'{cumle[:50]}': {b.get('message')}")


# ---- ana akış -------------------------------------------------------------------------------------
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("gun_klasoru")
    ap.add_argument("--kuyruk", help="veri/kuyruk.json yolu ya da raw URL")
    ap.add_argument("--gecmis", help="gunler/ klasörü ya da raw .../gunler URL'si (çeşitlilik için)")
    ap.add_argument("--dilbilgisi", action="store_true", help="LanguageTool ile İngilizce cümleleri tara (internet)")
    a = ap.parse_args()

    klasor = a.gun_klasoru.rstrip("/")
    gun = os.path.basename(klasor)
    content = oku(os.path.join(klasor, "content.json"))
    if not content:
        print("KALDI: content.json okunamadı"); sys.exit(1)
    gun = content.get("date", gun)
    kuyruk = oku(a.kuyruk) or []
    gecmis = gecmis_yukle(a.gecmis or os.path.dirname(klasor), gun, ESIK["baslik_tekrar_gun"])

    for pid, tur, sp in paylasimlar(content):
        kayit = next((k for k in kuyruk if k.get("id") == f"{gun}-{pid}"), {})
        cevaplar = None
        if tur == "anim":
            anim_kontrol(pid, sp)
        elif tur == "quiz":
            cevaplar = quiz_kontrol(pid, sp.get("questions", []), yds=sp.get("tema", "ydt") == "ydt")
            if len(sp.get("questions", [])) + 2 > ESIK["slayt_max"]:
                ekle(pid, "toplam slayt", "KALDI", "kapak + sorular + cevap anahtarı 10'u geçiyor")
        else:
            bilgi_kontrol(pid, sp)
        havuz_kontrol(pid, sp)
        aciklama_kontrol(pid, sp.get("caption") or sp.get("aciklama") or kayit.get("aciklama"), cevaplar)
        mp4 = os.path.join(klasor, f"{pid}.mp4")
        if os.path.exists(mp4):
            video_kontrol(pid, mp4, bool(sp.get("ses")))
        elif tur == "anim":
            ekle(pid, "video dosyası", "UYARI", f"{pid}.mp4 bulunamadı; video kontrolleri atlandı")
        if a.dilbilgisi:
            dilbilgisi_kontrol(pid, sp)
    cesitlilik_kontrol(gun, content, kuyruk, gecmis)

    kaldi = [s for s in SONUC if s["durum"] == "KALDI"]
    uyari = [s for s in SONUC if s["durum"] == "UYARI"]
    rapor = {"tarih": gun, "karar": "KALDI" if kaldi else "GECTI", "kaldi": len(kaldi), "uyari": len(uyari), "kontroller": SONUC}
    with open(os.path.join(klasor, "kalite.json"), "w", encoding="utf-8") as f:
        json.dump(rapor, f, ensure_ascii=False, indent=1)
    for s in kaldi + uyari:
        print(f"{s['durum']:6} [{s['paylasim']}] {s['kontrol']}: {s['ayrinti']}")
    print(f"\nKARAR: {rapor['karar']} · {len(kaldi)} KALDI · {len(uyari)} UYARI · {len(SONUC)} kontrol")
    sys.exit(1 if kaldi else 0)


if __name__ == "__main__":
    main()
