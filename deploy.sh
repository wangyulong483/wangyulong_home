#!/bin/bash
# ==========================================
#  部署脚本 — 构建并发布到 Cloudflare Pages
#  用法: bash deploy.sh "提交信息"
# ==========================================
set -e

MSG="${1:-deploy: 更新网站}"

echo "📦 构建项目..."
npm run build

echo "📤 提交并推送..."
git add -A
git commit -m "$MSG" || echo "⚠️  没有新改动"
git push origin main

echo "☁️  部署到 Cloudflare Pages..."
npx wrangler pages deploy dist --project-name=wangyulong-home --branch=main

echo ""
echo "✅ 部署完成！"
echo "🔗 https://wangyulong-home.pages.dev"
