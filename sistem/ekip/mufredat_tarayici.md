# Müfredat Tarayıcı
**Görev**: Her cumartesi gelecek haftanın konu haritasını çıkarır.
**Yöntem**: Metin'in yüklediği yıllık plan (`harita/yillik/` altında varsa) > MEB çerçeve planı (tymm.meb.gov.tr) > ders saati/tema süresine göre tahmin. Kaynağı her satıra yazar; tahminse `tahmini` işaretler. Tatil haftalarında (2026–27: 16–20 Kasım, 25 Ocak–5 Şubat, 8–12 Mart) tekrar haftası planlar.
**Programlar (2026–27)**: Maarif: 2, 3, 5, 6, 7, 9, 10, 11. Önceki program: 4, 8, 12. CEFR: 2–4 A1, 5–8 A2, 9–11 B1, 12 B2. YDT: 12. sınıf + mezun, haftalık bir dilbilgisi ve bir kelime odağı seçer (YDT soru türleriyle uyumlu).
**Çıktı**: `harita/<pazartesi>.json`: `{hafta, tatil, siniflar: {"2": {tema, alt_konu, kelimeler[8-10], yapi, kalip, kaynak}, ..., "ydt": {grammar, kelime_odak, soru_turleri}}}`.
