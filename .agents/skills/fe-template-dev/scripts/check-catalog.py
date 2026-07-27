#!/usr/bin/env python3
"""
check-catalog — catalog and fixture hygiene.

The catalog must render fully offline from fixtures; fixtures must never depend
on the components they feed.

Rules:
    fixture-imports-kit  WARN   a file under mocks/ or fixtures/ imports the UI kit
    catalog-network      WARN   a catalog page calls the network (fetch/axios/useQuery/...)
"""

from __future__ import annotations

import os
import re
import sys

from _common import (
    CODE_EXTS,
    Finding,
    file_ext,
    import_specs_in_line,
    in_catalog,
    in_mocks,
    in_tests,
    read_lines,
    run_checks,
)

_RE_NET = re.compile(
    r"\b(?:fetch|axios|XMLHttpRequest|useQuery|useMutation|useSWR|useInfiniteQuery)\b"
)
_RE_KIT = re.compile(r"@[\w.-]+/ui(?:/|$)")


def run(paths: list[str], findings: list[Finding]) -> None:
    for path in paths:
        if not os.path.isfile(path):
            continue
        if file_ext(path) not in CODE_EXTS:
            continue

        is_fixture = in_mocks(path)
        is_page = in_catalog(path) and not in_tests(path)
        if not (is_fixture or is_page):
            continue

        lines = read_lines(path)
        if lines is None:
            continue

        for i, line in enumerate(lines, start=1):
            if is_fixture and "import type" not in line:
                for spec in import_specs_in_line(line):
                    if _RE_KIT.search(spec) or "/components/" in spec:
                        findings.append(Finding(
                            path, i, "WARN", "fixture-imports-kit",
                            "fixture imports the UI kit — fixtures must not depend on components (import type is allowed)",
                        ))
                        break

            if is_page and _RE_NET.search(line):
                findings.append(Finding(
                    path, i, "WARN", "catalog-network",
                    "catalog page calls the network — use a fixture or MSW, never a real backend",
                ))


if __name__ == "__main__":
    sys.exit(run_checks(sys.argv, "check-catalog.py", run, exts=None))
