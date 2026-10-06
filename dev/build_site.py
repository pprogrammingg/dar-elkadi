#!/usr/bin/env python3
"""
Build static site into _site/ for Cloudflare Pages (free).

  python3 dev/build_site.py

Copies public assets only. Plaintext admin JSON and secrets/ stay out.
Requires data/*.enc.json for gated pages (run dev/encrypt_admin.py first).
"""
from __future__ import annotations

import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "_site"

PUBLIC_HTML = ["index.html", "campaign.html"]
PUBLIC_DIRS = {
    "css": ["styles.css"],
    "js": ["main.js", "campaign.js", "gate.js"],
    "data": ["menu.json"],  # enc files added below
    "assets": None,  # selective
}

ASSET_FILES = [
    "logo_only_1.jpeg",
    "olive_traced.jpeg",
    "jog.jpeg",
    "dessert.jpeg",
    "pour.jpeg",
    "lantern_traced.png",
]
PATTERN_FILES = [
    "islamic_corner.svg",
    "islamic-tile.svg",
    "islamic_pattern_2_1.jpeg",
    "scroll-bob.svg",
]


def clean() -> None:
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)


def copy_file(src: Path, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dest)


def main() -> int:
    clean()

    for name in PUBLIC_HTML:
        src = ROOT / name
        if not src.is_file():
            print(f"Missing {name}", file=sys.stderr)
            return 1
        copy_file(src, OUT / name)

    copy_file(ROOT / "css" / "styles.css", OUT / "css" / "styles.css")
    for js in ("main.js", "campaign.js", "gate.js"):
        copy_file(ROOT / "js" / js, OUT / "js" / js)

    copy_file(ROOT / "data" / "menu.json", OUT / "data" / "menu.json")

    enc_files = sorted((ROOT / "data").glob("*.enc.json"))
    if not enc_files:
        print(
            "No data/*.enc.json — run: python3 dev/encrypt_admin.py",
            file=sys.stderr,
        )
        return 1
    for enc in enc_files:
        copy_file(enc, OUT / "data" / enc.name)

    for name in ASSET_FILES:
        copy_file(ROOT / "assets" / name, OUT / "assets" / name)
    for name in PATTERN_FILES:
        copy_file(
            ROOT / "assets" / "patterns" / name,
            OUT / "assets" / "patterns" / name,
        )

    for name in ("_redirects", "_headers"):
        src = ROOT / name
        if src.is_file():
            copy_file(src, OUT / name)

    (OUT / ".nojekyll").write_text("", encoding="utf-8")
    print(f"Built {OUT.relative_to(ROOT)}/ for Cloudflare Pages")
    return 0


if __name__ == "__main__":
    sys.exit(main())
