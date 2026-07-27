/**
 * Cloudflare Pages _worker.js
 * 所有请求交由静态资源处理器
 * AI 对话已迁移至 FastAPI 后端（通过 Cloudflare Tunnel 暴露）
 */
export default {
  async fetch(request, env) {
    // 全部请求 → 静态资源（前端 SPA）
    return env.ASSETS.fetch(request)
  },
}
