#!/usr/bin/env python3
"""
Shared helpers for frontend check scripts.
"""

from __future__ import annotations

import os
import re
import sys
from typing import Iterable

# -------
# Config
# -------

FRONTEND_EXTS = {".tsx", ".jsx", ".ts", ".js", ".mjs", ".vue", ".svelte"}
JSX_EXTS = {".tsx", ".jsx"}
STYLE_EXTS = {".css", ".scss"}

LARGE_COMPONENT_LINES = 200
LARGE_FILE_LINES = 400
LARGE_GLOBAL_CSS_LINES = 80

ALLOWED_COMPONENT_TYPE_FOLDERS = {
    "atoms", "buttons", "forms", "tables", "cards", "typography",
    "charts", "overlays", "navigation", "feedback", "layout",
    "icons", "marketing", "sliders", "media", "auth-ui",
    "data", "surfaces", "templates", "modals", "dropdowns",
    "domain",
}

VAGUE_COMPONENT_FOLDERS = {
    "utils", "helpers", "common", "shared", "misc", "stuff",
    "global", "components",
}

VENDOR_PREFIXES = (
    "Mui", "Ant", "Radix", "Chakra", "Mantine", "Bootstrap",
)

VAGUE_FILE_NAMES = {
    "data.ts", "data.js", "data.tsx", "data.jsx",
    "types.ts", "types.js",
    "helpers.ts", "helpers.js",
    "utils.ts", "utils.js",
    "common.ts", "common.js",
}

# -------
# Helpers
# -------

class Finding:
    __slots__ = ("path", "line", "severity", "rule", "message")

    def __init__(self, path: str, line: int, severity: str, rule: str, message: str):
        self.path = path
        self.line = line
        self.severity = severity
        self.rule = rule
        self.message = message

    def emit(self) -> str:
        return f"{self.path}:{self.line}: [{self.severity}] [{self.rule}] {self.message}"


def file_ext(path: str) -> str:
    return os.path.splitext(path)[1].lower()


def basename(path: str) -> str:
    return os.path.basename(path)


def basename_no_ext(path: str) -> str:
    return os.path.splitext(basename(path))[0]


def norm(path: str) -> str:
    return path.replace("\\", "/")


def read_lines(path: str) -> list[str] | None:
    try:
        with open(path, "r", encoding="utf-8", errors="replace") as f:
            return f.read().splitlines()
    except OSError:
        return None


def under(path: str, segment: str) -> bool:
    """True if /<segment>/ appears anywhere in normalized path."""
    return f"/{segment}/" in f"/{norm(path)}/"


def in_components(path: str) -> bool:
    return under(path, "components")


def in_routes(path: str) -> bool:
    return under(path, "routes")


def in_pages(path: str) -> bool:
    return under(path, "pages")


def in_layouts(path: str) -> bool:
    return under(path, "layouts")


def expand_paths(args: Iterable[str], exts: set[str] | None = None) -> list[str]:
    """Walk directories and return matching files."""
    if exts is None:
        exts = FRONTEND_EXTS | STYLE_EXTS
    out: list[str] = []
    for a in args:
        if os.path.isdir(a):
            for root, _, files in os.walk(a):
                for name in files:
                    if file_ext(name) in exts:
                        out.append(os.path.join(root, name))
        else:
            out.append(a)
    return out


def run_checks(argv: list[str], script_name: str, check_fn, exts: set[str] | None = None) -> int:
    """Generic driver: parse args, expand paths, run check_fn, print results."""
    if len(argv) < 2:
        sys.stderr.write(f"usage: {script_name} FILE [FILE ...]\n")
        return 2

    paths = expand_paths(argv[1:], exts)
    findings: list[Finding] = []
    check_fn(paths, findings)

    if not findings:
        print(f"OK: no {script_name.replace('.py', '').replace('check-', '')} issues found")
        return 0

    findings.sort(key=lambda f: (f.path, f.line, f.rule))
    for f in findings:
        print(f.emit())

    n_warn = sum(1 for f in findings if f.severity == "WARN")
    n_info = sum(1 for f in findings if f.severity == "INFO")
    print(f"\nSummary: {len(findings)} finding(s) — WARN={n_warn}, INFO={n_info}")
    return 1
