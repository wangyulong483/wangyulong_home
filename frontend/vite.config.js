import { fileURLToPath, URL } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

// 用 CommonJS require 加载全部配置依赖，
// 避免本沙盒环境下 bundler 加载 ESM 依赖时的路径解析问题
const { defineConfig } = require('vite')
const vue = require('@vitejs/plugin-vue')
const vueDevTools = require('vite-plugin-vue-devtools')

// https://vite.dev/config/
export default defineConfig({
  base: '/', // Cloudflare Pages 根路径部署
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // 开发时代理 /api 到 FastAPI 后端
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
