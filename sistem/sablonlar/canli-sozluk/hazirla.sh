#!/bin/sh
# Canlı Sözlük: film klasörüne şablon motorunu kopyalar (sablon/, depoya girmez) ve index.html yoksa koyar.
# Kullanım (depo kökünden): sh sistem/sablonlar/canli-sozluk/hazirla.sh filmler/<klasör>
# Hangi şablon: sozluk.json'daki "sablon" alanı: "isik-kutusu" ya da "cizgi-film". teslim.sh bunu kendisi çağırır.
set -e
FILM="$1"; KOK=$(cd "$(dirname "$0")" && pwd)
[ -f "$FILM/sozluk.json" ] || { echo "SABLON HATASI: $FILM/sozluk.json yok"; exit 1; }
SAB=$(sed -n 's/.*"sablon"[[:space:]]*:[[:space:]]*"\([a-z-]*\)".*/\1/p' "$FILM/sozluk.json" | head -1)
[ -d "$KOK/$SAB" ] || { echo "SABLON HATASI: sozluk.json \"sablon\" = '$SAB' (isik-kutusu | cizgi-film olmalı)"; exit 1; }
[ -f "$FILM/sahne.js" ] || { echo "SABLON HATASI: $FILM/sahne.js yok (örnek: $KOK/$SAB/sahneler/)"; exit 1; }
rm -rf "$FILM/sablon"; mkdir -p "$FILM/sablon"
cp -r "$KOK/$SAB/." "$FILM/sablon/"; cp -r "$KOK/fonts" "$FILM/sablon/fonts"; rm -f "$FILM/sablon/index.html"
printf '*\n' > "$FILM/sablon/.gitignore"
[ -f "$FILM/index.html" ] || cp "$KOK/$SAB/index.html" "$FILM/index.html"
[ -f "$FILM/mix.py" ] || printf 'import runpy, sys, os\n# Canlı Sözlük müziği: sistem/sablonlar/canli-sozluk/muzik.py\nsys.argv[0] = p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "sistem", "sablonlar", "canli-sozluk", "muzik.py")\nrunpy.run_path(p, run_name="__main__")\n' > "$FILM/mix.py"
echo "hazir: $FILM ($SAB)"
