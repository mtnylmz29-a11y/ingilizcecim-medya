# "Sınav sorusu" Reels — nasıl üretilir (Metin, 18 Kasım 2026)

Metin 18 Kasım'da "responsible for / from" videosunu beğendi ve bunu biçim olarak istedi. Kararları:
- "Sorularda seslendirme kullanmayalım. Sadece az bir müzik olabilir…"
- "…tik tak sesleri falan."

**Akış:**
1. Ahşap masaya çizgili bir YDS soru kâğıdı kayar (beş şık).
2. Soru 3 sn okunur, ardından 5 sn geri sayım halkası işler (tik tak; son 2 sn kırmızı).
3. Yanlış şıklar sırayla gerekçesiyle elenir: kalem çiziği ve kırmızı balon, her biri 2,5 sn.
4. Doğru şık yeşil daireye alınır ve optik formda kodlanır.
5. Sarı kural kartı gelir (5 sn), video ingilizcecim.com ile kapanır.

**Örnek spec:** `video/ornekler/sinav_responsible-for.json`.

## Ne zaman kullanılır
- **Ekip 17:30 gönderisinde haftada 2–3 gün** (art arda değil) bu biçimi kendiliğinden seçer; HyperFrames çizgi film zorunluluğu o günler için geçerli değildir (`ORKESTRA.md`).
- Konu: sık karıştırılan edat, bağlaç ya da zaman ayrımları; YDS/YDT tipi tek boşluklu dilbilgisi ya da kelime sorusu.
- Soru tek bir "tuzağı" öğretmeli: Türkçeden geçen yanlış kalıp, iki yapının karıştırılması gibi. Gerekçeler kısa ve gerçek olmalı. Uydurma kural yazılmaz; kalıp sözlükten (Cambridge, Oxford, Merriam-Webster) doğrulanır.

## Üretim yolu
Spec'i `gunler/YYYY-MM-DD/sinav_<ad>.json` olarak yükle. Etimoloji ile aynı Actions işi (`etym-render.yml`) çalışır ve aynı klasöre üç dosya yazar:
- `<ad>_sinav.mp4`
- `<ad>_sinav_kareler.jpg`
- `<ad>_sinav_kapak.jpg` (kapak: elemeler bitmiş, doğru şık daire içinde, üstte başlık bandı)

Seslendirme yok, TTS çağrılmaz: Gemini kotası, internet ya da GPU gerekmez. Müzik ve efektler `video/sinav.py`'de kodla üretilir (telifsiz). Hatalar "SPEC HATASI" diye görünür. Kuyruk ve onay süreci diğer Reels'lerle aynıdır; kayıtta `"bicim": "animasyon"`, `"stil": "sinav-sorusu (remotion)"` yaz.

**Bilgisayarda (Claude Code):** depo kökünden şu komutu çalıştır:
```
PYTHON=C:/Users/Metin/lemo-opuscar/.venv/Scripts/python.exe TMPDIR=/e/ingilizcecim/tmp sh video/build.sh gunler/<tarih>/sinav_<ad>.json
```
İlk seferde `cd video && npm ci` gerekir.

## Spec biçimi
```
{
 "bicim": "sinav",
 "ad": "responsible-for",
 "etiket": "YDS · EDAT TUZAĞI",        // kâğıdın sol üstü, ≤ 26 karakter
 "soruNo": 7,
 "soru": "As the new project manager, Sarah is responsible ---- training all the newly hired staff.",   // boşluk "----", ≤ 170 karakter
 "ikon": "canta",                      // kâğıdın sağ üstü: bisiklet bulasik canta ev grafik kahve kalem kirikTabak kitap kumSaati saat sehir soru tabela takvim telefon ucak yatak
 "secenekler": ["from", "for", "of", "to", "with"],   // tam 5, her biri ≤ 24 karakter
 "dogru": 1,                           // A=0 … E=4
 "eleme": [ {"sik": 0, "neden": "'-den sorumlu' tuzağı!"}, ... ],   // 1–4 kayıt, elenme sırasıyla; neden ≤ 32 karakter (tek satır), Türkçe
 "kural": "for + yapılan iş\nto + hesap verilen kişi",              // 1–2 satır (\n), satır ≤ 26 karakter
 "kuralOrnek": "for training · to the manager",                     // ≤ 40 karakter
 "kapak": {"baslik": "Responsible", "alt": "from mu, for mu?"}      // kapak başlığı ≤ 12 karakter; "etiket" verilmezse kâğıdın etiketi
}
```
Süre eleme sayısına bağlıdır: 4 elemede 29 sn, 3 elemede 26,5 sn. Zamanlama tek bir dosyada tutulur (`video/src/sinavZaman.json`); hem video hem ses oradan okur.

## Kontrol (Editör)
`<ad>_sinav_kareler.jpg` ve kapağa bak:
- Soru metni üç satırı aşmıyor.
- Hiçbir balon iki satıra taşmıyor.
- Doğru şık gerçekten doğru; gerekçeler dilbilgisi açısından doğru.
- Kapak başlığı okunaklı.
