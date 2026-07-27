#!/usr/bin/env python3
"""
check-sections — verify section hygiene in HTML pages.

For pages (HTML with one or more <section> elements):
  - every <section> is preceded by a SECTION:/LAYOUT: comment banner
  - section-scoped <style> is co-located (not only in <head>)

Sample-page section folders (sample-pages/.../<section>/index.html) use an
external <section>.css, so the co-location check is skipped there — only the
comment-banner rule applies.

Run:  python3 check-sections.py local/html-template/site/
"""

from __future__ import annotations

import os
import re
import sys

_SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
if _SCRIPT_DIR not in sys.path:
    sys.path.insert(0, _SCRIPT_DIR)

from _common import (  # noqa: E402
    Finding, run_checks, read_text, file_ext, norm, line_of, seg_in, MARKUP_EXTS,
)

_RE_SECTION = re.compile(r"<section\b", re.IGNORECASE)
_RE_BANNER = re.compile(r"<!--[^>]*\b(SECTION|LAYOUT|CATALOG)\s*:", re.IGNORECASE)
_RE_HEAD_END = re.compile(r"</head>", re.IGNORECASE)
_RE_STYLE_OPEN = re.compile(r"<style\b", re.IGNORECASE)


def _preceded_by_banner(text: str, section_offset: int) -> bool:
    """Is there a SECTION:/LAYOUT:/CATALOG: comment banner attached to this
    section? The convention is  banner -> <style> -> <section>, and a section's
    <style> can be long, so we search the whole region from the *previous*
    section/header/footer up to this <section> (which contains exactly this
    section's banner + style, never the previous section's banner)."""
    region_start = 0
    for tag in ("<section", "<header", "<footer"):
        pos = text.rfind(tag, 0, section_offset)
        if pos != -1:
            region_start = max(region_start, pos + len(tag))
    window = text[region_start:section_offset]
    return bool(_RE_BANNER.search(window))


def run(paths: list, findings: list) -> None:
    for path in paths:
        if file_ext(path) not in MARKUP_EXTS:
            continue
        text = read_text(path)
        if text is None:
            continue

        sections = list(_RE_SECTION.finditer(text))
        if not sections:
            continue

        is_sample_folder = seg_in(path, "sample-pages")

        # Banner check for every <section>.
        for sm in sections:
            if not _preceded_by_banner(text, sm.start()):
                findings.append(Finding(path, line_of(text, sm.start()), "WARN",
                    "section-missing-banner",
                    "<section> has no SECTION:/LAYOUT: comment banner above it"))

        # Co-location check (skip sample folders which use an external .css).
        if not is_sample_folder:
            head_end = _RE_HEAD_END.search(text)
            body_offset = head_end.end() if head_end else 0
            has_body_style = bool(_RE_STYLE_OPEN.search(text, body_offset))
            if not has_body_style:
                first = sections[0]
                findings.append(Finding(path, line_of(text, first.start()), "INFO",
                    "style-not-colocated",
                    "page has <section>s but no in-body <style> — keep section CSS in a <style> above its section"))


if __name__ == "__main__":
    sys.exit(run_checks(sys.argv, "check-sections.py", run))
