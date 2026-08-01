"""Validate the source-attributed live shrine index before publishing."""

from __future__ import annotations

import json
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import urlparse


PROJECT_ROOT = Path(__file__).resolve().parent.parent
INDEX_PATH = PROJECT_ROOT / "frontend" / "public" / "shrine-data" / "index.json"
MINIMUMS = {"gallery": 1, "wiki": 5, "news": 3}


def valid_url(value: str) -> bool:
    parsed = urlparse(value or "")
    return parsed.scheme in {"http", "https"} and bool(parsed.netloc)


def main() -> int:
    with INDEX_PATH.open(encoding="utf-8") as handle:
        payload = json.load(handle)

    errors = []
    live = payload.get("liveSearch") or {}
    try:
        generated = datetime.fromisoformat(live.get("generatedAt", "").replace("Z", "+00:00"))
        if datetime.now(timezone.utc) - generated.astimezone(timezone.utc) > timedelta(hours=7):
            errors.append("liveSearch.generatedAt is older than 7 hours")
    except ValueError:
        errors.append("liveSearch.generatedAt is invalid")

    for collection, minimum in MINIMUMS.items():
        items = live.get(collection)
        if not isinstance(items, list) or len(items) < minimum:
            errors.append(f"liveSearch.{collection} has fewer than {minimum} items")
            continue
        for index, item in enumerate(items):
            prefix = f"liveSearch.{collection}[{index}]"
            if not item.get("title"):
                errors.append(f"{prefix}.title is empty")
            source_url = item.get("sourceUrl") or item.get("url")
            if not item.get("source"):
                errors.append(f"{prefix}.source is empty")
            if not valid_url(source_url):
                errors.append(f"{prefix}.sourceUrl is invalid")

    for collection in ("gallery", "related", "guides", "news"):
        for index, item in enumerate(payload.get(collection) or []):
            prefix = f"{collection}[{index}]"
            source_url = item.get("sourceUrl") or item.get("url")
            if not item.get("source"):
                errors.append(f"{prefix}.source is empty")
            if not valid_url(source_url):
                errors.append(f"{prefix}.sourceUrl is invalid")

    if errors:
        print("[ERROR] Shrine validation failed:", file=sys.stderr)
        for error in errors[:30]:
            print(f"  - {error}", file=sys.stderr)
        return 1

    print(
        "[OK] shrine live index: "
        + ", ".join(f"{name}={len(live[name])}" for name in MINIMUMS)
        + f"; generatedAt={live['generatedAt']}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
