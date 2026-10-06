#!/usr/bin/env python3
"""
Encrypt admin JSON for password-gated pages (AES-256-GCM + PBKDF2).

  # Edit plaintext (gitignored), then:
  python3 dev/encrypt_admin.py
  python3 dev/encrypt_admin.py campaign

Reads secrets/password (gitignored) and data/<name>.json → data/<name>.enc.json
"""
from __future__ import annotations

import argparse
import base64
import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SECRETS = ROOT / "secrets" / "password"
DATA = ROOT / "data"
ITERATIONS = 250_000


def _python() -> Path:
    venv = ROOT / ".venv" / "bin" / "python"
    return venv if venv.exists() else Path(sys.executable)


def load_password() -> str:
    if not SECRETS.is_file():
        raise SystemExit(
            f"Missing {SECRETS.relative_to(ROOT)}\n"
            "Create it with one line (the site admin password), then re-run."
        )
    password = SECRETS.read_text(encoding="utf-8").strip()
    if not password:
        raise SystemExit(f"{SECRETS.relative_to(ROOT)} is empty.")
    return password


def encrypt_bytes(plaintext: bytes, password: str) -> dict:
    try:
        from cryptography.hazmat.primitives.ciphers.aead import AESGCM
        from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
        from cryptography.hazmat.primitives import hashes
    except ImportError as exc:
        raise SystemExit(
            "Need cryptography. Run:\n"
            "  python3 -m venv .venv && .venv/bin/pip install cryptography\n"
            "  .venv/bin/python dev/encrypt_admin.py"
        ) from exc

    salt = os.urandom(16)
    iv = os.urandom(12)
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=ITERATIONS,
    )
    key = kdf.derive(password.encode("utf-8"))
    ct = AESGCM(key).encrypt(iv, plaintext, None)
    b64 = lambda b: base64.b64encode(b).decode("ascii")
    return {
        "v": 1,
        "alg": "AES-GCM",
        "kdf": "PBKDF2-SHA256",
        "iter": ITERATIONS,
        "salt": b64(salt),
        "iv": b64(iv),
        "ct": b64(ct),
    }


def encrypt_name(name: str, password: str) -> Path:
    src = DATA / f"{name}.json"
    if not src.is_file():
        raise SystemExit(f"Missing plaintext source: {src.relative_to(ROOT)}")
    # Validate JSON
    payload = json.loads(src.read_text(encoding="utf-8"))
    raw = json.dumps(payload, ensure_ascii=False, separators=(",", ":")).encode(
        "utf-8"
    )
    blob = encrypt_bytes(raw, password)
    out = DATA / f"{name}.enc.json"
    out.write_text(json.dumps(blob, indent=2) + "\n", encoding="utf-8")
    return out


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "names",
        nargs="*",
        default=["campaign"],
        help="Admin page data names (default: campaign)",
    )
    args = parser.parse_args()
    password = load_password()
    for name in args.names:
        slug = name.strip().lower().replace(" ", "-")
        out = encrypt_name(slug, password)
        print(f"Encrypted {slug}.json → {out.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
