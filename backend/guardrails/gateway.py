"""
Guardrails gateway: the single choke point every user message and every
model response passes through. Keep this dumb and fast — it should reject
obviously bad input/output, not try to be a second LLM.

Swap `_BLOCKLIST` / add regex or a moderation-API call as the project grows;
callers only depend on `check_input` / `check_output` returning a GuardResult.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import List, Optional

_BLOCKLIST_PATTERNS: List[re.Pattern] = [
    re.compile(r"ignore (all|previous) instructions", re.IGNORECASE),
    re.compile(r"system prompt", re.IGNORECASE),
    re.compile(r"\bssn\b|\bsocial security number\b", re.IGNORECASE),
]

MAX_INPUT_CHARS = 4000
MAX_OUTPUT_CHARS = 8000


@dataclass
class GuardResult:
    allowed: bool
    reason: Optional[str] = None
    sanitized_text: Optional[str] = None


def check_input(text: str) -> GuardResult:
    if not text or not text.strip():
        return GuardResult(allowed=False, reason="Empty message.")

    if len(text) > MAX_INPUT_CHARS:
        return GuardResult(allowed=False, reason=f"Message exceeds {MAX_INPUT_CHARS} characters.")

    for pattern in _BLOCKLIST_PATTERNS:
        if pattern.search(text):
            return GuardResult(allowed=False, reason="Message matched a restricted pattern.")

    return GuardResult(allowed=True, sanitized_text=text.strip())


def check_output(text: str) -> GuardResult:
    if not text:
        return GuardResult(allowed=False, reason="Empty model response.")

    if len(text) > MAX_OUTPUT_CHARS:
        text = text[:MAX_OUTPUT_CHARS] + "\n\n[truncated]"

    for pattern in _BLOCKLIST_PATTERNS:
        if pattern.search(text):
            return GuardResult(allowed=False, reason="Response matched a restricted pattern.")

    return GuardResult(allowed=True, sanitized_text=text)


def run_gateway(user_message: str, generate_fn) -> str:
    """
    Convenience wrapper: validate input -> call the LLM -> validate output.
    `generate_fn` is whatever calls your agent/LLM and returns a string.
    Raises ValueError with a user-facing reason on any guard failure.
    """
    input_check = check_input(user_message)
    if not input_check.allowed:
        raise ValueError(input_check.reason)

    raw_output = generate_fn(input_check.sanitized_text)

    output_check = check_output(raw_output)
    if not output_check.allowed:
        raise ValueError(output_check.reason)

    return output_check.sanitized_text
