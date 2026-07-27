#!/usr/bin/env python3
"""
Shared helpers for html-template check scripts.

Not intended to be run directly. Provides the Finding class, path/segment
helpers, HTML/CSS scanners, a Tailwind-utility detector, the `.es__` prefix
allow-list, and the run_checks driver used by every check-*.py script.

Findings format:  path:line: [SEVERITY] [RULE] message
Severities used:  WARN (fix it), INFO (consider it)
Exit codes:       0 none, 1 findings, 2 bad invocation
"""

from __future__ import annotations

import os
import re
import sys
from typing import Callable, Iterable, Optional

# -------
# Config
# -------

MARKUP_EXTS = {".html", ".htm"}
STYLE_EXTS = {".css"}
SCRIPT_EXTS = {".js", ".mjs"}
DOC_EXTS = {".md"}
ALL_EXTS = MARKUP_EXTS | STYLE_EXTS | SCRIPT_EXTS | DOC_EXTS

SKIP_DIRS = {"node_modules", ".git", "dist", "build", ".next", "coverage", "__pycache__"}

# Canonical template contract
REQUIRED_DOCS = ("METADATA.md", "AGENTS.md", "README.md", "PAGES_AND_SECTIONS.md")
BUCKET_DIRS = ("site", "components", "sample-pages")

# The project class prefix and its JS state hook.
ES_PREFIX = "es__"
ES_STATE = "es--"

# Class-name tokens that are allowed to appear unprefixed (third-party widgets
# emit these themselves; reprefixing them would break the library).
ALLOWED_CLASS_PREFIXES = ("es__", "es--", "swiper", "lenis", "lucide", "gsap")
ALLOWED_CLASS_EXACT = {"sr-only", "clearfix", "lucide"}

# Heuristic detector for leftover Tailwind / utility classes.
_TW_PATTERNS = [
    re.compile(r"^(sm|md|lg|xl|2xl):"),
    re.compile(r"^(hover|focus|focus-visible|active|group|peer|disabled|dark|motion-safe|motion-reduce):"),
    re.compile(r"^-?(p|m)(x|y|t|b|l|r|s|e)?-\d"),
    re.compile(r"^(w|h|min-w|max-w|min-h|max-h|gap|space-(x|y))-"),
    re.compile(r"^(text|bg|border|ring|from|via|to|fill|stroke|divide)-(\[|[a-z]+-?\d|white|black|transparent|current)"),
    re.compile(r"^(flex|grid|inline-flex|inline-grid|hidden|absolute|relative|fixed|sticky)$"),
    re.compile(r"^(items|justify|content|self|place|inset|top|bottom|left|right)-"),
    re.compile(r"^(rounded|shadow|opacity|z|order|col|row|grid-cols|grid-rows|aspect|object)-"),
    re.compile(r"^(font|leading|tracking)-"),
    re.compile(r"^(uppercase|lowercase|capitalize|italic|truncate|antialiased)$"),
    re.compile(r"\[.+\]"),  # arbitrary value, e.g. bg-[#ff7744]
]

_RE_CLASS_ATTR = re.compile(r"""class\s*=\s*(?:"([^"]*)"|'([^']*)')""", re.IGNORECASE)
_RE_STYLE_ATTR = re.compile(r"""style\s*=\s*(?:"([^"]*)"|'([^']*)')""", re.IGNORECASE)
_RE_HEX = re.compile(r"#[0-9a-fA-F]{3,8}\b")
_RE_CSS_CLASS = re.compile(r"\.([A-Za-z_][\w-]*)")
_RE_COMMENT_CSS = re.compile(r"/\*.*?\*/", re.S)

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

def norm(path: str) -> str:
    return path.replace("\\", "/")


def basename(path: str) -> str:
    return os.path.basename(norm(path))


def file_ext(path: str) -> str:
    return os.path.splitext(path)[1].lower()


def segments(path: str) -> list:
    return [s for s in norm(path).split("/") if s and s != "."]


def seg_in(path: str, name: str) -> bool:
    return name in segments(path)


def read_text(path: str) -> Optional[str]:
    try:
        with open(path, "r", encoding="utf-8", errors="replace") as f:
            return f.read()
    except OSError:
        return None


def line_of(text: str, offset: int) -> int:
    """1-based line number of a character offset within text."""
    return text.count("\n", 0, offset) + 1

# -------
# Class / style scanners
# -------

def is_allowed_class(name: str) -> bool:
    if name in ALLOWED_CLASS_EXACT:
        return True
    return any(name.startswith(p) for p in ALLOWED_CLASS_PREFIXES)


def looks_tailwind(name: str) -> bool:
    return any(rx.search(name) for rx in _TW_PATTERNS)


def iter_html_class_attrs(text: str):
    """Yield (class_value, offset) for each class="..." attribute."""
    for m in _RE_CLASS_ATTR.finditer(text):
        value = m.group(1) if m.group(1) is not None else m.group(2)
        yield value or "", m.start()


def iter_html_style_attrs(text: str):
    for m in _RE_STYLE_ATTR.finditer(text):
        value = m.group(1) if m.group(1) is not None else m.group(2)
        yield value or "", m.start()


def css_class_selectors(text: str):
    """Yield (class_name, offset) for every class used in a CSS *selector*
    (not inside a declaration block). Tolerates nested @media rules."""
    stripped = _RE_COMMENT_CSS.sub(lambda m: " " * len(m.group(0)), text)
    chunk_start = 0
    for m in re.finditer(r"\{", stripped):
        prelude = stripped[chunk_start:m.start()]
        last_close = prelude.rfind("}")
        sel_start = chunk_start + last_close + 1
        sel = stripped[sel_start:m.start()]
        if "@" not in sel:  # skip at-rule preludes (@media/@supports/@keyframes)
            for cm in _RE_CSS_CLASS.finditer(sel):
                yield cm.group(1), sel_start + cm.start()
        chunk_start = m.end()


def has_hex(text_line: str) -> Optional[str]:
    m = _RE_HEX.search(text_line)
    return m.group(0) if m else None

# -------
# Driver
# -------

def expand_paths(args: Iterable[str], exts: Optional[set] = None) -> list:
    if exts is None:
        exts = ALL_EXTS
    out: list = []
    for a in args:
        if os.path.isdir(a):
            for root, dirs, files in os.walk(a):
                dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
                for name in files:
                    if file_ext(name) in exts:
                        out.append(os.path.join(root, name))
        else:
            out.append(a)
    return out


def run_checks(argv: list, script_name: str, check_fn: Callable, exts: Optional[set] = None) -> int:
    if len(argv) < 2:
        sys.stderr.write(f"usage: {script_name} PATH [PATH ...]\n")
        return 2

    paths = expand_paths(argv[1:], exts)
    findings: list = []
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
