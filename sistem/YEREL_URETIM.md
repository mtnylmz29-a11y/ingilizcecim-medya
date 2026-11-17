# ingilizcecim — Bilgisayarda video üretimi (Claude Code için tarif)

Bu dosyayı Metin'in bilgisayarındaki (Windows) Claude Code okur ve uygular. Amaç: ingilizcecim.com Instagram hesabı için **YDT/YDS İngilizce** konulu, görsel olarak zengin, dikey bir video üretmek ve buluttaki ekibin denetleyip saatinde yayınlayabileceği şekilde GitHub'a yüklemek. Metin işin başında beklemez: **soru sorma**, kararları kendin ver, sonunda kısa bir özet yaz.

## 1. Klasörler (Windows, kullanıcı: Metin)

| Ne | Yer |
|---|---|
| Video kütüphanesi (lemo-opuscar) | `C:\Users\Metin\lemo-opuscar` (zaten kurulu; `LIB` budur) |
| Ekibin GitHub deposu (yerel kopya) | `E:\ingilizcecim\ingilizcecim-medya` — yoksa: `git clone https://github.com/mtnylmz29-a11y/ingilizcecim-medya.git E:\ingilizcecim\ingilizcecim-medya` |
| Film çalışma klasörleri | `E:\ingilizcecim\filmler\<YYYY-MM-DD>-<kisa-ad>\` (her video için ayrı klasör; küçük harf, rakam, tire) |
| Depoya yüklenecek son dosyalar | `E:\ingilizcecim\ingilizcecim-medya\gunler\<YYYY-MM-DD>\` |

**Klasörleri kendin oluştur**: `E:\ingilizcecim`, `E:\ingilizcecim\filmler`, `E:\ingilizcecim\tmp` yoksa aç (PowerShell: `New-Item -ItemType Directory -Force <yol>`); depo yoksa klonla. Metin'den klasör açmasını isteme.

C: diskinde yer yok: depo, film klasörleri ve tüm geçici/ara dosyalar (render kareleri, ses parçaları, npm/pip önbellekleri dahil) **E: diskinde** tutulur; C:'ye yeni dosya yazma. Kütüphane `C:\Users\Metin\lemo-opuscar`'da kalır ama çıktıları her zaman E:'deki film klasörüne gider. Gerekirse `TEMP`/`TMP` değişkenlerini `E:\ingilizcecim\tmp` yap.

Her işe başlamadan önce depoda `git pull` yap. Çalışma dosyaları (TREATMENT.md, kareler, ses parçaları) film klasöründe kalır; depoya **yalnızca** aşağıdaki son dosyalar gider.

## 2. Hangi gün, hangi saat?

- **Hedef gün**: saat 11:00'den önce çalışıyorsan bugün, sonra çalışıyorsan yarın (Europe/Istanbul). Metin başka bir gün söylerse o gün.
- **Slot**: varsayılan **20:30** (kayıt id'si `YYYY-MM-DD-reels`). Metin "17:30" ya da "iki video" derse 17:30 için id `YYYY-MM-DD-gonderi`.
- `veri\kuyruk.json`'da o id zaten varsa o slot dolu: bir sonraki boş güne geç ve bunu özette söyle.
- Neden 11:00: buluttaki ekip 11:15'te bakar; o gün için senin videon yoksa **yedek olarak kendisi tek video** üretir.

## 3. Konu

- Seviye: **YDT ve YDS** (12. sınıf ve üniversite). İlkokul/ortaokul konusu yok.
- 20:30 slotunun varsayılanı **"Kelimelerin Tarihçesi"** serisidir: `veri\etimoloji_listesi.json`'da durumu `bekliyor` olan ilk kelimeyi al. Etimolojiyi **en az iki kaynaktan** doğrula (etymonline, Merriam-Webster, Wiktionary, Oxford). Kesin olmayan hikâye "rivayete göre", mitoloji "efsaneye göre" diye anlatılır ve ekranda da öyle yazılır. Bitince listede kelimeyi `uretildi` + tarih + `"uretim": "yerel"` yap.
- 17:30 slotu: bir dilbilgisi inceliği, sık karıştırılan ikili (so/such, used to/be used to, since/for…), soru tuzağı ya da kelime/collocation. Konu fikri için `harita\` klasöründeki en yeni haftalık haritaya bak.
- Son 14 günün kuyruk kayıtlarıyla aynı konu ve aynı kelime olmaz.

## 4. Video nasıl yapılır (lemo-opuscar)

1. `C:\Users\Metin\lemo-opuscar\AGENTS.md`, `DIRECTOR.md` ve `TECHNIQUE.md`'yi oku; kütüphanenin yöntemini izle (treatment → üretim → teslim). Kütüphane bir soru turu ister: **sorma**, aşağıdaki varsayılanlarla kendin karar ver.
2. **Stil seç** (`styles\README.md`). Son 3 kuyruk kaydının `stil` alanından farklı olsun; aynı stil art arda en fazla 2 gün. Bu hesaba uyan, görüntü üretecine ihtiyaç duymayan stiller:
   - Hikâye ve karakter: `crayon-book` (pastel boya resimli kitap), `watercolor`, `urban-sketch`, `paper-popup`, `isometric-picture-book`, `shadow-puppet`
   - Çizgi film: `midcentury-toon` (50'ler düz çizgi film), `rubber-hose` (1930'lar çizgi film), `scifi-toon`
   - Anlatım / ders: `stick-explainer` (stickman), `whiteboard`, `chalkboard`, `sketchnote`, `ipad-sketch`, `marker-paper`
   - Koyu infografik anlatım (Metin'in beğendiği örnek): `dark-keynote` / `swiss-motion` / `iso-infographic` — lacivert zemin, sarı numara rozeti + kalın başlık, telefon/kasa gibi nesneler, altta dolan 1-2-3 adım çipleri, ortada tek kalın altyazı kelimesi. Sayılı konular ("3 kullanım", "3 tuzak") için.
   - ✦ işaretli stiller (`comic-history`, `manga-panels`) bir görüntü üreteci ister; bilgisayarda kurulu ve çalışan bir görüntü aracı yoksa seçme.
   - **Animasyon türü de dönüşümlü** (Metin, 2026-11-16): karakterlerin çizim tipi ara sıra değişsin, art arda iki video aynı tipte olmasın. Yukarıdaki stillere ek olarak koda dökülebilen şu türler de kullanılır: **pixel art**, **PS2 dönemi low-poly 3D**, **çizgi roman (comic book)**, **3D CGI** (yumuşak ışıklı, Pixar benzeri ama özgün karakterler), **flat vector**, **oyuncak tuğla / minifigür tarzı** (LEGO adı, logosu ve resmî figürleri kullanılmaz), **clay 3D** (hamur animasyonu). 3D türler için three.js ya da Blender gibi yerel bir araç gerekir; bu türleri ilk kez yaparken önce kısa bir deneme karesi çıkar. Kuyruk kaydının `stil` alanına türü de yaz (ör. `pixel-art`).
   - Etimoloji için iyi eşleşmeler: `crayon-book`, `watercolor`, `shadow-puppet`, `urban-sketch` (kelime birinci ağızdan anlatır: "Ben *quarantine*. 1300'lerde Venedik limanında doğdum…"). Dilbilgisi için: `stick-explainer`, `midcentury-toon`, `chalkboard`, `whiteboard`, `dark-keynote` (koyu infografik).
3. **Teknik ayarlar** (render araçlarına `--size 1080x1920`):
   - Dikey **1080×1920**, 30 fps (stilin STYLE.md'si başka fps diyorsa o), H.264 video + AAC ses, `.mp4`.
   - Süre **35–60 sn** (etimoloji ~45 sn). Dosya **50 MB'tan küçük** (GitHub ve Instagram için).
   - Ses yüksekliği −14 LUFS (kütüphanenin mux.sh'ı).
   - Instagram'ın ekran öğeleri için **üstte 250 px, altta 380 px, sağda 120 px** boşluk: altyazı ve önemli yazı bu alanlara girmez.
4. **Görsel zenginlik standardı** (buluttaki Denetmen bununla denetler; tutmayan video geri döner):
   - Bir **karakter ve hikâye**: konuşan, mimiği değişen en az bir karakter; yeri ve dönemi belli sahneler; **en az 5 farklı sahne**; bir "dönüm" anı ve başı yankılayan bir son.
   - **İlk 3 saniyede kanca** (soru, şaşırtıcı bilgi ya da komik an). Yavaş logo açılışı yok.
   - **Seslendirme** (Metin, 2026-11-16): aşağıdakilerden biri. Tek kural: **ses modelinin lisansı ticari kullanıma açık olmalı** (hesap ingilizcecim.com'u tanıtıyor). Türkçe anlatım ve İngilizce örnekler aynı sesle. edge-tts ve Kokoro kullanılmaz.
     1. **Gemini TTS, ses `Kore`** (varsayılan). Anahtar Windows ortam değişkeninde: `GEMINI_API_KEY`. Kod örneği: depodaki `hf/gen.py` → `gemini()` (model `gemini-2.5-flash-preview-tts`, `voiceName: Kore`, Türkçe için 'Sıcak, net ve enerjik bir öğretmen sesiyle Türkçe söyle: ', İngilizce için 'Say in clear, natural American English, like a friendly teacher: ' öneki; çıktı 24 kHz 16-bit PCM). Ücretsiz kota **model başına günde 10 istek**, dakikada ~3: istekler arasında ~21 sn bekle, her satırı `E:\ingilizcecim\tmp\ses_cache` içinde önbelleğe al. Buluttaki "Etimoloji render" da aynı anahtarı ve aynı kotayı kullanır; kota biterse diğer Gemini TTS modellerine geç (`gemini-3.8-flash-tts`, `gemini-3.1-flash-tts-preview`). Bu modeller stil önekini de okur ve sona kısa bir parazit ekler: kes (örnek: `filmler\2026-11-16-disaster\cut_prefix.py`).
     2. **VoiceStudio + VoxCPM2** (bilgisayarda, ücretsiz, `E:\projeler\VoiceStudio\app\VoiceStudio.exe`, API `http://localhost:3900`). Uygulama AGPL-3.0, VoxCPM2 modeli (`openbmb/VoxCPM2`) Apache-2.0: ticari kullanım serbest. 2026-11-16'da kuruldu ve denendi: Türkçesi ve İngilizcesi temiz, Whisper satırların hepsini doğru duydu. Anlatıcı profili `a5cfa1a1` ("ingilizcecim-anlatici-vox", yalnızca metin tarifiyle tasarlanmış kadın öğretmen sesi). Üretim: `/v1/audio/speech`, JSON gövde `{"model":"voxcpm2","voice":"a5cfa1a1","input":…,"language":"tr","seed":21,"response_format":"wav"}`, çıktı 48 kHz. Örnek betik: `filmler6-11-17-ostracizes_tts.py`. Satır başı ~15–35 sn sürer; ilk kullanımda 4,7 GB model iner. VoxCPM2 OmniVoice'tan ~%20 yavaş konuşur: gerekiyorsa ffmpeg `atempo=1.1–1.2` ile hızlandır (1.2'de bazı kelimeler bozulabilir, Whisper ile kontrol et). MOSS-TTS-Nano da kurulu (Apache-2.0) ama VoiceStudio 0.5.8'de hata veriyor; MOSS-TTS v1.5 8B ve ~16 GB, kurulmadı. **OmniVoice kullanılmaz** (ağırlıkları CC-BY-NC, ticari olmayan kullanım).
     3. Ücretli ve ticari kullanıma açık bulut sesleri (yalnızca Metin hesap açıp anahtar verirse): **ElevenLabs** (ücretli planlarda ticari kullanım serbest, Türkçesi çok iyi), **Google Cloud Text-to-Speech** (`tr-TR` Chirp 3 HD sesleri), **Azure AI Speech** (`tr-TR-EmelNeural` / `tr-TR-AhmetNeural`).
     - Hangi sesi kullandığını `<ad>_kaynak.md` dosyasına ve kuyruk kaydının `uretim` alanına yaz. Hiçbir ses yoksa ya da hepsinin kotası dolduysa dur ve Metin'e söyle; ticari olmayan bir sese geçme.
     - Seslendirme ipuçları: her satır tek cümle olsun (bazı motorlar noktadan sonraki ilk kelimeyi bozuyor). İngilizce kelimeleri Türkçe ses için okunuşuyla yaz (ör. "ostrısayz"). Her satırı kütüphanenin faster-whisper (`asr_check.py`) aracıyla dinletip kontrol et; bozuk satırı tohumu (seed) değiştirerek ya da cümleyi yeniden kurarak tekrar üret. Kelime zamanlaması da bu araçla alınır.
   - **Altyazı** ekrana gömülü, kelime kelime ya da kısa öbekler halinde; anahtar İngilizce kelime vurgulu renkte. Ayrıca `.srt` çıkar.
   - Ekranda tek dil Türkçe; öğretilen İngilizce kelime/cümleler İngilizce. Stilin demo'sundaki Çince satırlar kullanılmaz.
   - Sonda kısa kapanış kartı: **ingilizcecim.com**.
   - **Kapak görseli** (Metin, 18 Kasım 2026: profil ızgarası çirkin görünüyordu; Instagram ilk kareyi kapak yapıyor). Her videonun ayrı bir `<ad>_kapak.jpg`'si olur (1080×1920, JPEG) ve yayında `cover_url` olarak verilir:
     - Filmin **konusunu en iyi anlatan ve en dolu karesi** (Metin): kelimenin/konunun özünü tek bakışta gösteren an; karakter, sahne ve nesnelerle dolu, renkli. Boş açılış karesi, geçiş, yazı kartı ya da kapanış kartı olmaz. Birkaç aday kareyi (`still.mjs`) karşılaştırıp en iyisini seç.
     - Üstüne **her videoda aynı düzende başlık**: küçük seri etiketi (ör. "KELİMELERİN TARİHÇESİ" ya da konu etiketi) + büyük ana kelime/başlık (ör. "Serendipity"), en az 140 px, yüksek kontrast, filmin stilinin renk ve yazı tipiyle.
     - Önemli her şey **ortadaki 1080×1350 alanda** (y = 285–1635) kalır: profil ızgarası dikey kapağın yalnızca ortasını gösterir.
     - Yapım: sayfa `?kapak=1` parametresiyle açılınca (`location.search`) o karenin üstüne başlığı çizer; `film.json`'a `"kapak_t": <saniye>` yazılır. Bulutta `teslim.sh` kapağı kendisi çıkarır; bilgisayarda `node core/render/still.mjs <film> <kapak_t> --size 1080x1920 --q kapak=1`.
   - **Yasak**: sadece yazı, düz zemin ya da kart dizisi olan video; başka hesapların karakteri, logosu, filigranı, sesi ya da sahnesi; yaşayan gerçek kişilerin çizimi (tarihî kişiler serbest); lisansı belirsiz müzik (kütüphanenin kendi müzik/ses araçlarını ya da müziksiz anlatımı kullan).
5. Kendi kontrolün: kütüphanenin `readcheck` / `asr_check.py` adımlarını çalıştır, sonra videodan **8 kare** içeren bir kontrol tablosu (`core\render\sheet.py`) çıkar ve kendin bak: yazı taşması, kesik karakter, boş sahne, yanlış yazım, ses-altyazı kayması yok.

## 5. Depoya yükleme

1. Dosyaları `E:\ingilizcecim\ingilizcecim-medya\gunler\<YYYY-MM-DD>\` içine koy:
   - `<ad>.mp4` (ad: küçük harf, ör. `quarantine_etym` ya da `so_such`)
   - `<ad>_kareler.jpg` (8 karelik kontrol tablosu)
   - `<ad>_kapak.jpg` (kapak görseli, §4.4)
   - `<ad>.srt`
   - `<ad>_kaynak.md` (TREATMENT özeti, seslendirme metni, etimoloji kaynakları)
2. `git add` + `git commit -m "Yerel üretim: <tarih> <ad>"` + `git push`. Commit'in **sha**'sını al.
3. `git pull` yap, sonra `veri\kuyruk.json`'a şu kaydı ekle (listenin sonuna; başka kayıtlara dokunma):

```json
{
 "id": "YYYY-MM-DD-reels",
 "tarih": "YYYY-MM-DD",
 "kademe": "ydt+yds",
 "sinif": "YDT · YDS",
 "bicim": "animasyon",
 "uretim": "yerel (Claude Code + lemo-opuscar)",
 "stil": "<lemo stil klasörü, ör. crayon-book>",
 "seri": "kelimelerin-tarihcesi",
 "baslik": "Kelimelerin Tarihçesi: Quarantine",
 "aciklama": "<Instagram açıklaması: 3–5 cümle Türkçe, bir soru ile biter, boş satır, ingilizcecim.com, boş satır, 8–10 hashtag (#ingilizce #ydt #yds #ingilizcecim ...)>",
 "mp4": "https://raw.githubusercontent.com/mtnylmz29-a11y/ingilizcecim-medya/<commit-sha>/gunler/YYYY-MM-DD/<ad>.mp4",
 "kareler": "https://github.com/mtnylmz29-a11y/ingilizcecim-medya/blob/<commit-sha>/gunler/YYYY-MM-DD/<ad>_kareler.jpg",
 "kapak": "https://raw.githubusercontent.com/mtnylmz29-a11y/ingilizcecim-medya/<commit-sha>/gunler/YYYY-MM-DD/<ad>_kapak.jpg",
 "sure_sn": 45.0,
 "kaynaklar": ["https://www.etymonline.com/word/...", "..."],
 "onerilen_dilim": "20:30",
 "durum": "denetimde"
}
```

   17:30 için: `"id": "YYYY-MM-DD-gonderi"`, `"onerilen_dilim": "17:30"`, `seri` yok.
4. `git commit -m "Kuyruk: <id> denetimde"` + `git push`. Push reddedilirse `git pull --rebase` yapıp tekrar dene.
5. `veri\gunluk\<YYYY-MM-DD>.md` dosyasına (bugünün tarihi) bir satır ekle: `- HH:MM YEREL URETIM: <id> "<başlık>" (<stil>, <süre> sn) yüklendi, denetimde.` Commit + push.

## 6. Sonrası (otomatik)

- Buluttaki **Denetmen** `denetimde` kayıtları gün içinde düzenli aralıklarla denetler. Geçerse kayıt Metin'in **Onay Paneli**'ne düşer, Metin onaylarsa saatinde (17:30 / 20:30) Instagram'a yayınlanır.
- Denetmen bir düzeltme isterse kaydın durumu `yerel_duzeltme` olur ve `duzeltme_notu` alanına ne değişeceği yazılır. Metin sana "düzeltmeleri yap" derse: kuyrukta `yerel_duzeltme` olan kayıtları bul, film klasöründe düzelt, aynı adla yeniden yükle, `mp4`/`kareler` adreslerini yeni commit sha'sıyla güncelle, notu `duzeltme_gecmisi` listesine taşı ve durumu yine `denetimde` yap.
- **Hiçbir şeyi Instagram'a kendin yükleme.**

## 7. Son mesaj (Metin'e)

En fazla 4 satır: hedef gün ve slot, konu/kelime, stil ve süre, mp4 bağlantısı. Bir sorun olduysa tek cümleyle ne olduğunu yaz.
