#!/usr/bin/env python3
"""
check-pages — page placement, naming, and sections rules.

Rules:
    page-outside-role    WARN   page file directly under pages/ without role subfolder
    page-name-mismatch   INFO   file in pages/<role>/<PageName>/ does not match PageName
    section-outside-page INFO   *Section.tsx found outside pages/<page>/sections/
"""

from __future__ import annotations

import os
import sys

from _common import (
    FRONTEND_EXTS,
    JSX_EXTS,
    Finding,
    basename_no_ext,
    file_ext,
    in_pages,
    norm,
    run_checks,
)


def check_page_outside_role(path: str, findings: list[Finding]) -> None:
    if not in_pages(path):
        return
    ext = file_ext(path)
    if ext not in FRONTEND_EXTS:
        return
    p = norm(path)
    parts = p.split("/pages/", 1)[1].split("/")
    if len(parts) < 2:
        findings.append(Finding(
            path, 1, "WARN", "page-outside-role",
            "page file directly under pages/ — move into pages/<role>/<PageName>/",
        ))


def check_page_name_mismatch(path: str, findings: list[Finding]) -> None:
    if not in_pages(path):
        return
    ext = file_ext(path)
    if ext not in FRONTEND_EXTS:
        return
    p = norm(path)
    parts = p.split("/")
    try:
        idx = parts.index("pages")
    except ValueError:
        return
    rest = parts[idx + 1:]
    if any(seg in ("components", "sections") for seg in rest[:-1]):
        return
    base = basename_no_ext(path)
    if base in {"index"}:
        return
    if base.endswith(".test") or ".test" in base or ".fixtures" in base or ".types" in base:
        return
    if len(rest) >= 2:
        folder = rest[-2]
        if folder and folder[0].isupper():
            if base != folder:
                findings.append(Finding(
                    path, 1, "INFO", "page-name-mismatch",
                    f"file '{base}' does not match page folder '{folder}' — rename to {folder}{ext}",
                ))


def check_section_outside_page(path: str, findings: list[Finding]) -> None:
    """*Section.tsx found outside pages/<page>/sections/."""
    ext = file_ext(path)
    if ext not in JSX_EXTS:
        return
    base = basename_no_ext(path)
    if not base.endswith("Section"):
        return
    p = norm(path)
    # Already in pages/<...>/sections/ — fine
    if "/pages/" in p and "/sections/" in p:
        return
    # In components/ — suspicious, sections should live with their page
    if "/components/" in p:
        findings.append(Finding(
            path, 1, "INFO", "section-outside-page",
            f"'{base}' looks like a page section — move to pages/<page>/sections/{base}.tsx",
        ))


def run(paths: list[str], findings: list[Finding]) -> None:
    for path in paths:
        if not os.path.isfile(path):
            continue
        check_page_outside_role(path, findings)
        check_page_name_mismatch(path, findings)
        check_section_outside_page(path, findings)


if __name__ == "__main__":
    sys.exit(run_checks(sys.argv, "check-pages.py", run, exts=FRONTEND_EXTS))
