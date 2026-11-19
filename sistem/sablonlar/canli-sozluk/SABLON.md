# Canlı Sözlük — ingilizcecim'in kendi video şablonları

Metin'in onayladığı (2026-11-20) üç görünüm, iki motorda. Bulutta ve yerelde, mevcut stil havuzuna **ek olarak** kullanılır (YEREL_URETIM.md §4.2). En iyi oldukları iş: **Kelimelerin Tarihçesi** (etimoloji), ama bir kelimenin hikâyesi olan her video olur.

| `film.json` `stil` | `sozluk.json` `sablon` | Görünüm | Ne zaman |
|---|---|---|---|
| `canli-sozluk-isik` | `isik-kutusu` + hava `gece-limani` | Kesik kâğıt katmanlı ışık kutusu, gece, liman, lambalar | Deniz, ticaret, şehir, salgın, savaş hikâyeleri |
| `canli-sozluk-isik` | `isik-kutusu` + hava `col-ikindisi` | Aynı kutu, sıcak çöl ikindisi | Arapça/Farsça/Türkçe kökler, kervan, çarşı |
| `canli-sozluk-cizgi` | `cizgi-film` | 1940'lar renkli sinema çizgi filmi türü; maskot **Lügat** (sarı sözlük, beyaz eldiven) | Mitoloji, kişi adından gelen kelimeler, komik hikâyeler |

Kurallar: kelime B2 ve üstü; etimoloji en az 2 kaynaktan; mevcut çizgi film karakterleri, logoları, jenerik yazıları **asla** kullanılmaz (Lügat tek oyuncumuz). Art arda iki video aynı şablonda olmaz; haftada 2–3 Canlı Sözlük videosu iyi bir ölçü.

## Film klasörü

`filmler/<tarih>-<kelime>/` içinde **yalnız şu dosyaları sen yazarsın**:

| Dosya | İçerik |
|---|---|
| `film.json` | `{"ad": "tantalize_etym", "tarih": "2026-11-21", "stil": "canli-sozluk-cizgi", "grain": 0, "kapak_t": 20}` (ışık kutusunda `grain: 1`) |
| `ses.json` | Anlatım satırları (BULUT_LEMO.md §2 ile aynı; `okunus` İngilizce kelimelerin Türkçe okunuşu). 10–13 satır, toplam ≈ 45–55 sn |
| `sozluk.json` | Ekrandaki sözlük içeriği (aşağıda) |
| `sahne.js` | Hangi sahneler, hangi satırda geçiş (aşağıda) |

`index.html`, `mix.py` ve `sablon/` (motor + fontlar, depoya girmez) **teslim.sh tarafından** `hazirla.sh` ile kendiliğinden konur. Önizlemeden önce elle: `sh sistem/sablonlar/canli-sozluk/hazirla.sh filmler/<klasör>`.
Hazır örnekler: `sistem/sablonlar/canli-sozluk/ornek/{quarantine,magazine,tantalize}/` — yeni filme kopyala, değiştir.

### sozluk.json

```json
{ "sablon": "cizgi-film", "kelime": "tantalize", "ipa": "/ˈtæntəlaɪz/", "tur": "v.", "anlam": "imrendirip ulaştırmamak",
  "zincir": [ {"dil": "Yun.", "kok": "Tantal", "son": "os", "satir": "s03"},
              {"dil": "Lat.", "kok": "Tantal", "son": "us", "satir": "s08"},
              {"dil": "İng.", "kok": "tantal", "son": "ize", "satir": "s09"} ],
  "akraba": {"dil": "Tr.", "kok": "karant", "son": "ina", "satir": "s10"},
  "notlar": [{"metin": "\"kırk gün\"", "sira": 0, "satir": "s07"}],
  "muhur": "s12", "muzik": "bando", "enstruman": "ud" }
```

- `zincir`: kökün yolculuğu, eskiden yeniye; son satır (İngilizce) sarı vurgulanır. `kok` kırmızı yazılır (değişmeyen çekirdek), `on`/`son` lacivert. Her satır `satir` (ses.json id) okunurken belirir. 3–4 satır.
- `akraba` (isteğe bağlı): Türkçedeki kardeş kelime, gazete kâğıdı şeritte.
- `notlar` (isteğe bağlı, kısa): `sira` numaralı zincir satırının yanına el yazısı not.
- `muhur`: ingilizcecim mührünün indiği satır (genelde son satır). Yoksa sona yakın.
- `muzik`: `gece` (müzik kutusu + arp, re minör) · `col` (ud + darbuka, hicaz) · `bando` (çizgi film: tuba, banço, ksilofon). Varsayılan: ışık kutusu → `gece`, çizgi film → `bando`. `enstruman`: `mandolin` | `ud` | `yok`.
- Yazılar kendiliğinden sığdırılır, ama `anlam` ≤ 40 harf, zincir satırı ≤ 22 harf tut.

### sahne.js — ışık kutusu

```js
import { kervansaray, venedikLimani } from './sablon/sahneler/ornekler.js';
export default K => [kervansaray(K), venedikLimani(K, { bas: 's06' })];   // s06 okununca lamba söner, ikinci kutu yanar
```

Hazır kutular: `venedikLimani` (gece limanı), `kervansaray` (çöl ikindisi); `{ hava: 'gece-limani' | 'col-ikindisi' }` ile havası değişir. 1–3 kutu yeter. Yeni bir yer gerekiyorsa (ör. Roma forumu, Paris sokağı) `sablon/sahneler/ornekler.js`'deki kalıbı kopyalayıp `sahne.js` içinde kendi kutunu yaz: `K.kutu(hava, { gunes, bas })` sonra `k.katman({ z, trans, kat, draw, glowDraw })` 5–6 kez; motifler `K.MOTIF` (`campanile, dome, houses, galley, bricola, dunes, caravanserai, camel, palm`). Kurallar `ornekler.js` başındaki yorumda (katmanlar çerçevenin altına kadar iner, önemli binalar x ±.09 içinde).

### sahne.js — çizgi film

```js
import { tantalosHavuzu } from './sablon/sahneler/ornekler.js';
export default K => [tantalosHavuzu(K, { uzan: K.at('s06'), egil: K.at('s07'), yine: K.at('s11') })];
```

Yeni kelimede çoğu zaman **yeni bir sahne yazarsın** (kelimenin hikâyesini Lügat oynar). Bir sahne `{ bas, iris: [x, y], arka(K), ciz(t, u, K) }`: `arka` durağan guaj arka planı bir kez boyar (`K.T.g` üstüne), `ciz` her kareyi (ikişerli, 12 fps) çizer. Lügat: `K.lugat(x, y, { reach, kol, el, lean, bak, kas, agiz, ter, kapak, sx, sy, ayak })` — seçenekler `cizgi-film/lugat.js` başında. Gag dili ve ses efekti adları (`K.olay(t, 'kac')` …) `cizgi-film/sahneler/ornekler.js` başında. Oyuncular y 560–1150 px arasında; zemin çerçevenin altına kadar.

## Ekran düzeni (Instagram güvenli alanları hesaba katıldı)

Işık kutusu: kelime kartı üstte (250 px altı), zincir şeritleri ortada, altyazı 1500 px civarı, sağ 120 px boş. Çizgi film: giriş kartı 250–560 px, zincir kartı ≈1460 px'te biter, altyazı 1525 px. Kapak (`?kapak=1`): "KELİMELERİN TARİHÇESİ" + büyük kelime, sahnenin `kapak_t` anındaki görüntüsü üstünde.

## Akış (BULUT_LEMO.md §3'e göre, farklar)

1. Kelime + 2 kaynak → `ses.json`, `sozluk.json`, `film.json`, `sahne.js` yaz → `asama=ses` tetikle → `ses/zaman.json` gelir.
2. Önizleme: `hazirla.sh`, sonra `still.mjs <film> 2 10 20 30 40 50` ve kareleri Read ile bak (yazı taşması, mühür, sahne geçişi).
3. `asama=video`. Işık kutusu WebGL'dir: Actions'ta yazılım render'ı ile ~40–70 dk sürer (iş zaman aşımı 150 dk). Çizgi film 2D tuvaldir, hızlıdır.
4. Kuyruk kaydında `stil`: `canli-sozluk-isik` ya da `canli-sozluk-cizgi`.

Teknik kaynak: ışık kutusu motoru lemo-opuscar paper-lantern, çizgi film motoru rubber-hose (MIT). Fontlar OFL (`fonts/`). Müzik ve efektler `muzik.py` içinde sentezlenir (örnek ses yok).
