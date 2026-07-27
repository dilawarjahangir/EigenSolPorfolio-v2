#!/usr/bin/env python3
"""
check-consumption — rules for a downstream app that consumes the template.

Run against a consuming app's source (e.g. src/).

Rules:
    deep-import          WARN   @org/ui/src|dist|components/... deep import (use the package root)
    theme-brand-branch   WARN   branching on theme/brand (fix the token, not the component)
    override-prop        WARN   themeOverride/customColor prop punches through tokens
    inline-style-hex     INFO   inline style={{...}} with a hex color overrides theming
"""

from __future__ import annotations

import os
import re
import sys

from _common import (
    CODE_EXTS,
    Finding,
    basename,
    file_ext,
    import_specs_in_line,
    in_tests,
    in_themes,
    in_tokens,
    read_lines,
    run_checks,
)

_RE_DEEP = re.compile(r"@[\w.-]+/ui/(?:src|dist|components)/|/packages/ui/src/")
_RE_BRANCH = re.compile(r"\b(?:theme|brand)\b\s*===|===\s*['\"](?:dark|light)['\"]")
_RE_OVERRIDE = re.compile(r"\b(?:themeOverride|customColor|overrideColor|colorOverride)\s*=")
_RE_HEX = re.compile(r"#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b")


def _theme_infra(path: str) -> bool:
    return in_tokens(path) or in_themes(path) or "theme" in basename(path).lower()


def run(paths: list[str], findings: list[Finding]) -> None:
    for path in paths:
        if not os.path.isfile(path):
            continue
        if file_ext(path) not in CODE_EXTS or in_tests(path):
            continue
        lines = read_lines(path)
        if lines is None:
            continue

        infra = _theme_infra(path)

        for i, line in enumerate(lines, start=1):
            for spec in import_specs_in_line(line):
                if _RE_DEEP.search(spec):
                    findings.append(Finding(
                        path, i, "WARN", "deep-import",
                        f"deep import '{spec}' — import from the package root (@org/ui) only",
                    ))

            if not infra and _RE_BRANCH.search(line):
                findings.append(Finding(
                    path, i, "WARN", "theme-brand-branch",
                    "branching on theme/brand — fix the token, not the component; brands are invisible to components",
                ))

            if _RE_OVERRIDE.search(line):
                findings.append(Finding(
                    path, i, "WARN", "override-prop",
                    "theme/color override prop punches through tokens — use a variant or a token",
                ))

            if "style={{" in line and _RE_HEX.search(line):
                findings.append(Finding(
                    path, i, "INFO", "inline-style-hex",
                    "inline style with a hex color overrides theming — use a variant/token",
                ))


if __name__ == "__main__":
    sys.exit(run_checks(sys.argv, "check-consumption.py", run, exts=None))
