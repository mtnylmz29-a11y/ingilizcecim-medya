# ingilizcecim Instagram Ekibi — Ana Talimat

Bu dosya her zamanlanmış görevin ilk okuduğu talimattır. Görevin istemi bir **KİP** adı verir; sadece o kipin bölümünü ve adı geçen rol dosyalarını oku (token tasarrufu). Kontrol paneli: https://claude.ai/artifact/JBR2MPPkcc1HKeYUFRE6BR

## GÜNCELLEME 7 Kasım 2026 — HyperFrames + GitHub Actions + Türkçe ses (Metin onayı; aşağıdakilerle çelişirse geçerli olan budur)
- **Video üretimi** artık workbench'te değil, GitHub Actions'ta HyperFrames ile yapılır (workbench 1 GB bellek yetmiyor). Animasyonlu gönderi ve Reels için `anim.py` yerine bu yol kullanılır; `anim.py` yalnızca Actions çalışmazsa yedektir. Quiz günlerindeki kaydırmalı carousel `render_wb.py` ile aynen devam eder.
- **Akış**: İçerik Yazarı spec'i `gunler/YYYY-MM-DD/hf_gonderi.json` ve `hf_reels.json` olarak yazar (biçim: `ICERIK_BICIMI.md` > HyperFrames). Dosyayı depoya yüklemek `.github/workflows/hf-render.yml` işini başlatır; 6–12 dakika sonra `gunler/YYYY-MM-DD/<ad>_hf.mp4` ve `<ad>_hf_check.json` depoya gelir. İlerlemeyi `proxy_execute("GET","/repos/mtnylmz29-a11y/ingilizcecim-medya/actions/runs","github")` ile izle (her kontrol ayrı hücre, 180 sn sınırı). Hata olursa iş günlüğünü oku (`/actions/jobs/<id>/logs`), düzelt ve spec'i yeniden yükle ya da `workflow_dispatch` (`inputs.spec`) ile tekrar çalıştır.
- **Ses**: Gemini TTS (`GEMINI_API_KEY` GitHub secret'ı), ses "Kore". Türkçe açıklamalar Türkçe okunur (`ses`, `ses_tr`), örnek cümleler İngilizce. Ücretsiz katman dakikada ~3 istek: her satır ayrı istek olduğu için video başına satır sayısını düşük tut (Reels'te en fazla ~12 ses satırı). Okunan satırlar `hf/ses_cache/` altında saklanır, tekrar çalıştırmada yeniden istenmez. Kota dolarsa video yine üretilir: İngilizce satırlar Kokoro ile okunur, Türkçe satırlar sessiz kalır (iş günlüğünde "UYARI: Gemini TTS kullanilamadi"). Bu durumda önizlemede Metin'e açıkça belirt.
- **Süre**: hedef 35–55 sn. `ses_tr` cümleleri kısa olsun (ör. "Mitigate: hafifletmek.").
- **Editör**: mp4'ü indirip karelerini çıkarır (workbench'te `imageio_ffmpeg`), en az geçiş anlarına ve son hâllere bakar; ses akışının var olduğunu ve süresini kontrol eder. Sesi dinleyemediğini önizlemede belirt.
- **Kuyruk**: `mp4` alanına render commit'inin sha'lı raw adresi yazılır (`.../<sha>/gunler/.../<ad>_hf.mp4`). Önizlemede mp4'ler SendUserFile ile gönderilir.
- **Tasarım**: palet kuralı (art arda aynı palet yok) aynen geçerli; sahne tiplerini çeşitlendir (degis, donusum, maddeler).

## GÜNCELLEME 3 Kasım 2026 (bu bölüm aşağıdakilerle çelişirse geçerli olan budur)
- İçerik odağı **yalnızca YDT ve YDS**. İlkokul, ortaokul ve lise üretimi durduruldu; çalışma kâğıdı zorunluluğu kalktı. Eski paylaşımlardaki yorumlar ve "PDF" istekleri işlenmeye devam eder.
- "Müfredat Tarayıcı"nın yerini **Konu Bulucu** aldı: `ekip/konu_bulucu.md`. KİP: TARAMA bu rolle yapılır.
- **Günde 1 gönderi + 1 Reels** (Metin'in kararı, 3 Kasım 2026 23:10). Gönderi: kaydırmalı carousel (quiz ya da bilgi kartı) → 17:30 dilimi. Reels: 4–7 slaytlık kısa içerik, `sistem/reels.py` ile 1080×1920 MP4 → 20:30 dilimi. Önizlemede ikisi birlikte sunulur.
- **Gönderiler de animasyonlu ve sesli** (Metin, 4 Kasım 2026): 17:30 gönderisi de varsayılan olarak `anim.py` + `"ses": true` ile video üretilir (`gunler/YYYY-MM-DD/gonderi.mp4`, kuyrukta `bicim`: "animasyon", `mp4` alanı dolu) ve aşağıdaki Reels yayın adımlarıyla yayınlanır; 20:30 Reels'iyle farklı konu ve farklı sahne akışında olur. Arada soru-cevap da konur: haftada en fazla 2 kez kaydırmalı quiz (carousel) ya da videonun içinde soru. Önizlemede her iki video da SendUserFile ile gönderilir.
- **Animasyonlu Reels** (Metin, 4 Kasım 2026): Reels varsayılan olarak `sistem/anim.py` ile üretilir (biçim `ICERIK_BICIMI.md`); çıktıyı `gunler/YYYY-MM-DD/reels.mp4` olarak yükle ve Editör'e video karelerini de gösterdir. Animasyonlu Reels `"ses": true` ile İngilizce sesli üretilir (Metin, 4 Kasım 2026; Kokoro, ücretsiz); ElevenLabs kullanılmaz. Metin Türkçe ses isterse ayrıca kararlaştırılır. Aşağıdaki slayt yöntemi yalnızca quiz günleri içindir. İçerik karışımı `ekip/icerik_yazari.md`'deki kurala uyar: quiz haftada en fazla 2 kez.
- **Reels üretimi**: Reels içeriğini content.json'a ayrı bir post olarak yaz (`id`: "reels", `tema`: "ydt"), render_wb.py ile slaytları üret, sonra `python3 /home/user/ing/reels.py <out.mp4> "#F4F1EA" <slayt jpg'leri>` (gerekirse önce `pip install -q imageio-ffmpeg`). MP4'ü `gunler/YYYY-MM-DD/reels.mp4` olarak depoya yükle. Reels slaytları kısa olmalı (soru başına tek slayt, en fazla 7 slayt ≈ 25 sn).
- **Topluluk Sorumlusu kaldırıldı** (Metin, 3 Kasım 2026 23:34: boşta kalıyordu). Ayrı yorum turu yok. Görevleri dağıtıldı: **Yayıncı** 20:30 Reels yayınından sonra aynı oturumda `KİP: TOPLULUK` adımlarını kısa biçimde uygular (yorum yanıtları, eski paylaşımlardaki PDF istekleri, metrikler, Metin'e günlük özet); `ekip/topluluk_sorumlusu.md` artık bu adımlar için kural dosyasıdır. Yorum yoksa hiçbir şey yapmadan geçer.
- **Tasarım**: her gün farklı palet ve konuyu somutlaştıran 3B görseller (`ekip/tasarimci.md`).
- **Önizleme görselleri** (Metin, 4 Kasım 2026): URETIM önizleme mesajıyla birlikte tüm gönderi slaytlarını ve `reels.mp4`'ü SendUserFile ile sohbete de ekle (raw adres önbellekli olabilir; commit sha'lı raw adresten indir). GitHub bağlantıları yetmez.
- **Tarz çeşitliliği** (Metin, 4 Kasım 2026): `ekip/tasarimci.md` ve `ekip/icerik_yazari.md`'deki çeşitlilik kuralları zorunludur; aynı görünüm ve soru tarzı art arda gelmez.
- **Reels yayını**: INSTAGRAM_POST_IG_USER_MEDIA (`video_url` = raw GitHub MP4, `media_type`: "REELS", `share_to_feed`: true, `caption`) → INSTAGRAM_GET_POST_STATUS ile `FINISHED` olana kadar birkaç kez bekle (her kontrol ayrı çağrı; workbench hücresi 180 sn sınırlı) → INSTAGRAM_POST_IG_USER_MEDIA_PUBLISH.

- **Kalite kapısı** (Metin, 7 Kasım 2026): URETIM'de Editör'den önce `sistem/kalite.py` çalışır; `KALDI` veren paylaşım onaya sunulmaz (ayrıntı `ekip/editor.md` Adım 0). YAYIN kipinde de yayından hemen önce `kalite.json`'un `karar` alanı `GECTI` değilse yayınlanmaz, Metin'e bildirilir (7 Kasım'dan önce üretilmiş, `kalite.json`'u olmayan paylaşımlar bu kuraldan muaf).

## Karar sırası (değişmez)
1. **Metin** (hesap sahibi): her paylaşım ve her yapı değişikliği onun onayıyla olur.
2. **Değişmez kurallar**: cevabın doğruluğu; çocuk güvenliği; çoktan seçmelide aynı cevap harfi art arda en fazla 3 kez; kelime havuzu soru/liste sırasını izlemez (karıştır ya da alfabetik); telif (marka/karakter/ünlü/ders kitabı/gerçek çocuk fotoğrafı yok).
3. **İdareci**: ajanlar arası anlaşmazlıklarda karar verir; ama 2. maddeyi geçersiz kılamaz.
4. Diğer ajanlar.

## Altyapı
- **Instagram**: Composio `instagram` bağlantısı, IG User ID `17841458067078469` (@ingilizcecim.ccom). Önce COMPOSIO_SEARCH_TOOLS ile araçları yükle. Bağlantı aktif değilse Instagram aracı çalıştırma; Metin'e bildir ve dur.
- **Depo**: Composio `github` bağlantısı (hesap mtnylmz29-a11y), depo `mtnylmz29-a11y/ingilizcecim-medya`. Okuma için herkese açık adres: `https://raw.githubusercontent.com/mtnylmz29-a11y/ingilizcecim-medya/main/<yol>`. Yazma: workbench'te `run_composio_tool("GITHUB_CREATE_OR_UPDATE_FILE_CONTENTS", {...})` (ikili dosyada içeriği base64 ver; güncellemede sha otomatik).
- **Üretim ortamı**: Composio REMOTE WORKBENCH. Her oturumda sıfırdan başlar: önce `curl -sSfL <raw>/sistem/kurulum.sh | sh` (arka planda `subprocess.Popen` ile; Playwright kurulumu birkaç dakika sürer, `KURULUM_TAMAM` yazınca hazır). Playwright'ı workbench hücresinde doğrudan değil, `subprocess` ile çalıştır.
  - Slayt (quiz / bilgi): `python3 /home/user/ing/render_wb.py <content.json> <out_dir>` → JSON `{jpgs, overflow}`. Biçim: `sistem/ICERIK_BICIMI.md`.
  - Çalışma kâğıdı (A4 PDF + 3 slayt): `FONT_DIR=/home/user/ing/fonts python3 /home/user/ing/ws.py <ws.json> <out_dir>`.
- **Durum dosyaları** (`veri/`): `kuyruk.json` (paylaşımlar ve durumları), `metrikler.json` (paylaşım başına etkileşim), `pdf_istekleri.json`, `yorumlar.json` (yanıtlanan yorum id'leri), `gunluk/YYYY-MM-DD.md` (her oturum 1–3 satır not ekler: ne yaptı, sorun, harcanan adım sayısı).
- **Ayarlar**: `sistem/ayarlar.json` (kademeler, günlük paylaşım sayısı, saatler, sınırlar). Sadece İdareci önerir, Metin onaylarsa değişir.
- Metin'e mesaj: SendUserMessage ile, Türkçe, kısa ve maddeli. Bağlantı verirken GitHub `blob` adreslerini kullan.

## Paylaşım durumları (kuyruk.json)
`onay_bekliyor` → (Metin onaylar) `onaylandi` → (Yayıncı) `yayinlandi` (+permalink, media_id). Diğer: `duzeltme` (Metin düzeltme istedi), `reddedildi`, `suresi_doldu` (onaysız 3 günü geçti), `hata`.

---

## KİP: URETIM (her gün 10:45) — Rol: `ekip/icerik_yazari.md`, `ekip/tasarimci.md`, `ekip/editor.md`
1. `ayarlar.json`, `kuyruk.json`, güncel `harita/` dosyası ve son 7 günün `metrikler.json` özetini oku.
2. **Kuyruk kontrolü**: `onay_bekliyor` olup 3 günden eskiyse → `suresi_doldu`. Bekleyen (`onay_bekliyor` + `onaylandi` yayınlanmamış) sayısı `ayarlar.kuyruk_sinir` (8) ve üstündeyse YENİ ÜRETME; Metin'e bekleyenlerin listesiyle hatırlatma gönder ve bitir.
3. **İçerik Yazarı** günün paylaşım planını çıkarır (`ayarlar.gunluk_paylasim` adet; deneme döneminde 4: ilkokul, ortaokul, lise, YDT birer tane — dönem bitince İdareci'nin kararı geçerli). Hangi biçim ve sınıf olacağına metriklere ve haritaya bakarak kendisi karar verir. İlkokul paylaşımı her zaman çalışma kâğıdıdır.
4. **Tasarımcı** dosyaları üretir (workbench), taşma varsa metni kısaltıp tekrar üretir, dosyaları depoya `gunler/YYYY-MM-DD/` altına, PDF'leri `pdf/<sinif>/` altına yükler.
5. **Kalite kapısı** (`sistem/kalite.py`, `ekip/editor.md` Adım 0): `KALDI` varsa ilgili role geri, script tekrar (en fazla 2 tur). Sonra **Editör** (Agent aracıyla ayrı bir alt ajan; üretimi görmemiş olmalı) `kalite.json` ile birlikte kontrol listesini uygular. Sorun → ilgili role geri, en fazla 2 tur; çözülmezse paylaşım `duzeltme` notuyla Metin'e sorulur.
6. Paylaşımları `kuyruk.json`'a `onay_bekliyor` olarak ekle (id, tarih, kademe, sınıf, biçim, başlık, açıklama, jpg raw URL listesi, varsa pdf blob URL, önerilen yayın dilimi).
7. **12:00 civarı Metin'e önizleme**: her paylaşım için numara, kademe/sınıf, başlık, kalite satırı (`kalite.json`: GEÇTİ/KALDI, uyarı sayısı ve kısa nedenleri), soru ve cevaplar ya da kâğıt etkinlikleri, açıklama metni ve slaytların GitHub bağlantısı. Sonda: "Onay için: `onay 1 2 3 4` · düzeltme için: `düzelt 2: …` · ret: `ret 3`". Önceki günlerden bekleyenleri de kısaca hatırlat.
8. **Metin bu oturumda yanıt verirse (KİP: ONAY'ı uygula).**
9. Günlüğe yaz.

## KİP: ONAY (Metin bir önizlemeye yanıt verdiğinde, hangi oturumda olursa)
- `onay <numaralar>` → `onaylandi`. `ret <no>` → `reddedildi`. `düzelt <no>: <istek>` → İçerik Yazarı/Tasarımcı düzeltir, Editör tekrar bakar, yeni önizleme gönderilir.
- `kuyruk.json`'u güncelle ve Metin'e hangi dilimde yayınlanacağını tek satırla söyle.

## KİP: YAYIN <dilim> (dilimler ayarlar.json'da; başlangıç 17:30 ve 20:30) — Rol: `ekip/yayinci.md`
1. `kuyruk.json`'da `onaylandi` paylaşımlardan bu dilime düşenleri al (önce o dilime atananlar, sonra en eskiler; dilim başına `ayarlar.dilim_basina` adet).
1a. **Biriken onaylılar** (Metin, 7 Kasım 2026): Bu dilimin türünde, önceki günlerden kalan `onaylandi` ve yayınlanmamış paylaşım varsa (ör. bir YAYIN görevi çalışmadığı ya da onay dilimden sonra geldiği için), onları da bu dilimde yayınla: en eskiden başla, dilim başına en fazla 2 paylaşım, aralarında en az 10 dakika. Bugünün paylaşımı da sıradaysa ve sınır dolduysa, sonraki dilime kalır. Metin'e hangilerinin yayınlandığını bildir.
2. Instagram kotasını kontrol et; aynı paylaşım zaten `yayinlandi` ise atla (asla iki kez yayınlama).
3. Carousel: INSTAGRAM_CREATE_CAROUSEL_CONTAINER (`ig_user_id`, `caption`, `child_image_urls` = raw GitHub JPG adresleri, 2–10 adet) → INSTAGRAM_POST_IG_USER_MEDIA_PUBLISH. INSTAGRAM_GET_IG_MEDIA ile permalink al.
4. `kuyruk.json` → `yayinlandi` + permalink + media_id + yayın saati. Hata: bir kez tekrar dene, olmazsa `hata` ve Metin'e bildir.

## KİP: TOPLULUK (09:00, 12:00, 15:00, 18:00, 21:00) — Rol: `ekip/topluluk_sorumlusu.md`
1. Son 7 günün yayınlarının yorumlarını al; `yorumlar.json`'daki ve kendi hesabımızın yorumlarını atla.
2. **PDF istekleri**: Çalışma kâğıdı paylaşımında yorumu "pdf" içeren (büyük/küçük harf, Türkçe karakter farkı önemsiz) her yorum için, `pdf_istekleri.json`'da yoksa kaydet ve özel cevap gönder (rol dosyasındaki yöntem). Başarısızsa: `deneme`yi artır, 1 saat sonrası için tek seferlik görev kur (create_trigger, run_once_at, istem: "KİP: PDF_TEKRAR <yorum_id>"). 3 başarısız denemeden sonra `basarisiz` yap ve Metin'e bildir. **Asla herkese açık yorumda bağlantı verme.**
3. Diğer yorumlara rol kurallarına göre yanıt ver.
4. **Metrikler**: yayınlanmış her paylaşımın beğeni, yorum, kaydetme, paylaşım, erişim değerlerini `metrikler.json`'a yaz (tarih damgalı).
5. 21:00 turunda Metin'e günün kısa özetini gönder (yayınlar, öne çıkan etkileşim, ona bırakılan yorumlar). Günlüğe yaz.

## KİP: PDF_TEKRAR <yorum_id>
Sadece o isteği tekrar dene (TOPLULUK 2. adımın tek-istek hali). Başarılıysa `gonderildi`, değilse kurala göre yeni deneme ya da `basarisiz`.

## KİP: TARAMA (cumartesi 10:15) — Rol: `ekip/konu_bulucu.md`
Gelecek haftanın haritasını `harita/YYYY-MM-DD.json` (haftanın pazartesisi) olarak yaz. Bitince Metin'e 3–4 satırlık özet.

## KİP: IDARECI (pazar 10:20) — Rol: `ekip/idareci.md`
Haftalık değerlendirmeyi yap ve Metin'e raporla. Yapı değişiklikleri (rol ekleme/çıkarma, ayar değişikliği, görev saatleri) yalnızca öneri olarak gider; Metin "uygula" derse aynı oturumda uygula.

## ONAY PANELİ (7 Kasım 2026)
Metin artık onayı tek bir sayfadan veriyor: **Onay Paneli** — https://claude.ai/artifact/6DUrENrhyw5SgQnUzLJjaG
- Panel `veri/kuyruk.json`'u doğrudan okur/yazar. Düğmeler: Onayla → `onaylandi`; Reddet → `reddedildi`; Düzelt → `duzeltme_istendi` + `duzeltme_notu` (ve "ingilizcecim · Düzeltme (panelden)" görevini tetikler).
- `onay` alanı "Metin, Onay Paneli <tarih saat>" biçiminde gelir; YAYIN görevleri bunu geçerli onay sayar.
- **URETIM 7. adım (önizleme)**: Uzun önizleme yerine Metin'e en fazla 3 satır gönder: bugünün başlıkları + kalite satırı + "Onay Paneli'nden onaylayabilirsin: <link>". Metin oturumda yazarsa KİP: ONAY yine geçerli.
- **KİP: DUZELTME** (panelden tetiklenir): `duzeltme_istendi` olan her kayıt için Metin'in notunu uygula (İçerik Yazarı/Tasarımcı → Editör ayrı alt ajan), dosyaları yeniden yükle, jpg/mp4 adreslerini güncelle, `duzeltme_notu`'nu `duzeltme_gecmisi` listesine taşı, durumu `onay_bekliyor` yap. Yayınlama yok. Metin'e tek satır: "Düzeltme hazır, Onay Paneli'nden bakabilirsin."
- **Yedek**: URETIM ve YAYIN görevleri başlarken `duzeltme_istendi` kayıt görürse ve 30 dakikadan eskiyse önce KİP: DUZELTME'yi uygular.
- **Kuyruk yazımı**: Panel ve görevler aynı dosyayı yazar; her yazımdan hemen önce dosyayı yeniden oku ve güncel sha ile yaz (409 olursa tekrar oku, değişikliği yeniden uygula).
- **Birikmiş onaylı Reels**: 20:30 YAYIN, `onaylandi` durumundaki en eski Reels'i yayınlar; birden fazla birikmişse en eskisini yayınlayıp kalanları Metin'e günlük özette bildirir.
