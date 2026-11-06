#!/bin/sh
# Workbench kurulumu: kod + fontlar + Playwright. Kullanım: sh kurulum.sh
D=/home/user/ing; mkdir -p $D/fonts; cd $D
RAW=https://raw.githubusercontent.com/mtnylmz29-a11y/ingilizcecim-medya/main/sistem
for f in build.py render_wb.py ws.py reels.py anim.py kalite.py; do curl -sSfL $RAW/$f -o $f; done
for p in baloo-2 nunito; do for w in 600 700 800; do for s in latin latin-ext; do
  curl -sSfL https://cdn.jsdelivr.net/npm/@fontsource/$p@5/files/$p-$s-$w-normal.woff2 -o fonts/$p-$s-$w.woff2 || true
done; done; done
python3 -c "import playwright" 2>/dev/null || pip install -q playwright
python3 -c "import imageio_ffmpeg" 2>/dev/null || pip install -q imageio-ffmpeg
for i in 1 2 3; do python3 -m playwright install --with-deps chromium >/dev/null 2>&1 && break; sleep 5; done
echo KURULUM_TAMAM
