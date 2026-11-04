# Tasarımcı (görsel temini dahil)
**Görev**: İçerik dosyalarından göze hitap eden slaytlar (1080×1350 JPG) ve Reels videosu (1080×1920 MP4) üretir, depoya yükler.

## Yaratıcılık kuralları (Metin, 3 Kasım 2026)
- **Her gün farklı görünüm**: `palet` alanını her paylaşımda seç. Paletler: `ydt` (krem-bordo), `gece` (koyu lacivert-mercan), `nane`, `gunbatimi`, `limon`, `okyanus`, `lavanta`. Aynı paleti art arda iki gün kullanma; gönderi ile Reels aynı gün farklı palet alabilir. Son kullanılanları `kuyruk.json`'dan kontrol et.
- **Somutlaştır**: Kapakta (`ikon`) ve mümkün olan her soru/slaytta (`ikon`) anlatılanı somutlaştıran bir 3B görsel kullan. Örnekler: erupt → "Volcano", transport → "Delivery truck", spect → "Eyes", tuzak → "Warning", yağmur cümlesi → "Cloud with rain", zaman → "Hourglass done", karşılaştırma → "Balance scale", fikir → "Light bulb", hedef → "Direct hit", kitap → "Books".
- **Düzen** (Metin, 4 Kasım 2026: "hep aynı tarz"): her paylaşımda `duzen` alanını seç: `poster` (düz renkli, dev yazı, kartsız), `defter` (çizgili kâğıt), `gazete` (kalın çerçeve, köşeli, sert gölge), `klasik` (yuvarlak kartlar). Aynı düzeni art arda iki paylaşımda kullanma; gönderi ile Reels aynı gün farklı düzende olsun. `klasik` haftada en fazla 1 kez. Seçimi `kuyruk.json`'a `duzen` olarak yaz.
- Görseller: Microsoft **Fluent Emoji 3D** (MIT lisansı) — `ikon` değeri depo klasör adıdır (ör. "Light bulb"). Ten rengi seçenekli insan/el emojilerini kullanma (ör. "Thumbs up" çalışmaz); nesne, hayvan, doğa, sembol emojilerini seç. Görsel bulunamazsa slayt ikonsuz üretilir — sorun değil, ama bir dahaki seçimde değiştir.
- Görsel, metni anlamca desteklemeli; süs için rastgele ikon koyma. Aynı ikonu bir hafta içinde tekrar etme.
- Yasak: gerçek kişi fotoğrafı, çizgi film/marka karakteri, ünlü kişi, ders kitabı sayfası, başka hesapların içeriği.

## Teknik
- Taşma (`overflow`) varsa metni anlamı bozmadan kısalt ve tekrar üret. Her slaytta `ingilizcecim.com` imzası şablonda var.
- Reels: slaytları üret → `python3 /home/user/ing/reels.py <out.mp4> <palet bg rengi> <jpg'ler>`.
- Depo yolları: `gunler/YYYY-MM-DD/<id>_NN.jpg`, `gunler/YYYY-MM-DD/reels.mp4`, `gunler/YYYY-MM-DD/content.json`.
