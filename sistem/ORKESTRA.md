# ingilizcecim Instagram Ekibi — Ana Talimat

Bu dosya her zamanlanmış görevin ilk okuduğu talimattır. Görevin istemi bir **KİP** adı verir; sadece o kipin bölümünü ve adı geçen rol dosyalarını oku (token tasarrufu). Kontrol paneli: https://claude.ai/artifact/JBR2MPPkcc1HKeYUFRE6BR

## GÜNCELLEME 16 Kasım 2026 — SES: KORE VEYA VOICESTUDIO (Metin; aşağıdakilerin hepsinden önce gelir, "gece 2" ses kuralının yerine geçer)
- Metin: "Gemini Kore ve VoiceStudio ile oluşturulmuş ticari kullanıma açık sesler kabul edilecek."
- Kabul edilen seslendirme: (1) **Gemini TTS, ses 'Kore'** (bulutta varsayılan; ayarlar `hf/gen.py` → `gemini()`), (2) **VoiceStudio** ile üretilmiş, **modelinin lisansı ticari kullanıma açık** sesler (ör. VoxCPM2 — Apache-2.0; MOSS-TTS — Apache-2.0). Ayrıntı ve anlatıcı profili: `sistem/YEREL_URETIM.md` 4. madde.
- VoiceStudio'da ticari kullanıma kapalı modeller (ör. **OmniVoice**, CC-BY-NC) kullanılmaz. edge-tts ve Kokoro kullanılmaz.
- Kullanılan ses motoru ve lisansı `<ad>_kaynak.md`'ye ve kuyruktaki `uretim` alanına yazılır.
- Denetmen: Gemini 'Kore' ya da VoiceStudio + ticari lisanslı model dışındaki sesi (ya da motoru/lisansı belirtilmemiş sesi) DUZELT sayar.

## GÜNCELLEME 15 Kasım 2026 (gece 2) — SES: GEMINI 'KORE' (Metin; aşağıdakilerin hepsinden önce gelir)
- Metin: "Şu anki ses çok kötü, düzgün okumuyor." **Bütün videolar** (yerel, bulut, etimoloji, gönderi) **Gemini TTS, ses 'Kore'** ile seslendirilir. edge-tts ve Kokoro kullanılmaz; Gemini kotası dolarsa yedek sese geçme, işi bekletip Metin'e bildir. (16 Kasım: yerelde VoiceStudio + ticari lisanslı model de kabul; yukarıya bak.)
- Ayarlar `hf/gen.py` → `gemini()` ile aynı. Etimoloji (`etym-render.yml`) iş akışı da `GEMINI_API_KEY` secret'ıyla Gemini kullanacak şekilde güncellenir.
- ~~Denetmen, Gemini 'Kore' dışında bir sesle gelen videoyu DUZELT sayar.~~ (16 Kasım güncellemesiyle değişti: VoiceStudio + ticari lisanslı model de kabul.)

## GÜNCELLEME 15 Kasım 2026 (gece) — VİDEOLARI METİN'İN BİLGİSAYARI YAPAR, DENETİMİ DENETMEN YAPAR (Metin; bu bölüm aşağıdakilerin HEPSİNDEN önce gelir, "(akşam)" bölümüyle çelişirse geçerli olan budur)
- **Yerel üretim**: Videoları artık Metin'in bilgisayarındaki Claude Code, `lemo-opuscar` kütüphanesiyle üretir ve depoya yükler. Tarif: `sistem/YEREL_URETIM.md`. Yerel kayıtlar kuyrukta `"uretim": "yerel (…)"` ve `"durum": "denetimde"` olarak gelir.
- **Bulut yedeği (günde en fazla 1 video)**: Sabah Üretimi'nin 10:45 üretim görevi kapatıldı. Akşam Üretimi 11:15'te bakar: o günün tarihini taşıyan **herhangi bir** kuyruk kaydı (`YYYY-MM-DD-gonderi` ya da `YYYY-MM-DD-reels`) varsa hiçbir şey üretmez; yoksa yalnızca **bir** "Kelimelerin Tarihçesi" Reels'i (20:30) üretir. Bulutta üretilen video da "Görsel zenginlik standardı"na uyar.
- **Denetim artık Denetmen'in işi** (çapraz denetim kaldırıldı): Her üretim (yerel ya da bulut) `denetimde` olarak kuyruğa girer. "ingilizcecim · Denetmen denetimi" görevi (trig_01VBbs1s9v9f7EfTHqN69Noa) gün içinde düzenli çalışır, ayrıca bulut üretimi bitince tetiklenir. **KİP: DENETIM**: `denetimde` her kayıt için mp4'ü indir, en az 8 kare çıkar ve incele; bilgiyi en az 2 kaynakla bağımsız doğrula; yazım, ses, süre (35–60 sn), 1080×1920, dosya boyutu (<50 MB) ve "Görsel zenginlik standardı"nı kontrol et. GECTI → `onay_bekliyor` + `denetim` {denetci: "Denetmen", sonuc, notlar, zaman}. DUZELT → yerel kayıtta `yerel_duzeltme` + `duzeltme_notu` "[Denetmen] …" (Metin'e tek satır: "Bilgisayarındaki Claude Code'a 'düzeltmeleri yap' de."); bulut kaydında `duzeltme_istendi` + not ve Düzeltme görevini (trig_01LU8ENWGrVzqwBA7fh6hrsN) tetikle. 2 turdan sonra hâlâ sorun varsa `onay_bekliyor` yap ve kalan sorunları `denetim.notlar`a yaz.
- **KİP: DUZELTME**: not "[Denetmen]" (ya da eski "[… denetimi]") ile başlıyorsa düzeltmeden sonra `denetimde` yap ve Denetmen denetimini tekrar tetikle; Metin'in notuysa `onay_bekliyor`. Yerel kayıtların (`uretim` "yerel" ile başlar) videosu bulutta yeniden üretilmez; yalnızca açıklama/başlık gibi metin alanları bulutta düzeltilebilir, video düzeltmesi `yerel_duzeltme` ile Metin'e bırakılır.
- **YAYIN**: `denetimde` ve `yerel_duzeltme` kayıtlar yayınlanmaz. Yerel kayıtlar da diğerleri gibi yalnızca `onaylandi` iken, `onerilen_dilim` saatinde yayınlanır.
- Masalar: Sabah Üretimi = 17:30 yayını + düzeltmeler; Akşam Üretimi = bulut yedeği + 20:30 yayını + yorumlar; Denetmen = denetim + konu planı + haftalık rapor.

## GÜNCELLEME 15 Kasım 2026 (akşam) — 3 MASA, ÇAPRAZ DENETİM, GÖRSEL ZENGİNLİK (Metin; bu bölüm aşağıdakilerin HEPSİNDEN önce gelir)

### Üç masa
Ekip artık Metin'in Ofis sayfasında 3 masa olarak görünür (https://claude.ai/artifact/8Hr6tXMcgJwygX187PRtxM):
- **Sabah Üretimi**: 17:30 gönderisi — KİP: URETIM, KİP: DUZELTME (gönderi kayıtları), KİP: YAYIN 17:30.
- **Akşam Üretimi**: 20:30 Kelimelerin Tarihçesi Reels'i — KİP: ETIMOLOJI, KİP: DUZELTME (`-reels` kayıtları), KİP: YAYIN 20:30, KİP: TOPLULUK.
- **Denetmen**: KİP: TARAMA, KİP: IDARECI, genel istekler.
Metin masalara Ofis'ten mesaj yazar (`veri/istekler.json`, "ingilizcecim · Ofis mesajları" görevi).

### Çapraz denetim (Metin: "Sabah üretiminin ürünlerini akşam üretimi, akşam üretiminin ürünlerini sabah üretimi kontrol etsin.")
- Üretim bitince kaydı kuyruğa **`onay_bekliyor` değil `denetimde`** olarak yaz, Metin'e önizleme gönderme, sonra Claude_Code_Remote `fire_trigger` ile **trig_01VBbs1s9v9f7EfTHqN69Noa** ("ingilizcecim · Çapraz denetim") görevini tetikle. Üretim oturumunun kendi "Editör alt ajanı" adımı kalkar; `kalite.py` gibi otomatik kontroller ve kendi kare kontrolün devam eder.
- Sabah Üretimi'nin işini (gönderi) **Akşam Üretimi**, Akşam Üretimi'nin işini (`-reels`) **Sabah Üretimi** denetler. Denetçi üretimi görmemiş ayrı bir oturumdur.
- **KİP: CAPRAZ_DENETIM**: `denetimde` her kayıt için mp4'ü indir, en az 8 kare çıkar ve incele; bilgileri (etimoloji, dilbilgisi, örnekler) en az 2 kaynakla bağımsız doğrula; yazım, ses, süre ve aşağıdaki "Görsel zenginlik standardı"nı kontrol et. GECTI → `onay_bekliyor` + `denetim` {denetci, sonuc, notlar, zaman}. DUZELT → `duzeltme_istendi` + `duzeltme_notu` "[<masa> denetimi] …" + `denetim_turu`+1, Düzeltme görevini (trig_01LU8ENWGrVzqwBA7fh6hrsN) tetikle. 2 turdan sonra hâlâ sorun varsa `onay_bekliyor` yap ve kalan sorunları `denetim.notlar`a yaz.
- **KİP: DUZELTME**: not "[… denetimi]" ile başlıyorsa düzeltmeden sonra durumu yine `denetimde` yap ve Çapraz denetim'i tekrar tetikle; Metin'in notuysa eskisi gibi `onay_bekliyor`.
- **YAYIN**: `denetimde` kayıt asla yayınlanmaz. Yedek: URETIM/YAYIN başlarken 60 dakikadan eski `denetimde` kayıt görürsen Çapraz denetim'i tekrar tetikle.

### Görsel zenginlik standardı (Metin: "15 Kasım salary gibi görsel yönden zengin olsun"; 14 Kasım "çizgi film stili zorunlu" kuralının yerine geçer)
Zorunlu olan tek bir stil değil, **zenginliktir**. Her video:
- Bir **karakter ve hikâye** taşır: konuşan, mimiği değişen karakter(ler); yeri/dönemi belli sahne arka planları; en az 5 farklı sahne; kelime kelime çıkan, vurgulu altyazı; seslendirme. Sadece yazı, düz zemin ya da kart dizisi olan video **KALDI**.
- **Stil havuzu** (Metin'in örnekleri; aynı stil art arda en fazla 2 gün, haftada en az 3 farklı stil, kuyrukta `stil` alanına yaz):
  - **A · Resimli hikâye kitabı**: masal/çizgi roman kitabı tarzı, sıcak renkli, kâğıt dokulu çerçeveli kareler; karakter birinci ağızdan anlatır ("1300'lerde Venedik'te doğdum…"); yavaş zoom/kaydırma; serif altyazı. Etimoloji ve tarihî kişiler için ideal.
  - **B · Düz vektör skeç**: kalın konturlu, düz renkli yerel tipler (köylü, öğretmen, öğrenci, işçi), iki karakter diyaloğu, mimikler; köy evi, sınıf, şantiye gibi sahneler. "Yanlış/doğru" ve dilbilgisi gönderileri için ideal.
  - **C · Defter / doodle**: bej kâğıt, el yazısı başlık, iple birbirine bağlı "delil" kartları, sevimli maskot; dedektif anlatımı. Soru tuzakları için ideal.
  - **D · Stickman / minimal karakter**: basit çizgi karakterlerle hızlı, komik anlatım.
  - **E · HyperFrames `cizgi`** (gökyüzü, tabelalar): havuzdaki seçeneklerden biri.
  - **F · Koyu infografik anlatım** (Metin'in örneği, 15 Kasım): lacivert/gece mavisi zemin, ince ızgara dokusu; üstte küçük harfli seri adı ve sağda altın sarısı konu etiketi; büyük **sarı numara rozeti** + kalın başlık ("1 Reklam"); sahnede somut nesneler (telefon ekranı, kasa, kutu, ok) animasyonla dolar/boşalır; altta **1-2-3 adım çipleri** sırayla dolar; ortada tek kalın altyazı kelimesi ("Bir:"). Düzenli, sakin, net. "3 kullanım / 3 adım / 3 tuzak" gibi sayılı dilbilgisi ve sınav taktiği konuları için ideal. lemo-opuscar karşılıkları: `dark-keynote`, `swiss-motion`, `iso-infographic`. Yazı tek başına değil, her adımda bir nesne/animasyon olur.
- **Araçlar**: mevcut yol (GitHub Actions + HyperFrames/Remotion + TTS) devam eder. Ek olarak görüntü üretim modelleri (Elevenlabs `creative_generate_image`, Canva `generate-image`) ile sahne kareleri üretilebilir; aynı karakter için her karede aynı karakter tarifini kullan (tutarlılık). GitHub'daki açık kaynak animasyon/stickman/2D karakter repoları Actions'ta denenebilir. Yeni bir araç ilk kez kullanıldığında günlüğe not düş; çalışmazsa havuzdaki başka bir stile dön, yayın aksamasın.
- **Sınırlar**: başka hesapların karakterlerini, logosunu, filigranını, sesini ya da sahnelerini kopyalama — özgün karakterler. Yaşayan gerçek kişi çizilmez; tarihî kişiler serbest. Görüntü üretimi kredi harcar: video başına en fazla ~12 görüntü (tekrarlar dahil).

## GÜNCELLEME 15 Kasım 2026 — İŞ BÖLÜMÜ: EKİP 17:30, ETİMOLOJİ 20:30 (Metin; bu bölüm aşağıdakilerin hepsinden önce gelir)
Metin: "Sadece kelime üzerine olmasına gerek yok. Önemli grammar noktaları ya da ayrımları da olabilir… 2 gönderi yapalım. Birini sen yap birini agent ekibi yapsın."
- **Günde 2 paylaşım** (salı–pazar; pazartesi yayın yok):
  - **17:30 gönderi → ekip (KİP: URETIM).** Ekip artık yalnızca bu paylaşımı üretir; **Reels üretmez**. Konu kelimeyle sınırlı değildir: önemli bir dilbilgisi noktası, iki yapı arasındaki ayrım (ör. used to / be used to, since / for, although / despite, will / be going to, which / that), sık yapılan hata, kelime/collocation olabilir. Konu Bulucu'nun haritasından seçilir; haftada en az 3 gün grammar noktası ya da ayrımı olsun. Üretim: HyperFrames `"stil": "cizgi"` (aşağıdaki 14 Kasım bölümü).
  - **20:30 Reels → Etimoloji görevi (KİP: ETIMOLOJI, ekipten ayrı).** Her gün bir "Kelimelerin Tarihçesi" videosu. Talimat: **`sistem/VIDEO_ETIMOLOJI.md`**; örnek spec `gunler/2026-11-15/etym_salary.json`; kelime sırası `veri/etimoloji_listesi.json`. Üretim: spec → `.github/workflows/etym-render.yml` (Remotion + edge-tts) → `<kelime>_etym.mp4` + `<kelime>_etym_kareler.jpg`.
  - **Çeşitlilik (Metin, 15 Kasım: "Sürekli aynı tür video çıkmasın; konuya göre şekillendir, görsel, animatif, ilgi çekici olsun")**: her video `VIDEO_ETIMOLOJI.md` > "Çeşitlilik kuralları"na uyar — tema / giriş stili / müzik son 3 videodan farklı, en az 2 yeni olay tipi (sayaç, kayan yıldız, ekmek bölme, iplik, perde, sarsıntı…), ülkeler arası yolculukta dünya haritası. Her kelimenin `gorsel_oneri`si listede yazılı.
  - **Dünya turu biçimi** (14 Kasım Good morning videosu): `sistem/VIDEO_DUNYA.md`, spec `gunler/YYYY-MM-DD/dunya_<ad>.json` → `<ad>_dunya.mp4`. Etimoloji görevi haftada en fazla 1 kez, ekip 17:30'da da kullanabilir.
- **Görev istemleriyle çelişki**: URETIM görevinin isteminde Reels'ten söz eden cümleler 15 Kasım'dan önce yazıldı ve geçersizdir: URETIM Reels üretmez. 14 Kasım'daki "Remotion yasak" kuralı yalnızca ekibin 17:30 videosu içindir.
- Kuyruk: Etimoloji kaydı `id` = `YYYY-MM-DD-reels`, `bicim`: "animasyon", `uretim`: "etym (Remotion + edge-tts)", `seri`: "kelimelerin-tarihcesi", `onerilen_dilim`: "20:30", `mp4` = sha'lı raw adres, `kareler` = kontrol ızgarasının blob adresi. 20:30 YAYIN görevi bu kaydı diğer Reels gibi yayınlar.

## KİP: ETIMOLOJI (her gün 11:15, pazartesi hariç) — Etimoloji görevi (ekipten bağımsız)
1. `kuyruk.json`'u oku. Bugünün `YYYY-MM-DD-reels` kaydı varsa hiçbir şey üretme (iki kez üretme). Onaysız bekleyen etimoloji Reels'i 2 ya da daha fazlaysa üretme; günlüğe not düş.
2. `veri/etimoloji_listesi.json`'dan `bekliyor` durumundaki ilk kelimeyi al. Etimolojiyi listedeki nota ek olarak en az iki kaynaktan (etymonline, Merriam-Webster, Wiktionary, Oxford) doğrula; çelişki varsa kesin olmayanı "rivayete göre" yap ya da kelimeyi atla ve listeye not yaz.
3. `sistem/VIDEO_ETIMOLOJI.md`'ye göre spec'i ve açıklamayı yaz (örnekler: `gunler/2026-11-15/etym_salary.json`, `video/ornekler/etym_ozellik-1.json`, `etym_ozellik-2.json`). Önce listedeki son 3 `gorsel` kaydına ve kelimenin `gorsel_oneri`sine bak; çeşitlilik kurallarına uy. `gunler/YYYY-MM-DD/etym_<kelime>.json` ve `<kelime>_etym.txt` olarak yükle (Dünya turu seçildiyse `dunya_<ad>.json`, `VIDEO_DUNYA.md`). Actions'ı izle; SPEC HATASI varsa düzelt, en fazla 3 deneme.
4. **Editör** (Agent aracıyla ayrı bir alt ajan, üretimi görmemiş): `VIDEO_ETIMOLOJI.md` > Editör kontrolü. KALDI → düzelt, yeniden üret (en fazla 2 tur).
5. `kalite.json`'a (günün klasörü; varsa ekle) `reels` satırlarını yaz, kuyruğa `onay_bekliyor` olarak ekle, listede kelimeyi `uretildi` + tarih + `gorsel` kaydı (`tema`, `stil`, `muzik`, `zeminler`, `olaylar`, `harita`) yap. Yayınlama yok; Metin Onay Paneli'nden onaylar.
6. Listede 7'den az `bekliyor` kalırsa listeyi 7'ye tamamla (YDT/YDS'de geçen, kökeni ilginç kelimeler; `kesin` / `rivayet` / `zemin_onerisi` / `gorsel_oneri` alanlarıyla, kaynakla doğrulanmış; `gorsel_oneri` yalnızca katalogdaki zemin/kostüm/ikon/olay adlarını kullanır). Günlüğe 1–2 satır yaz.

## GÜNCELLEME 14 Kasım 2026 — ÇİZGİ FİLM STİLİ ZORUNLU (Metin; aşağıdakilerin hepsinden önce gelir)
- Metin: "Salak salak düz yazı yazıp gelsin istemiyorum." Bütün videolar (17:30 gönderi videosu ve 20:30 Reels) **çizgi film tarzında** üretilir: gökyüzü, kayan bulutlar, gülen güneş, tepeler, sallanan çiçekler; ipe asılı ahşap tabelalar sallanarak iner; büyük çizim (Fluent Emoji 3D) zıplayarak gelir; altyazılar kelime kelime çıkar. Örnek: 14 Kasım "thrive" Reels'i.
- Nasıl: HyperFrames spec'ine kökte `"stil": "cizgi"` yaz. Biçim ve sahne tipleri: `ICERIK_BICIMI.md` > "Çizgi film stili". Üretim aynı yol (spec'i `gunler/YYYY-MM-DD/hf_<ad>.json` olarak yükle → Actions → `<ad>_hf.mp4`).
- **Yasak**: koyu/düz zeminde sadece yazı olan video; tüm sahneleri `maddeler` olan video; `"stil": "cizgi"` olmayan spec; workbench'te, Remotion'da ya da başka bir araçla düz kart videosu. Her videoda en az 2 sahnede büyük çizim (`ikon`) olur ve en az bir `kelime` ya da `soru` sahnesi bulunur. `maddeler`/`kural` video başına en fazla 1 kez.
- Her video kendi içinde zemin değiştirir (ör. `cayir` → `senlik` → `gece`); gönderi ile Reels aynı gün farklı zemin sırası kullanır.
- Editör, çizgi film stilinde olmayan videoyu **KALDI** sayar ve yeniden ürettirir. Önizlemede Metin'e kareleri gösterirken çizimlerin ve tabelaların göründüğü kareleri seç.

## GÜNCELLEME 7 Kasım 2026 — HyperFrames + GitHub Actions + Türkçe ses (Metin onayı; aşağıdakilerle çelişirse geçerli olan budur)
- **Video üretimi** artık workbench'te değil, GitHub Actions'ta HyperFrames ile yapılır (workbench 1 GB bellek yetmiyor). Animasyonlu gönderi ve Reels için `anim.py` yerine bu yol kullanılır; `anim.py` yalnızca Actions çalışmazsa yedektir. Quiz günlerindeki kaydırmalı carousel `render_wb.py` ile aynen devam eder.
- **Akış**: İçerik Yazarı spec'i `gunler/YYYY-MM-DD/hf_gonderi.json` ve `hf_reels.json` olarak yazar (biçim: `ICERIK_BICIMI.md` > HyperFrames). Dosyayı depoya yüklemek `.github/workflows/hf-render.yml` işini başlatır; 6–12 dakika sonra `gunler/YYYY-MM-DD/<ad>_hf.mp4` ve `<ad>_hf_check.json` depoya gelir. İlerlemeyi `proxy_execute("GET","/repos/mtnylmz29-a11y/ingilizcecim-medya/actions/runs","github")` ile izle (her kontrol ayrı hücre, 180 sn sınırı). Hata olursa iş günlüğünü oku (`/actions/jobs/<id>/logs`), düzelt ve spec'i yeniden yükle ya da `workflow_dispatch` (`inputs.spec`) ile tekrar çalıştır.
- **Ses**: Gemini TTS (`GEMINI_API_KEY` GitHub secret'ı), ses "Kore". Türkçe açıklamalar Türkçe okunur (`ses`, `ses_tr`), örnek cümleler İngilizce. Ücretsiz katman dakikada ~3 istek: her satır ayrı istek olduğu için video başına satır sayısını düşük tut (Reels'te en fazla ~12 ses satırı). Okunan satırlar `hf/ses_cache/` altında saklanır, tekrar çalıştırmada yeniden istenmez. Kota dolarsa video yine üretilir: İngilizce satırlar Kokoro ile okunur, Türkçe satırlar sessiz kalır (iş günlüğünde "UYARI: Gemini TTS kullanilamadi"). Bu durumda önizlemede Metin'e açıkça belirt.
- **Süre**: hedef 35–55 sn. `ses_tr` cümleleri kısa olsun (ör. "Mitigate: hafifletmek.").
- **Editör**: mp4'ü indirip karelerini çıkarır (workbench'te `imageio_ffmpeg`), en az geçiş anlarına ve son hâllere bakar; ses akışının var olduğunu ve süresini kontrol eder. Sesi dinleyemediğini önizlemede belirt.
- **Kuyruk**: `mp4` alanına render commit'inin sha'lı raw adresi yazılır (`.../<sha>/gunler/.../<ad>_hf.mp4`). Önizlemede mp4'ler SendUserFile ile gönderilir.
- **Tasarım**: 14 Kasım'dan beri çizgi film stili zorunlu (yukarıdaki güncelleme); sahne tiplerini çeşitlendir (kelime, esanlam, soru, kural).

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
