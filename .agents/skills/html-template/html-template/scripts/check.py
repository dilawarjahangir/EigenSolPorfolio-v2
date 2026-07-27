#!/usr/bin/env python3
"""
html-template check — runs ALL check scripts in one pass.

Convenience wrapper. For targeted checks, run an individual script:
    check-structure.py, check-styling.py, check-sections.py

Usage:
    python3 check.py PATH [PATH ...]
    python3 check.py local/html-template/

Exit codes:
    0  No findings
    1  Findings emitted
    2  Bad invocation
"""

from __future__ import annotations

import importlib.util
import os
import sys

_SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
if _SCRIPT_DIR not in sys.path:
    sys.path.insert(0, _SCRIPT_DIR)

from _common import Finding, run_checks  # noqa: E402

_SCRIPTS = [
    "check-structure",
    "check-styling",
    "check-sections",
]


def _load_runners() -> list:
    runners = []
    for name in _SCRIPTS:
        mod_name = name.replace("-", "_")
        spec = importlib.util.spec_from_file_location(
            mod_name, os.path.join(_SCRIPT_DIR, f"{name}.py")
        )
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        runners.append(mod.run)
    return runners


def run(paths: list, findings: list) -> None:
    for runner in _load_runners():
        runner(paths, findings)


if __name__ == "__main__":
    sys.exit(run_checks(sys.argv, "check.py", run, exts=None))
