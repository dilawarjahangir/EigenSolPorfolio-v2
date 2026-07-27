#!/usr/bin/env python3
"""
check-layers — down-only import direction and token purity.

Imports go DOWN only: tokens(1) < atoms(2) < composites(3) < sections/domain(4)
< templates(5). A lower-layer file importing a higher one is a violation.

Rules:
    upward-import            WARN   a lower-layer file imports a higher layer
    token-has-react          WARN   a file under tokens/ imports React or uses a JSX extension
    component-imports-theme  WARN   a component imports from tokens/themes/* (read tokens via classes)
"""

from __future__ import annotations

import os
import sys

from _common import (
    CODE_EXTS,
    JSX_EXTS,
    Finding,
    file_ext,
    import_specs_in_line,
    in_tests,
    in_tokens,
    is_internal_spec,
    layer_of,
    read_lines,
    run_checks,
    spec_layer,
)


def run(paths: list[str], findings: list[Finding]) -> None:
    for path in paths:
        if not os.path.isfile(path):
            continue
        if file_ext(path) not in CODE_EXTS or in_tests(path):
            continue
        lines = read_lines(path)
        if lines is None:
            continue

        cur = layer_of(path)
        token_file = in_tokens(path)

        if token_file and file_ext(path) in JSX_EXTS:
            findings.append(Finding(
                path, 1, "WARN", "token-has-react",
                "token file uses a JSX extension — tokens are plain .ts values (no React below Layer 1)",
            ))

        for i, line in enumerate(lines, start=1):
            for spec in import_specs_in_line(line):
                if token_file and (spec == "react" or spec.startswith("react/") or spec.startswith("react-dom")):
                    findings.append(Finding(
                        path, i, "WARN", "token-has-react",
                        "tokens/ must be pure TS — no React imports below Layer 1",
                    ))

                if not is_internal_spec(spec):
                    continue

                target = spec_layer(spec)
                if cur is not None and target is not None and target > cur:
                    findings.append(Finding(
                        path, i, "WARN", "upward-import",
                        f"layer {cur} file imports layer {target} ('{spec}') — imports must go DOWN only",
                    ))

                if cur is not None and cur >= 2 and ("/themes/" in spec or spec.endswith("/themes")):
                    findings.append(Finding(
                        path, i, "WARN", "component-imports-theme",
                        "component imports a theme object — read tokens via classes, not tokens/themes/*",
                    ))


if __name__ == "__main__":
    sys.exit(run_checks(sys.argv, "check-layers.py", run, exts=None))
