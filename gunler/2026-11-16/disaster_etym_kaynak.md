# Kelimelerin Tarihçesi: Disaster — kaynak notu

**Tarih / slot:** 2026-11-16 · 20:30 Reels · YDT/YDS
**Stil:** lemo-opuscar `crayon-book` (pastel boya resimli kitap; gece suluboyası balmumu yıldızları ortaya çıkarır) · 1080×1920 · 24 fps · 57 sn · −14 LUFS
**Karakterler:** Nino (küçük Rönesans yıldız falcısı, kurgusal) ve "kötü yıldız" (kırmızı, yüzlü). Anlatıcı kelimenin kendisi.

## TREATMENT özeti
Tek bir gece, bir çatı: Nino dürbünle kırmızı bir yıldıza bakar (kanca: "Bir felaketin suçlusu bir yıldız olabilir mi?"). Gökte DISASTER başlığı elle yazılır. 1500'ler İtalya kasabası: insanlar kaderi yıldızların yazdığına inanır. **Dönüm:** ultramarin gece yıkaması gökyüzünü geçer, balmumuyla saklı yıldızlar çıkar, kırmızı yıldız belirir, Nino korkar. Kelimenin parçaları: dis (kötü) + astro (yıldız) = disastro. Çocuk haritası: İtalya → Fransa (désastre) → İngiltere (disaster, 1500'lerin sonu). Bugün: fırtınada kasaba, İngilizce örnek cümle. Son: aynı çatı, gece; kırmızı yıldız göz kırpar; ingilizcecim.com.
Sahneler: çatı, gökte başlık, İtalya kasabası, yıkama/dönüm, kelime sayfası, harita, fırtına, gece çatısı (8).

## Seslendirme metni (tr-TR-AhmetNeural; İngilizce cümle en-US-GuyNeural)
1. Bir felaketin suçlusu bir yıldız olabilir mi?
2. Merhaba, ben disaster. Türkçesi: felaket.
3. 1500'lerde İtalya'da doğdum.
4. O zamanlar insanlar kaderi yıldızların yazdığına inanırdı.
5. Gökyüzünde uğursuz bir yıldız görünce başa bela geleceğini düşünürlerdi.
6. Adım da buradan geliyor: dis, yani kötü; astro, yani yıldız.
7. İtalyanca disastro: kötü yıldız.
8. Sonra Fransızcaya désastre olarak geçtim.
9. 1500'lerin sonunda da İngilizceye vardım.
10. Bugün yıldızlara kimse kızmıyor; ama büyük felaketlerin adı hâlâ benim.
11. *The storm was a disaster for the town.*
12. Bir dahaki sefere disaster dediğinde gökyüzüne bir bak!

Konuşma kontrolü: her satır faster-whisper (medium, tr; en için base.en) ile ayrı ayrı ve son miks üzerinde bütün olarak doğrulandı. İngilizce kelimelerin Türkçe sesle okunuşu ("dizastır") beklenen fonetik farktır.

## Etimoloji ve kaynaklar
- **Kesin:** İtalyanca *disastro* < *dis-* (olumsuz/kötü anlamlı önek) + *astro* "yıldız" (Latince *astrum*, Yunanca *astron*). Orta Fransızca *désastre* üzerinden İngilizceye 16. yüzyılın ikinci yarısında geçti (Merriam-Webster ilk kullanım 1567; etymonline 1590'lar). İlk anlamı astrolojikti: bir yıldızın ya da gezegenin uğursuz konumu; sonra bu konumun getirdiği sanılan büyük talihsizlik.
- **Ekrandaki ifade:** "1500'lerin sonu" — iki kaynağın ortak aralığı (1567 / 1590'lar). İtalya'da doğuş "1500'ler" olarak verildi; kesin İtalyanca ilk tarih iddia edilmedi.
- **Rivayet yok:** hikâye kaynakların doğruladığı astrolojik anlamla sınırlı tutuldu; "insanlar yıldızların kaderi yazdığına inanırdı" dönemin inancını anlatır, olgu iddiası değildir.
- https://www.etymonline.com/word/disaster
- https://www.merriam-webster.com/dictionary/disaster

## Teknik
Yerel üretim: Claude Code + lemo-opuscar (render, readcheck, asr_check, mux). Film klasörü: `E:\ingilizcecim\filmler\2026-11-16-disaster` (`sh build.sh` ile baştan üretilir).
Kontroller: readcheck 0 hata; asr_check 0 uyuşmazlık; blackdetect 0; I = −14.0 LUFS, tepe −1.6 dBFS; 8 karelik tablo elle incelendi. Dosya 40 MB, H.264 + AAC, BT.709 sınırlı aralık.
