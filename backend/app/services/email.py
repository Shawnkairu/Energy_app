"""Email OTP delivery — Resend in production, console fallback in dev.

Per docs/PILOT_SCOPE.md §1, OTP is email-only for the pilot.
"""
from __future__ import annotations

import logging
from typing import Any

from ..config import get_settings

logger = logging.getLogger(__name__)


async def send_otp_email(to: str, code: str) -> None:
    """Deliver a 6-digit OTP code to `to`.

    In dev (ALLOW_DEV_OTP_CONSOLE=true), always also logs the code to stdout
    so developers can read it without configuring Resend. In non-dev mode
    without a configured Resend key, raises so the caller surfaces a 500.
    """
    settings = get_settings()

    if settings.allow_dev_otp_console:
        logger.warning("[dev-otp] %s -> %s", to, code)

    api_key = settings.resend_api_key
    if not api_key:
        if settings.allow_dev_otp_console:
            return  # Dev mode: console-only is sufficient
        raise RuntimeError(
            "EMAPPA_RESEND_API_KEY not set and EMAPPA_ALLOW_DEV_OTP_CONSOLE=false"
        )

    # Real send via Resend.
    try:
        import resend  # type: ignore[import-not-found]

        resend.api_key = api_key
        params: dict[str, Any] = {
            "from": settings.resend_from,
            "to": [to],
            "subject": "Your e.mappa code",
            "html": (
                f"<p>Your e.mappa verification code is <strong>{code}</strong>.</p>"
                f"<p>This code expires in 10 minutes. If you did not request it, ignore this email.</p>"
            ),
        }
        resend.Emails.send(params)
    except Exception as exc:  # noqa: BLE001 — surface, but don't leak code in logs
        logger.exception("Resend OTP send failed for %s", to)
        if not settings.allow_dev_otp_console:
            raise RuntimeError("OTP delivery failed") from exc
