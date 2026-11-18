#!/bin/sh
# Bulut lemo filmi: render, miks, mux (ffmpeg 7), altyazi, kareler, kontroller, gunler/<tarih>/ icine kopya.
# Kullanim (depo kokunden, LIB = lemo-opuscar klasoru): sh sistem/lemo/teslim.sh <film_klasoru> [onizleme]
set -e
FILM=$(cd "$1" && pwd); REPO=$(pwd); PY=${PY:-$LIB/.venv/bin/python}
[ -f "$LIB/core/render/video.mjs" ] || { echo "LIB yok"; exit 1; }
[ -f "$FILM/index.html" ] || { echo "FILM HATASI: $FILM/index.html yok"; exit 1; }
[ -f "$FILM/ses/zaman.json" ] || { echo "FILM HATASI: ses/zaman.json yok, once asama=ses"; exit 1; }
$PY "$REPO/sistem/lemo/yardim.py" bilgi "$FILM" > /tmp/bilgi.env
. /tmp/bilgi.env
SIZE=1080x1920
cd "$LIB"
if [ "$2" = onizleme ]; then
  node core/render/still.mjs "$FILM" $TS --size $SIZE --out /tmp/stills
  $PY core/render/sheet.py "$FILM/onizleme.jpg" /tmp/stills/*.jpg --cols 6 --w 300
  echo "onizleme: $FILM/onizleme.jpg"; exit 0
fi
mkdir -p "$FILM/out" /tmp/k
node core/render/events.mjs "$FILM" --size $SIZE --out "$FILM/events.json" || echo "(EV yok)"
node core/render/video.mjs "$FILM" --fps 24 --workers 4 --size $SIZE --out /tmp/video.mp4
if [ -f "$FILM/mix.py" ]; then $PY "$FILM/mix.py" "$FILM" /tmp/mix.wav; else $PY "$REPO/sistem/lemo/mix.py" "$FILM" /tmp/mix.wav; fi
sh core/render/mux.sh /tmp/video.mp4 /tmp/mix.wav /tmp/film.mp4 24 "$GRAIN"
node core/render/still.mjs "$FILM" "$KAPAK_T" --size $SIZE --q kapak=1 --out /tmp/kapak
cd "$REPO"
cp /tmp/kapak/*.jpg "$FILM/out/kapak.jpg"
$PY sistem/lemo/yardim.py srt "$FILM" "$FILM/out/film.srt"
i=0
for T in $KARE; do
  ffmpeg -loglevel error -y -ss "$T" -i /tmp/film.mp4 -frames:v 1 -vf scale=360:640 "/tmp/k/$i.jpg"; i=$((i+1))
done
ffmpeg -loglevel error -y -i "/tmp/k/%d.jpg" -vf tile=4x2 "$FILM/out/kareler.jpg"
ffprobe -v error -show_entries stream=width,height,codec_type -show_entries format=duration,size -of json /tmp/film.mp4 > /tmp/probe.json
$PY sistem/lemo/yardim.py kontrol /tmp/probe.json
$PY sistem/lemo/ses_kontrol.py "$FILM" || echo "UYARI: SES PARAZITI (ses.py ile susturulmus olmaliydi)"
mkdir -p "gunler/$TARIH"
cp /tmp/film.mp4 "gunler/$TARIH/$AD.mp4"
cp "$FILM/out/film.srt" "gunler/$TARIH/$AD.srt"
cp "$FILM/out/kareler.jpg" "gunler/$TARIH/${AD}_kareler.jpg"
cp "$FILM/out/kapak.jpg" "gunler/$TARIH/${AD}_kapak.jpg"
echo "TESLIM: gunler/$TARIH/$AD.mp4"
