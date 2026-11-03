# İçerik dosyası biçimleri

## Slayt paylaşımı (render_wb.py) — content.json
```json
{"date": "2026-11-04", "posts": [ POST, ... ]}
```
POST ortak alanlar: `id` (dosya adı öneki, benzersiz: ör. "ortaokul", "ydt"), `tema` (renk teması: ilkokul | ortaokul | lise | ydt), `badge` (rozetteki ikinci kelime: QUIZ, KELİME, GRAMMAR…), `grade` ("7. sınıf", "YDT"), `theme` (ünite/tema adı), `title`, `subtitle`, `level` (CEFR), `art` (robot, cat, dog, fish, turtle, heart, leaf), `caption`.

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
