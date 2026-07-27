#!/usr/bin/env python3
"""
check-structure — verify the template's bucket layout and required docs.

Operates on whatever path you pass; it infers the template root from the file
list. Checks are emitted only when the path actually looks like a template
(at least one bucket dir or one required doc is present), to avoid noise.

Rules:
  doc-missing                WARN  a required root doc is absent
  bucket-missing             INFO  site/ | components/ | sample-pages/ absent
  layouts-missing            INFO  sample-pages/ present but no layouts/ folder
  section-folder-missing-html WARN a sample section folder has .css/.js but no .html

Run:  python3 check-structure.py local/html-template/
"""

from __future__ import annotations

import os
import sys

_SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
if _SCRIPT_DIR not in sys.path:
    sys.path.insert(0, _SCRIPT_DIR)

from _common import (  # noqa: E402
    Finding, run_checks, norm, basename, file_ext, segments,
    REQUIRED_DOCS, BUCKET_DIRS,
)


def _template_root(paths: list) -> str:
    norm_paths = [norm(p) for p in paths]
    if not norm_paths:
        return "."
    if len(norm_paths) == 1:
        p = norm_paths[0]
        return os.path.dirname(p) if file_ext(p) else p
    try:
        root = norm(os.path.commonpath(norm_paths))
    except ValueError:
        root = "."
    if file_ext(root):
        root = os.path.dirname(root)
    return root or "."


def run(paths: list, findings: list) -> None:
    if not paths:
        return

    root = _template_root(paths)
    seg_set: set = set()
    for p in paths:
        seg_set.update(segments(p))

    has_bucket = any(b in seg_set for b in BUCKET_DIRS)
    docs_at_root = {
        basename(p)
        for p in paths
        if file_ext(p) == ".md" and norm(os.path.dirname(norm(p))) == root
    }
    has_doc = bool(docs_at_root & set(REQUIRED_DOCS))

    # Only assert structure when this really looks like a template root.
    if not (has_bucket or has_doc):
        return

    for doc in REQUIRED_DOCS:
        if doc not in docs_at_root:
            findings.append(Finding(f"{root}/{doc}", 1, "WARN", "doc-missing",
                f"required doc '{doc}' not found at template root"))

    for bucket in BUCKET_DIRS:
        if bucket not in seg_set:
            findings.append(Finding(root or ".", 1, "INFO", "bucket-missing",
                f"bucket '{bucket}/' not found — the template ships three buckets"))

    # sample-pages must carry a layouts/ folder
    if "sample-pages" in seg_set:
        has_layouts = any("sample-pages/layouts" in norm(p) for p in paths)
        if not has_layouts:
            findings.append(Finding(f"{root}/sample-pages", 1, "INFO", "layouts-missing",
                "sample-pages/ has no layouts/ folder (header, footer, …)"))

    # A sample section folder with assets but no html entry
    by_dir: dict = {}
    for p in paths:
        np = norm(p)
        if "sample-pages/pages/" not in np:
            continue
        d = os.path.dirname(np)
        by_dir.setdefault(d, set()).add(file_ext(np))
    for d, exts in by_dir.items():
        has_asset = (".css" in exts) or (".js" in exts)
        has_html = (".html" in exts) or (".htm" in exts)
        # only flag leaf-ish section folders (…/pages/<page>/<section>/)
        depth_after_pages = len(norm(d).split("sample-pages/pages/")[-1].split("/"))
        if has_asset and not has_html and depth_after_pages >= 2:
            findings.append(Finding(d, 1, "WARN", "section-folder-missing-html",
                "section folder has .css/.js but no .html entry (add index.html)"))


if __name__ == "__main__":
    sys.exit(run_checks(sys.argv, "check-structure.py", run))
