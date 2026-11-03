"""Workbench render: python3 render_wb.py <content.json> <out_dir> -> prints JSON list of jpgs."""
import os, sys, json, pathlib, subprocess
P = pathlib.Path(__file__).parent
content, out = sys.argv[1], sys.argv[2]
pathlib.Path(out).mkdir(parents=True, exist_ok=True)
env = dict(os.environ, CONTENT=content, OUT_DIR=out, FONT_DIR=str(P / "fonts"))
subprocess.run([sys.executable, str(P / "build.py")], env=env, check=True)
files = (pathlib.Path(out) / "list.txt").read_text().split("\n")
from playwright.sync_api import sync_playwright
res, over = [], []
with sync_playwright() as pw:
    b = pw.chromium.launch(); pg = b.new_page(viewport={"width": 1080, "height": 1350})
    for f in files:
        pg.goto("file://" + f); pg.evaluate("document.fonts.ready")
        if pg.evaluate("document.body.scrollHeight>1350"): over.append(f)
        j = f.replace(".html", ".jpg"); pg.screenshot(path=j, type="jpeg", quality=90); res.append(j)
    b.close()
print(json.dumps({"jpgs": res, "overflow": over}))
