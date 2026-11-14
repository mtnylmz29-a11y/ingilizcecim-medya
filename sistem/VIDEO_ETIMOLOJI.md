# "Kelimelerin Tarihçesi" Reels — nasıl üretilir (Metin, 15 Kasım 2026)

Metin 15 Kasım'da `gunler/2026-11-15/salary_etym.mp4`'yi izleyip onayladı: "Scheduled görevler için de aynen böyle videolar istiyorum." Aynı gün ekledi: **"Sürekli aynı tür video çıkmasın. Konuya göre şekillendir. Görsel olsun, animatif olsun, ilgi çekici olsun."** Bu dosya videonun nasıl üretileceğini ve her videonun nasıl farklı kurulacağını anlatır.

- **Temel örnek:** `gunler/2026-11-15/etym_salary.json`.
- **Yeni özelliklerin örnekleri:** `video/ornekler/etym_ozellik-1.json` ve `etym_ozellik-2.json`. Bunlar yalnızca söz dizimi örneğidir, anlatım metni denemedir ve yayınlanmaz. Labirent, iplik, harita, sayaç, perde, ekmek bölme, ölçer gibi her özellik bu iki dosyada kullanılmış hâliyle görülebilir.
- **İkinci biçim, Dünya turu:** `sistem/VIDEO_DUNYA.md`.

## Akış (değişmez, 30–45 sn, 1080×1920, 30 fps)
1. **Giriş (~3 sn):** büyük kelime ve "Bu kelimenin geçmişini biliyor musun?". Üç stil var (`giris.stil`).
2. **Köken (10–15 sn):**
   - Dönemin sahnesi (zemin) ve yürüyerek gelen karakter. İsteğe bağlı ikinci bir karakter (`karakter2`) sağdan gelir.
   - Kelimenin dil etiketi ve kök kelime görünür; kök parçalara ayrılır ve her parçanın Türkçe anlamı çıkar.
   - Olaylar anlatıyı canlandırır.
3. **Anlam değişimi (10–15 sn):**
   - Dönem dönem duraklar listelenir.
   - Sahne ya karakterle birlikte değişir ya da **dünya haritasına** döner: duraklarda `yer` varsa kelimenin yolculuğu kürede çizilir.
   - Eski anlamın simgesinin üstü çizilir. Bu bölümde de olaylar kullanılabilir.
4. **Bugünkü kullanım (~5–6 sn):** YDT seviyesinde örnek cümle. Cümle İngilizce okunur, kelimeler okundukça aydınlanır; altında Türkçe çevirisi çıkar.
5. **Kapanış (~3 sn):** ingilizcecim.com ve "Takip et".

**Ses:** Türkçe satırlar `tr-TR-EmelNeural`, İngilizce satırlar `en-US-AvaNeural` sesiyle okunur (edge-tts, ücretsiz). Müzik kodla üretilir ve telifsizdir; `muzik` alanıyla seçilir. Altyazı sesle eşzamanlı ve otomatiktir.

## Üretim yolu (GitHub Actions)
1. Spec'i `gunler/YYYY-MM-DD/etym_<kelime>.json` olarak depoya yükle (Composio `GITHUB_CREATE_OR_UPDATE_FILE_CONTENTS`).
2. Yükleme `.github/workflows/etym-render.yml`'yi başlatır (~6–10 dk). Sonuç aynı klasöre gelir: `<kelime>_etym.mp4` ve **`<kelime>_etym_kareler.jpg`** (12 karelik kontrol ızgarası).
3. İlerlemeyi izle: `proxy_execute("GET","/repos/mtnylmz29-a11y/ingilizcecim-medya/actions/runs?per_page=5","github")` (her kontrol ayrı hücrede). Hata olursa işin günlüğünü oku.
   - **"SPEC HATASI"** satırları eksikleri madde madde söyler. Katalogda olmayan bir zemin, kostüm, ikon, olay ya da tema adı da bu hatayı verir ve geçerli adları listeler.
   - Düzelt ve spec'i yeniden yükle (ya da `workflow_dispatch`, `inputs.spec`).
4. Kuyruğa (`id` = `YYYY-MM-DD-reels`) `mp4` olarak render commit'inin **sha'lı** raw adresini yaz.

## Spec biçimi
```
{
 "kelime": "salary",
 "tema": "altin",            // renk teması: altin | mavi | yesil | mor | turuncu | gece  (geçiş bandı, giriş ve kapanış renkleri)
 "muzik": "neseli",          // neseli | gizemli | macera | sakin
 "giris": {"ikonlar": ["para", "tuz"], "stil": "isik"},   // stil: isik (dönen ışık) | harfler (harfler tek tek düşer) | parsomen (parşömen açılır, kelime yazılır)
 "ses": [ {"id", "dil": "tr"|"en", "bolum": "giris"|"koken"|"degisim"|"ornek"|"kapanis", "metin", "altyazi"?, "ara"?, "hiz"?}, ... ],
 "koken": {
   "zemin": "<ZEMİN>", "etiket": "LATİNCE · ROMA", "kok": "salarium",
   "parcalar": [{"p": "sal", "anlam": "tuz", "cue": "<ses id>"}, {"p": "-arium", "anlam": "ile ilgili"}],
   "not": {"metin": "salarium = askere ve memura ödenek", "cue": "<ses id>"},
   "karakter": {"kostum": "<KOSTÜM>", "sac": "kisa"|"uzun", "x"?},
   "karakter2": {"kostum": "<KOSTÜM>", "sac"?, "x"?: 780, "cue"?},          // isteğe bağlı ikinci kişi, sağdan yürüyerek gelir
   "dekor": [{"ikon": "<İKON>", "x", "y", "s"?, "metin"?, "renk"?}],
   "olaylar": [ <OLAY>, ... ]
 },
 "degisim": {
   "duraklar": [{"donem": "ESKİ FRANSIZCA", "kelime": "salaire", "cue", "gecikme"?, "zemin"?, "kostum"?, "sac"?,
                 "yer"?: {"ad": "Paris", "lon": 2.35, "lat": 48.86}}],        // en az 2 durakta "yer" varsa bölüm HARİTA olur
   "eski_ikon": {"ikon": "tuz", "cue"},
   "yeni_anlam": {"metin": "salary = aylık / yıllık maaş", "cue"},
   "karsilastirma": {"cue", "kartlar": [{"kelime", "aciklama", "ikon", "cue"?}]},
   "olaylar": [ <OLAY>, ... ]                                               // köken ile aynı olaylar
 },
 "ornek": {"en", "tr", "zemin"?: "ofis", "ikon"?, "ikon_metin"?, "kostum"?, "sac"?}
}
```
- `cue` olayın başladığı ses satırının `id`'sidir. `gecikme` saniye cinsindendir ve negatif olabilir.
- `ses` sırası bölüm sırasını izler:
  - `giris`: 2 satır (İngilizce kelime, sonra Türkçe soru).
  - `ornek`: `ornek.en` ile aynı metni taşıyan 1 İngilizce satır.
  - `kapanis`: 1 Türkçe satır.
- Türkçe sesin içinde İngilizce kelime okutma, yanlış telaffuz eder. İngilizce kelimeyi ayrı bir `"dil": "en"` satırına koy.
- Türkçe satır başına en fazla ~70 karakter; toplam 12–16 ses satırı.
- Koordinatlar (kare 1080×1920):
  - Yer çizgisi y≈1300–1340; ana karakter x≈360, `karakter2` x≈780.
  - Dekoru x 480–1040, y 1250–1340 aralığına koy.
  - Kartlar üstte y 190–620 arasını kullanır. Damgalar y 560 ve 1180 civarında iyi durur.
  - Harita bölümünde küre y 740–1520 arasındadır; olayları x 700–950, y 760–900 civarına koy.

### Olaylar (`tip`)
| tip | ne yapar | alanlar |
|---|---|---|
| `yagmur` | eşya karakterin eline yağar | `ikon` |
| `dusunce` | düşünce balonu | `ikonlar`: `"ikon:metin"` ya da ≤2 karakterlik işaret (`=`, `→`) |
| `damga` | ekrana damga vurulur (RİVAYETE GÖRE / EFSANEYE GÖRE / KESİN DEĞİL) | `metin`, `renk`, `y` |
| `ziplat` | eşya zıplayarak gelir; `k_bas`→`k_son` ile **canlanır** (yüz asıktan gülene, ölçer kırmızıdan yeşile, grafik yükselir) | `ikon`, `x`, `y`, `s`, `metin`, `k_bas`, `k_son`, `sure` |
| `sayac` | büyük sayaç kartı `bas`→`son` sayar (ör. 30→40 GÜN) | `bas`, `son`, `metin`, `sure`, `x`, `y`, `renk` |
| `kayan` | gökten kayan yıldızlar | `adet`, `renk`, `x`, `y` |
| `parilti` | bir noktanın çevresinde yıldız parıltısı | `x`, `y`, `sure`, `renk` |
| `bol` | eşya ikiye bölünür, iki yana ayrılır (ekmek paylaşımı) | `ikon`, `x`, `y`, `aralik` |
| `iplik` | labirentte girişten çıkışa kırmızı iplik çizilir (yalnızca `labirent` zemini) | `sure`, `renk` |
| `sars` | sahne sarsılır (deprem, felaket, şaşkınlık) | `sure` |
| `perde` | bölüm kapalı kırmızı perdeyle başlar, `cue`'da perde açılır (tiyatro açılışı, "sahne") | `metin` (perde üstünde), `sure` |

`renk`: `kirmizi`, `mavi`, `yesil`, `mor`, `turuncu` ya da `#RRGGBB`.

## Kataloglar (yalnızca bunlar çizilir; başka ad yazılırsa SPEC HATASI verir)
- **ZEMİN:**
  - Dönem sahneleri: `roma`, `yunan` (deniz + tapınak), `orta_cag` (şato), `liman` (Venedik cepheleri, gemi), `col` (kum tepeleri, palmiye, kubbe), `laboratuvar` (raflarda şişeler), `tiyatro` (kırmızı perde), `kir` (ahır, çit), `gece` (yıldızlar, ay).
  - Bugünün sahneleri: `sehir` (gökdelenler), `ofis` (pencere, masa, saat).
  - **Yeni:** `labirent` (kuşbakışı labirent), `han` (Orta Çağ hanı: şömine ateşi, fener, masa, ekmek), `spor` (spor salonu: dambıl rafı, mat), `fabrika` (bacalardan duman, bant üstünde kutular), `forum` (Roma forumu: sütunlar, kürsü, kalabalık), `carsi` (çarşı: tenteli tezgâhlar, fenerler, kavanozlar).
- **KOSTÜM:**
  - Mevcut: `roma_askeri`, `toga`, `katip`, `denizci`, `alim` (cübbe + sarık), `ofis`, `doktor`, `isci`, `robot`.
  - **Yeni:** `kahraman` (Yunan kahramanı: tolgalı miğfer), `sporcu`, `astrolog` (yıldızlı cübbe + sivri şapka), `toga_candida` (parlayan beyaz toga, parıltılar).
- **İKON:**
  - Mevcut: `para`, `tuz`, `cuval` (metin), `tabela` (metin), `gemi`, `sise`, `kavanoz`, `ekmek`, `yildiz`, `fare`, `yumak`, `parsomen` (metin), `kitap`, `saat`, `takvim` (metin = sayı), `buyutec`, `grafik` (metin = başlık; k ile yükselir), `kalp`, `soru`, `kas`, `disli`, `goz`, `maske`, `sandik`.
  - **Yeni:** `capa`, `bayrak` (metin, renk; dalgalanır), `teleskop`, `simsek` (yağmur bulutu + şimşek), `gezegen`, `kol` (bükülmüş kol; `metin: "fare"` ile pazıda kayan fare), `dambil`, `imbik` (damıtma: kaynayan balon, damlayan boru), `surme` (sürme kabı + çubuk), `daktilo` (metin kâğıda yazılır), `yuz` (k: 0 asık → 1 gülen), `olcer` (k: 0 kırmızı → 1 yeşil; metin), `oy_sandigi`, `kursu`, `tebesir`.
- Yeni bir zemin, kostüm ya da ikon gerekirse `video/src/kit.tsx`'e eklenir. Bu bir yapı değişikliğidir: İdareci önerir, Metin onaylar.

## Çeşitlilik kuralları (Metin, 15 Kasım: "sürekli aynı tür video çıkmasın")
Her videoyu konuya göre kur. Spec'i yazmadan önce `veri/etimoloji_listesi.json`'da son üretilen 3 kelimenin `gorsel` alanına bak ve şu kurallara uy:
1. **`tema`, `giris.stil` ve `muzik`, son 3 videodaki değerlerden farklı olsun.** Üçü birden aynı olamaz; en az ikisi değişmeli.
2. **Köken zemini art arda iki videoda aynı olmasın.**
3. **Her videoda salary'de olmayan en az 2 olay tipi kullan:** `sayac`, `kayan`, `parilti`, `bol`, `iplik`, `sars`, `perde` ya da canlanan `ziplat`. Olay hikâyeyi anlatmalı, süs olmamalı. Örneğin quarantine'de 40 güne sayan sayaç, companion'da paylaşılan ekmek.
4. **Kelime ülkeler ya da diller arasında yolculuk yaptıysa** (Arapça → Latince → İngilizce, İtalya → Fransa → İngiltere) değişim bölümünü **harita** yap: en az 2 durakta `yer` olsun. Yer adı ancak kaynakta geçiyorsa yazılır; emin değilsen yeri dilin ana bölgesi olarak ver (ör. "İtalya"). Haritayı haftada en az 1 videoda kullan.
5. **İkinci karakter** (`karakter2`) iki kişilik hikâyelerde kullanılır: paylaşım, efsanedeki iki kahraman, satıcı ile alıcı gibi.
6. Kelime bir ifadenin dünyadaki farklı söylenişleri ya da yayılışı üzerinden daha iyi anlatılıyorsa (çay, kahve, çikolata) o gün **Dünya turu biçimini** kullan (`sistem/VIDEO_DUNYA.md`). En fazla haftada 1 kez.
7. Üretimden sonra listeye o videonun `gorsel` kaydını yaz: `{"tema", "stil", "muzik", "zeminler": [...], "olaylar": [...], "harita": true|false}`.

## İçerik kuralları (değişmez)
- **Etimoloji doğru olmalı.**
  - Kaynaklar: etymonline.com (Online Etymology Dictionary), Merriam-Webster, Oxford/Lexico, Wiktionary'nin etimoloji bölümü.
  - En az iki kaynakta aynı bilgi yoksa yazma.
  - Tarihleri "1300'ler", "1590'lar" gibi yuvarla. Haritadaki yerler ve tarihler de bu kurala tabidir.
- **Kesin olmayan hikâyeler "rivayete göre" diye söylenir ve ekranda damga ile gösterilir** (`"metin": "RİVAYETE GÖRE"`, gerekirse `"KESİN DEĞİL"`).
  - Mitoloji "efsaneye göre" diye anılır.
  - Kanıtlanmamış bir hikâyeyi kesin bilgi gibi anlatmak **KALDI** sebebidir.
- Örnek cümle YDT/YDS seviyesinde, doğal ve 12–18 kelime olsun; kelime cümlede geçsin; Türkçe çeviri doğal olsun.
- Çocuk güvenliği ve telif kuralları geçerlidir. Gerçek kişi, marka ya da karakter çizilmez: Čapek gibi kişilerin adı anılabilir, yüzü çizilmez. Kişiyi bir eşya (daktilo) ya da genel bir figürle temsil et.
- **Instagram açıklaması:**
  - Türkçe 3–4 cümle: kelimenin hikâyesi ve yoruma davet eden bir soru.
  - Ayrı satırda `ingilizcecim.com`.
  - Ardından tam 10 hashtag: her zaman `#kelimelerintarihçesi #ingilizcecim #ydt #yds`, artı kelimeye özgü 6 tane.
  - Aynı metni `gunler/YYYY-MM-DD/<kelime>_etym.txt` olarak da yükle.

## Editör kontrolü (bu format için)
- `<kelime>_etym_kareler.jpg`'yi aç ve şunlara bak:
  - 12 karenin hepsinde sahne ve çizim var mı?
  - Yazı taşıyor ya da üst üste biniyor mu?
  - Kartlar okunuyor mu?
  - Harita bölümünde yer etiketleri okunuyor mu?
- Etimolojiyi kaynaktan bağımsız olarak doğrula. "Rivayet" işareti eksikse sonuç KALDI.
- Çeşitlilik kurallarına uyulmuş mu? Son 3 videoyla aynı tema, stil ve müzik üçlüsü kullanıldıysa sonuç UYARI.
- Spec'teki ses metinleri ile ekrandaki metinler aynı bilgiyi veriyor mu? İngilizce kelimeler ayrı `en` satırında mı?
- Sesi dinleyemediğini önizlemede belirt.

## Kelime listesi
`veri/etimoloji_listesi.json` sıradaki kelimeleri, doğrulanmış köken notlarıyla ve **`gorsel_oneri`** (o kelimeye uygun sahne, olay ve harita fikri) ile tutar.
- Etimoloji görevi (ORKESTRA > KİP: ETIMOLOJI) her gün listeden `durum: "bekliyor"` olan ilk kelimeyi alır.
- Üretince kelimeye `"uretildi"`, tarih ve `gorsel` kaydını yazar.
- Listede 7'den az bekleyen kelime kalırsa listeyi kendisi tamamlar; yeni kelimelere de `gorsel_oneri` yazar.
