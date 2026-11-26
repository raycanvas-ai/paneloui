"""Screenshot and measure a Panelo block: python -I verify.py <slug> [--url http://localhost:3000].

Writes light, dark and RTL full pages plus 3x crops of every control to $TMPDIR/panelo-verify/<slug>/,
and fails on any control part (thumb, indicator, badge) that leaves its control or sits unevenly inset.
"""
import os, sys, tempfile
from playwright.sync_api import sync_playwright

args = [a for a in sys.argv[1:] if not a.startswith("--")]
if not args:
    sys.exit(__doc__)
slug = args[0]
base = sys.argv[sys.argv.index("--url") + 1] if "--url" in sys.argv else "http://localhost:3000"
out = os.path.join(tempfile.gettempdir(), "panelo-verify", slug)
os.makedirs(out, exist_ok=True)

CONTROLS = "[role=switch],[role=radio],[role=checkbox],[role=combobox],button,input:not([type=hidden]):not([hidden])"

# For each switch/checkbox/radio with a single inner part, the gap on each side. Uneven = a geometry bug.
MEASURE = """sel => [...document.querySelectorAll(sel)].flatMap(el => {
  const part = el.querySelector('[data-slot$=thumb],[data-slot$=indicator]');
  if (!part || !part.getClientRects().length) return [];
  const a = el.getBoundingClientRect(), c = part.getBoundingClientRect();
  const g = { l: c.left - a.left, r: a.right - c.right, t: c.top - a.top, b: a.bottom - c.bottom };
  const name = el.getAttribute('aria-label') || el.textContent.trim().slice(0, 30) || el.dataset.slot;
  return [{ name, slot: part.dataset.slot, ...Object.fromEntries(Object.entries(g).map(([k, v]) => [k, +v.toFixed(1)])) }];
})"""

failures = []
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1280, "height": 900}, device_scale_factor=3)
    page.goto(f"{base}/preview/{slug}", wait_until="load", timeout=120000)
    page.wait_for_timeout(4000)

    page.screenshot(path=f"{out}/light.png", full_page=True)
    for i, el in enumerate(page.locator(CONTROLS).all()):
        if not el.is_visible():
            continue
        el.scroll_into_view_if_needed()
        box = el.bounding_box()
        if not box or box["width"] < 4:
            continue
        pad = 10
        page.screenshot(path=f"{out}/control-{i:02d}.png", clip={"x": max(0, box["x"] - pad), "y": max(0, box["y"] - pad), "width": box["width"] + 2 * pad, "height": box["height"] + 2 * pad})

    def check(label):
        for m in page.evaluate(MEASURE, "[role=switch],[role=checkbox],[role=radio]"):
            gaps = [m["l"], m["r"], m["t"], m["b"]]
            if min(gaps) < 0:
                failures.append(f"{label}: {m['name']} {m['slot']} leaves its control {m}")
            # Vertical inset should match; horizontal pairs differ only by the travel of a thumb.
            if abs(m["t"] - m["b"]) > 0.5:
                failures.append(f"{label}: {m['name']} {m['slot']} uneven top/bottom {m}")
            if m["slot"].endswith("thumb") and abs(min(m["l"], m["r"]) - m["t"]) > 0.5:
                failures.append(f"{label}: {m['name']} thumb end gap {min(m['l'], m['r'])} != top gap {m['t']}")

    check("light")
    for sw in page.locator("[role=switch]").all():  # measure the other state too
        sw.click(); page.wait_for_timeout(400); check("toggled"); sw.click(); page.wait_for_timeout(400)

    page.evaluate("document.documentElement.classList.add('dark')")
    page.wait_for_timeout(400)
    page.screenshot(path=f"{out}/dark.png", full_page=True)
    page.evaluate("document.documentElement.classList.remove('dark')")

    page.evaluate("const r = document.querySelector('main, section, body > div'); r.dir = 'rtl'; r.lang = 'ar'")
    page.wait_for_timeout(400)
    page.screenshot(path=f"{out}/rtl.png", full_page=True)
    check("rtl")
    browser.close()

print(f"screenshots: {out}")
print("\n".join(failures) if failures else "geometry: ok")
sys.exit(1 if failures else 0)
