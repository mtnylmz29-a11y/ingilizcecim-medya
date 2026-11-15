# Kelimelerin Tarihçesi: Disaster — kaynak notu

**Tarih / slot:** 2026-11-16 · 20:30 Reels · YDT/YDS
**Stil:** lemo-opuscar `crayon-book` (pastel boya resimli kitap; gece suluboyası balmumu yıldızları ortaya çıkarır) · 1080×1920 · 24 fps · 58,6 sn · −14 LUFS
**Karakterler:** Nino (küçük Rönesans yıldız falcısı, kurgusal) ve "kötü yıldız" (kırmızı, yüzlü). Anlatıcı kelimenin kendisi.

## TREATMENT özeti
Tek bir gece, bir çatı: Nino dürbünle kırmızı bir yıldıza bakar (kanca: "Bir felaketin suçlusu bir yıldız olabilir mi?"). Gökte DISASTER başlığı elle yazılır. 1500'ler İtalya kasabası: insanlar kaderi yıldızların yazdığına inanır. **Dönüm:** ultramarin gece yıkaması gökyüzünü geçer, balmumuyla saklı yıldızlar çıkar, kırmızı yıldız belirir, Nino korkar. Kelimenin parçaları: dis (kötü) + astro (yıldız) = disastro. Çocuk haritası: İtalya → Fransa (désastre) → İngiltere (disaster, 1500'lerin sonu). Bugün: fırtınada kasaba, İngilizce örnek cümle. Son: aynı çatı, gece; kırmızı yıldız göz kırpar; ingilizcecim.com.
Sahneler: çatı, gökte başlık, İtalya kasabası, yıkama/dönüm, kelime sayfası, harita, fırtına, gece çatısı (8).

## Seslendirme metni (Gemini TTS, ses Kore; Türkçe ve İngilizce aynı sesle)
1. Bir felaketin suçlusu bir yıldız olabilir mi?
2. Merhaba, ben disaster. Türkçesi: felaket.
3. İtalya'da doğdum.
4. O zamanlar insanlar kaderi yıldızların yazdığına inanırdı.
5. Gökyüzünde uğursuz bir yıldız görünce başa bela geleceğini düşünürlerdi.
6. Adım da buradan geliyor: dis, yani kötü; astro, yani yıldız.
7. İtalyanca disastro: kötü yıldız.
8. Sonra Fransızcaya désastre olarak geçtim.
9. 1500'lerin sonunda da İngilizceye vardım.
10. Bugün yıldızlara kimse kızmıyor; ama büyük felaketlerin adı hâlâ benim.
11. *The storm was a disaster for the town.*
12. Bir dahaki sefere disaster dediğinde gökyüzüne bir bak!

Konuşma kontrolü: her satır faster-whisper (medium, tr; en için base.en) ile ayrı ayrı ve son miks üzerinde bütün olarak doğrulandı.

Ses notu (düzeltme turu 1): gemini-2.5-flash-preview-tts ücretsiz günlük kotası (10 istek) dolduğu için Metin'in onayıyla gemini-3.8-flash-tts (Kore) kullanıldı; m1, m2, f1 ve İngilizce satır o modelin kotası da dolunca gemini-3.1-flash-tts-preview (Kore) ile üretildi. 3.x modelleri stil önekini de seslendirdiği için önek whisper kelime zamanlarıyla kesildi; ham çıktının sonundaki kısa parazit atıldı (`cut_prefix.py`).

## Etimoloji ve kaynaklar
- **Kesin:** İtalyanca *disastro* < *dis-* (olumsuz/kötü anlamlı önek) + *astro* "yıldız" (Latince *astrum*, Yunanca *astron*). Orta Fransızca *désastre* üzerinden İngilizceye 16. yüzyılın ikinci yarısında geçti (Merriam-Webster ilk kullanım 1567; etymonline 1590'lar). İlk anlamı astrolojikti: bir yıldızın ya da gezegenin uğursuz konumu; sonra bu konumun getirdiği sanılan büyük talihsizlik.
- **Ekrandaki ifade:** "1500'lerin sonu" — iki kaynağın ortak aralığı (1567 / 1590'lar). Seslendirmede İtalyanca için tarih verilmiyor ("İtalya'da doğdum"); kasaba sahnesindeki "1500'ler · İtalya" etiketi sahnenin dönemidir.
- **Rivayet yok:** hikâye kaynakların doğruladığı astrolojik anlamla sınırlı tutuldu; "insanlar yıldızların kaderi yazdığına inanırdı" dönemin inancını anlatır, olgu iddiası değildir.
- https://www.etymonline.com/word/disaster
- https://www.merriam-webster.com/dictionary/disaster

## Teknik
Yerel üretim: Claude Code + lemo-opuscar (render, readcheck, asr_check, mux). Film klasörü: `E:\ingilizcecim\filmler\2026-11-16-disaster` (`sh build.sh` ile baştan üretilir).
Kontroller: readcheck 0 hata; asr_check geçti (yalnızca disaster/désastre okunuş farkları); blackdetect 0; I = −14.0 LUFS, tepe −1.7 dBFS; 8 karelik tablo elle incelendi. Dosya 41 MB, H.264 + AAC, BT.709 sınırlı aralık.

Düzeltme turu 1 (Denetmen): kapanış kartında harf aralığı açıldı, eğim kaldırıldı (ingilizcecim.com net); haritada İngiltere ayrı ada (Manş boşluğu), etiket adanın üstünde; 'disastro' etiketi rotadan uzak; '1500'lerde' sesten çıkarıldı.
