#!/usr/bin/env python3
"""
fe-template-dev check — runs ALL check scripts in one pass.

Convenience wrapper. For targeted checks, run an individual script:
    check-structure.py, check-tokens.py, check-layers.py,
    check-catalog.py, check-consumption.py

Usage:
    python3 check.py FILE [FILE ...]
    python3 check.py packages/ui/src/

Exit codes:
    0  No findings
    1  Findings emitted
    2  Bad invocation
"""

from __future__ import annotations

import importlib.util
import os
import sys

# Ensure this script's directory is importable so dynamically loaded
# check-*.py modules can `from _common import ...` regardless of cwd.
_SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
if _SCRIPT_DIR not in sys.path:
    sys.path.insert(0, _SCRIPT_DIR)

from _common import Finding, run_checks  # noqa: E402

_SCRIPTS = [
    "check-structure",
    "check-tokens",
    "check-layers",
    "check-catalog",
    "check-consumption",
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


def run(paths: list[str], findings: list[Finding]) -> None:
    for runner in _load_runners():
        runner(paths, findings)


if __name__ == "__main__":
    sys.exit(run_checks(sys.argv, "check.py", run, exts=None))
