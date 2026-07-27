#!/usr/bin/env python3
"""
check-routing — route file and lazy-loading rules.

Rules:
    route-file-tsx         WARN   route file uses .tsx/.jsx — must be .ts/.js
    route-renders-jsx      WARN   route file contains JSX or React import
    route-with-layout-hoc  WARN   withXxxLayout() HOC in route file
    route-non-lazy-page    INFO   page imported eagerly in a route group
"""

from __future__ import annotations

import os
import re
import sys

from _common import (
    FRONTEND_EXTS,
    JSX_EXTS,
    Finding,
    basename_no_ext,
    file_ext,
    in_routes,
    read_lines,
    run_checks,
)


def check_route_file_not_ts(path: str, lines: list[str], findings: list[Finding]) -> None:
    if not in_routes(path):
        return
    if file_ext(path) in JSX_EXTS:
        findings.append(Finding(
            path, 1, "WARN", "route-file-tsx",
            "route file uses .tsx/.jsx — route files are data, must be .ts/.js",
        ))


def check_route_renders_jsx(path: str, lines: list[str], findings: list[Finding]) -> None:
    if not in_routes(path):
        return
    base = basename_no_ext(path)
    if base in {"paths", "redirects", "index"} and file_ext(path) not in JSX_EXTS:
        pass
    jsx_pat = re.compile(r"<[A-Z][A-Za-z0-9]*[\s/>]")
    react_import = re.compile(r"\bimport\s+React\b")
    for i, line in enumerate(lines, start=1):
        if jsx_pat.search(line) or react_import.search(line):
            findings.append(Finding(
                path, i, "WARN", "route-renders-jsx",
                "route file contains JSX or React import — keep routes as data; wire in App.tsx",
            ))
            return


def check_route_with_layout_hoc(path: str, lines: list[str], findings: list[Finding]) -> None:
    if not in_routes(path):
        return
    pat = re.compile(r"\bwith[A-Z][A-Za-z]*Layout\s*\(")
    for i, line in enumerate(lines, start=1):
        if pat.search(line):
            findings.append(Finding(
                path, i, "WARN", "route-with-layout-hoc",
                "withXxxLayout() HOC in route file — page should import its layout directly",
            ))


def check_route_non_lazy_pages(path: str, lines: list[str], findings: list[Finding]) -> None:
    if not in_routes(path):
        return
    base = basename_no_ext(path)
    if base in {"index", "paths", "redirects"}:
        return
    eager_page = re.compile(r"^\s*import\s+([A-Z][A-Za-z0-9]*)\s+from\s+[\"'].*/pages/.*[\"']")
    lazy_present = re.compile(r"\blazy\s*\(\s*\(\s*\)\s*=>\s*import")
    text = "\n".join(lines)
    if lazy_present.search(text):
        return
    for i, line in enumerate(lines, start=1):
        if eager_page.match(line):
            findings.append(Finding(
                path, i, "INFO", "route-non-lazy-page",
                "page imported eagerly in a route group — consider React.lazy",
            ))
            return


def run(paths: list[str], findings: list[Finding]) -> None:
    for path in paths:
        if not os.path.isfile(path):
            continue
        if file_ext(path) not in FRONTEND_EXTS:
            continue
        lines = read_lines(path)
        if lines is None:
            continue
        check_route_file_not_ts(path, lines, findings)
        check_route_renders_jsx(path, lines, findings)
        check_route_with_layout_hoc(path, lines, findings)
        check_route_non_lazy_pages(path, lines, findings)


if __name__ == "__main__":
    sys.exit(run_checks(sys.argv, "check-routing.py", run, exts=FRONTEND_EXTS))
