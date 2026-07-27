#!/usr/bin/env python3
"""
check-components — shared component organization rules.

Rules:
    domain-folder-in-components  WARN   lowercase folder under components/ not in type whitelist
    vague-component-folder       WARN   components/utils/, helpers/, common/, shared/, etc.
    vendor-named-component       WARN   file starts with Mui*, Ant*, Radix*, etc.
    vague-file-in-components     WARN   data.ts / types.ts / helpers.ts inside components/ or layouts/
"""

from __future__ import annotations

import os
import sys

from _common import (
    ALLOWED_COMPONENT_TYPE_FOLDERS,
    FRONTEND_EXTS,
    JSX_EXTS,
    VAGUE_COMPONENT_FOLDERS,
    VAGUE_FILE_NAMES,
    VENDOR_PREFIXES,
    Finding,
    basename,
    basename_no_ext,
    file_ext,
    in_components,
    in_layouts,
    norm,
    read_lines,
    run_checks,
)


def check_domain_in_shared_components(path: str, findings: list[Finding]) -> None:
    if not in_components(path):
        return
    p = norm(path)
    parts = p.split("/")
    try:
        ci = parts.index("components")
    except ValueError:
        return
    if len(parts) <= ci + 2:
        return  # file is directly inside components/ (e.g. components/index.ts)
    sub = parts[ci + 1]
    if sub in ALLOWED_COMPONENT_TYPE_FOLDERS:
        return
    if sub in VAGUE_COMPONENT_FOLDERS:
        findings.append(Finding(
            path, 1, "WARN", "vague-component-folder",
            f"components/{sub}/ is a generic dump — group by component type",
        ))
        return
    if sub and sub[0].islower() and not sub.startswith("_"):
        findings.append(Finding(
            path, 1, "WARN", "domain-folder-in-components",
            f"components/{sub}/ looks domain-based — organize by type (atoms, tables, cards, …) or move to components/domain/{sub}/",
        ))


def check_vendor_named_component(path: str, lines: list[str], findings: list[Finding]) -> None:
    if not (in_components(path) or in_layouts(path)):
        return
    if file_ext(path) not in JSX_EXTS:
        return
    base = basename_no_ext(path)
    for prefix in VENDOR_PREFIXES:
        if base.startswith(prefix) and len(base) > len(prefix) and base[len(prefix)].isupper():
            findings.append(Finding(
                path, 1, "WARN", "vendor-named-component",
                f"'{base}' starts with vendor prefix '{prefix}' — wrap behind a project-named component",
            ))
            return


def check_vague_file_in_components(path: str, findings: list[Finding]) -> None:
    if not (in_components(path) or in_layouts(path)):
        return
    if basename(path) in VAGUE_FILE_NAMES:
        findings.append(Finding(
            path, 1, "WARN", "vague-file-in-components",
            f"'{basename(path)}' in components/ or layouts/ — use co-located <Name>.fixtures.ts or <Name>.types.ts",
        ))


def run(paths: list[str], findings: list[Finding]) -> None:
    for path in paths:
        if not os.path.isfile(path):
            continue
        check_domain_in_shared_components(path, findings)
        check_vague_file_in_components(path, findings)

        lines = read_lines(path)
        if lines is None:
            continue
        check_vendor_named_component(path, lines, findings)


if __name__ == "__main__":
    sys.exit(run_checks(sys.argv, "check-components.py", run, exts=FRONTEND_EXTS))
