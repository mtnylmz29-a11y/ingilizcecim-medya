# ingilizcecim — İzinli stil listesi (Metin, 24 Kasım 2026)

**Kural:** Videolar YALNIZCA bu listedeki stillerden üretilir. Listede olmayan stil kullanılmaz; Denetmen listede olmayan stili DUZELT der.
Metin bir stili beğenmezse "Liste dışı"na taşınır, beğendiği yeni stil "İzinli"ye eklenir. Bu dosyayı yalnızca Metin'in isteğiyle değiştir.
Art arda iki gün aynı stil olmaz. Kuyruk kaydının `stil` alanına aşağıdaki adı aynen yaz.

## İzinli stiller

| Stil | Nasıl görünür |
|---|---|
| `stickman` | **Metin'in favorisi (ilk referans resmi, RedStick hissi).** lemo-opuscar kütüphanesindeki `stick-explainer` stilini temel al (styles/stick-explainer/STYLE.md ve demosu). Kalın siyah çizgili ince gövde, büyük yuvarlak renkli kafa (kendi rengimiz: lacivert #13235B ya da mercan #FF5A4E; RedStick'in kırmızı karakteri kopyalanmaz); sade, açık renkli sınıf/ev/kafe arka planları; diyalogla komik ama kısa sahneler. **Yüz ifadeleri barışçıl ve sıcak olmalı:** gülümseme, meraklı/şaşkın ama tatlı bakış, hafif kaş kaldırma. Öfkeli, bağıran, kaşları çatık, dişleri görünen ya da alaycı/kötü niyetli yüz YOK; şaşkınlık bile yumuşak (küçük 'o' ağız). Karakterler birbirine nazik davranır. |
| `cartoon` | Yumuşak, yuvarlak hatlı sevimli çizgi film; sıcak ışık (lamba ışığı, gölge), pastel/toprak renkler, tüylü sevimli hayvan ya da karakterler; ortada tek kalın beyaz altyazı kelimesi. |
| `flat-vector` | Kalın koyu dış çizgili düz vektör; büyük gözlü sevimli karakterler (kask, yelek gibi detaylar); turuncu/sarı sıcak gökyüzü, şantiye/şehir gibi sahneler; üstte koyu bantta büyük harfli başlık, nesnelerin üstünde krem etiket balonları, altta krem kutuda altyazı. |
| `explainer-3d` | Koyu lacivert zeminli 3B anlatım: sarı numara rozeti + kalın başlık, telefon/kasa gibi canlanan nesneler, 1-2-3 adım çipleri. |
| `scifi-toon` | "Have / Get Something Done" (19 Kasım) videosu: renkli atölye/garaj, Ece + usta + robot, sahneye göre değişen renk teması. |
| `storybook` | Resimli çocuk kitabı: suluboya/pastel boya dokusu, sıcak renkler, anlatıcı sesiyle masal akışı (etimoloji için çok uygun). |
| `comic-art` | Çizgi roman: paneller, kalın mürekkep çizgisi, konuşma balonları, "POW" tarzı ses yazıları, nokta tram dokusu. |
| `claymation` | Hamur animasyonu görünümü: yumuşak, parmak izi dokulu yuvarlak 3B karakterler, sıcak stüdyo ışığı. |
| `anime` | Anime tarzı: büyük parlak gözler, temiz çizgi, cel gölgelendirme, canlı gökyüzü arka planları. Gerçek anime karakterleri kullanılmaz. |
| `3d-animation` | Yumuşak ışıklı, Pixar benzeri ama özgün 3B karakterler. |
| `cgi-motion` | Parlak 3B nesneler ve hareketli tipografi; kamera hareketli, modern reklam hissi. |
| `retro-low-poly` | PS2 dönemi düşük poligonlu 3B: köşeli modeller, düz renkler, hafif bulanık doku. |

3B gerektiren stiller (`claymation`, `3d-animation`, `cgi-motion`, `retro-low-poly`, `explainer-3d`, `anime`) bulutta kodla (three.js ve benzeri) yapılır; ilk kez yapılırken önce tek bir deneme karesi üret ve görüntü kötüyse başka izinli stil seç.

## Liste dışı (kullanılmaz)

| Stil | Neden |
|---|---|
| — | (Metin beğenmediklerini buraya ekletecek) |

Bu listede adı olmayan eski stiller (watercolor, woodcut, silent-film, midcentury-toon, pixel-rpg, whiteboard, chalkboard vb.) artık kullanılmaz.
