# ingilizcecim — Bulutta lemo-opuscar ile video (Metin'in bilgisayarı kapalıyken)

Bu tarifi buluttaki zamanlanmış görevler (Akşam Üretimi, Düzeltme) uygular. Amaç, `sistem/YEREL_URETIM.md`'deki videonun aynısını Metin'in bilgisayarı olmadan üretmek. **Konu, stil, görsel zenginlik standardı, Instagram güvenli alanları, kuyruk kaydı biçimi** YEREL_URETIM.md §2–§5 ile aynıdır, onları oku. Bu dosya yalnızca **araçların bulutta nasıl çalıştığını** anlatır. Soru sorma, kararları kendin ver.

## 0. Neyin nerede çalıştığı

| İş | Nerede | Neden |
|---|---|---|
| Senaryo, stil seçimi, sayfa kodu (`index.html`), kare önizlemesi | Senin oturumun (bulut) | Chrome ve npm burada çalışır |
| Seslendirme (Gemini TTS `Kore`) | GitHub Actions `Lemo render`, `asama=ses` | Oturumdan Google'a erişilemez; anahtar depoda secret |
| Video render + miks + mux (ffmpeg 7) + kareler + kontroller | GitHub Actions `Lemo render`, `asama=video` | Oturumdaki ffmpeg 6.1, mux 7+ ister |

Depo: `mtnylmz29-a11y/ingilizcecim-medya` (herkese açık; okumak için `git clone`, yazmak için **Composio GitHub araçları**: `GITHUB_COMMIT_MULTIPLE_FILES`, `GITHUB_CREATE_A_WORKFLOW_DISPATCH_EVENT`, `GITHUB_LIST_WORKFLOW_RUNS_FOR_A_REPOSITORY`, `GITHUB_LIST_JOBS_FOR_A_WORKFLOW_RUN`). Büyük API yanıtlarını COMPOSIO_REMOTE_WORKBENCH'te kısaltarak oku.

Kütüphane: `https://github.com/lemomo-ai/lemo-opuscar` (herkese açık). Lisans: kod MIT; **dokümanlar (*.md) ve görsel promptları CC BY-NC 4.0** → okuyup uygula ama **depoya kopyalama** (bizim depo herkese açık). Turuncu "Clawd" karakteri ve demo filmlerin seslendirmeleri kullanılmaz. Yaptığımız filmler bizimdir, LemoLab kredisi/filigranı yok.

## 1. Hazırlık (oturumda, ~3 dk)

```sh
git clone -q --depth 1 https://github.com/mtnylmz29-a11y/ingilizcecim-medya.git ~/medya
git clone -q --depth 1 https://github.com/lemomo-ai/lemo-opuscar.git ~/lemo-opuscar
cd ~/lemo-opuscar && git config lemo.managed true && LEMO_OPUSCAR_HOME=~/lemo-opuscar sh plugin/skills/lemo-opuscar/scripts/setup.sh deps
```
"ffmpeg7+ missing" uyarısı normaldir (mux Actions'ta yapılır). Sonra `AGENTS.md`, `DIRECTOR.md`, `TECHNIQUE.md`, `core/README.md` ve seçtiğin stilin `styles/<slug>/STYLE.md`'sini oku. Treatment'ı yazdıktan sonra tekniği görmek için: `sh plugin/skills/lemo-opuscar/scripts/setup.sh demo <slug>` (demo kodu MIT; tekniği öğren, hikâyesini/sahnelerini alma).

## 2. Film klasörü sözleşmesi

Klasör: `filmler/<YYYY-MM-DD>-<kelime>/` (depoda). İçinde:

| Dosya | Ne |
|---|---|
| `film.json` | `{"ad": "serendipity_etym", "tarih": "2026-11-19", "stil": "shadow-puppet", "grain": 0}` → çıktı `gunler/<tarih>/<ad>.mp4` |
| `ses.json` | `{"satirlar": [{"id": "s01", "dil": "tr", "metin": "...", "okunus": "(isteğe bağlı)"}, …], "bas": 0.6, "ara": 0.35, "son": 2.8, "araliklar": {"s05": 0.9}}` — her satır **tek cümle**; İngilizce kelime Türkçe satırda geçiyorsa `okunus`'ta Türkçe okunuşuyla yaz ("serendipiti"), `metin` ekranda görünen yazımdır. Toplam ~12–14 satır, film 40–55 sn. |
| `ses/` + `ses/zaman.json` | **Actions yazar** (asama=ses). `{"dur", "satirlar": [{"id","dil","metin","t0","t1","kelimeler":[{"w","t0","t1"}],"duyulan"}]}` — filmdeki yerler. `duyulan` Whisper'ın duyduğudur: metinle karşılaştır, bozuk satırı yeniden yaz. |
| `index.html` (+ `*.js`) | Sayfa. lemo sözleşmesi: `window.DUR`, `window.render(t)`, `window.READY`, isteğe bağlı `window.EV` (efektler: `pop|whoosh|ding|thump|click`) ve `window.TEXTS`. **Zamanlamayı `fetch('ses/zaman.json')` ile oku**, `DUR = zaman.dur`, sahne geçişlerini satırların `t0`'ına, altyazıyı `kelimeler`'e bağla. Kütüphane dosyaları mutlak yolla: `/core/lib.js`, `/core/fonts/fonts.css` (Fredoka, Lilita One, IM Fell English — Türkçe harfler var), `/node_modules/three/...`. Boyut 1080×1920. |
| `miks.json` (isteğe bağlı) | Standart miks ayarı: `{"fon": "yumusak"|"yok", "fon_db": -26, "akorlar": [[57,60,64],…], "efekt_db": -14}`. Stilin ses paletine uygun özel miks istersen `mix.py <film> <cikti.wav>` yaz (lemo `core/audio/sfx.py`, `sampler.py` kullanılabilir; sampler kütüphaneleri Actions'ta iner). |
| Kapak | Sayfa `?kapak=1` ile açılınca başlığı çizer; `film.json`'a `"kapak_t"` yaz (YEREL_URETIM.md §4.4 kapak kuralı). Actions `gunler/<tarih>/<ad>_kapak.jpg` çıkarır. |
| `kaynak.md` | Kısa treatment özeti, seslendirme metni, etimoloji kaynakları (bizim metnimiz; lemo dokümanı kopyalama). |

## 3. Akış

1. **Konu ve kontrol**: YEREL_URETIM.md §2–§3 (gün/slot, `veri/etimoloji_listesi.json`'dan sıradaki `bekliyor` kelime, en az 2 kaynak, "rivayete göre"/"efsaneye göre"). Stil: son 3 kayıttan farklı (YEREL_URETIM.md §4.2 listesi); WebGL'li stiller Actions'ta yazılım render'ıyla yavaştır ama çalışır.
2. **Treatment** (oturumda, depoya `kaynak.md` olarak özet). Kanca ilk 3 sn, karakter + hikâye, ≥5 sahne, dönüm anı, kapanış kartı **ingilizcecim.com**.
3. **Ses**: `film.json` + `ses.json`'u tek commit'le yükle → `Lemo render` iş akışını (`lemo-render.yml`) `{"film": "<klasör>", "asama": "ses"}` ile tetikle → çalışmayı izle (~5–8 dk; satır başı ~25 sn) → `git pull`, `ses/zaman.json`'u oku. Günlükte **`SES KOTASI`** görürsen: hazır satırlar önbellekte kalır; işi bırak, kuyruğa kayıt açma, günlüğe yaz, Metin'e tek satır bildir ("Gemini ses kotası doldu, video kota açılınca (11:00) üretilecek"). Ticari olmayan ya da başka bir sese geçme.
4. **Sayfa**: `index.html`'i yaz. Oturumda önizle: `ses/` klasörünü yerel kopyaya al, sonra `cd ~/lemo-opuscar && node core/render/still.mjs <film> 1 6 12 20 30 40 --size 1080x1920 --out /tmp/st` ve kareleri Read ile **kendin bak**: yazı taşması, Instagram güvenli alanı (üst 250, alt 380, sağ 120 px), boş sahne, yanlış Türkçe karakter. (WebGL uyarısı normal.) İstersen kısa bir test videosu: `node core/render/video.mjs <film> --fps 24 --size 1080x1920 --out /tmp/v.mp4` (ses yok).
5. **Video**: sayfa dosyalarını yükle → `{"film": "<klasör>", "asama": "video"}` tetikle (~15–40 dk; WebGL stillerde daha uzun) → bitince `gunler/<tarih>/<ad>_kareler.jpg`'yi indir ve bak. Günlükte `KONTROL HATASI` varsa (süre 35–60 sn dışı, boyut, >50 MB, ses yok) düzelt ve tekrar `video`.
6. **Kontrol (ayrı göz)**: Agent aracıyla üretimi görmemiş bir alt ajana kareler tablosunu ve `zaman.json`'daki metni denetlet (yazım, bilgi doğruluğu, görsel zenginlik).
7. **Kuyruk**: YEREL_URETIM.md §5.3 biçiminde kayıt, şu farklarla: `"uretim": "bulut (lemo-opuscar, <stil>; ses Gemini Kore)"`, `"film": "filmler/<klasör>"`, `mp4`/`kareler`/`kapak` (raw adres) Actions'ın commit sha'sıyla. `"durum": "denetimde"`. Etimoloji listesinde kelimeyi `uretildi` + tarih + `"uretim": "bulut"` yap. Sonra Claude_Code_Remote `fire_trigger` ile **trig_01VBbs1s9v9f7EfTHqN69Noa** (Denetmen). Günlüğe 1–2 satır.
8. **Asla yayınlama.** Yayın Onay Paneli'nden sonra 17:30/20:30 görevlerinde yapılır.

## 4. Düzeltme (Denetmen ya da Metin isterse)

Kayıtta `"film"` alanı varsa: film klasöründe istenen değişikliği yap (metin → `ses.json`, görüntü → `index.html`), gerekirse `asama=hepsi` (ses önbellekten gelir, yalnızca değişen satırlar yeniden üretilir) ya da `asama=video` ile yeniden render et, `mp4`/`kareler` adreslerini yeni sha ile güncelle.

## 5. Bilinen tuzaklar

- Composio commit'i **403** dönerse (güvenlik duvarı): dosyaları daha küçük commit'lere böl; kabuk betiklerini ve `secrets` geçen YAML'ı tek başına yükle.
- `zaman.json`'daki `kelimeler`'in son kelimesi satır sonunu birkaç yüz ms aşabilir (Whisper): altyazıyı `t1`'de kapat.
- Gemini kotası: model başına günde 10 istek, Pasifik gece yarısı (İstanbul 11:00) sıfırlanır; `ses.py` sırayla `gemini-2.5-flash-preview-tts` → `gemini-3.8-flash-tts` → `gemini-3.1-flash-tts-preview` dener. Önbellek `hf/ses_cache/`.
- İlk denemede (18 Kasım, Serendipity) video Actions'ta çıktı ama üretim oturumu kuyruk kaydını yazmadan kapandı. Video biter bitmez **ilk iş** kuyruk kaydını yaz; görevler başlarken kaydı olmayan bitmiş filmleri tamamlar.
- Hedef gün: her gün bir video üretilir; yedekte video varsa sıradaki boş güne yazılır (Metin, 18 Kasım: "biriksin"). Yayın görevleri her dilimde yalnızca bir paylaşım yayınlar, gelecek tarihli kayıtlara dokunmaz.
- Actions çalışması aynı anda bir tane (`concurrency: lemo-render`); sıradakini bekler.
- **Satır sonu paraziti** (18 Kasım): Gemini bazı satırların sonuna ~160 ms'lik bir patlama ekliyor. `ses.py` bunu susturur. Render'dan sonra `python3 sistem/lemo/ses_kontrol.py <film>` ile kontrol et. Eski önbellekli filmler `asama=hepsi` ile düzelir.
