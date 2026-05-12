"""Legacy test compatibility shim.

Historically, tests imported `app.store.store` and called `store.reset()`
between cases. The API is now DB-backed, so this in-memory store no longer
exists; keep a no-op shim so older fixtures still import cleanly.
"""


class _LegacyStoreShim:
    def reset(self) -> None:
        """No-op reset for compatibility with old test fixtures."""


store = _LegacyStoreShim()

