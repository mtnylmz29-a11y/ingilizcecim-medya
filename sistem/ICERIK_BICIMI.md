# İçerik dosyası biçimleri

## Slayt paylaşımı (render_wb.py) — content.json
```json
{"date": "2026-11-04", "posts": [ POST, ... ]}
```
POST ortak alanlar: `palet` (ydt | gece | nane | gunbatimi | limon | okyanus | lavanta — renk paleti; yoksa `tema` kullanılır), `ikon` (kapak için Fluent Emoji 3D klasör adı, ör. "Volcano"; soru ve bilgi slaytlarında da `ikon` verilebilir), `id` (dosya adı öneki, benzersiz: ör. "ortaokul", "ydt"), `tema` (renk teması: ilkokul | ortaokul | lise | ydt), `badge` (rozetteki ikinci kelime: QUIZ, KELİME, GRAMMAR…), `grade` ("7. sınıf", "YDT"), `theme` (ünite/tema adı), `title`, `subtitle`, `level` (CEFR), `art` (robot, cat, dog, fish, turtle, heart, leaf), `caption`.

**Quiz** (varsayılan): `questions: [{q, o: [şıklar], a: "A".."E", why, art?}]` → kapak + soru başına slayt + cevap anahtarı. İlkokul 3 şık, ortaokul 4, lise 4–5, YDT 5.

**Bilgi kartı**: `format: "bilgi"`, `slides: [{h: başlık, lines: [madde], ex: [not/örnek]}]`, `ozet`, `cta` → kapak + slaytlar + özet. Slayt başına en fazla 4 madde, madde başına en fazla ~70 karakter.

Toplam slayt 10'u geçmemeli (Instagram sınırı).

## Çalışma kâğıdı (ws.py) — ws.json
`slug`, `grade`, `level`, `theme`, `focus`, `title`, `caption`, `activities: [...]`. Etkinlik türleri:
- `look_write`: `items: [{art, ok: true/false, text: "... ______ ..."}]` (4 öğe)
- `match`: `items: [{art}]` (4), `pool: [kelimeler]` (alfabetik; resim sırasını izlemesin)
- `circle`: `items: [{text: "Birds (can / can't) fly."}]` — parantezli seçenek kalıbı şablonda şu an yalnızca "(can / can't)" için kutulanır; başka ikilemlerde metin düz görünür.
- `write`: `lines: ["I can ______ ."]`
Her etkinlikte `title` (İngilizce yönerge), `tr` (Türkçe yönerge), `key` (cevap anahtarı). Sayfa 1'e sığmalı (4 etkinlik).
Kullanılabilir çizimler: robot, cat, dog, fish, turtle, bird, penguin.

## Animasyonlu Reels (anim.py) — anim.json
`python3 /home/user/ing/anim.py <anim.json> <out.mp4>` (1080×1920, 25–35 sn önerilir; arka planda `subprocess.Popen` ile çalıştır).
```json
{"palet": "lavanta", "sahneler": [SAHNE, ...]}
```
Her sahnede `tip`, `sure` (sn), isteğe bağlı `ust` (küçük başlık), `ikon`:
- `kapak`: `baslik`, `alt`, `ikon`
- `donusum`: `once`, `sonra` (kelimeler ekranda yeni yerine kayar), `vurgu` (öne çıkan kelimeler), `not` (kuralın açıklaması). `sure` en az 7. Her iki cümlede de ortak kelimeler aynı yazılmalı.
- `maddeler`: `baslik`, `satirlar` (sırayla belirir; en fazla 4, kısa)
- `kapanis`: `baslik`, `alt`, `ikon`
**Sesli anlatım**: kökte `"ses": true`. Kokoro-82M (Apache-2.0, ücretsiz, workbench'te yerel çalışır; model ilk kullanımda iner) yalnızca **İngilizce** okur. `donusum` sahnesinde `once` ve `sonra` otomatik okunur, süre sese göre uzar, kelimeler okuma arasında kayar. `kapak`, `maddeler`, `kapanis` için okunacak metin `ses` alanına İngilizce yazılır. Türkçe açıklamalar ekranda kalır, okunmaz. Ses `ses_sesi` (varsayılan af_heart) ve `ses_hizi` (0.95) ile ayarlanır.
Uzun cümle 3 satırı geçmesin. Kontrol için kare klasörü üçüncü bağımsız değişken olarak verilir.

## HyperFrames videosu (7 Kasım 2026'dan itibaren varsayılan) — gunler/YYYY-MM-DD/hf_<ad>.json
GitHub Actions `hf/gen.py` ile üretir, çıktı `<ad>_hf.mp4` (1080×1920). Kök alanlar: `palet` (ydt | gece | nane | gunbatimi | limon | okyanus | lavanta), isteğe bağlı `gemini_ses` (varsayılan "Kore"). `sahneler` listesi, sahne tipleri:
- `kapak` / `kapanis`: `baslik`, `vurgu` (kutuya alınacak kelimeler), `alt`, `ikon` (Fluent Emoji 3D klasör adı), `ses` (okunacak metin), `ses_dil` ("tr" varsayılan | "en"), kapanışta isteğe bağlı `etiketler` (küçük kutular).
- `degis` (bir kelimenin yerine daha iyisi gelir; kelime aileleri, akademik kelime, yanlış→doğru tek kelime): `ust` (rozet, ör. "FİİL 1/4"), `no` (arka planda dev rakam), `once`, `eski`, `yeni`, `sonra`, `anlam` (Türkçe kart), `ikon`, `ses_tr` (kısa Türkçe açıklama). Eski ve yeni cümle İngilizce okunur (`ses_eski`/`ses_yeni` ile değiştirilebilir).
- `donusum` (cümle önce → sonra; dilbilgisi dönüşümü): `ust`, `once`, `sonra`, `vurgu`, `not` (Türkçe kart), `ses_tr`. Cümleler İngilizce okunur.
- `maddeler` (özet liste, en fazla 4 madde): `ust`, `baslik`, `satirlar`, `ses`, `ses_dil`.
Kurallar: cümle başına en fazla ~45 karakter (daha uzunsa iki satıra iner, sorun değil ama 3 satırı geçmesin); Türkçe büyük harfler doğrudan yazılır ("FİİL", "ÖZET"); ses satırı sayısı Reels'te en fazla ~12.
