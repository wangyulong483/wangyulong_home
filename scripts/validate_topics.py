"""Validate the generated hot-topics payload before publishing it."""

import argparse
import json
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import urlparse
from zoneinfo import ZoneInfo


PROJECT_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_PATH = PROJECT_ROOT / "frontend" / "public" / "topics-data" / "hot-topics.json"
SHANGHAI_TZ = ZoneInfo("Asia/Shanghai")

MIN_ITEMS = 12
MIN_SOURCES = 4
MAX_ITEM_AGE_HOURS = 50
MAX_NEWEST_AGE_HOURS = 24
MAX_GENERATION_AGE_HOURS = 13
MIN_CHINESE_ITEMS = 12
MIN_DOMESTIC_SOURCES = 2
MIN_CHINESE_SHARE = 0.7


def parse_datetime(value: str, field: str) -> datetime:
    if not value:
        raise ValueError(f"{field} is empty")
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        raise ValueError(f"{field} must include a timezone")
    return parsed.astimezone(timezone.utc)


def is_http_url(value: str) -> bool:
    parsed = urlparse(value)
    return parsed.scheme in {"http", "https"} and bool(parsed.netloc)


def validate(payload: dict, expected_generated_at: str | None = None) -> list[str]:
    errors = []
    now = datetime.now(timezone.utc)
    items = payload.get("items")

    if not isinstance(items, list):
        return ["items must be an array"]

    if len(items) < MIN_ITEMS:
        errors.append(f"only {len(items)} items; expected at least {MIN_ITEMS}")
    if payload.get("total") != len(items):
        errors.append("total does not match items length")

    expected_date = now.astimezone(SHANGHAI_TZ).strftime("%Y-%m-%d")
    if payload.get("date") != expected_date:
        errors.append(f"date is {payload.get('date')!r}; expected {expected_date!r}")

    try:
        generated_at = parse_datetime(payload.get("generatedAt"), "generatedAt")
        generation_age = now - generated_at
        if generation_age > timedelta(hours=MAX_GENERATION_AGE_HOURS):
            errors.append(f"payload was generated {generation_age} ago")
        if generation_age < -timedelta(minutes=5):
            errors.append("generatedAt is unexpectedly in the future")
        if expected_generated_at and payload.get("generatedAt") != expected_generated_at:
            errors.append("deployed generatedAt does not match the workflow payload")
    except (TypeError, ValueError) as exc:
        errors.append(str(exc))

    ids = set()
    urls = set()
    sources = set()
    published_dates = []
    chinese_items = 0
    domestic_sources = set()

    for index, item in enumerate(items):
        prefix = f"items[{index}]"
        item_id = item.get("id")
        url = item.get("url")
        source = item.get("source")
        language = item.get("language")
        scope = item.get("scope")

        if not item.get("title"):
            errors.append(f"{prefix}.title is empty")
        if not item_id or item_id in ids:
            errors.append(f"{prefix}.id is empty or duplicated")
        else:
            ids.add(item_id)
        if not is_http_url(url or ""):
            errors.append(f"{prefix}.url is invalid")
        elif url in urls:
            errors.append(f"{prefix}.url is duplicated")
        else:
            urls.add(url)
        if not source:
            errors.append(f"{prefix}.source is empty")
        else:
            sources.add(source)

        if language == "zh":
            chinese_items += 1
        if scope in {"hefei", "china"} and source:
            domestic_sources.add(source)

        try:
            published_at = parse_datetime(item.get("publishedAt"), f"{prefix}.publishedAt")
            published_dates.append(published_at)
            age = now - published_at
            if age > timedelta(hours=MAX_ITEM_AGE_HOURS):
                errors.append(f"{prefix} is older than {MAX_ITEM_AGE_HOURS} hours")
            if age < -timedelta(hours=2):
                errors.append(f"{prefix} is unexpectedly in the future")
        except (TypeError, ValueError) as exc:
            errors.append(str(exc))

    if len(sources) < MIN_SOURCES:
        errors.append(f"only {len(sources)} sources; expected at least {MIN_SOURCES}")
    if chinese_items < MIN_CHINESE_ITEMS:
        errors.append(f"only {chinese_items} Chinese items; expected at least {MIN_CHINESE_ITEMS}")
    if items and chinese_items / len(items) < MIN_CHINESE_SHARE:
        errors.append(
            f"Chinese share is {chinese_items / len(items):.0%}; expected at least {MIN_CHINESE_SHARE:.0%}"
        )
    if len(domestic_sources) < MIN_DOMESTIC_SOURCES:
        errors.append(
            f"only {len(domestic_sources)} domestic sources; expected at least {MIN_DOMESTIC_SOURCES}"
        )
    if published_dates and now - max(published_dates) > timedelta(hours=MAX_NEWEST_AGE_HOURS):
        errors.append("the newest item is more than 24 hours old")

    freshness = payload.get("freshness") or {}
    if freshness.get("sourceCount") != len(sources):
        errors.append("freshness.sourceCount does not match the actual source count")

    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--path", type=Path, default=DEFAULT_PATH)
    parser.add_argument("--expected-generated-at")
    args = parser.parse_args()

    try:
        with args.path.open(encoding="utf-8") as handle:
            payload = json.load(handle)
    except (OSError, json.JSONDecodeError) as exc:
        print(f"[ERROR] Cannot read {args.path}: {exc}", file=sys.stderr)
        return 1

    errors = validate(payload, args.expected_generated_at)
    if errors:
        print("[ERROR] Hot topics validation failed:", file=sys.stderr)
        for error in errors[:30]:
            print(f"  - {error}", file=sys.stderr)
        return 1

    sources = {item["source"] for item in payload["items"]}
    print(
        f"[OK] {payload['date']}: {len(payload['items'])} items from "
        f"{len(sources)} sources; generatedAt={payload['generatedAt']}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
