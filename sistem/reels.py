"""Reels: 1080x1350 slaytlardan 1080x1920 dikey video.
Kullanım: python3 reels.py <out.mp4> <renk_hex> <slayt1.jpg> <slayt2.jpg> ...
Her slayt 3.5 sn (ilk 2.5, son 4.5), sessiz ses izi (Instagram uyumu)."""
import sys, subprocess, os, tempfile, shutil
from PIL import Image
try:
    import imageio_ffmpeg
    FF = imageio_ffmpeg.get_ffmpeg_exe()
except Exception:
    FF = shutil.which("ffmpeg")
out, renk, slides = sys.argv[1], sys.argv[2], sys.argv[3:]
tmp = tempfile.mkdtemp()
frames = []
for i, s in enumerate(slides):
    bg = Image.new("RGB", (1080, 1920), renk)
    im = Image.open(s).convert("RGB")
    bg.paste(im, (0, (1920 - 1350) // 2))
    p = f"{tmp}/f{i:02d}.jpg"; bg.save(p, quality=92); frames.append(p)
durs = [2.5] + [3.5] * (len(frames) - 2) + [4.5] if len(frames) > 1 else [5.0]
lst = f"{tmp}/list.txt"
with open(lst, "w") as f:
    for p, d in zip(frames, durs):
        f.write(f"file '{p}'\nduration {d}\n")
    f.write(f"file '{frames[-1]}'\n")
total = sum(durs)
args = [FF, "-y", "-f", "concat", "-safe", "0", "-i", lst,
        "-f", "lavfi", "-t", f"{total}", "-i", "anullsrc=r=44100:cl=stereo",
        "-vf", "fps=30,format=yuv420p", "-c:v", "libx264", "-preset", "veryfast",
        "-tune", "stillimage", "-crf", "22", "-c:a", "aac", "-b:a", "96k",
        "-t", f"{total}", "-movflags", "+faststart", out]
r = subprocess.run(args, capture_output=True, text=True)
if r.returncode:
    print(r.stderr[-1500:]); sys.exit(1)
print(out, os.path.getsize(out), f"{total}s")
