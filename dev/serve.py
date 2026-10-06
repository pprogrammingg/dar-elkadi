#!/usr/bin/env python3
"""
Dev static server — serves the repo root with no-cache headers.

  python3 dev/serve.py

Open http://127.0.0.1:8765/
"""
from __future__ import annotations

import atexit
import os
import sys
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEV_STATE = ROOT / ".dev"
PID_FILE = DEV_STATE / "server.pid"
PORT_FILE = DEV_STATE / "server.port"

NO_CACHE_EXT = {".html", ".css", ".js", ".json", ".mjs", ".md"}
DEFAULT_PORT = 8765
HOST = os.environ.get("HOST", "127.0.0.1")
HOME_PATH = "/index.html"

# Pretty paths (same idea as Cloudflare _redirects)
PRETTY_ROUTES = {
    "/campaign": "/campaign.html",
    "/campaign/": "/campaign.html",
}


class DevHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self) -> None:
        ext = Path(self.path.split("?")[0]).suffix.lower()
        if ext in NO_CACHE_EXT:
            self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
            self.send_header("Pragma", "no-cache")
        super().end_headers()

    def do_GET(self):
        path = self.path.split("?", 1)[0]
        if path in ("", "/"):
            self.send_response(302)
            self.send_header("Location", HOME_PATH)
            self.end_headers()
            return
        pretty = PRETTY_ROUTES.get(path)
        if pretty:
            self.path = pretty + (
                "?" + self.path.split("?", 1)[1] if "?" in self.path else ""
            )
        return super().do_GET()


def write_server_state(port: int) -> None:
    DEV_STATE.mkdir(parents=True, exist_ok=True)
    PID_FILE.write_text(str(os.getpid()), encoding="utf-8")
    PORT_FILE.write_text(str(port), encoding="utf-8")


def clear_server_state() -> None:
    for path in (PID_FILE, PORT_FILE):
        try:
            path.unlink(missing_ok=True)
        except OSError:
            pass


def pick_port(start: int) -> int:
    import socket

    for port in range(start, start + 20):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            try:
                sock.bind((HOST, port))
                return port
            except OSError:
                continue
    raise OSError(f"No free port between {start} and {start + 19}")


def main() -> int:
    requested = int(os.environ.get("PORT", DEFAULT_PORT))
    try:
        port = pick_port(requested)
    except OSError as exc:
        print(exc, file=sys.stderr)
        return 1

    server = HTTPServer((HOST, port), DevHandler)
    url = f"http://{HOST}:{port}/"
    write_server_state(port)
    atexit.register(clear_server_state)
    if port != requested:
        print(f"Port {requested} busy — using {port}")
    print(f"Dev server (no-cache): {url}")
    print(f"  → {url.rstrip('/')}{HOME_PATH}")
    print("Press Ctrl+C to stop, or run: python3 dev/stop.py")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
    finally:
        clear_server_state()
        server.server_close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
