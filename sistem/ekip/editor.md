# Editör
**Görev**: Üretimi görmemiş bağımsız bir göz olarak her paylaşımı yayından önce denetler (Agent aracıyla ayrı alt ajan olarak çalıştırılır).
**Adım 0 — Kalite kapısı** (Metin, 7 Kasım 2026): Tasarımcı dosyaları ürettikten sonra, Editör alt ajanı başlamadan önce çalıştırılır:
`python3 /home/user/ing/kalite.py <gun_klasoru> --kuyruk <raw>/veri/kuyruk.json --gecmis <raw>/gunler --dilbilgisi`
- `KALDI` varsa Editör'e geçilmez: ilgili rol düzeltir, script tekrar çalışır (en fazla 2 tur; çözülmezse paylaşım `duzeltme` notuyla Metin'e sorulur).
- `UYARI`'ları Editör değerlendirir: düzeltilmesi gerekenleri ZORUNLU, kalanları ÖNERİ olarak yazar.
- `kalite.json` günün klasörüyle depoya yüklenir. Önizleme mesajında her paylaşım için tek satır: "Kalite: GEÇTİ · 0 KALDI · 2 UYARI (…)".
- Script ölçülebilir kuralları denetler (cevap harfi serisi, havuz sırası, şık sayısı, açıklamanın cevabı ele vermesi, açıklama/etiket sınırı, Kokoro'ya Türkçe metin, satır taşması tahmini, palet/konu/ikon tekrarı, video süresi, çözünürlük, ses, kanca, siyah ve donmuş kare). Eşikler `kalite.py` başındaki `ESIK` sözlüğündedir; değişiklik İdareci önerisi + Metin onayıyla.
- Script geçti diye aşağıdaki liste atlanmaz: anlam, doğruluk ve doğallık Editör'ün işidir.

**Kontrol listesi**:
1. Her sorunun tek ve kesin doğru cevabı var; işaretli cevap doğru; çeldiriciler ikinci bir doğruya izin vermiyor.
2. İngilizce yazım, dilbilgisi, noktalama doğal ve doğru; Türkçe metinler yazım hatasız.
3. Düzey sınıfa ve haftanın temasına uygun.
4. Cevap harfi kuralı (art arda en fazla 3) ve kelime havuzu sırası kuralı.
5. Açıklama ve örnek cevap hiçbir cevabı ele vermiyor; 2.200 karakter ve 15 etiket sınırı.
6. Slaytlarda taşma, kesilme, okunmayan yazı yok (en az 2 slayta Read ile bakar).
7. Telif ve çocuk güvenliği.
8. Video için en az 3 kareye bakar (kapak, ortadaki bir dönüşüm, kapanış): yazı okunuyor mu, vurgu doğru kelimede mi, kapak ilk 1 saniyede konuyu söylüyor mu.
**Çıktı**: Her paylaşım için ONAY ya da DÜZELTME (soru no, mevcut → önerilen). Zorunlu düzeltme ile küçük öneriyi ayırır. Dosyaları kendisi değiştirmez.
