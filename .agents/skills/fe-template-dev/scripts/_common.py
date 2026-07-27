#!/usr/bin/env python3
"""
Shared helpers for fe-template-dev check scripts.

Not intended to be run directly. Provides the Finding class, path/segment
helpers, layer inference, import-specifier extraction, and the run_checks
driver used by every check-*.py script.

A file's LAYER and ROLE are inferred from its path segments, so the scripts
work both in a monorepo (packages/ui/src/...) and in a flat project being
extracted into a template (src/...).
"""

from __future__ import annotations

import os
import re
import sys
from typing import Iterable, Optional

# -------
# Config
# -------

CODE_EXTS = {".tsx", ".jsx", ".ts", ".js", ".mjs", ".vue", ".svelte"}
JSX_EXTS = {".tsx", ".jsx"}
STYLE_EXTS = {".css", ".scss"}

LARGE_COMPONENT_LINES = 200
LARGE_FILE_LINES = 400

# Layer rank by folder name (path segment). Lower number = lower layer.
LAYER_BY_FOLDER = {
    "tokens": 1, "themes": 1,
    "atoms": 2, "forms": 2, "icons": 2,
    "feedback": 3, "surfaces": 3, "overlays": 3, "data": 3, "charts": 3,
    "cards": 3, "tables": 3, "sliders": 3, "lists": 3, "media": 3,
    "modals": 3, "dropdowns": 3,
    "navigation": 4, "layout": 4, "auth": 4, "marketing": 4,
    "domain": 4, "sections": 4,
    "templates": 5, "patterns": 5,
}

VAGUE_COMPONENT_FOLDERS = {"utils", "helpers", "common", "shared", "misc", "stuff", "global"}

VAGUE_FILE_NAMES = {
    "data.ts", "data.js", "data.tsx", "data.jsx",
    "types.ts", "types.js",
    "helpers.ts", "helpers.js",
    "utils.ts", "utils.js",
    "common.ts", "common.js",
}

# import specifier extractors
_RE_FROM = re.compile(r"""\bfrom\s+['"]([^'"]+)['"]""")
_RE_SIDE = re.compile(r"""^\s*import\s+['"]([^'"]+)['"]""")
_RE_REQUIRE = re.compile(r"""\brequire\(\s*['"]([^'"]+)['"]\s*\)""")
_RE_DYN = re.compile(r"""\bimport\(\s*['"]([^'"]+)['"]\s*\)""")

# -------
# Finding
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

# -------
# Path helpers
# -------

def file_ext(path: str) -> str:
    return os.path.splitext(path)[1].lower()


def basename(path: str) -> str:
    return os.path.basename(path)


def basename_no_ext(path: str) -> str:
    return os.path.splitext(basename(path))[0]


def norm(path: str) -> str:
    return path.replace("\\", "/")


def segments(path: str) -> list[str]:
    return [s for s in norm(path).split("/") if s]


def read_lines(path: str) -> Optional[list[str]]:
    try:
        with open(path, "r", encoding="utf-8", errors="replace") as f:
            return f.read().splitlines()
    except OSError:
        return None


def seg_in(path: str, name: str) -> bool:
    return name in segments(path)

# -------
# Role / scope inference
# -------

def in_tokens(path: str) -> bool:
    return seg_in(path, "tokens")


def in_themes(path: str) -> bool:
    return seg_in(path, "themes")


def in_mocks(path: str) -> bool:
    if any(s in {"mocks", "fixtures", "__mocks__"} for s in segments(path)):
        return True
    return ".fixtures." in basename(path)


def in_catalog(path: str) -> bool:
    segs = segments(path)
    return "sample" in segs or "catalog" in segs or "stories" in segs


def in_tests(path: str) -> bool:
    b = basename(path)
    if ".test." in b or ".spec." in b:
        return True
    return any(s in {"tests", "__tests__"} for s in segments(path))


def is_barrel(path: str) -> bool:
    return basename(path) in {"index.ts", "index.tsx", "index.js", "index.mjs"}


def layer_of(path: str) -> Optional[int]:
    """Rank of the deepest recognized layer folder in the path, else None."""
    rank: Optional[int] = None
    for s in segments(path):
        if s in LAYER_BY_FOLDER:
            rank = LAYER_BY_FOLDER[s]
    return rank


def is_component_source(path: str) -> bool:
    if file_ext(path) not in CODE_EXTS:
        return False
    if in_tests(path) or in_mocks(path):
        return False
    return seg_in(path, "components") or layer_of(path) is not None

# -------
# Import specifiers
# -------

def import_specs_in_line(line: str) -> list[str]:
    out: list[str] = []
    for rx in (_RE_FROM, _RE_SIDE, _RE_REQUIRE, _RE_DYN):
        for m in rx.finditer(line):
            out.append(m.group(1))
    return out


def is_internal_spec(spec: str) -> bool:
    """A specifier that resolves inside the template/library (not an npm dep)."""
    if spec.startswith(".") or spec.startswith("src/"):
        return True
    if "/components/" in spec or "/tokens/" in spec:
        return True
    if re.search(r"@[\w.-]+/ui(?:/|$)", spec):
        return True
    return False


def spec_layer(spec: str) -> Optional[int]:
    """Highest layer rank among the specifier's path segments, else None."""
    rank: Optional[int] = None
    for part in spec.split("/"):
        if part in LAYER_BY_FOLDER:
            r = LAYER_BY_FOLDER[part]
            rank = r if rank is None else max(rank, r)
    return rank

# -------
# Driver
# -------

_SKIP_DIRS = {"node_modules", ".git", "dist", "build", ".next", "coverage", "__pycache__"}


def expand_paths(args: Iterable[str], exts: Optional[set[str]] = None) -> list[str]:
    if exts is None:
        exts = CODE_EXTS | STYLE_EXTS
    out: list[str] = []
    for a in args:
        if os.path.isdir(a):
            for root, dirs, files in os.walk(a):
                dirs[:] = [d for d in dirs if d not in _SKIP_DIRS]
                for name in files:
                    if file_ext(name) in exts:
                        out.append(os.path.join(root, name))
        else:
            out.append(a)
    return out


def run_checks(argv: list[str], script_name: str, check_fn, exts: Optional[set[str]] = None) -> int:
    if len(argv) < 2:
        sys.stderr.write(f"usage: {script_name} FILE [FILE ...]\n")
        return 2

    paths = expand_paths(argv[1:], exts)
    findings: list[Finding] = []
    check_fn(paths, findings)

    if not findings:
        label = script_name.replace(".py", "").replace("check-", "")
        print(f"OK: no {label} issues found")
        return 0

    findings.sort(key=lambda f: (f.path, f.line, f.rule))
    for f in findings:
        print(f.emit())

    n_warn = sum(1 for f in findings if f.severity == "WARN")
    n_info = sum(1 for f in findings if f.severity == "INFO")
    print(f"\nSummary: {len(findings)} finding(s) — WARN={n_warn}, INFO={n_info}")
    return 1
