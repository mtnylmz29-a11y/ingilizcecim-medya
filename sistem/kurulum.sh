#!/bin/sh
# Workbench kurulumu: kod + fontlar + Playwright. Kullanım: sh kurulum.sh
set -e
D=/home/user/ing; mkdir -p $D/fonts; cd $D
RAW=https://raw.githubusercontent.com/mtnylmz29-a11y/ingilizcecim-medya/main/sistem
for f in build.py render_wb.py; do curl -sSfL $RAW/$f -o $f; done
for p in baloo-2 nunito; do for w in 600 700 800; do for s in latin latin-ext; do
  curl -sSfL https://cdn.jsdelivr.net/npm/@fontsource/$p@5/files/$p-$s-$w-normal.woff2 -o fonts/$p-$s-$w.woff2 || true
done; done; done
python3 -c "import playwright" 2>/dev/null || (pip install -q playwright && python3 -m playwright install --with-deps chromium >/dev/null)
echo KURULUM_TAMAM
