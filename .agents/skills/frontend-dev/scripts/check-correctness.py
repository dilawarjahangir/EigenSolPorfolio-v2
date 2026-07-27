#!/usr/bin/env python3
"""
check-correctness — general React/JS correctness rules.

Rules:
    missing-key        WARN   .map() returning JSX without key
    key-from-index     WARN   array index used as React key
    direct-dom         WARN   document.querySelector / getElementById
    unsafe-html        WARN   dangerouslySetInnerHTML / v-html
    inline-secret      WARN   hardcoded-looking secret/token/key
    stray-console      INFO   console.log/debug left in source
    large-component    INFO   .tsx/.jsx > 200 lines
    large-file         INFO   other source > 400 lines
"""

from __future__ import annotations

import os
import re
import sys

from _common import (
    FRONTEND_EXTS,
    JSX_EXTS,
    LARGE_COMPONENT_LINES,
    LARGE_FILE_LINES,
    Finding,
    file_ext,
    read_lines,
    run_checks,
)


def check_array_index_key(path: str, lines: list[str], findings: list[Finding]) -> None:
    if file_ext(path) not in JSX_EXTS:
        return
    map_pat = re.compile(
        r"\.map\(\s*\(?\s*[A-Za-z_][A-Za-z0-9_]*\s*,\s*([A-Za-z_][A-Za-z0-9_]*)\s*\)?"
    )
    for i, line in enumerate(lines, start=1):
        m = map_pat.search(line)
        if m:
            idx = m.group(1)
            window = "\n".join(lines[i - 1: i + 3])
            key_pat = r"key\s*=\s*\{\s*" + re.escape(idx) + r"\s*\}"
            if re.search(key_pat, window):
                findings.append(Finding(
                    path, i, "WARN", "key-from-index",
                    f"using '{idx}' (array index) as key — use a stable id from data",
                ))


def check_missing_key(path: str, lines: list[str], findings: list[Finding]) -> None:
    if file_ext(path) not in JSX_EXTS:
        return
    map_pat = re.compile(r"\.map\(\s*\(?\s*[A-Za-z_][A-Za-z0-9_]*[^)]*\)?\s*=>")
    for i, line in enumerate(lines, start=1):
        if map_pat.search(line):
            window = "\n".join(lines[i - 1: i + 6])
            if "key=" not in window:
                findings.append(Finding(
                    path, i, "WARN", "missing-key",
                    "map() returning JSX without `key` prop",
                ))


def check_query_selector(path: str, lines: list[str], findings: list[Finding]) -> None:
    pat = re.compile(r"\bdocument\.(querySelector|getElementById|getElementsBy)")
    for i, line in enumerate(lines, start=1):
        if pat.search(line):
            findings.append(Finding(
                path, i, "WARN", "direct-dom",
                "direct DOM access — use refs / framework APIs instead",
            ))


def check_console_log(path: str, lines: list[str], findings: list[Finding]) -> None:
    pat = re.compile(r"\bconsole\.(log|debug)\s*\(")
    for i, line in enumerate(lines, start=1):
        if pat.search(line):
            findings.append(Finding(
                path, i, "INFO", "stray-console",
                "stray console.log/debug — remove or use a logger",
            ))


def check_dangerously_set_html(path: str, lines: list[str], findings: list[Finding]) -> None:
    pat = re.compile(r"dangerouslySetInnerHTML")
    vue_pat = re.compile(r"\bv-html\s*=")
    for i, line in enumerate(lines, start=1):
        if pat.search(line) or vue_pat.search(line):
            findings.append(Finding(
                path, i, "WARN", "unsafe-html",
                "raw HTML render — ensure content is trusted/sanitized",
            ))


def check_inline_secret(path: str, lines: list[str], findings: list[Finding]) -> None:
    pat = re.compile(
        r"(api[_-]?key|secret|token|password)\s*[:=]\s*[\"']([A-Za-z0-9_\-]{16,})[\"']",
        re.IGNORECASE,
    )
    for i, line in enumerate(lines, start=1):
        if pat.search(line):
            findings.append(Finding(
                path, i, "WARN", "inline-secret",
                "looks like a hardcoded secret — move to env / server",
            ))


def check_component_size(path: str, lines: list[str], findings: list[Finding]) -> None:
    n = len(lines)
    if file_ext(path) in JSX_EXTS and n > LARGE_COMPONENT_LINES:
        findings.append(Finding(
            path, n, "INFO", "large-component",
            f"component file has {n} lines (>{LARGE_COMPONENT_LINES}) — consider splitting",
        ))
    elif n > LARGE_FILE_LINES:
        findings.append(Finding(
            path, n, "INFO", "large-file",
            f"file has {n} lines (>{LARGE_FILE_LINES}) — consider splitting",
        ))


def run(paths: list[str], findings: list[Finding]) -> None:
    for path in paths:
        if not os.path.isfile(path):
            continue
        lines = read_lines(path)
        if lines is None:
            continue
        if file_ext(path) not in FRONTEND_EXTS:
            continue
        check_array_index_key(path, lines, findings)
        check_missing_key(path, lines, findings)
        check_query_selector(path, lines, findings)
        check_console_log(path, lines, findings)
        check_dangerously_set_html(path, lines, findings)
        check_inline_secret(path, lines, findings)
        check_component_size(path, lines, findings)


if __name__ == "__main__":
    sys.exit(run_checks(sys.argv, "check-correctness.py", run, exts=FRONTEND_EXTS))
