"""Validate the source-attributed live shrine index before publishing."""

from __future__ import annotations

import json
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import urlparse


PROJECT_ROOT = Path(__file__).resolve().parent.parent
INDEX_PATH = PROJECT_ROOT / "frontend" / "public" / "shrine-data" / "index.json"
KNOWLEDGE_PATH = PROJECT_ROOT / "frontend" / "public" / "shrine-data" / "knowledge-base.json"
MINIMUMS = {"gallery": 1, "wiki": 5, "news": 3}
KNOWLEDGE_LAYERS = {"身份", "经历", "人生观", "价值观", "治理", "关系", "日常", "武艺", "世界观"}
KNOWLEDGE_CERTAINTY = {
    "canonical",
    "interpretive",
    "limited",
    "canonical-with-unknowns",
    "canonical-with-memory-boundary",
    "canonical-with-version-boundary",
}


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
    except (TypeError, ValueError):
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

    with KNOWLEDGE_PATH.open(encoding="utf-8") as handle:
        knowledge = json.load(handle)

    sources = knowledge.get("sources") or []
    entries = knowledge.get("entries") or []
    source_ids = [source.get("id") for source in sources]
    entry_ids = [entry.get("id") for entry in entries]
    if knowledge.get("schemaVersion") != "2.0.0":
        errors.append("knowledge.schemaVersion must be 2.0.0")
    try:
        datetime.fromisoformat(knowledge.get("updatedAt", "").replace("Z", "+00:00"))
    except ValueError:
        errors.append("knowledge.updatedAt is invalid")
    if len(entries) < 60:
        errors.append("knowledge.entries has fewer than 60 items")
    if len(set(source_ids)) != len(source_ids):
        errors.append("knowledge.sources contains duplicate ids")
    if len(set(entry_ids)) != len(entry_ids):
        errors.append("knowledge.entries contains duplicate ids")

    known_sources = set(source_ids)
    known_entries = set(entry_ids)
    for index, source in enumerate(sources):
        prefix = f"knowledge.sources[{index}]"
        if not source.get("id") or not source.get("title") or not source.get("publisher"):
            errors.append(f"{prefix} is missing id/title/publisher")
        if not valid_url(source.get("url", "")):
            errors.append(f"{prefix}.url is invalid")
        if str(source.get("tier", "")).startswith("github-"):
            if not source.get("license") or not source.get("attribution"):
                errors.append(f"{prefix} GitHub source needs license and attribution")

    for index, entry in enumerate(entries):
        prefix = f"knowledge.entries[{index}]"
        if not all(entry.get(field) for field in ("id", "title", "layer", "content", "voice")):
            errors.append(f"{prefix} is missing required fields")
        if entry.get("layer") not in KNOWLEDGE_LAYERS:
            errors.append(f"{prefix}.layer is invalid")
        if entry.get("certainty") not in KNOWLEDGE_CERTAINTY:
            errors.append(f"{prefix}.certainty is invalid")
        if not isinstance(entry.get("priority"), int) or not 0 <= entry["priority"] <= 100:
            errors.append(f"{prefix}.priority must be an integer from 0 to 100")
        if not entry.get("aliases") or not entry.get("keywords"):
            errors.append(f"{prefix} needs aliases and keywords")
        if not entry.get("sourceIds"):
            errors.append(f"{prefix} needs at least one source")
        unknown_sources = set(entry.get("sourceIds") or []) - known_sources
        if unknown_sources:
            errors.append(f"{prefix} references unknown sources: {sorted(unknown_sources)}")
        unknown_related = set(entry.get("related") or []) - known_entries
        if unknown_related:
            errors.append(f"{prefix} references unknown related entries: {sorted(unknown_related)}")
        if entry.get("id") in set(entry.get("related") or []):
            errors.append(f"{prefix} cannot reference itself")

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
    print(
        f"[OK] shrine knowledge: entries={len(entries)}, sources={len(sources)}, "
        f"version={knowledge.get('knowledgeVersion')}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
