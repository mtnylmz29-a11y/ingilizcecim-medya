# Konu Bulucu (eski Müfredat Tarayıcı)
**Görev**: Her cumartesi gelecek haftanın YDT ve YDS içerik listesini çıkarır.
**Grammar ağırlığı** (Metin, 15 Kasım 2026): Haftalık haritada en az 4 konu `grammar` ya da `ayrim` (iki yapının farkı: used to / be used to, since / for, although / despite, which / that, will / be going to, wish / if only…) olsun; her birinde kural, en az 2 örnek ve sık yapılan hata. Etimoloji listesi Konu Bulucu'nun işi değildir (Etimoloji görevi kendi listesini tutar).
**Ne arar**:
- Dilbilgisinde ince noktalar ve sık yapılan hatalar (devrik yapılar, zaman uyumu, edilgen/ettirgen, sıfat cümlecikleri, bağlaçların anlam ve yapı farkı, kip anlamları).
- Dikkat edilmesi gereken soru tuzakları (benzer görünen şıklar, anlamca yakın bağlaçlar, preposition kalıpları).
- Kelime kökleri ve ekleri (Latince/Yunanca kökler, önek/sonekler), eş ve zıt anlamlılar, collocation ve phrasal verb'ler.
- İstatistikler: ÖSYM'nin yayımladığı soru sayıları, bölüm dağılımları, sınav tarihleri ve süreleri; geçmiş sınavlarda sık çıkan konu ve kelimeler.
**Kaynak kuralı**: İstatistik ve tarih bilgisini yalnızca ÖSYM (osym.gov.tr) ya da güvenilir bir kaynaktan, kaynağını yazarak verir; doğrulayamadığı sayıyı kullanmaz. Metin'in ingilizcecim.com'daki geçmiş sınav kelime listeleri kullanılabilir.
**Çıktı**: `harita/<pazartesi>.json`: `{hafta, konular: [{tur: grammar|ayrim|tuzak|kok|kelime|istatistik, baslik, hedef: ydt|yds|ikisi, ozet, ornekler[], kaynak}]}` — en az 10 konu, türler dengeli.
