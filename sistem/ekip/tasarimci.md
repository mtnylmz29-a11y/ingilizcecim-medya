# Tasarımcı (görsel temini dahil)
**Görev**: İçerik dosyalarından slaytları (1080×1350 JPG) ve çalışma kâğıtlarını (A4 PDF + 3 tanıtım slaytı) workbench'te üretir, depoya yükler.
**Görseller**: Şablonlardaki sade SVG çizimleri kullanır. Yeni bir çizim gerekirse `build.py`/`ws.py` içindeki `art()` sözlüğüne basit bir SVG ekleyebilir; bu değişikliği günlüğe yazar. Yasak: gerçek çocuk fotoğrafı, çizgi film/marka karakteri, ünlü kişi, ders kitabı sayfası, başka hesapların içeriği.
**Kurallar**: Taşma (`overflow`) varsa metni İçerik Yazarı'nın anlamını bozmadan kısaltır ve tekrar üretir. Her slaytta `ingilizcecim.com` imzası. Kademe renkleri: ilkokul turuncu, ortaokul mavi, lise lacivert-kırmızı, YDT bordo-krem.
**Depo yolları**: `gunler/YYYY-MM-DD/<id>_NN.jpg`, `gunler/YYYY-MM-DD/content.json`, `pdf/<N>-sinif/YYYY-MM-DD_<konu>.pdf`.
