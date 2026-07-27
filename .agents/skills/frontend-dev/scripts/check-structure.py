#!/usr/bin/env python3
"""
check-structure — project layout, layouts, naming, file sizes.

Rules:
    domain-folder-in-components  WARN   lowercase folder under components/ not in type whitelist
    vague-component-folder       WARN   components/utils/, helpers/, common/, shared/, etc.
    vendor-named-component       WARN   file starts with Mui*, Ant*, Radix*, etc.
    vague-file-in-components     WARN   data.ts / types.ts / helpers.ts inside components/ or layouts/
    layout-without-folder        WARN   layouts/Foo.tsx should be layouts/Foo/Foo.tsx
    layout-components-flat       WARN   layouts/components/<X>.tsx dump
    mixed-case-folder            INFO   folder mixes CapitalCase and camelCase sources
    large-component              INFO   .tsx/.jsx > 200 lines
    large-file                   INFO   other source > 400 lines
"""

from __future__ import annotations

import os
import sys

from _common import (
    ALLOWED_COMPONENT_TYPE_FOLDERS,
    FRONTEND_EXTS,
    JSX_EXTS,
    LARGE_COMPONENT_LINES,
    LARGE_FILE_LINES,
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


_mixed_case_cache: dict = {}


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


def check_layout_without_folder(path: str, findings: list[Finding]) -> None:
    if not in_layouts(path):
        return
    if file_ext(path) not in JSX_EXTS:
        return
    p = norm(path)
    parts = p.split("/")
    try:
        li = parts.index("layouts")
    except ValueError:
        return
    rest = parts[li + 1:]
    if len(rest) == 1:
        base = basename_no_ext(path)
        if base[0].isupper():
            findings.append(Finding(
                path, 1, "WARN", "layout-without-folder",
                f"layouts/{basename(path)} should live in its own folder layouts/{base}/",
            ))
    elif len(rest) >= 2 and rest[0] == "components":
        findings.append(Finding(
            path, 1, "WARN", "layout-components-flat",
            "layouts/components/ is a dump — move into layouts/<LayoutName>/partials/",
        ))


def check_mixed_case_in_folder(path: str, findings: list[Finding]) -> None:
    folder = os.path.dirname(path)
    base = basename_no_ext(path)
    if file_ext(path) not in FRONTEND_EXTS:
        return
    if base in {"index"} or any(s in base for s in (".test", ".fixtures", ".types", ".variants")):
        return
    _mixed_case_cache.setdefault(folder, {"cap": [], "low": []})
    if base and base[0].isupper():
        _mixed_case_cache[folder]["cap"].append((path, base))
    elif base and base[0].islower():
        _mixed_case_cache[folder]["low"].append((path, base))


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
    _mixed_case_cache.clear()
    for path in paths:
        if not os.path.isfile(path):
            continue
        check_domain_in_shared_components(path, findings)
        check_vague_file_in_components(path, findings)
        check_layout_without_folder(path, findings)
        check_mixed_case_in_folder(path, findings)

        lines = read_lines(path)
        if lines is None:
            continue
        check_vendor_named_component(path, lines, findings)
        check_component_size(path, lines, findings)

    # Emit aggregated mixed-case findings
    for folder, buckets in _mixed_case_cache.items():
        if buckets["cap"] and buckets["low"]:
            n = norm(folder)
            if any(seg in n for seg in ("/routes", "/hooks", "/store", "/services", "/theme", "/mocks")):
                continue
            cap_name = buckets["cap"][0][1]
            low_name = buckets["low"][0][1]
            findings.append(Finding(
                buckets["low"][0][0], 1, "INFO", "mixed-case-folder",
                f"folder contains both CapitalCase ({cap_name}) and camelCase ({low_name}) sources — pick one case",
            ))


if __name__ == "__main__":
    sys.exit(run_checks(sys.argv, "check-structure.py", run, exts=None))
