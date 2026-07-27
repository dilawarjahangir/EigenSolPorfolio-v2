#!/usr/bin/env python3
"""
check-styling — CSS/SCSS and inline style rules.

Rules:
    inline-style       INFO   style={{...}} in JSX — prefer classes / tokens
    hardcoded-color    INFO   #hex / rgb() literal in a component file
    giant-global-css   WARN   global CSS file over 80 lines
    css-important      INFO   !important in CSS
"""

from __future__ import annotations

import os
import re
import sys

from _common import (
    FRONTEND_EXTS,
    JSX_EXTS,
    LARGE_GLOBAL_CSS_LINES,
    STYLE_EXTS,
    Finding,
    basename,
    file_ext,
    read_lines,
    run_checks,
)


def check_inline_style(path: str, lines: list[str], findings: list[Finding]) -> None:
    if file_ext(path) not in JSX_EXTS and file_ext(path) not in {".vue", ".svelte"}:
        return
    pat = re.compile(r"\bstyle\s*=\s*\{\{")
    for i, line in enumerate(lines, start=1):
        if pat.search(line):
            findings.append(Finding(
                path, i, "INFO", "inline-style",
                "inline style={{...}} — prefer classes / design tokens",
            ))


def check_hardcoded_color(path: str, lines: list[str], findings: list[Finding]) -> None:
    ext = file_ext(path)
    if ext not in JSX_EXTS and ext not in {".vue", ".svelte"}:
        return
    hex_pat = re.compile(r"#([0-9a-fA-F]{3,8})\b")
    rgb_pat = re.compile(r"\brgba?\s*\(")
    for i, line in enumerate(lines, start=1):
        stripped = line.strip()
        if stripped.startswith("//") or stripped.startswith("*"):
            continue
        if hex_pat.search(line) or rgb_pat.search(line):
            findings.append(Finding(
                path, i, "INFO", "hardcoded-color",
                "color literal in component — use a token / class",
            ))


def check_giant_global_css(path: str, lines: list[str], findings: list[Finding]) -> None:
    if file_ext(path) not in STYLE_EXTS:
        return
    name = basename(path).lower()
    if name in {"app.css", "index.css", "main.css", "global.css", "globals.css", "styles.css"}:
        n = len(lines)
        if n > LARGE_GLOBAL_CSS_LINES:
            findings.append(Finding(
                path, n, "WARN", "giant-global-css",
                f"'{basename(path)}' has {n} lines (>{LARGE_GLOBAL_CSS_LINES}) — keep global CSS to tokens + reset; co-locate per-component styles",
            ))


def check_important(path: str, lines: list[str], findings: list[Finding]) -> None:
    if file_ext(path) not in STYLE_EXTS:
        return
    pat = re.compile(r"!important")
    for i, line in enumerate(lines, start=1):
        if pat.search(line):
            findings.append(Finding(
                path, i, "INFO", "css-important",
                "!important — fix the conflicting rule instead",
            ))


def run(paths: list[str], findings: list[Finding]) -> None:
    for path in paths:
        if not os.path.isfile(path):
            continue
        lines = read_lines(path)
        if lines is None:
            continue
        ext = file_ext(path)
        if ext in FRONTEND_EXTS:
            check_inline_style(path, lines, findings)
            check_hardcoded_color(path, lines, findings)
        if ext in STYLE_EXTS:
            check_giant_global_css(path, lines, findings)
            check_important(path, lines, findings)


if __name__ == "__main__":
    exts = FRONTEND_EXTS | STYLE_EXTS
    sys.exit(run_checks(sys.argv, "check-styling.py", run, exts=exts))
