#!/bin/sh
# GitHub Actions kurulumu: ffmpeg 7 (statik), lemo-opuscar (herkese acik depo), Node/Python paketleri, faster-whisper
set -e
LIB="$RUNNER_TEMP/lemo-opuscar"
mkdir -p "$RUNNER_TEMP/ff"
python3 sistem/lemo/indir.py "$RUNNER_TEMP/ff/f.tar.xz"
tar xf "$RUNNER_TEMP/ff/f.tar.xz" -C "$RUNNER_TEMP/ff"
B=$(dirname "$(find "$RUNNER_TEMP/ff" -name ffmpeg -type f | head -1)")
export PATH="$B:$PATH"
ffmpeg -version | head -1
git clone -q --depth 1 https://github.com/lemomo-ai/lemo-opuscar.git "$LIB"
git -C "$LIB" config lemo.managed true
LEMO_OPUSCAR_HOME="$LIB" sh "$LIB/plugin/skills/lemo-opuscar/scripts/setup.sh" deps
"$LIB/.venv/bin/python" -m pip install -q faster-whisper
echo "$B" >> "$GITHUB_PATH"
echo "LIB=$LIB" >> "$GITHUB_ENV"
echo "LEMO_OPUSCAR_HOME=$LIB" >> "$GITHUB_ENV"
echo "PY=$LIB/.venv/bin/python" >> "$GITHUB_ENV"
