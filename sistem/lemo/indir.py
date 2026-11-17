"""ffmpeg 7+ statik derlemesini indirir (BtbN, yedek: johnvansickle)."""
import sys, urllib.request

KAYNAK = ["https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-linux64-gpl.tar.xz",
          "https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz"]
for u in KAYNAK:
    try:
        urllib.request.urlretrieve(u, sys.argv[1]); print("indirildi:", u); break
    except Exception as e:
        print("olmadi:", u, e)
else:
    sys.exit("ffmpeg indirilemedi")
