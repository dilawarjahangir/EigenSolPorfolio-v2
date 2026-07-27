#!/usr/bin/env python3
"""
Frontend check — runs ALL check scripts in one pass.

This is a convenience wrapper. For targeted checks, use individual scripts:
    check-structure.py, check-routing.py, check-pages.py,
    check-components.py, check-a11y.py, check-styling.py,
    check-correctness.py

Usage:
    python3 check.py FILE [FILE ...]
    python3 check.py src/

Exit codes:
    0  No findings
    1  Findings emitted
    2  Bad invocation
"""

from __future__ import annotations

import os
import sys

from _common import Finding, expand_paths, run_checks

# Import each focused checker's run function
import importlib

_SCRIPTS = [
    "check-structure",
    "check-routing",
    "check-pages",
    "check-components",
    "check-a11y",
    "check-styling",
    "check-correctness",
]


def _load_runners() -> list:
    """Dynamically import each check-*.py module and return its run function."""
    runners = []
    for name in _SCRIPTS:
        mod_name = name.replace("-", "_")
        # Import by file path since module names have hyphens
        script_dir = os.path.dirname(os.path.abspath(__file__))
        spec = importlib.util.spec_from_file_location(
            mod_name, os.path.join(script_dir, f"{name}.py")
        )
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        runners.append(mod.run)
    return runners


def run(paths: list[str], findings: list[Finding]) -> None:
    runners = _load_runners()
    for runner in runners:
        runner(paths, findings)


if __name__ == "__main__":
    sys.exit(run_checks(sys.argv, "check.py", run, exts=None))
