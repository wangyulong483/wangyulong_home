"""
行业热点抓取脚本 —— 每 12 小时搜集合肥、国内及国际机器人与 AI 行业动态

来源按用户求职地域排序：合肥/安徽产业、国内中文技术资讯、国际一手技术源。
中文聚合查询会保留实际发布媒体名称，国际英文内容只作为补充。

用法：
  python scripts/fetch_topics.py                     # 生成今天的热点
  python scripts/fetch_topics.py --date 2026-07-10   # 生成指定日期的热点
  python scripts/fetch_topics.py --dry-run           # 仅打印，不写文件

输出：
  frontend/public/topics-data/hot-topics.json    -- 今天的热点
  frontend/public/topics-data/archive/           -- 按日期归档
"""
import argparse
import hashlib
import json
import os
import re
import sys
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path
from difflib import SequenceMatcher
from zoneinfo import ZoneInfo

import feedparser
import requests
from bs4 import BeautifulSoup

# ============================================================
# 配置
# ============================================================

# 项目根目录（脚本在 scripts/ 下）
PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "frontend" / "public" / "topics-data"
ARCHIVE_DIR = DATA_DIR / "archive"

# 请求超时（秒）
TIMEOUT = 20

# 标题去重相似度阈值（0~1，超过此值视为重复）
DEDUP_THRESHOLD = 0.75

# 只保留最近 48 小时发布的内容，避免旧文章每天重复成为“热点”
MAX_ITEM_AGE_HOURS = 48

# 控制单次输出规模，确保页面保持可扫描性
MAX_ITEMS = 60

# 国内中文内容优先，英文国际内容最多占六分之一。
MAX_GLOBAL_ITEMS = 10
MAX_ITEMS_PER_SOURCE = 5

BLOCKED_TITLE_PATTERNS = [
    re.compile(pattern, re.IGNORECASE)
    for pattern in [
        r"官方网站", r"live\s*直播", r">>>", r"首页\s*>\s*-", r"博彩|下注|送彩金",
        r"怎么选", r"有哪些", r"FAQ", r"赢麻了", r"这波太狠", r"购车|选购|优惠价",
    ]
]

SHANGHAI_TZ = ZoneInfo("Asia/Shanghai")

# ============================================================
# RSS 源定义
# ============================================================

RSS_SOURCES = [
    # ----- 中文聚合源（适合 GitHub Actions，保留原始媒体名称）-----
    {
        "name": "合肥产业动态",
        "url": "https://news.google.com/rss/search",
        "params": {
            "q": "(合肥 OR 安徽) (机器人 OR 人工智能 OR 传感器 OR 自动驾驶 OR 低空经济) when:2d",
            "hl": "zh-CN",
            "gl": "CN",
            "ceid": "CN:zh-Hans",
        },
        "category": "robot",
        "icon": "location",
        "lang": "zh",
        "scope": "hefei",
        "aggregator": True,
        "require_keywords": True,
        "require_terms": [
            "合肥", "安徽", "芜湖", "蚌埠", "淮南", "马鞍山", "淮北", "铜陵",
            "安庆", "黄山", "滁州", "阜阳", "宿州", "六安", "亳州", "池州", "宣城",
        ],
    },
    {
        "name": "国内机器人产业",
        "url": "https://news.google.com/rss/search",
        "params": {
            "q": "中国 (机器人 OR 具身智能 OR 人形机器人 OR 工业机器人) when:2d",
            "hl": "zh-CN",
            "gl": "CN",
            "ceid": "CN:zh-Hans",
        },
        "category": "robot",
        "icon": "controller",
        "lang": "zh",
        "scope": "china",
        "aggregator": True,
        "require_keywords": True,
    },
    {
        "name": "国内 AI 产业",
        "url": "https://news.google.com/rss/search",
        "params": {
            "q": "中国 (人工智能 OR 大模型 OR 算力 OR 智能制造) when:2d",
            "hl": "zh-CN",
            "gl": "CN",
            "ceid": "CN:zh-Hans",
        },
        "category": "ai",
        "icon": "microchip",
        "lang": "zh",
        "scope": "china",
        "aggregator": True,
        "require_keywords": True,
    },
    {
        "name": "国内机器人技术",
        "url": "https://news.google.com/rss/search",
        "params": {
            "q": "中国 (ROS2 OR 激光雷达 OR SLAM OR 传感器融合 OR 自动驾驶) when:2d",
            "hl": "zh-CN",
            "gl": "CN",
            "ceid": "CN:zh-Hans",
        },
        "category": "sensor",
        "icon": "settings",
        "lang": "zh",
        "scope": "china",
        "aggregator": True,
        "require_keywords": True,
    },
    # ----- 国际源（GitHub Actions 海外 runner 可直接访问）-----
    {
        "name": "ROS Discourse",
        "url": "https://discourse.openrobotics.org/latest.rss",
        "category": "ros2",
        "icon": "ros",
        "lang": "en",
        "scope": "global",
    },
    {
        "name": "IEEE Spectrum Robotics",
        "url": "https://spectrum.ieee.org/feeds/topic/robotics.rss",
        "category": "robot",
        "icon": "ieee",
        "lang": "en",
        "scope": "global",
    },
    {
        "name": "The Robot Report",
        "url": "https://www.therobotreport.com/feed/",
        "category": "robot",
        "icon": "robot-report",
        "lang": "en",
        "scope": "global",
    },
    {
        "name": "arXiv CS.RO",
        "url": "https://rss.arxiv.org/rss/cs.RO",
        "category": "ai",
        "icon": "arxiv",
        "lang": "en",
        "scope": "global",
    },
    {
        "name": "TechCrunch Robotics",
        "url": "https://techcrunch.com/category/robotics/feed/",
        "category": "robot",
        "icon": "techcrunch",
        "lang": "en",
        "scope": "global",
    },
    {
        "name": "MIT Robotics",
        "url": "https://news.mit.edu/topic/mitrobotics-rss.xml",
        "category": "robot",
        "icon": "mit",
        "lang": "en",
        "scope": "global",
    },
    {
        "name": "ScienceDaily Robotics",
        "url": "https://www.sciencedaily.com/rss/computers_math/robotics.xml",
        "category": "robot",
        "icon": "science",
        "lang": "en",
        "scope": "global",
    },
    {
        "name": "Google DeepMind",
        "url": "https://deepmind.google/blog/rss.xml",
        "category": "ai",
        "icon": "deepmind",
        "lang": "en",
        "scope": "global",
        "require_keywords": True,
    },
    # ----- 国内源 -----
    {
        "name": "机器之心",
        "url": "https://www.jiqizhixin.com/rss",
        "category": "ai",
        "icon": "jiqizhixin",
        "lang": "zh",
        "scope": "china",
        "require_keywords": True,
    },
    {
        "name": "量子位",
        "url": "https://www.qbitai.com/feed",
        "category": "ai",
        "icon": "qbitai",
        "lang": "zh",
        "scope": "china",
        "require_keywords": True,
    },
]

# 分类定义
CATEGORIES = [
    {"key": "ros2",    "label": "ROS2",      "icon": "settings"},
    {"key": "robot",   "label": "机器人",     "icon": "controller"},
    {"key": "lidar",   "label": "激光雷达",   "icon": "target"},
    {"key": "camera",  "label": "深度相机",   "icon": "camera"},
    {"key": "ai",      "label": "AI",        "icon": "microchip"},
    {"key": "sensor",  "label": "传感器",     "icon": "connection"},
]

# ============================================================
# 关键词 → 分类映射（用于自动标注 tags）
# ============================================================

KEYWORD_TAG_MAP = {
    "robot": ["robot", "robotics", "机器人", "机器狗", "机械臂", "具身智能", "人形机器人",
              "工业机器人", "移动机器人", "无人机", "自动驾驶", "智能驾驶", "低空经济"],
    "ros2": ["ros2", "ros 2", "ros humble", "ros jazzy", "ros iron", "nav2", "moveit", "gazebo", "rviz",
             "ros2_control", "micro-ros", "rmw", "dds", "colcon", "ament"],
    "lidar": ["lidar", "激光雷达", "point cloud", "点云", "lidar slam", "lio-sam", "velodyne",
              "ouster", "livox", "robosense", "速腾", "hesai", "禾赛"],
    "camera": ["depth camera", "深度相机", "rgb-d", "stereo camera", "双目相机", "realsense",
               "orbbec", "zed", "tof", "结构光", "intel realsense", "kinect"],
    "sensor": ["imu", "tof", "sensor fusion", "传感器融合", "ultrasonic", "超声波", "红外",
               "mems", "encoder", "torque sensor", "力矩传感器", "六维力", "tactile", "触觉"],
    "ai": ["artificial intelligence", "人工智能", "生成式人工智能", "机器学习", "深度学习", "算力",
           "yolo", "detection", "目标检测", "segmentation", "分割", "transformer", "llm", "大模型",
           "reinforcement learning", "强化学习", "sim-to-real", "sim2real", "nerf", "gaussian splatting",
           "embodied ai", "具身智能", "imitation learning", "模仿学习", "slam", "pytorch", "tensorflow"],
}

CATEGORY_PRIORITY = ["ros2", "robot", "lidar", "camera", "sensor", "ai"]


def clean_google_news_title(title: str, publisher: str) -> str:
    """Google 新闻标题通常带有“ - 媒体名”后缀，页面上单独展示来源即可。"""
    suffix = f" - {publisher}" if publisher else ""
    return title[:-len(suffix)].strip() if suffix and title.endswith(suffix) else title


def resolve_category(default_category: str, tags: list[str]) -> str:
    for category in CATEGORY_PRIORITY:
        if category in tags:
            return category
    return default_category


def title_similarity(a: str, b: str) -> float:
    """计算两个标题的相似度（0~1）"""
    a_clean = re.sub(r"[^\w\s]", "", a.lower())
    b_clean = re.sub(r"[^\w\s]", "", b.lower())
    return SequenceMatcher(None, a_clean, b_clean).ratio()


def classify_by_keywords(title: str, summary: str) -> list[str]:
    """根据标题和摘要自动打标签"""
    text = (title + " " + summary).lower()
    tags = set()
    for tag, keywords in KEYWORD_TAG_MAP.items():
        for kw in keywords:
            if kw in text:
                tags.add(tag)
                break
    return sorted(tags)


def fetch_rss(
    source: dict,
    reference_time: datetime | None = None,
) -> list[dict]:
    """抓取单个 RSS 源，返回条目列表"""
    items = []
    url = source["url"]
    reference_time = reference_time or datetime.now(timezone.utc)
    cutoff_time = reference_time - timedelta(hours=MAX_ITEM_AGE_HOURS)
    try:
        resp = requests.get(
            url,
            params=source.get("params"),
            timeout=TIMEOUT,
            headers={
                "User-Agent": "Mozilla/5.0 (compatible; HotTopicsBot/1.0; +https://github.com/wangyulong483)"
            },
        )
        resp.raise_for_status()
        feed = feedparser.parse(resp.content)

        for entry in feed.entries[:15]:  # 每个源最多取 15 条
            publisher = ""
            if source.get("aggregator"):
                publisher = (entry.get("source") or {}).get("title", "").strip()
            title = clean_google_news_title(entry.get("title", "").strip(), publisher)
            if not title:
                continue
            if any(pattern.search(title) for pattern in BLOCKED_TITLE_PATTERNS):
                continue

            # 提取摘要
            summary = ""
            if hasattr(entry, "summary"):
                soup = BeautifulSoup(entry.summary, "lxml")
                summary = soup.get_text(" ", strip=True)[:300]
            elif hasattr(entry, "description"):
                soup = BeautifulSoup(entry.description, "lxml")
                summary = soup.get_text(" ", strip=True)[:300]

            if source.get("aggregator") and (summary == title or title in summary):
                summary = ""

            # 提取发布时间
            published_dt = None
            time_type = "published"
            for date_field in ["published_parsed", "updated_parsed"]:
                dt = getattr(entry, date_field, None)
                if dt:
                    published_dt = datetime(*dt[:6], tzinfo=timezone.utc)
                    break

            # 无日期条目不冒充最新新闻。
            if not published_dt:
                continue

            if published_dt < cutoff_time or published_dt > reference_time + timedelta(hours=2):
                continue

            # 提取 URL
            url = entry.get("link", "")

            # 自动打标签
            auto_tags = classify_by_keywords(title, summary)
            if source.get("require_keywords") and not auto_tags:
                continue
            required_terms = source.get("require_terms") or []
            if required_terms and not any(term in f"{title} {summary}" for term in required_terms):
                continue

            # 合并源默认分类和自动标签
            all_tags = list(set(auto_tags))
            category = resolve_category(source["category"], auto_tags)
            if category not in all_tags:
                all_tags.insert(0, category)

            item_source = publisher or source["name"]

            # 生成唯一 ID
            raw_id = f"{item_source}:{title}:{url}"
            item_id = hashlib.md5(raw_id.encode()).hexdigest()[:12]

            items.append({
                "id": item_id,
                "title": title,
                "summary": summary,
                "source": item_source,
                "sourceFeed": source["name"],
                "sourceIcon": source["icon"],
                "url": url,
                "category": category,
                "tags": all_tags[:5],  # 最多 5 个标签
                "publishedAt": published_dt.isoformat(),
                "timeType": time_type,
                "language": source.get("lang", "en"),
                "scope": source.get("scope", "global"),
            })

    except requests.RequestException as e:
        print(f"  [WARN] {source['name']} 请求失败: {e}")
    except Exception as e:
        print(f"  [WARN] {source['name']} 解析失败: {e}")

    return items


def deduplicate(items: list[dict]) -> list[dict]:
    """去重：移除标题高度相似或 URL 相同的条目"""
    seen_urls = set()
    result = []

    for item in items:
        # URL 去重
        if item["url"] and item["url"] in seen_urls:
            continue
        seen_urls.add(item["url"])

        # 标题相似度去重
        is_dup = False
        for existing in result:
            if title_similarity(item["title"], existing["title"]) > DEDUP_THRESHOLD:
                is_dup = True
                # 保留摘要更长的那个
                if len(item["summary"]) > len(existing["summary"]):
                    existing.update(item)
                break

        if not is_dup:
            result.append(item)

    return result


def limit_items_per_source(items: list[dict], limit: int) -> list[dict]:
    """限制单一媒体占比，避免聚合结果被高频发布站点垄断。"""
    source_counts = {}
    result = []
    for item in items:
        source = item["source"]
        if source_counts.get(source, 0) >= limit:
            continue
        source_counts[source] = source_counts.get(source, 0) + 1
        result.append(item)
    return result


def main():
    parser = argparse.ArgumentParser(description="行业热点抓取脚本")
    parser.add_argument("--date", help="指定日期 (YYYY-MM-DD)，默认今天")
    parser.add_argument("--dry-run", action="store_true", help="仅打印，不写文件")
    args = parser.parse_args()

    now_utc = datetime.now(timezone.utc)

    # 归档日期以网站主要受众时区为准，避免北京时间凌晨仍写入前一天。
    if args.date:
        target_date = args.date
        reference_time = (
            datetime.strptime(args.date, "%Y-%m-%d")
            .replace(tzinfo=SHANGHAI_TZ)
            + timedelta(days=1)
        ).astimezone(timezone.utc)
    else:
        target_date = now_utc.astimezone(SHANGHAI_TZ).strftime("%Y-%m-%d")
        reference_time = now_utc

    print(f"\n{'='*60}")
    print(f"行业热点抓取 — {target_date}")
    print(f"{'='*60}\n")

    # ============================================================
    # 1. 抓取所有 RSS 源
    # ============================================================
    all_items = []
    source_health = []

    for source in RSS_SOURCES:
        print(f"[FETCH] {source['name']}...")
        items = fetch_rss(source, reference_time)
        print(f"   -> {len(items)} 条")
        source_health.append({
            "name": source["name"],
            "count": len(items),
            "status": "ok" if items else "empty",
        })
        all_items.extend(items)

    # ============================================================
    # 2. 去重
    # ============================================================
    print(f"\n[DEDUP] 去重前: {len(all_items)} 条")
    all_items = deduplicate(all_items)
    print(f"[DEDUP] 去重后: {len(all_items)} 条")

    # ============================================================
    # 3. 合肥/国内中文优先，国际英文只保留少量高价值补充。
    # ============================================================
    scope_priority = {"hefei": 2, "china": 1, "global": 0}
    all_items.sort(
        key=lambda x: (scope_priority.get(x.get("scope"), 0), x.get("publishedAt", "")),
        reverse=True,
    )
    all_items = limit_items_per_source(all_items, MAX_ITEMS_PER_SOURCE)
    domestic_items = [item for item in all_items if item.get("scope") != "global"]
    global_items = [item for item in all_items if item.get("scope") == "global"]
    domestic_limit = MAX_ITEMS - MAX_GLOBAL_ITEMS
    selected_items = domestic_items[:domestic_limit]
    selected_items.extend(global_items[:MAX_GLOBAL_ITEMS])
    all_items = selected_items[:MAX_ITEMS]

    # ============================================================
    # 4. 构建输出 JSON
    # ============================================================
    source_count = len({item["source"] for item in all_items})
    output = {
        "date": target_date,
        "items": all_items,
        "categories": CATEGORIES,
        "total": len(all_items),
        "generatedAt": now_utc.isoformat(),
        "freshness": {
            "windowHours": MAX_ITEM_AGE_HOURS,
            "updateIntervalHours": 12,
            "sourceCount": source_count,
            "newestPublishedAt": all_items[0]["publishedAt"] if all_items else None,
            "oldestPublishedAt": all_items[-1]["publishedAt"] if all_items else None,
        },
        "audience": {
            "city": "合肥",
            "country": "中国",
            "language": "zh-CN",
        },
        "sourceHealth": source_health,
    }

    # ============================================================
    # 5. 输出
    # ============================================================
    if args.dry_run:
        print(f"\n[PREVIEW] 预览（前 10 条）:\n")
        for item in all_items[:10]:
            print(f"  [{item['category']}] {item['title']}")
            print(f"    {item['source']} | {item['publishedAt']}")
            print(f"    {item['url']}")
            print()
        print(f"--- 共 {len(all_items)} 条 ---")
        return

    # 确保目录存在
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)

    # 写入今天的热点
    today_path = DATA_DIR / "hot-topics.json"
    with open(today_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    print(f"\n[OK] 已写入: {today_path}")

    # 写入归档
    archive_path = ARCHIVE_DIR / f"{target_date}.json"
    with open(archive_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    print(f"[OK] 已归档: {archive_path}")

    # 更新归档索引
    update_archive_index()

    print(f"\n[DONE] 完成！共收录 {len(all_items)} 条热点")


def update_archive_index():
    """更新归档索引文件（供前端日期选择器使用）"""
    index_path = ARCHIVE_DIR / "index.json"
    dates = []

    if ARCHIVE_DIR.exists():
        for f in sorted(ARCHIVE_DIR.glob("*.json"), reverse=True):
            if f.name == "index.json":
                continue
            date_str = f.stem
            # 读取该日期的条目数
            try:
                with open(f, "r", encoding="utf-8") as fp:
                    data = json.load(fp)
                    total = len(data.get("items", []))
            except Exception:
                total = 0
            dates.append({"date": date_str, "total": total})

    with open(index_path, "w", encoding="utf-8") as f:
        json.dump(dates, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    main()
