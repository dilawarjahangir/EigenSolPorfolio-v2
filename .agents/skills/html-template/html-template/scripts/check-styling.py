#!/usr/bin/env python3
"""
check-styling — enforce the `.es__` prefix and token discipline.

Scans .css and .html files for:
  - unprefixed class names (should start with es__ / es--)
  - leaked Tailwind / utility classes
  - inline style="" hex colors
  - raw #hex literals in section CSS (prefer a --es-* token)

Run:  python3 check-styling.py local/html-template/site/
"""

from __future__ import annotations

import os
import re
import sys

_SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
if _SCRIPT_DIR not in sys.path:
    sys.path.insert(0, _SCRIPT_DIR)

from _common import (  # noqa: E402
    Finding, run_checks, read_text, file_ext, basename, line_of,
    iter_html_class_attrs, iter_html_style_attrs, css_class_selectors,
    is_allowed_class, looks_tailwind, has_hex, MARKUP_EXTS, STYLE_EXTS,
    _RE_HEX, _RE_COMMENT_CSS,
)

# A `:root { ... }` token-definition block. `[^{}]` also matches newlines, so
# this spans multi-line :root blocks; :root never nests braces.
_RE_ROOT_BLOCK = re.compile(r":root[^{}]*\{[^{}]*\}")


def _check_html(path: str, text: str, findings: list) -> None:
    for value, offset in iter_html_class_attrs(text):
        base_line = line_of(text, offset)
        for tok in value.split():
            tok = tok.strip()
            if not tok or "{{" in tok or "${" in tok:
                continue  # template placeholder
            if is_allowed_class(tok):
                continue
            if looks_tailwind(tok):
                findings.append(Finding(path, base_line, "WARN", "tailwind-utility",
                    f"utility/Tailwind class '{tok}' — convert to one .es__ class backed by CSS"))
            else:
                findings.append(Finding(path, base_line, "INFO", "unprefixed-class",
                    f"class '{tok}' is not prefixed (.es__/.es--)"))

    for value, offset in iter_html_style_attrs(text):
        hexv = has_hex(value)
        if hexv:
            findings.append(Finding(path, line_of(text, offset), "INFO", "inline-style-hex",
                f"inline style hex '{hexv}' — move to a class + --es-* token"))


def _check_css(path: str, text: str, findings: list) -> None:
    is_global = basename(path).lower() in {"global.css", "tokens.css"}
    for name, offset in css_class_selectors(text):
        if is_allowed_class(name):
            continue
        if looks_tailwind(name):
            findings.append(Finding(path, line_of(text, offset), "WARN", "tailwind-utility",
                f"selector '.{name}' looks like a utility class — use a semantic .es__ class"))
        else:
            findings.append(Finding(path, line_of(text, offset), "INFO", "unprefixed-class",
                f"selector '.{name}' is not prefixed (.es__/.es--)"))

    # Raw hex inside section CSS (global.css is the home of literal token values).
    if not is_global:
        # Blank out comments and :root{...} token blocks, replacing each matched
        # span with equal-length spaces. Length is preserved, so offsets — and
        # therefore line_of(text, …) computed against the ORIGINAL text — stay
        # exact. This exempts hex inside a comment or a :root token definition,
        # while still flagging a real literal in a rule even when it shares a
        # line with a :root block.
        blank = lambda m: " " * len(m.group(0))
        clean = _RE_COMMENT_CSS.sub(blank, text)
        clean = _RE_ROOT_BLOCK.sub(blank, clean)
        for hm in _RE_HEX.finditer(clean):
            findings.append(Finding(path, line_of(text, hm.start()), "INFO", "hardcoded-hex",
                f"hex '{hm.group(0)}' in section CSS — prefer a --es-* token"))


def run(paths: list, findings: list) -> None:
    for path in paths:
        ext = file_ext(path)
        if ext not in MARKUP_EXTS and ext not in STYLE_EXTS:
            continue
        text = read_text(path)
        if text is None:
            continue
        if ext in MARKUP_EXTS:
            _check_html(path, text, findings)
        else:
            _check_css(path, text, findings)


if __name__ == "__main__":
    sys.exit(run_checks(sys.argv, "check-styling.py", run))
