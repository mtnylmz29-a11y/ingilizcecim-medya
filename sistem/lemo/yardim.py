"""teslim.sh yardımcıları: bilgi | srt | kontrol"""
import json, sys

k = sys.argv[1]
if k == "bilgi":
    f = sys.argv[2]; F = json.load(open(f"{f}/film.json", encoding="utf-8")); d = json.load(open(f"{f}/ses/zaman.json", encoding="utf-8"))["dur"]
    print(f"AD='{F['ad']}'\nTARIH='{F['tarih']}'\nGRAIN='{F.get('grain', 0)}'\nDUR='{d}'")
    print("TS='" + " ".join(f"{d * i / 11:.2f}" for i in range(12)).replace("0.00", "0.30", 1) + "'")
    print("KARE='" + " ".join(f"{d * p:.2f}" for p in (0.06, 0.18, 0.30, 0.42, 0.54, 0.66, 0.78, 0.92)) + "'")
elif k == "srt":
    f, out = sys.argv[2], sys.argv[3]; Z = json.load(open(f"{f}/ses/zaman.json", encoding="utf-8"))

    def ts(x):
        h, m = int(x // 3600), int(x % 3600 // 60); s = x % 60
        return f"{h:02d}:{m:02d}:{int(s):02d},{int(round((s % 1) * 1000)) % 1000:03d}"
    satir, n = [], 1
    for l in Z["satirlar"]:
        w = l["metin"].split(); parts = [w[i:i + 6] for i in range(0, len(w), 6)]
        d = (l["t1"] - l["t0"]) / max(1, len(w)); i0 = 0
        for p in parts:
            a = l["t0"] + i0 * d; b = l["t0"] + (i0 + len(p)) * d; i0 += len(p)
            satir.append(f"{n}\n{ts(a)} --> {ts(b)}\n{' '.join(p)}\n"); n += 1
    open(out, "w", encoding="utf-8").write("\n".join(satir))
elif k == "kontrol":
    p = json.load(open(sys.argv[2])); d = float(p["format"]["duration"]); mb = int(p["format"]["size"]) / 1e6
    v = [s for s in p["streams"] if s["codec_type"] == "video"][0]; a = [s for s in p["streams"] if s["codec_type"] == "audio"]
    h = []
    if not (35 <= d <= 60): h.append(f"süre {d:.1f} sn (35–60 olmalı)")
    if (v["width"], v["height"]) != (1080, 1920): h.append(f"boyut {v['width']}x{v['height']}")
    if mb >= 50: h.append(f"dosya {mb:.1f} MB (<50)")
    if not a: h.append("ses yok")
    print(f"KONTROL: {d:.1f} sn, {v['width']}x{v['height']}, {mb:.1f} MB, ses {'var' if a else 'yok'}")
    if h: print("KONTROL HATASI: " + "; ".join(h)); sys.exit(4)
