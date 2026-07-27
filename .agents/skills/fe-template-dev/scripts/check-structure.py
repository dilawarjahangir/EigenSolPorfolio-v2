#!/usr/bin/env python3
"""
check-structure — template/library layout, naming, export hygiene, file sizes.

Rules:
    component-not-in-folder   INFO   atoms/Button.tsx should be atoms/Button/Button.tsx
    vague-component-folder    WARN   components/utils|helpers|common|shared|misc|global/
    vague-file-in-components  WARN   data.ts / types.ts / helpers.ts inside components/
    default-export-component  INFO   library component uses `export default`
    large-component           INFO   .tsx/.jsx > 200 lines
    large-file                INFO   other source > 400 lines
"""

from __future__ import annotations

import os
import re
import sys

from _common import (
    JSX_EXTS,
    LARGE_COMPONENT_LINES,
    LARGE_FILE_LINES,
    LAYER_BY_FOLDER,
    VAGUE_COMPONENT_FOLDERS,
    VAGUE_FILE_NAMES,
    Finding,
    basename,
    basename_no_ext,
    file_ext,
    in_mocks,
    in_tests,
    is_component_source,
    read_lines,
    run_checks,
    seg_in,
    segments,
)

_RE_DEFAULT_EXPORT = re.compile(r"^\s*export\s+default\b")
_NAME_SUFFIXES = (".test", ".spec", ".fixtures", ".types", ".variants", ".stories")


def _check_not_in_folder(path: str, findings: list[Finding]) -> None:
    if file_ext(path) not in JSX_EXTS:
        return
    base = basename_no_ext(path)
    if base == "index" or not base[:1].isupper():
        return
    if any(s in base for s in _NAME_SUFFIXES):
        return
    segs = segments(path)
    if len(segs) < 2:
        return
    parent = segs[-2]
    if parent in LAYER_BY_FOLDER and parent != base:
        findings.append(Finding(
            path, 1, "INFO", "component-not-in-folder",
            f"{parent}/{basename(path)} — give the component its own folder {parent}/{base}/{base}.tsx",
        ))


def _check_vague_folder(path: str, findings: list[Finding]) -> None:
    segs = segments(path)
    if "components" not in segs:
        return
    ci = segs.index("components")
    if len(segs) <= ci + 2:
        return
    sub = segs[ci + 1]
    if sub in VAGUE_COMPONENT_FOLDERS:
        findings.append(Finding(
            path, 1, "WARN", "vague-component-folder",
            f"components/{sub}/ is a generic dump — group by component type or layer",
        ))


def _check_vague_file(path: str, findings: list[Finding]) -> None:
    if seg_in(path, "components") and basename(path) in VAGUE_FILE_NAMES:
        findings.append(Finding(
            path, 1, "WARN", "vague-file-in-components",
            f"'{basename(path)}' in components/ — use co-located <Name>.fixtures.ts / <Name>.types.ts or mocks/",
        ))


def _check_default_export(path: str, lines: list[str], findings: list[Finding]) -> None:
    if not is_component_source(path) or not seg_in(path, "components"):
        return
    for i, line in enumerate(lines, start=1):
        if _RE_DEFAULT_EXPORT.search(line):
            findings.append(Finding(
                path, i, "INFO", "default-export-component",
                "library component uses a default export — prefer a named export for clean barrels",
            ))
            return


def _check_size(path: str, lines: list[str], findings: list[Finding]) -> None:
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
        _check_not_in_folder(path, findings)
        _check_vague_folder(path, findings)
        _check_vague_file(path, findings)

        lines = read_lines(path)
        if lines is None:
            continue
        if not (in_tests(path) or in_mocks(path)):
            _check_default_export(path, lines, findings)
        _check_size(path, lines, findings)


if __name__ == "__main__":
    sys.exit(run_checks(sys.argv, "check-structure.py", run, exts=None))
