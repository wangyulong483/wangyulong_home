"""Validate the AI quiz question bank (manifest index + chunked question files)."""

from __future__ import annotations

import json
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "frontend" / "public" / "ai-quiz-data"
MANIFEST_PATH = DATA_DIR / "manifest.json"

KNOWN_DIMENSIONS = {
    "model-basics",
    "prompt-context",
    "rag",
    "agent",
    "tools-skills-mcp",
    "eval-safety",
}
KNOWN_ICONS = {"microchip", "code", "book", "target", "wrench", "shield-03"}
KNOWN_AUDIENCES = {"general", "professional"}
KNOWN_DIFFICULTY = {"basic", "intermediate", "advanced"}
KNOWN_COGNITIVE = {"remember", "understand", "apply", "analyze"}
KNOWN_VOLATILITY = {"low", "medium", "high"}
KNOWN_TYPES = {"single", "multiple", "judge"}

MIN_TOTAL = 60
MIN_GENERAL = 30
MIN_PROFESSIONAL = 30
MAX_JUDGE = 8
TARGET_PER_DIMENSION = 12


def main() -> int:
    errors = []
    warnings = []

    with MANIFEST_PATH.open(encoding="utf-8") as handle:
        manifest = json.load(handle)

    if manifest.get("schemaVersion") != "1.3.0":
        errors.append("manifest.schemaVersion must be 1.3.0")

    dimensions = manifest.get("dimensions") or []
    sources = manifest.get("sources") or []
    meta_questions = manifest.get("questions") or []

    dim_ids = [dimension.get("id") for dimension in dimensions]
    if set(dim_ids) != KNOWN_DIMENSIONS:
        errors.append(f"dimensions ids must be exactly {sorted(KNOWN_DIMENSIONS)}")
    if len(set(dim_ids)) != len(dim_ids):
        errors.append("dimensions contain duplicate ids")
    for dimension in dimensions:
        if not dimension.get("title") or not dimension.get("tagline"):
            errors.append(f"dimension {dimension.get('id')} missing title/tagline")
        if dimension.get("icon") not in KNOWN_ICONS:
            errors.append(f"dimension {dimension.get('id')} icon not in whitelist")

    source_ids = [source.get("id") for source in sources]
    if len(set(source_ids)) != len(source_ids):
        errors.append("sources contain duplicate ids")
    known_sources = set(source_ids)
    for source in sources:
        if not source.get("id") or not source.get("title") or not source.get("publisher") or not source.get("url"):
            errors.append(f"source {source.get('id')} missing id/title/publisher/url")

    meta_ids = [question.get("id") for question in meta_questions]
    if len(set(meta_ids)) != len(meta_ids):
        errors.append("manifest.questions contain duplicate ids")

    content_by_id = {}
    chunk_file_names = set()
    for path in sorted((DATA_DIR / "questions").rglob("*.json")):
        rel = path.relative_to(DATA_DIR).as_posix()
        chunk_file_names.add(rel)
        with path.open(encoding="utf-8") as handle:
            chunk = json.load(handle)
        if chunk.get("file") != rel:
            errors.append(f"{rel} file field mismatch")
        for content in chunk.get("questions") or []:
            cid = content.get("id")
            if not cid:
                errors.append(f"{rel} contains a question without id")
                continue
            if cid in content_by_id:
                errors.append(f"duplicate question id across chunks: {cid}")
            content_by_id[cid] = content

    meta_id_set = set(meta_ids)
    for question in meta_questions:
        qid = question.get("id")
        if not qid:
            errors.append("manifest question missing id")
            continue
        prefix = f"{qid}"
        if question.get("file") not in chunk_file_names:
            errors.append(f"{prefix} references missing file {question.get('file')}")
        if qid not in content_by_id:
            errors.append(f"{prefix} has no content in any chunk")
        if question.get("dimension") not in KNOWN_DIMENSIONS:
            errors.append(f"{prefix} invalid dimension")
        audience = question.get("audience")
        if not isinstance(audience, list) or not audience or not set(audience) <= KNOWN_AUDIENCES:
            errors.append(f"{prefix} invalid audience")
        if question.get("difficulty") not in KNOWN_DIFFICULTY:
            errors.append(f"{prefix} invalid difficulty")
        if question.get("cognitiveLevel") not in KNOWN_COGNITIVE:
            errors.append(f"{prefix} invalid cognitiveLevel")
        if question.get("volatility") not in KNOWN_VOLATILITY:
            errors.append(f"{prefix} invalid volatility")
        if not isinstance(question.get("tags"), list) or not question.get("tags"):
            errors.append(f"{prefix} missing tags")
        if not question.get("sourceIds") or set(question.get("sourceIds")) - known_sources:
            errors.append(f"{prefix} invalid sourceIds")
        if not question.get("file"):
            errors.append(f"{prefix} missing file")

    for cid in content_by_id:
        if cid not in meta_id_set:
            errors.append(f"chunk question {cid} has no manifest entry")

    for cid, content in content_by_id.items():
        prefix = f"{cid}"
        qtype = content.get("type")
        if qtype not in KNOWN_TYPES:
            errors.append(f"{prefix} invalid type")
        options = content.get("options")
        if not isinstance(options, list) or len(options) < 2:
            errors.append(f"{prefix} needs at least 2 options")
            continue
        if not content.get("prompt") or not content.get("explanation") or not content.get("evidence"):
            errors.append(f"{prefix} missing prompt/explanation/evidence")
        answer = content.get("answer")
        if qtype == "multiple":
            if (
                not isinstance(answer, list)
                or not answer
                or any(not isinstance(index, int) or not 0 <= index < len(options) for index in answer)
            ):
                errors.append(f"{prefix} invalid multiple answer")
        elif qtype == "judge":
            if options != ["正确", "错误"]:
                errors.append(f"{prefix} judge options must be [正确, 错误]")
            if answer not in (0, 1):
                errors.append(f"{prefix} judge answer must be 0 or 1")
        else:
            if not isinstance(answer, int) or not 0 <= answer < len(options):
                errors.append(f"{prefix} invalid single answer")

    total = len(meta_questions)
    general = sum(1 for question in meta_questions if "general" in (question.get("audience") or []))
    professional = sum(1 for question in meta_questions if "professional" in (question.get("audience") or []))
    judge = sum(1 for content in content_by_id.values() if content.get("type") == "judge")

    if total < MIN_TOTAL:
        errors.append(f"total questions {total} < {MIN_TOTAL}")
    if general < MIN_GENERAL:
        errors.append(f"general questions {general} < {MIN_GENERAL}")
    if professional < MIN_PROFESSIONAL:
        errors.append(f"professional questions {professional} < {MIN_PROFESSIONAL}")
    if judge > MAX_JUDGE:
        errors.append(f"judge questions {judge} > {MAX_JUDGE}")

    dim_counts = {}
    for question in meta_questions:
        dim = question.get("dimension")
        dim_counts[dim] = dim_counts.get(dim, 0) + 1
    for dim in sorted(KNOWN_DIMENSIONS):
        count = dim_counts.get(dim, 0)
        if count < TARGET_PER_DIMENSION:
            warnings.append(f"dimension {dim} has {count} questions (target >= {TARGET_PER_DIMENSION})")

    if errors:
        print("[ERROR] Quiz validation failed:", file=sys.stderr)
        for error in errors[:40]:
            print(f"  - {error}", file=sys.stderr)
        return 1

    for warning in warnings:
        print(f"[WARN] {warning}", file=sys.stderr)

    print(f"[OK] quiz: total={total}, general={general}, professional={professional}, judge={judge}, chunks={len(chunk_file_names)}")
    print("[OK] quiz dimensions: " + ", ".join(f"{dim}={dim_counts.get(dim, 0)}" for dim in sorted(KNOWN_DIMENSIONS)))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
