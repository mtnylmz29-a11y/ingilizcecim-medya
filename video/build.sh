#!/bin/sh
# Spec -> MP4 (+ kontrol kareleri). Kullanım (depo kökünden): sh video/build.sh gunler/2026-11-15/etym_salary.json
# Dosya adı biçimi belirler: etym_<ad>.json -> Etym (Kelimelerin Tarihçesi), dunya_<ad>.json -> Dunya (Dünya turu).
# Çıktı: aynı klasöre <ad>_<biçim>.mp4 ve <ad>_<biçim>_kareler.jpg
set -e
SPEC=$1
D=$(dirname "$SPEC")
B=$(basename "$SPEC" .json)
BICIM=${B%%_*}
AD=${B#*_}
case "$BICIM" in
  etym) COMP=Etym ;;
  dunya) COMP=Dunya ;;
  *) echo "SPEC HATASI: dosya adı etym_<ad>.json ya da dunya_<ad>.json olmalı"; exit 2 ;;
esac
ROOT=$(pwd)
IS=$(mktemp -d)
PY=${PYTHON:-python3}
"$PY" video/ses.py "$SPEC" "$IS"
"$PY" video/mix.py "$IS"
(cd video && npx remotion render $COMP "$IS/video.mp4" --props="$IS/veri.json" --muted --codec=h264 --x264-preset=veryfast --crf=21 --log=error)
OUT="$ROOT/$D/${AD}_${BICIM}"
ffmpeg -y -v error -i "$IS/video.mp4" -i "$IS/mix.wav" -map 0:v -map 1:a -c:v copy \
  -af loudnorm=I=-14:TP=-1.5:LRA=11 -ar 48000 -c:a aac -b:a 160k -shortest -movflags +faststart "$OUT.mp4"
# Kontrol kareleri: 12 eşit aralıklı kare, 6x2 ızgara (Editör buna bakar)
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT.mp4")
ffmpeg -y -v error -i "$OUT.mp4" -vf "fps=12/$DUR,scale=270:-1,tile=6x2" -frames:v 1 -q:v 3 "${OUT}_kareler.jpg"
echo "TAMAM $D/${AD}_${BICIM}.mp4 ($DUR sn)"
