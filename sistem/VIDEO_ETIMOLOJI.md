# "Kelimelerin Tarihçesi" Reels — nasıl üretilir (Metin, 15 Kasım 2026)

Metin 15 Kasım'da `gunler/2026-11-15/salary_etym.mp4`'yi izleyip onayladı: "Scheduled görevler için de aynen böyle videolar istiyorum." Bu dosya o videonun nasıl üretileceğini anlatır. **Örnek spec: `gunler/2026-11-15/etym_salary.json`.** Her yeni spec'i önce bu örneği okuyarak yaz.

## Akış (değişmez, 30–45 sn, 1080×1920, 30 fps)
1. **Giriş (~3 sn)**: büyük kelime + "Bu kelimenin geçmişini biliyor musun?" (kart otomatik). Ses: İngilizce kelime, sonra Türkçe soru.
2. **Köken (10–15 sn)**: dönemin sahnesi (zemin), karakter yürüyerek gelir; kelimenin geldiği dil etiketi, kök kelime, sonra parçalarına ayrılır (her parçanın Türkçe anlamı çıkar); olaylar (para yağmuru, düşünce balonu, damga) anlatıyı somutlaştırır.
3. **Anlam değişimi (10–15 sn)**: dönem dönem biçim listesi (duraklar); karakter kostüm, sahne zemin değiştirir; eski anlamın simgesi çizilir; isteğe bağlı karşılaştırma kartları (salary ↔ wage gibi).
4. **Bugünkü kullanım (~5–6 sn)**: YDT seviyesinde İngilizce örnek cümle (İngilizce sesle okunur, kelime kelime aydınlanır) + Türkçe çevirisi.
5. **Kapanış (~3 sn)**: ingilizcecim.com logosu + "Takip et" (otomatik). Ses: "Kelimelerin tarihçesi için ingilizcecim'i takip et!"

Ses: Türkçe `tr-TR-EmelNeural`, İngilizce kelime/cümle `en-US-AvaNeural` (edge-tts, ücretsiz). Müzik kodla üretilir (telifsiz). Altyazı otomatik, sesle eşzamanlı.

## Üretim yolu (GitHub Actions)
1. Spec'i `gunler/YYYY-MM-DD/etym_<kelime>.json` olarak depoya yükle (Composio `GITHUB_CREATE_OR_UPDATE_FILE_CONTENTS`).
2. Bu yükleme `.github/workflows/etym-render.yml`'yi başlatır (~6–10 dk). Sonuç aynı klasöre gelir: `<kelime>_etym.mp4` ve **`<kelime>_etym_kareler.jpg`** (12 karelik kontrol ızgarası).
3. İlerleme: `proxy_execute("GET","/repos/mtnylmz29-a11y/ingilizcecim-medya/actions/runs?per_page=5","github")` (her kontrol ayrı hücre). Hata: işin günlüğünü oku. **"SPEC HATASI"** satırları spec'teki eksikleri madde madde söyler; düzelt ve spec'i yeniden yükle (ya da `workflow_dispatch`, `inputs.spec`).
4. Kuyruğa `mp4` olarak render commit'inin **sha'lı** raw adresini yaz.

## Spec biçimi
```
{
 "kelime": "salary",
 "giris": {"ikonlar": ["para", "tuz"]},          // girişte dönen 2 ikon (konuyla ilgili)
 "ses": [ {"id", "dil": "tr"|"en", "bolum": "giris"|"koken"|"degisim"|"ornek"|"kapanis", "metin", "altyazi"?, "ara"?}, ... ],
 "koken": {
   "zemin": "<ZEMİN>", "etiket": "LATİNCE · ROMA", "kok": "salarium",
   "parcalar": [{"p": "sal", "anlam": "tuz", "cue": "<ses id>"}, {"p": "-arium", "anlam": "ile ilgili"}],
   "not": {"metin": "salarium = askere ve memura ödenek", "cue": "<ses id>"},     // isteğe bağlı
   "karakter": {"kostum": "<KOSTÜM>", "sac": "kisa"|"uzun"},
   "dekor": [{"ikon": "<İKON>", "x", "y", "s"?, "metin"?, "renk"?}],            // sabit eşyalar
   "olaylar": [
     {"tip": "yagmur", "ikon": "para", "cue"},                                 // eşya karakterin eline yağar
     {"tip": "dusunce", "ikonlar": ["cuval:SAL", "=", "para"], "cue"},         // balon; "ikon:metin" ya da ≤2 karakterlik işaret
     {"tip": "damga", "metin": "RİVAYETE GÖRE", "renk": "mavi"|"kirmizi"|"yesil"|"mor"|"turuncu", "cue", "gecikme"?, "y"?},
     {"tip": "ziplat", "ikon", "x", "y", "s"?, "metin"?, "cue", "gecikme"?}    // eşya zıplayarak gelir
   ]},
 "degisim": {
   "duraklar": [{"donem": "ESKİ FRANSIZCA", "kelime": "salaire", "cue", "gecikme"?, "zemin"?, "kostum"?, "sac"?}],   // 3–5 durak
   "eski_ikon": {"ikon": "tuz", "cue"},                                         // eski anlamın simgesi, üstü çizilir
   "yeni_anlam": {"metin": "salary = aylık / yıllık maaş", "cue"},
   "karsilastirma": {"cue", "kartlar": [{"kelime", "aciklama" ("\n" satır), "ikon", "cue"?}]}   // isteğe bağlı, 2 kart
 },
 "ornek": {"en", "tr", "zemin"?: "ofis", "ikon"?, "ikon_metin"?, "kostum"?, "sac"?}
}
```
- `cue` = o olayın başladığı ses satırının `id`'si; `gecikme` saniye (negatif olabilir). Bir ses satırında birden çok olay olabilir.
- `ses` sırası bölüm sırasını izler. `giris`: 2 satır (en kelime, tr soru). `ornek`: 1 İngilizce satır (`ornek.en` ile aynı metin). `kapanis`: 1 Türkçe satır.
- Türkçe sesin içinde İngilizce kelime okutma (yanlış telaffuz eder): İngilizce kelimeyi ayrı `"dil": "en"` satırı yap (örnek: `c2b`, `c3b`).
- Türkçe satır başına en fazla ~70 karakter; toplam 12–16 ses satırı. Süre 30–45 sn dışına çıkarsa günlükte UYARI yazar: metni kısalt.
- Koordinatlar: kare 1080×1920; yer çizgisi y≈1300–1340; karakter x≈360. Dekoru x 480–1040, y 1250–1340 aralığına koy (karakter ve üst kartlarla çakışmasın). Kartlar üstte y 190–620 arasını kullanır; damgalar y 560 ve 1180 civarında iyi durur.

## Kataloglar (yalnızca bunlar çizilir; başka ad yazarsan boş kalır)
- **ZEMİN**: `roma`, `yunan` (deniz + tapınak), `orta_cag` (şato, parşömen gök), `liman` (Venedik cepheleri, deniz, gemi), `col` (kum tepeleri, palmiye, kubbeli yapı), `laboratuvar` (raflarda şişeler, simya masası), `tiyatro` (kırmızı perde, sahne), `sehir` (gökdelenler), `ofis` (pencere, masa, saat), `kir` (ahır, çit, ağaç), `gece` (yıldızlar, ay, takımyıldız).
- **KOSTÜM**: `roma_askeri` (kask, kalkan), `toga` (beyaz toga + defne tacı), `katip` (Orta Çağ kâtibi), `denizci`, `alim` (uzun cübbe + sarık), `ofis`, `doktor`, `isci` (tulum + kasket), `robot`.
- **İKON**: `para`, `tuz`, `cuval` (metin), `tabela` (metin), `gemi`, `sise`, `kavanoz`, `ekmek`, `yildiz`, `fare`, `yumak`, `parsomen` (metin), `kitap`, `saat`, `takvim` (metin = sayı), `buyutec`, `grafik` (metin = başlık, çubuk yükselir), `kalp`, `soru`, `kas`, `disli`, `goz`, `maske`, `sandik`.
- Yeni zemin/kostüm/ikon gerekirse `video/src/kit.tsx`'e eklenir — bu bir yapı değişikliğidir, İdareci önerir, Metin onaylar.

## İçerik kuralları (değişmez)
- **Etimoloji doğru olmalı.** Kaynak: etymonline.com (Online Etymology Dictionary), Merriam-Webster, Oxford/Lexico, Wiktionary etimoloji bölümü. En az iki kaynakta aynı bilgi yoksa yazma. Tarihi "1300'ler", "1590'lar" gibi yuvarla.
- **Kesin olmayan hikâyeler "rivayete göre" diye söylenir ve ekranda damga ile gösterilir** (`"metin": "RİVAYETE GÖRE"` + gerekirse `"KESİN DEĞİL"`). Mitoloji "efsaneye göre" diye anılır. Kanıtlanmamış bir hikâyeyi kesin bilgi gibi anlatmak **KALDI** sebebidir.
- Örnek cümle YDT/YDS seviyesinde, doğal, 12–18 kelime; kelime cümlede geçer; Türkçe çeviri doğal.
- Çocuk güvenliği ve telif kuralları geçerlidir; gerçek kişi/marka/karakter çizimi yok (Čapek gibi kişilerin adı anılabilir, yüzü çizilmez).
- **Instagram açıklaması**: Türkçe 3–4 cümle (kelimenin hikâyesi + yoruma davet sorusu), ayrı satırda `ingilizcecim.com`, sonra tam 10 hashtag (her zaman `#kelimelerintarihçesi #ingilizcecim #ydt #yds` + kelimeye özgü 6). Aynı metni `gunler/YYYY-MM-DD/<kelime>_etym.txt` olarak da yükle.

## Editör kontrolü (bu format için)
- `<kelime>_etym_kareler.jpg`'yi aç: 12 karenin hepsinde sahne/çizim var mı, yazı taşıyor ya da üst üste biniyor mu, kartlar okunuyor mu.
- Etimolojiyi kaynaktan bağımsız olarak doğrula; "rivayet" işareti eksikse KALDI.
- Spec'teki ses metinleri ile ekrandaki metinler aynı bilgiyi veriyor mu; İngilizce kelimeler ayrı `en` satırında mı.
- Sesi dinleyemediğini önizlemede belirt.

## Kelime listesi
`veri/etimoloji_listesi.json`: sıradaki kelimeler, doğrulanmış köken notlarıyla. URETIM Reels için listeden `durum: "bekliyor"` olan ilk kelimeyi alır, üretince `"uretildi"` + tarih yazar. Listede 3'ten az bekleyen kalırsa Konu Bulucu cumartesi taramasında YDT/YDS'de sık çıkan, hikâyesi ilginç kelimelerle listeyi tamamlar (kaynak ve kesin/rivayet ayrımıyla).
