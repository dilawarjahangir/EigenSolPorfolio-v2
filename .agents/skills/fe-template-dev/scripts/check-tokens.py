#!/usr/bin/env python3
"""
check-tokens — token-first enforcement.

No styling literal may appear in component source; appearance comes only from
token classes that resolve to CSS variables. Files under tokens/, themes/, the
catalog, mocks/, and tests are skipped (they legitimately hold literal values).

Rules:
    hardcoded-hex         WARN   #hex color literal in component source
    arbitrary-tw-color    WARN   Tailwind arbitrary color value (bg-[#...], text-[rgb(...)])
    color-fn              INFO   rgb()/hsl() literal in component source
    arbitrary-tw-length   INFO   Tailwind arbitrary length (w-[123px])
    raw-font-family       INFO   font-family literal
    raw-px                INFO   raw px literal
"""

from __future__ import annotations

import os
import re
import sys

from _common import (
    Finding,
    in_catalog,
    in_themes,
    in_tokens,
    is_component_source,
    read_lines,
    run_checks,
)

_RE_HEX = re.compile(r"#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})\b")
_RE_COLORFN = re.compile(r"\b(?:rgba?|hsla?)\s*\(")
_RE_TW_COLOR = re.compile(
    r"\b(?:bg|text|border|ring|fill|stroke|from|via|to|decoration|outline|shadow|divide|caret|accent)-\[\s*(?:#|rgb|hsl)"
)
_RE_TW_LEN = re.compile(
    r"\b(?:w|h|min-w|max-w|min-h|max-h|p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|top|bottom|left|right|inset|leading|tracking|rounded|basis|size)-\[\s*\d"
)
_RE_FONTFAM = re.compile(r"font-family\s*:")
_RE_PX = re.compile(r"\b\d+px\b")


def _is_comment(line: str) -> bool:
    s = line.strip()
    return s.startswith("//") or s.startswith("*") or s.startswith("/*")


def run(paths: list[str], findings: list[Finding]) -> None:
    for path in paths:
        if not os.path.isfile(path):
            continue
        if not is_component_source(path):
            continue
        if in_tokens(path) or in_themes(path) or in_catalog(path):
            continue
        lines = read_lines(path)
        if lines is None:
            continue
        for i, line in enumerate(lines, start=1):
            if _is_comment(line):
                continue

            for m in _RE_HEX.finditer(line):
                # skip hex inside a Tailwind arbitrary value — reported separately
                if m.start() > 0 and line[m.start() - 1] == "[":
                    continue
                findings.append(Finding(
                    path, i, "WARN", "hardcoded-hex",
                    f"hex color '{m.group(0)}' in component source — use a token class (e.g. bg-brand-500)",
                ))
                break

            if _RE_TW_COLOR.search(line):
                findings.append(Finding(
                    path, i, "WARN", "arbitrary-tw-color",
                    "Tailwind arbitrary color value — replace with a token utility (bg-surface, text-fg-default)",
                ))
            if _RE_COLORFN.search(line):
                findings.append(Finding(
                    path, i, "INFO", "color-fn",
                    "rgb()/hsl() literal in component source — prefer a token class",
                ))
            if _RE_TW_LEN.search(line):
                findings.append(Finding(
                    path, i, "INFO", "arbitrary-tw-length",
                    "Tailwind arbitrary length — prefer a spacing/size token (p-3, gap-2)",
                ))
            if _RE_FONTFAM.search(line):
                findings.append(Finding(
                    path, i, "INFO", "raw-font-family",
                    "font-family literal — use the font token (text-body-md / --font-body)",
                ))
            elif _RE_PX.search(line):
                findings.append(Finding(
                    path, i, "INFO", "raw-px",
                    "raw px literal — prefer a spacing/size token",
                ))


if __name__ == "__main__":
    sys.exit(run_checks(sys.argv, "check-tokens.py", run, exts=None))
