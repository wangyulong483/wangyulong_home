"""Refresh the searchable, source-attributed index for the Raiden shrine."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote

import feedparser
import requests
from bs4 import BeautifulSoup


PROJECT_ROOT = Path(__file__).resolve().parent.parent
INDEX_PATH = PROJECT_ROOT / "frontend" / "public" / "shrine-data" / "index.json"
TIMEOUT = 25
USER_AGENT = "Mozilla/5.0 (compatible; ShrineIndexBot/1.0; +https://github.com/wangyulong483)"
TARGET_TERMS = ("雷电将军", "雷电影", "雷神", "巴尔泽布", "一心净土")
BVID_PATTERN = re.compile(r"BV[0-9A-Za-z]{10}")


def request(url: str, *, params: dict | None = None) -> requests.Response:
    response = requests.get(
        url,
        params=params,
        timeout=TIMEOUT,
        headers={"User-Agent": USER_AGENT, "Referer": "https://www.bilibili.com/"},
    )
    response.raise_for_status()
    return response


def clean_html(value: str, limit: int = 320) -> str:
    text = BeautifulSoup(value or "", "lxml").get_text(" ", strip=True)
    return re.sub(r"\s+", " ", text)[:limit]


def stable_id(prefix: str, value: str) -> str:
    digest = hashlib.sha256(value.encode("utf-8")).hexdigest()[:12]
    return f"{prefix}-{digest}"


def iso_date(timestamp: int | float | None) -> str:
    if not timestamp:
        return ""
    return datetime.fromtimestamp(timestamp, tz=timezone.utc).strftime("%Y-%m-%d")


def fetch_bilibili_index(curated_bvids: list[str]) -> list[dict]:
    """Discover Bilibili pages through Bing RSS, then verify metadata via Bilibili's view API."""
    bvids: list[str] = []
    for query in ("site:bilibili.com/video 雷电将军", "site:bilibili.com/video 雷电影"):
        feed = feedparser.parse(
            request("https://www.bing.com/search", params={"format": "rss", "q": query}).content
        )
        for entry in feed.entries:
            match = BVID_PATTERN.search(f"{entry.get('link', '')} {entry.get('description', '')}")
            if match and match.group(0) not in bvids:
                bvids.append(match.group(0))

    # Search engines can suppress Bilibili video URLs. The public View API still
    # refreshes title, cover and engagement for every curated source in real time.
    for bvid in curated_bvids:
        if bvid and bvid not in bvids:
            bvids.append(bvid)

    results = []
    for bvid in bvids[:18]:
        try:
            payload = request(
                "https://api.bilibili.com/x/web-interface/view", params={"bvid": bvid}
            ).json()
            video = payload.get("data") or {}
            title = clean_html(video.get("title", ""), 120)
            description = clean_html(video.get("desc", ""), 240)
            if not any(term in f"{title} {description}" for term in TARGET_TERMS):
                continue
            owner = video.get("owner") or {}
            stats = video.get("stat") or {}
            results.append({
                "id": stable_id("video", bvid),
                "title": title,
                "platform": "bilibili",
                "platformLabel": "B站",
                "url": bvid,
                "source": f"哔哩哔哩 · {owner.get('name') or '视频作者'}",
                "sourceUrl": f"https://www.bilibili.com/video/{bvid}",
                "author": owner.get("name") or "视频作者",
                "authorUrl": f"https://space.bilibili.com/{owner.get('mid')}" if owner.get("mid") else "",
                "thumbnail": (video.get("pic") or "").replace("http://", "https://", 1),
                "duration": int(video.get("duration") or 0),
                "view": int(stats.get("view") or 0),
                "like": int(stats.get("like") or 0),
                "summary": description or "B站实时检索到的雷电将军相关影像。",
                "date": iso_date(video.get("pubdate")),
                "tags": ["实时检索", "B站"],
                "retrievedAt": datetime.now(timezone.utc).isoformat(),
            })
        except (requests.RequestException, ValueError, TypeError) as exc:
            print(f"  [WARN] Bilibili {bvid}: {exc}")
    return results


def fetch_bwiki_index() -> list[dict]:
    results = []
    seen_pages = set()
    for query in ("雷电将军", "雷电影"):
        payload = request(
            "https://wiki.biligame.com/ys/api.php",
            params={"action": "query", "list": "search", "srsearch": query, "srlimit": 12, "format": "json"},
        ).json()
        for entry in payload.get("query", {}).get("search", []):
            page_id = entry.get("pageid")
            if not page_id or page_id in seen_pages:
                continue
            seen_pages.add(page_id)
            title = clean_html(entry.get("title", ""), 100)
            excerpt = clean_html(entry.get("snippet", ""), 420)
            source_url = f"https://wiki.biligame.com/ys/{quote(title, safe='')}"
            results.append({
                "id": stable_id("wiki", str(page_id)),
                "title": title,
                "summary": excerpt or f"BWIKI 中与{query}相关的资料条目。",
                "content": excerpt,
                "source": "原神WIKI_BWIKI",
                "sourceUrl": source_url,
                "sourceNote": "实时检索结果来自玩家维护的 BWIKI，角色数值与版本机制请以游戏内公告为准。",
                "category": "实时索引",
                "date": str(entry.get("timestamp", ""))[:10],
                "retrievedAt": datetime.now(timezone.utc).isoformat(),
            })
    return results[:18]


def fetch_news_index() -> list[dict]:
    feed = feedparser.parse(request(
        "https://news.google.com/rss/search",
        params={
            "q": "(雷电将军 OR 雷电影 OR 一心净土) (原神 OR 米哈游) when:30d",
            "hl": "zh-CN",
            "gl": "CN",
            "ceid": "CN:zh-Hans",
        },
    ).content)
    results = []
    for entry in feed.entries:
        publisher = (entry.get("source") or {}).get("title", "").strip() or "Google 新闻收录媒体"
        title = clean_html(entry.get("title", ""), 140)
        suffix = f" - {publisher}"
        if title.endswith(suffix):
            title = title[:-len(suffix)].strip()
        summary = clean_html(entry.get("summary", ""), 300)
        if not any(term in f"{title} {summary}" for term in TARGET_TERMS):
            continue
        published = entry.get("published_parsed")
        published_at = datetime(*published[:6], tzinfo=timezone.utc) if published else None
        source_url = entry.get("link", "")
        results.append({
            "id": stable_id("news", source_url or title),
            "title": title,
            "summary": summary if title not in summary else f"来自{publisher}的雷电将军相关资讯，点击来源链接核对全文。",
            "date": published_at.strftime("%Y-%m-%d") if published_at else "",
            "publishedAt": published_at.isoformat() if published_at else "",
            "tag": "实时资讯",
            "url": source_url,
            "source": publisher,
            "sourceUrl": source_url,
            "sourceNote": "由 Google 新闻 RSS 检索并保留原发布媒体名称，点击可核对原文。",
            "retrievedAt": datetime.now(timezone.utc).isoformat(),
        })
    return results[:18]


def normalize_curated_sources(data: dict) -> None:
    for item in [*(data.get("gallery") or []), *(data.get("related") or [])]:
        bvid = item.get("url", "")
        item.setdefault("source", f"哔哩哔哩 · {item.get('author') or '视频作者'}")
        item.setdefault("sourceUrl", f"https://www.bilibili.com/video/{bvid}" if bvid else "")
    character = data.setdefault("character", {})
    character.setdefault("sources", [
        {
            "name": "原神官方角色PV「噩梦」",
            "url": "https://www.bilibili.com/video/BV1Y3411B7SX",
        },
        {
            "name": "原神WIKI_BWIKI · 雷电将军",
            "url": "https://wiki.biligame.com/ys/%E9%9B%B7%E7%94%B5%E5%B0%86%E5%86%9B",
        },
    ])


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    with INDEX_PATH.open(encoding="utf-8") as handle:
        data = json.load(handle)

    normalize_curated_sources(data)
    print("[FETCH] Bilibili video index")
    curated_bvids = [
        item.get("url", "")
        for item in [*(data.get("gallery") or []), *(data.get("related") or [])]
        if item.get("platform") == "bilibili"
    ]
    gallery = fetch_bilibili_index(curated_bvids)
    print(f"  -> {len(gallery)} items")
    print("[FETCH] Genshin BWIKI")
    wiki = fetch_bwiki_index()
    print(f"  -> {len(wiki)} items")
    print("[FETCH] Chinese news")
    news = fetch_news_index()
    print(f"  -> {len(news)} items")

    generated_at = datetime.now(timezone.utc).isoformat()
    data["liveSearch"] = {
        "generatedAt": generated_at,
        "updateIntervalHours": 6,
        "gallery": gallery,
        "wiki": wiki,
        "news": news,
        "sources": [
            {"name": "Bing Web RSS", "url": "https://www.bing.com/search", "use": "发现 B站影像"},
            {"name": "哔哩哔哩公开 View API", "url": "https://api.bilibili.com/x/web-interface/view", "use": "核验视频元数据"},
            {"name": "原神WIKI_BWIKI", "url": "https://wiki.biligame.com/ys/", "use": "攻略与角色资料"},
            {"name": "Google 新闻 RSS", "url": "https://news.google.com/", "use": "中文资讯索引"},
        ],
    }

    if args.dry_run:
        print(json.dumps({
            "generatedAt": generated_at,
            "gallery": len(gallery),
            "wiki": len(wiki),
            "news": len(news),
        }, ensure_ascii=False, indent=2))
        return 0

    with INDEX_PATH.open("w", encoding="utf-8", newline="\n") as handle:
        json.dump(data, handle, ensure_ascii=False, indent=2)
        handle.write("\n")
    print(f"[OK] Updated {INDEX_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
