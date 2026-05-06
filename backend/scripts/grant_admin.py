"""grant_admin — operator-run CLI to grant a user the admin role.

Per docs/IA_SPEC.md §8.5, admin is never publicly assignable. This script (plus seed.py)
is the only path to creating admin users.

Validates the target email against EMAPPA_ADMIN_EMAILS before granting.
Implementation lands in Phase B `auth` subagent.

Usage:

    python -m backend.scripts.grant_admin <email>

Returns nonzero exit code if email not in allowlist or DB unreachable.
"""
from __future__ import annotations

import sys


def main() -> int:
    if len(sys.argv) < 2:
        print("usage: grant_admin <email>", file=sys.stderr)
        return 2
    email = sys.argv[1]
    print(
        f"[grant_admin] placeholder — Phase B `auth` subagent implements the upsert. target={email}",
        file=sys.stderr,
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
