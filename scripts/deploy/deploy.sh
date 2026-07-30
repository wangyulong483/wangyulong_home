#!/bin/bash
# ==========================================
#  部署脚本 — 构建并发布到 Cloudflare Pages
#  用法: npm run deploy -- "提交信息"
# ==========================================
set -e

MSG="${1:-deploy: 更新网站}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$PROJECT_ROOT"

echo "📦 构建项目..."
npm --prefix frontend run build

echo "📤 提交并推送..."
git add -A
git commit -m "$MSG" || echo "⚠️  没有新改动"
git push origin main

echo "☁️  部署到 Cloudflare Pages..."
npx wrangler pages deploy frontend/dist --project-name=wangyulong-home --branch=main

echo ""
echo "✅ 部署完成！"
echo "🔗 https://wangyulong-home.pages.dev"
