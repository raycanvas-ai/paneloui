"""Base UI edition parity: render /preview/<slug> on the UI SDK dev server and the Base UI one, diff the pixels.
python -I parity.py <slug> [slug...] [--sdk http://localhost:3000] [--base http://localhost:3001]

Start the Base UI server with `PANELO_EDITION=base npx next dev -p 3001`. Writes both screenshots and a diff mask to
$TMPDIR/panelo-parity/, and prints per block the share of pixels that differ plus any page or console errors on Base UI.
"""
import os, sys, tempfile
from playwright.sync_api import sync_playwright
from PIL import Image, ImageChops
opt = lambda flag, default: sys.argv[sys.argv.index(flag) + 1] if flag in sys.argv else default
SDK, BASE = opt("--sdk", "http://localhost:3000"), opt("--base", "http://localhost:3001")
slugs = [a for i, a in enumerate(sys.argv[1:], 1) if not a.startswith("--") and sys.argv[i - 1] not in ("--sdk", "--base")]
out = os.path.join(tempfile.gettempdir(), "panelo-parity")
os.makedirs(out, exist_ok=True)
def shot(pg, url, path, errors):
    errors.clear()
    pg.goto(url, wait_until="networkidle", timeout=240000)
    pg.add_style_tag(content="*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important}")
    pg.wait_for_timeout(1200)
    pg.screenshot(path=path, full_page=True)
    return list(errors)
with sync_playwright() as p:
    b = p.chromium.launch()
    for slug in slugs:
        res = {}
        for name, base in (("sdk", SDK), ("base", BASE)):
            pg = b.new_page(viewport={"width": 1280, "height": 900})
            errs = []
            pg.on("pageerror", lambda e, errs=errs: errs.append(str(e)[:160]))
            pg.on("console", lambda m, errs=errs: m.type == "error" and errs.append(m.text[:160]))
            path = f"{out}/{slug}-{name}.png"
            try:
                res[name] = (path, shot(pg, f"{base}/preview/{slug}", path, errs) or list(errs))
            except Exception as e:
                res[name] = (None, [f"LOAD FAIL {e}"[:160]])
            pg.close()
        a, c = res["sdk"][0], res["base"][0]
        diff = "n/a"
        if a and c:
            ia, ic = Image.open(a).convert("RGB"), Image.open(c).convert("RGB")
            if ia.size != ic.size:
                diff = f"size {ia.size} vs {ic.size}"
                w, h = min(ia.width, ic.width), min(ia.height, ic.height); ia, ic = ia.crop((0,0,w,h)), ic.crop((0,0,w,h))
            d = ImageChops.difference(ia, ic).convert("L").point(lambda v: 255 if v > 24 else 0)
            frac = sum(d.histogram()[255:]) / (d.width * d.height)
            diff = f"{frac*100:.2f}% px differ" + ("" if ia.size == ic.size else f" ({diff})")
            if frac > 0.001:
                bbox = d.getbbox(); d.save(f"{out}/{slug}-diff.png"); diff += f" bbox={bbox}"
        print(f"{slug}: {diff} | base errors: {res['base'][1][:3]} | sdk errors: {res["sdk"][1][:2]}", flush=True)
    b.close()
