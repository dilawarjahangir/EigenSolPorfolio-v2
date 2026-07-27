#!/usr/bin/env python3
"""
check-a11y — accessibility rules for JSX / Vue / Svelte files.

Rules:
    img-missing-alt        WARN   <img> without alt attribute
    img-missing-dimensions INFO   <img> without width/height (CLS risk)
    non-button-click       WARN   <div>/<span> with onClick — use <button>
    label-missing-for      INFO   <label> without htmlFor/for
    removed-focus-outline  WARN   outline:none removes focus indicator
    tabindex-positive      WARN   positive tabIndex disrupts focus order
"""

from __future__ import annotations

import os
import re
import sys

from _common import (
    FRONTEND_EXTS,
    JSX_EXTS,
    STYLE_EXTS,
    Finding,
    file_ext,
    read_lines,
    run_checks,
)


def check_img_alt(path: str, lines: list[str], findings: list[Finding]) -> None:
    img_open = re.compile(r"<img\b([^>]*)>", re.IGNORECASE)
    alt_pat = re.compile(r"\balt\s*=", re.IGNORECASE)
    for i, line in enumerate(lines, start=1):
        for m in img_open.finditer(line):
            if not alt_pat.search(m.group(1)):
                findings.append(Finding(
                    path, i, "WARN", "img-missing-alt",
                    "<img> missing alt attribute",
                ))


def check_img_no_dimensions(path: str, lines: list[str], findings: list[Finding]) -> None:
    img_open = re.compile(r"<img\b([^>]*)>", re.IGNORECASE)
    width_pat = re.compile(r"\bwidth\s*=", re.IGNORECASE)
    height_pat = re.compile(r"\bheight\s*=", re.IGNORECASE)
    for i, line in enumerate(lines, start=1):
        for m in img_open.finditer(line):
            attrs = m.group(1)
            if not (width_pat.search(attrs) and height_pat.search(attrs)):
                findings.append(Finding(
                    path, i, "INFO", "img-missing-dimensions",
                    "<img> without width/height — set both to prevent CLS",
                ))


def check_div_onclick(path: str, lines: list[str], findings: list[Finding]) -> None:
    pat = re.compile(r"<(div|span)\b[^>]*\bon[Cc]lick\s*=", re.IGNORECASE)
    role_button = re.compile(r"\brole\s*=\s*[\"']button[\"']")
    for i, line in enumerate(lines, start=1):
        if pat.search(line) and not role_button.search(line):
            findings.append(Finding(
                path, i, "WARN", "non-button-click",
                "<div>/<span> with onClick — use <button> or add role/keyboard handler",
            ))


def check_label_for(path: str, lines: list[str], findings: list[Finding]) -> None:
    label_open = re.compile(r"<label\b([^>]*)>", re.IGNORECASE)
    has_for = re.compile(r"\b(htmlFor|for)\s*=", re.IGNORECASE)
    for i, line in enumerate(lines, start=1):
        for m in label_open.finditer(line):
            if not has_for.search(m.group(1)):
                rest = line[m.end():]
                if "<input" in rest.lower() or "<select" in rest.lower() or "<textarea" in rest.lower():
                    continue
                findings.append(Finding(
                    path, i, "INFO", "label-missing-for",
                    "<label> without htmlFor/for — associate with an input",
                ))


def check_outline_none(path: str, lines: list[str], findings: list[Finding]) -> None:
    pat = re.compile(r"outline\s*:\s*none")
    for i, line in enumerate(lines, start=1):
        if pat.search(line):
            findings.append(Finding(
                path, i, "WARN", "removed-focus-outline",
                "outline:none removes focus indicator — add a visible replacement",
            ))


def check_tabindex_positive(path: str, lines: list[str], findings: list[Finding]) -> None:
    pat = re.compile(r"tabIndex\s*=\s*\{?\s*([1-9]\d*)\s*\}?", re.IGNORECASE)
    for i, line in enumerate(lines, start=1):
        m = pat.search(line)
        if m:
            findings.append(Finding(
                path, i, "WARN", "tabindex-positive",
                f"tabIndex={m.group(1)} disrupts natural focus order — use 0 or -1",
            ))


def run(paths: list[str], findings: list[Finding]) -> None:
    for path in paths:
        if not os.path.isfile(path):
            continue
        lines = read_lines(path)
        if lines is None:
            continue
        ext = file_ext(path)
        if ext in JSX_EXTS or ext in {".vue", ".svelte"}:
            check_img_alt(path, lines, findings)
            check_img_no_dimensions(path, lines, findings)
            check_div_onclick(path, lines, findings)
            check_label_for(path, lines, findings)
            check_tabindex_positive(path, lines, findings)
        if ext in JSX_EXTS or ext in {".vue", ".svelte"} or ext in STYLE_EXTS:
            check_outline_none(path, lines, findings)


if __name__ == "__main__":
    exts = FRONTEND_EXTS | STYLE_EXTS
    sys.exit(run_checks(sys.argv, "check-a11y.py", run, exts=exts))
