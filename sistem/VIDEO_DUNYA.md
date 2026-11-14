# "Dünya turu" Reels — nasıl üretilir (Metin, 15 Kasım 2026)

Metin 14 Kasım'da "Good morning — 24 saatte dünyayı dolaşan selam" videosunu beğendi, 15 Kasım'da da "Dünya videosu biçimini de oraya ekle" dedi. Bu biçimde bir ifade ya da kelime şehir şehir dünyayı dolaşır:
- Küre döner ve her şehirde o dilde yazı, okunuş ve ses çıkar.
- Ardından kısa bir ders kartı gelir; isteğe bağlı 24 saatlik kadran da gösterilebilir.
- Video bir soru ve "Yorumlara yaz!" ile biter.

**Örnek spec:** `video/ornekler/dunya_good-morning.json` (14 Kasım videosunun aynısı).

## Ne zaman kullanılır
- Bir ifadenin farklı dillerdeki karşılıkları ya da kullanım saatleri: selamlaşma, teşekkür, "afiyet olsun", "cheers".
- Bir kelimenin diller arasında yayılışı: tea/çay, coffee/kahve, chocolate gibi. Burada şehirler kelimenin geçtiği dilleri temsil eder ve her biri kaynakla doğrulanır.
- Etimoloji görevi bu biçimi **haftada en fazla 1 kez** seçebilir. Ekip de 17:30 gönderisinde kullanabilir.

## Üretim yolu
Spec'i `gunler/YYYY-MM-DD/dunya_<ad>.json` olarak yükle. Aynı Actions işi çalışır ve sonucu `<ad>_dunya.mp4` ile `<ad>_dunya_kareler.jpg` olarak yazar. Hatalar "SPEC HATASI" diye görünür. Kuyruk ve onay süreci Kelimelerin Tarihçesi ile aynıdır.

## Spec biçimi
```
{
 "bicim": "dunya",
 "ad": "good-morning",
 "tarih": "2026-11-14",          // güneşin açısı bu tarihe göre hesaplanır (gunes: true ise)
 "etiket": "DÜNYA TURU",         // sol üst hap
 "gunes": true,                  // true: gece/gündüz çizgisi, güneşin doğuşu şehirden şehre ilerler (selamlaşma, saat konuları)
 "muzik": "sakin",               // neseli | gizemli | macera | sakin
 "baslik": {"ust": "Good", "vurgu": "morning!", "alt": "24 saatte dünyayı dolaşan selam"},
 "sehirler": [ {"id", "ad", "lon", "lat", "dil_adi", "yazi", "okunus"?, "yazi_tipi"?, "sag_sol"?}, ... ],   // 4–8 şehir, gösterim sırasıyla
 "ses": [ {"id", "dil", "bolum": "giris"|"tur"|"ders"|"kapanis", "metin", "altyazi"?, "ara"?, "hiz"?, "sehir"?}, ... ],
 "ders": {"saat": true, "satirlar": [ {"en", "tr", "not"?, "renk"?, "saat"?: [5, 12], "cue"?} ]},   // 2–5 satır
 "kapanis": {"soru": "Sen şu an hangisini söylerdin?", "vurgu": "hangisini", "cipler"?: [...], "yorum"?: "Yorumlara yaz!"}
}
```
- **Ses bölümleri:**
  - `giris`: 2 satır. Birincisi başlık ifadesi (İngilizce), ikincisi Türkçe tanıtım cümlesi.
  - `tur`: şehir satırları ve aradaki Türkçe anlatım. Her şehir **tam bir** ses satırında `"sehir": "<id>"` olarak geçer ve satırlar `sehirler` listesiyle aynı sıradadır. Şehir satırı o dilde okunur; altyazısı Türkçe açıklamadır ("Japonca: Günaydın").
  - `ders`: Türkçe kısa açıklamalar ve İngilizce örnekler. Bir satıra `cue` verilirse, o ses satırı başladığında ilgili satır yanar.
  - `kapanis`: 1 Türkçe satır (soru ve "Yorumlara yaz!").
- **`ders.saat: true`** olduğunda 24 saatlik kadran gösterilir; her satırda `saat: [başlangıç, bitiş]` olmalı (gece için 22–29 gibi 24'ü aşabilir). Saat dilimiyle ilgisi olmayan konularda bu alanı kapat. O zaman küre üste çıkar ve satırlar büyük gösterilir.
- **Dil kodları (`dil`):** `tr`, `en`/`us`, `gb`, `ja`, `zh`, `ar`, `fr`, `de`, `es`, `it`, `ru`, `ko`, `pt`, `el`, `hi`, `nl`, `pl`, `sv`, `he`, `th`, `fa`, `cs`.
- **`yazi_tipi`:** Latin dışı yazılarda gerekir. Değerler: `jp` (Japonca), `sc` (Çince), `ar` (Arapça ve Farsça, `"sag_sol": true` ile), `kr` (Korece), `hi` (Hintçe), `he` (İbranice, `sag_sol`), `th` (Tayca), `noto` (Yunanca ve Rusça).
- Süre 26–48 sn olmalı.

## İçerik kuralları
- Her şehirdeki yazı ve okunuş, iki kaynaktan doğrulanmış olmalı (sözlük, Wiktionary). Emin olunmayan dil listeye alınmaz.
- Koordinatlar şehir merkezidir. Şehirleri doğudan batıya sıralamak kürenin akıcı dönmesini sağlar.
- Gerçek kişi ve marka çizilmez. Kapanışta `@ingilizcecim.com` otomatik gösterilir. Açıklama ve hashtag kuralları Kelimelerin Tarihçesi ile aynıdır, yalnızca seri etiketi farklıdır: `#kelimelerintarihçesi` yerine `#dünyaturu`.

## Editör kontrolü
- `<ad>_dunya_kareler.jpg`'yi aç ve şunlara bak:
  - Şehir kartlarında yazılar taşıyor mu?
  - Latin dışı yazılar kutucuk (□) olarak mı görünüyor? Öyleyse `yazi_tipi` eksiktir.
  - Ders satırları okunuyor mu?
- Yazı ve okunuşları bağımsız olarak doğrula.
