"""
行业热点抓取脚本 —— 每日自动搜集机器人、ROS2、传感器、AI 行业动态

数据源（一期 10 个）：
  1. Open Robotics Discourse — ROS 2 社区最新讨论
  2. IEEE Spectrum Robotics — 机器人综合资讯
  3. The Robot Report — 机器人产业新闻
  4. arXiv CS.RO — 机器人学最新论文
  5. GitHub Trending Python — 热门开源项目（爬虫）
  6. 机器之心 — 中国 AI/机器人
  7. ROS 2 Discord 替代源 — ROS 官方新闻
  8. ScienceDaily Robotics — 机器人科研新闻
  9. TechCrunch Robotics — 科技创投
  10. Reddit r/robotics — 社区热门讨论

用法：
  python scripts/fetch_topics.py                     # 生成今天的热点
  python scripts/fetch_topics.py --date 2026-07-10   # 生成指定日期的热点
  python scripts/fetch_topics.py --dry-run           # 仅打印，不写文件

输出：
  frontend/public/data/hot-topics.json     ← 今天的热点
  frontend/public/data/archive/            ← 按日期归档
"""
import argparse
import hashlib
import json
import os
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from difflib import SequenceMatcher

import feedparser
import requests
from bs4 import BeautifulSoup

# ============================================================
# 配置
# ============================================================

# 项目根目录（脚本在 scripts/ 下）
PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "frontend" / "public" / "data"
ARCHIVE_DIR = DATA_DIR / "archive"

# 请求超时（秒）
TIMEOUT = 20

# 标题去重相似度阈值（0~1，超过此值视为重复）
DEDUP_THRESHOLD = 0.75

# ============================================================
# RSS 源定义
# ============================================================

RSS_SOURCES = [
    {
        "name": "ROS Discourse",
        "url": "https://discourse.openrobotics.org/posts.rss",
        "category": "ros2",
        "icon": "ros",
        "lang": "en",
    },
    {
        "name": "IEEE Spectrum Robotics",
        "url": "https://spectrum.ieee.org/feeds/topic/robotics/rss.xml",
        "category": "robot",
        "icon": "ieee",
        "lang": "en",
    },
    {
        "name": "The Robot Report",
        "url": "https://www.therobotreport.com/feed/",
        "category": "robot",
        "icon": "robot-report",
        "lang": "en",
    },
    {
        "name": "arXiv CS.RO",
        "url": "https://rss.arxiv.org/rss/cs.RO",
        "category": "ai",
        "icon": "arxiv",
        "lang": "en",
    },
    {
        "name": "ScienceDaily Robotics",
        "url": "https://www.sciencedaily.com/rss/computers_math/robotics.xml",
        "category": "robot",
        "icon": "science",
        "lang": "en",
    },
    {
        "name": "机器之心",
        "url": "https://www.jiqizhixin.com/rss",
        "category": "ai",
        "icon": "jiqizhixin",
        "lang": "zh",
    },
    {
        "name": "Reddit r/robotics",
        "url": "https://www.reddit.com/r/robotics/.rss",
        "category": "robot",
        "icon": "reddit",
        "lang": "en",
    },
    {
        "name": "TechCrunch Robotics",
        "url": "https://techcrunch.com/category/robotics/feed/",
        "category": "robot",
        "icon": "techcrunch",
        "lang": "en",
    },
    {
        "name": "ROS 2 GitHub Discussions",
        "url": "https://github.com/ros2/ros2_documentation/discussions.atom",
        "category": "ros2",
        "icon": "github",
        "lang": "en",
    },
    {
        "name": "AWS Robotics Blog",
        "url": "https://aws.amazon.com/blogs/robotics/feed/",
        "category": "robot",
        "icon": "aws",
        "lang": "en",
    },
]

# 分类定义
CATEGORIES = [
    {"key": "ros2",    "label": "ROS2",      "icon": "settings"},
    {"key": "robot",   "label": "机器人",     "icon": "controller"},
    {"key": "lidar",   "label": "激光雷达",   "icon": "compass"},
    {"key": "camera",  "label": "深度相机",   "icon": "camera"},
    {"key": "ai",      "label": "AI",        "icon": "fire"},
    {"key": "sensor",  "label": "传感器",     "icon": "pushpin"},
]

# ============================================================
# 关键词 → 分类映射（用于自动标注 tags）
# ============================================================

KEYWORD_TAG_MAP = {
    "ros2": ["ros2", "ros 2", "ros humble", "ros jazzy", "ros iron", "nav2", "moveit", "gazebo", "rviz",
             "ros2_control", "micro-ros", "rmw", "dds", "colcon", "ament"],
    "lidar": ["lidar", "激光雷达", "point cloud", "点云", "lidar slam", "lio-sam", "velodyne",
              "ouster", "livox", "robosense", "速腾", "hesai", "禾赛"],
    "camera": ["depth camera", "深度相机", "rgb-d", "stereo camera", "双目相机", "realsense",
               "orbbec", "zed", "tof", "结构光", "intel realsense", "kinect"],
    "sensor": ["imu", "tof", "sensor fusion", "传感器融合", "ultrasonic", "超声波", "红外",
               "mems", "encoder", "torque sensor", "力矩传感器", "六维力", "tactile", "触觉"],
    "ai": ["yolo", "detection", "目标检测", "segmentation", "分割", "transformer", "llm", "大模型",
           "reinforcement learning", "强化学习", "sim-to-real", "sim2real", "nerf", "gaussian splatting",
           "embodied ai", "具身智能", "imitation learning", "模仿学习", "slam", "pytorch", "tensorflow"],
}


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


def fetch_rss(source: dict) -> list[dict]:
    """抓取单个 RSS 源，返回条目列表"""
    items = []
    try:
        resp = requests.get(source["url"], timeout=TIMEOUT, headers={
            "User-Agent": "Mozilla/5.0 (compatible; HotTopicsBot/1.0; +https://github.com/wangyulong483)"
        })
        resp.raise_for_status()
        feed = feedparser.parse(resp.content)

        for entry in feed.entries[:15]:  # 每个源最多取 15 条
            title = entry.get("title", "").strip()
            if not title:
                continue

            # 提取摘要
            summary = ""
            if hasattr(entry, "summary"):
                soup = BeautifulSoup(entry.summary, "lxml")
                summary = soup.get_text(" ", strip=True)[:300]
            elif hasattr(entry, "description"):
                soup = BeautifulSoup(entry.description, "lxml")
                summary = soup.get_text(" ", strip=True)[:300]

            # 提取发布时间
            published = None
            for date_field in ["published_parsed", "updated_parsed"]:
                dt = getattr(entry, date_field, None)
                if dt:
                    published = datetime(*dt[:6], tzinfo=timezone.utc).isoformat()
                    break
            if not published:
                published = datetime.now(timezone.utc).isoformat()

            # 提取 URL
            url = entry.get("link", "")

            # 自动打标签
            auto_tags = classify_by_keywords(title, summary)
            # 合并源默认分类和自动标签
            all_tags = list(set(auto_tags))
            if source["category"] not in all_tags:
                all_tags.insert(0, source["category"])

            # 生成唯一 ID
            raw_id = f"{source['name']}:{title}:{url}"
            item_id = hashlib.md5(raw_id.encode()).hexdigest()[:12]

            items.append({
                "id": item_id,
                "title": title,
                "summary": summary,
                "source": source["name"],
                "sourceIcon": source["icon"],
                "url": url,
                "category": source["category"],
                "tags": all_tags[:5],  # 最多 5 个标签
                "publishedAt": published,
            })

    except requests.RequestException as e:
        print(f"  ⚠️  {source['name']} 请求失败: {e}")
    except Exception as e:
        print(f"  ⚠️  {source['name']} 解析失败: {e}")

    return items


def fetch_github_trending() -> list[dict]:
    """爬取 GitHub Trending Python/robotics 相关项目"""
    items = []
    try:
        # 抓取 Python 语言的 trending（日榜）
        url = "https://github.com/trending/python?since=daily"
        resp = requests.get(url, timeout=TIMEOUT, headers={
            "User-Agent": "Mozilla/5.0 (compatible; HotTopicsBot/1.0)"
        })
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "lxml")

        # 解析 trending 仓库卡片
        articles = soup.select("article.Box-row")
        for article in articles[:10]:
            h2 = article.select_one("h2 a")
            if not h2:
                continue
            # 提取 owner/repo
            href = h2.get("href", "").strip()
            repo_name = href.strip("/")

            # 提取描述
            desc_el = article.select_one("p")
            desc = desc_el.get_text(strip=True) if desc_el else ""

            # 过滤：只保留机器人/传感器/AI 相关项目
            related_keywords = [
                "robot", "ros", "slam", "lidar", "camera", "sensor", "detection",
                "yolo", "segmentation", "tracking", "autonomous", "drone", "perception",
                "point-cloud", "点云", "imu", "gazebo", "rviz", "navigation", "rl",
                "reinforcement", "pytorch", "tensorflow", "transformer", "llm", "gpt",
                "embodied", "具身", "sim-to-real", "深度", "视觉", "机器人",
            ]
            is_related = any(kw in (repo_name + " " + desc).lower() for kw in related_keywords)
            if not is_related:
                continue

            auto_tags = classify_by_keywords(repo_name, desc)
            if "ai" not in auto_tags:
                auto_tags.append("ai")

            raw_id = f"github-trending:{repo_name}"
            item_id = hashlib.md5(raw_id.encode()).hexdigest()[:12]

            items.append({
                "id": item_id,
                "title": f"📦 {repo_name}",
                "summary": desc[:300],
                "source": "GitHub Trending",
                "sourceIcon": "github",
                "url": f"https://github.com/{repo_name}",
                "category": "ai",
                "tags": auto_tags[:5],
                "publishedAt": datetime.now(timezone.utc).isoformat(),
            })

        print(f"  ✅ GitHub Trending: {len(items)} 条相关项目")
    except Exception as e:
        print(f"  ⚠️  GitHub Trending 抓取失败: {e}")

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


def main():
    parser = argparse.ArgumentParser(description="行业热点抓取脚本")
    parser.add_argument("--date", help="指定日期 (YYYY-MM-DD)，默认今天")
    parser.add_argument("--dry-run", action="store_true", help="仅打印，不写文件")
    args = parser.parse_args()

    # 确定目标日期
    if args.date:
        target_date = args.date
    else:
        target_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    print(f"\n{'='*60}")
    print(f"🏭 行业热点抓取 — {target_date}")
    print(f"{'='*60}\n")

    # ============================================================
    # 1. 抓取所有 RSS 源
    # ============================================================
    all_items = []

    for source in RSS_SOURCES:
        print(f"📡 抓取 {source['name']}...")
        items = fetch_rss(source)
        print(f"   → {len(items)} 条")
        all_items.extend(items)

    # ============================================================
    # 2. 抓取 GitHub Trending
    # ============================================================
    print(f"\n📡 抓取 GitHub Trending...")
    gh_items = fetch_github_trending()
    all_items.extend(gh_items)

    # ============================================================
    # 3. 去重
    # ============================================================
    print(f"\n🔄 去重前: {len(all_items)} 条")
    all_items = deduplicate(all_items)
    print(f"🔄 去重后: {len(all_items)} 条")

    # ============================================================
    # 4. 按发布时间排序（最新在前）
    # ============================================================
    all_items.sort(key=lambda x: x.get("publishedAt", ""), reverse=True)

    # ============================================================
    # 5. 构建输出 JSON
    # ============================================================
    output = {
        "date": target_date,
        "items": all_items,
        "categories": CATEGORIES,
        "total": len(all_items),
        "generatedAt": datetime.now(timezone.utc).isoformat(),
    }

    # ============================================================
    # 6. 输出
    # ============================================================
    if args.dry_run:
        print(f"\n📋 预览（前 10 条）:\n")
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
    print(f"\n✅ 已写入: {today_path}")

    # 写入归档
    archive_path = ARCHIVE_DIR / f"{target_date}.json"
    with open(archive_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    print(f"✅ 已归档: {archive_path}")

    # 更新归档索引
    update_archive_index()

    print(f"\n🎉 完成！共收录 {len(all_items)} 条热点")


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
