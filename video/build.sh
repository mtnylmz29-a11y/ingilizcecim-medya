#!/bin/sh
# Spec -> MP4 (+ kontrol kareleri). Kullanım (depo kökünden): sh video/build.sh gunler/2026-11-15/etym_salary.json
# Çıktı: aynı klasöre <kelime>_etym.mp4 ve <kelime>_etym_kareler.jpg
set -e
SPEC=$1
D=$(dirname "$SPEC")
AD=$(basename "$SPEC" .json); AD=${AD#etym_}
ROOT=$(pwd)
IS=$(mktemp -d)
PY=${PYTHON:-python3}
"$PY" video/ses.py "$SPEC" "$IS"
"$PY" video/mix.py "$IS"
(cd video && npx remotion render Etym "$IS/video.mp4" --props="$IS/veri.json" --muted --codec=h264 --x264-preset=veryfast --crf=21 --log=error)
ffmpeg -y -v error -i "$IS/video.mp4" -i "$IS/mix.wav" -map 0:v -map 1:a -c:v copy \
  -af loudnorm=I=-14:TP=-1.5:LRA=11 -ar 48000 -c:a aac -b:a 160k -shortest -movflags +faststart "$ROOT/$D/${AD}_etym.mp4"
# Kontrol kareleri: 12 eşit aralıklı kare, 6x2 ızgara (Editör buna bakar)
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$ROOT/$D/${AD}_etym.mp4")
ffmpeg -y -v error -i "$ROOT/$D/${AD}_etym.mp4" -vf "fps=12/$DUR,scale=270:-1,tile=6x2" -frames:v 1 -q:v 3 "$ROOT/$D/${AD}_etym_kareler.jpg"
echo "TAMAM $D/${AD}_etym.mp4 ($DUR sn)"
