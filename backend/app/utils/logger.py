"""
SmartCattle Net
utils/logger.py

Purpose
-------
Structured JSON application logger.
Provides a singleton root logger and a factory that every
module can call to obtain a correctly-scoped child logger.

Design decisions
----------------
- JSON lines format → easy to ingest into any log-aggregation stack
  (Loki, CloudWatch, Datadog, etc.) without additional parsers.
- pythonjsonlogger is a soft dependency: if it is not installed the
  module falls back to a plain text formatter so the app still starts.
- Log level is read from the environment variable LOG_LEVEL
  (defaults to INFO).
- A single StreamHandler (stdout) is registered on the root logger.
  Adding a file handler later is a one-liner.

Dependencies
------------
- python-json-logger  (pip install python-json-logger)
- Standard library: logging, os, sys
"""

from __future__ import annotations

import logging
import os
import sys
from typing import Optional


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

_DEFAULT_LOG_LEVEL: str = "INFO"
_LOG_FORMAT_JSON: str = (
    "%(asctime)s %(levelname)s %(name)s %(module)s %(funcName)s %(message)s"
)
_LOG_FORMAT_PLAIN: str = (
    "[%(asctime)s] %(levelname)-8s %(name)s — %(message)s"
)
_DATE_FORMAT: str = "%Y-%m-%dT%H:%M:%S"
_ROOT_LOGGER_NAME: str = "smartcattle"


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------


def _resolve_log_level() -> int:
    """
    Read LOG_LEVEL from the environment and convert it to a logging int.

    Returns
    -------
    int
        A ``logging.*`` constant (e.g. ``logging.DEBUG``).
    """
    raw: str = os.getenv("LOG_LEVEL", _DEFAULT_LOG_LEVEL).upper()
    level: int = getattr(logging, raw, logging.INFO)
    return level


def _build_formatter() -> logging.Formatter:
    """
    Build the best available formatter.

    Attempts to use ``pythonjsonlogger.jsonlogger.JsonFormatter`` for
    structured JSON output. Falls back to a plain ``logging.Formatter``
    if the package is not installed.

    Returns
    -------
    logging.Formatter
        A configured formatter instance.
    """
    try:
        from pythonjsonlogger import jsonlogger  # type: ignore[import]

        return jsonlogger.JsonFormatter(
            fmt=_LOG_FORMAT_JSON,
            datefmt=_DATE_FORMAT,
            rename_fields={"levelname": "level", "asctime": "timestamp"},
        )
    except ImportError:
        return logging.Formatter(
            fmt=_LOG_FORMAT_PLAIN,
            datefmt=_DATE_FORMAT,
        )


def _configure_root_logger() -> logging.Logger:
    """
    Create and configure the SmartCattle root logger exactly once.

    If the root logger has already been configured (handlers already
    attached), this function is a no-op and returns the existing logger.

    Returns
    -------
    logging.Logger
        The configured root logger named ``smartcattle``.
    """
    root: logging.Logger = logging.getLogger(_ROOT_LOGGER_NAME)

    # Guard: prevent duplicate handlers when module is re-imported
    if root.handlers:
        return root

    root.setLevel(_resolve_log_level())

    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(_resolve_log_level())
    handler.setFormatter(_build_formatter())

    root.addHandler(handler)

    # Prevent log records from propagating to the global Python root
    # logger so we do not get duplicated lines in certain frameworks.
    root.propagate = False

    return root


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

# Initialise the singleton on module import.
_root_logger: logging.Logger = _configure_root_logger()


def get_logger(name: Optional[str] = None) -> logging.Logger:
    """
    Return a child logger scoped to *name* under the SmartCattle root.

    Typical usage inside any module::

        from app.utils.logger import get_logger
        logger = get_logger(__name__)
        logger.info("Model loaded", extra={"stage": "stage1"})

    Parameters
    ----------
    name : str or None
        Dotted module path.  When ``None`` the root SmartCattle logger
        is returned directly.

    Returns
    -------
    logging.Logger
        A configured logger instance.
    """
    if name is None:
        return _root_logger

    # Prefix with the application root so all loggers share one hierarchy
    if not name.startswith(_ROOT_LOGGER_NAME):
        full_name = f"{_ROOT_LOGGER_NAME}.{name}"
    else:
        full_name = name

    return logging.getLogger(full_name)


def set_log_level(level: str) -> None:
    """
    Dynamically change the log level at runtime.

    Useful during testing or when the level must be adjusted without
    restarting the application.

    Parameters
    ----------
    level : str
        Case-insensitive log level string: ``"DEBUG"``, ``"INFO"``,
        ``"WARNING"``, ``"ERROR"``, ``"CRITICAL"``.

    Raises
    ------
    ValueError
        If *level* is not a recognised logging level.
    """
    numeric: int = getattr(logging, level.upper(), None)  # type: ignore[arg-type]
    if numeric is None:
        raise ValueError(
            f"Invalid log level: {level!r}. "
            "Choose from DEBUG, INFO, WARNING, ERROR, CRITICAL."
        )
    _root_logger.setLevel(numeric)
    for handler in _root_logger.handlers:
        handler.setLevel(numeric)
