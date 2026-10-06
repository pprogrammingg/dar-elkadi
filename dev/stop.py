#!/usr/bin/env python3
"""
Stop the local dev server started by dev/serve.py.

  python3 dev/stop.py
"""
from __future__ import annotations

import os
import signal
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEV_STATE = ROOT / ".dev"
PID_FILE = DEV_STATE / "server.pid"
PORT_FILE = DEV_STATE / "server.port"
DEFAULT_PORT = 8765


def read_port() -> int:
    if PORT_FILE.is_file():
        try:
            return int(PORT_FILE.read_text(encoding="utf-8").strip())
        except ValueError:
            pass
    return DEFAULT_PORT


def pids_on_port(port: int) -> list[int]:
    try:
        out = subprocess.check_output(
            ["lsof", "-ti", f"tcp:{port}", "-sTCP:LISTEN"],
            text=True,
            stderr=subprocess.DEVNULL,
        )
    except (subprocess.CalledProcessError, FileNotFoundError):
        return []
    return [int(line) for line in out.splitlines() if line.strip().isdigit()]


def pid_alive(pid: int) -> bool:
    try:
        os.kill(pid, 0)
    except ProcessLookupError:
        return False
    except PermissionError:
        return True
    return True


def stop_pid(pid: int) -> bool | None:
    if not pid_alive(pid):
        return False
    try:
        os.kill(pid, signal.SIGTERM)
    except PermissionError:
        return None
    for _ in range(20):
        if not pid_alive(pid):
            return True
        time.sleep(0.1)
    try:
        os.kill(pid, signal.SIGKILL)
    except PermissionError:
        return None
    return True


def main() -> int:
    stopped: list[int] = []
    blocked = False
    port = read_port()
    candidates: list[int] = []

    if PID_FILE.is_file():
        try:
            pid = int(PID_FILE.read_text(encoding="utf-8").strip())
        except ValueError:
            pid = 0
        if pid:
            candidates.append(pid)

    for pid in pids_on_port(port):
        if pid not in candidates:
            candidates.append(pid)

    for pid in candidates:
        result = stop_pid(pid)
        if result is True:
            stopped.append(pid)
        elif result is None:
            blocked = True

    for path in (PID_FILE, PORT_FILE):
        try:
            path.unlink(missing_ok=True)
        except OSError:
            pass

    if stopped:
        labels = ", ".join(str(p) for p in sorted(set(stopped)))
        print(f"Stopped dev server (PID {labels}).")
        return 0

    if blocked:
        print(
            "Dev server is running but could not be stopped from here. "
            "Use Ctrl+C in its terminal, or run: python3 dev/stop.py",
            file=sys.stderr,
        )
        return 1

    print("No dev server running.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
