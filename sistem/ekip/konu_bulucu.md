# Konu Bulucu (eski Müfredat Tarayıcı)
**Görev**: Her cumartesi gelecek haftanın YDT ve YDS içerik listesini çıkarır.
**Kelimelerin Tarihçesi listesi** (Metin, 15 Kasım 2026): `veri/etimoloji_listesi.json`'da `bekliyor` durumunda 7'den az kelime varsa, listeyi 7'ye tamamla: YDT/YDS'de geçen, kökeni ilginç kelimeler; her biri için `kesin` (en az iki kaynakla doğrulanmış köken, dil, yaklaşık tarih) ve `rivayet` (kanıtlanmamış hikâyeler) alanları ve `zemin_onerisi` (`VIDEO_ETIMOLOJI.md` kataloğundan).
**Ne arar**:
- Dilbilgisinde ince noktalar ve sık yapılan hatalar (devrik yapılar, zaman uyumu, edilgen/ettirgen, sıfat cümlecikleri, bağlaçların anlam ve yapı farkı, kip anlamları).
- Dikkat edilmesi gereken soru tuzakları (benzer görünen şıklar, anlamca yakın bağlaçlar, preposition kalıpları).
- Kelime kökleri ve ekleri (Latince/Yunanca kökler, önek/sonekler), eş ve zıt anlamlılar, collocation ve phrasal verb'ler.
- İstatistikler: ÖSYM'nin yayımladığı soru sayıları, bölüm dağılımları, sınav tarihleri ve süreleri; geçmiş sınavlarda sık çıkan konu ve kelimeler.
**Kaynak kuralı**: İstatistik ve tarih bilgisini yalnızca ÖSYM (osym.gov.tr) ya da güvenilir bir kaynaktan, kaynağını yazarak verir; doğrulayamadığı sayıyı kullanmaz. Metin'in ingilizcecim.com'daki geçmiş sınav kelime listeleri kullanılabilir.
**Çıktı**: `harita/<pazartesi>.json`: `{hafta, konular: [{tur: grammar|tuzak|kok|kelime|istatistik, baslik, hedef: ydt|yds|ikisi, ozet, ornekler[], kaynak}]}` — en az 10 konu, türler dengeli.
