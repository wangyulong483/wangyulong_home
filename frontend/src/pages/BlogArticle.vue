<template>
  <!--
    BlogArticle — 单篇文章页（路由 /blog/:slug）
    正文不在组件里，而是从 public/writer_works/ 取 Markdown 渲染，
    这样写作时只要改 Markdown 文件，页面自动跟上。
  -->
  <div class="article-page">
    <header class="article-head">
      <nav class="article-crumb" aria-label="面包屑">
        <router-link to="/blog" class="crumb-back">← 全部文章</router-link>
        <span class="crumb-sep" aria-hidden="true">/</span>
        <span class="crumb-now">JOURNAL / {{ indexLabel }}</span>
      </nav>

      <template v-if="article">
        <p class="article-kicker"><span aria-hidden="true"></span> PERSONAL NOTES / 复习笔记</p>
        <h1 class="article-title">{{ article.title }}</h1>
        <p class="article-sub">{{ article.subtitle }}</p>

        <ul class="article-meta">
          <li>{{ article.date }}</li>
          <li>{{ article.readMinutes }} MIN READ</li>
          <li v-for="tag in article.tags" :key="tag" class="meta-tag">{{ tag }}</li>
        </ul>
      </template>

      <template v-else>
        <h1 class="article-title">文章不存在</h1>
      </template>
    </header>

    <p v-if="state === 'loading'" class="article-state">正在载入正文…</p>

    <div v-else-if="state === 'error'" class="article-state">
      <p>正文载入失败：{{ errorText }}</p>
      <button type="button" class="state-retry" @click="load">重新载入</button>
    </div>

    <p v-else-if="state === 'missing'" class="article-state">
      没有找到这篇笔记。<router-link to="/blog" class="state-link">回到文章列表</router-link>
    </p>

    <ArticleBody v-else :html="html" :toc="toc" />

    <footer class="article-foot">
      <router-link to="/blog" class="foot-back">← 全部文章</router-link>

      <div class="foot-links">
        <router-link
          v-if="links.prev"
          :to="{ name: 'BlogArticle', params: { slug: links.prev.slug } }"
          class="foot-link"
        >
          <span>上一篇</span>{{ links.prev.title }}
        </router-link>

        <router-link
          v-if="links.next"
          :to="{ name: 'BlogArticle', params: { slug: links.next.slug } }"
          class="foot-link"
        >
          <span>下一篇</span>{{ links.next.title }}
        </router-link>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import ArticleBody from '@/features/blog/components/ArticleBody.vue'
import { articles, findArticle, neighboursOf } from '@/features/blog/data/articles.js'
import { renderArticle } from '@/features/blog/lib/articleMarkdown.js'

const route = useRoute()

const html = ref('')
const toc = ref([])
const state = ref('loading')
const errorText = ref('')

// 当前文章（清单里的一条）
const article = computed(() => findArticle(route.params.slug))

// 当前是第几篇：用于页眉的 01 / 02 编号
const indexLabel = computed(() => {
  const index = articles.findIndex((item) => item.slug === route.params.slug)
  return index < 0 ? '--' : String(index + 1).padStart(2, '0')
})

const links = computed(() => neighboursOf(route.params.slug))

// 取正文 → 渲染 → 写入标题
async function load() {
  const post = article.value
  if (!post) {
    state.value = 'missing'
    return
  }

  state.value = 'loading'
  errorText.value = ''

  try {
    const response = await fetch(post.file, { cache: 'no-cache' })
    if (!response.ok) throw new Error('HTTP ' + response.status)

    const markdown = await response.text()
    // Cloudflare Pages 的 SPA 兜底会把未知路径返回成 index.html，
    // 这里先认一下，免得把整页 HTML 当正文渲染
    if (/^\s*<!doctype html/i.test(markdown) || /^\s*<html/i.test(markdown)) {
      throw new Error('正文地址被 SPA 兜底接管')
    }

    const result = renderArticle(markdown, { baseDir: post.baseDir })
    html.value = result.html
    toc.value = result.toc
    state.value = 'ready'
    document.title = post.title + ' · 个人博客'
  } catch (error) {
    errorText.value = error?.message || '未知错误'
    state.value = 'error'
  }
}

onMounted(load)
watch(() => route.params.slug, load)
onUnmounted(() => {
  document.title = '个人博客'
})
</script>

<style scoped>
.article-page {
  width: min(100%, 1080px);
  margin: 0 auto;
  padding: clamp(14px, 2.4vw, 30px) 0 56px;
}

/* ---------- 页眉 ---------- */
.article-head {
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border);
}

.article-crumb {
  display: flex;
  align-items: center;
  gap: 9px;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.1em;
}

.crumb-back {
  color: var(--text-secondary);
  transition: color 0.2s var(--ease-out);
}

.crumb-back:hover,
.crumb-back:focus-visible {
  color: var(--gold-bright);
  outline: none;
}

.crumb-sep {
  color: var(--text-tertiary);
}

.crumb-now {
  color: var(--red);
}

.article-kicker {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 22px 0 0;
  color: var(--gold);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.16em;
}

.article-kicker span {
  width: 9px;
  height: 9px;
  background: var(--red);
}

.article-title {
  margin: 14px 0 0;
  color: var(--text-primary);
  font-family: var(--font-display);
  font-size: clamp(30px, 4.4vw, 46px);
  font-weight: 800;
  line-height: 1.12;
  letter-spacing: -0.005em;
  text-wrap: balance;
}

.article-sub {
  margin: 12px 0 0;
  color: var(--text-secondary);
  font-family: var(--font-serif);
  font-size: clamp(13px, 1.4vw, 15px);
  letter-spacing: 0.14em;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 20px;
  margin: 18px 0 0;
  padding: 0;
  list-style: none;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.1em;
}

.article-meta li:first-child {
  color: var(--text-secondary);
}

.meta-tag {
  padding: 1px 7px;
  border: 1px solid var(--border);
  color: var(--text-secondary);
}

/* ---------- 加载与错误态 ---------- */
.article-state {
  margin: clamp(28px, 5vw, 52px) 0;
  padding: 26px 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.06em;
  line-height: 1.9;
}

.article-state p {
  margin: 0;
}

.state-retry,
.state-link {
  display: inline-block;
  margin-top: 12px;
  padding: 7px 14px;
  border: 1px solid var(--border-hover);
  background: none;
  color: var(--gold-bright);
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: background 0.2s var(--ease-out), color 0.2s var(--ease-out);
}

.state-retry:hover,
.state-retry:focus-visible,
.state-link:hover,
.state-link:focus-visible {
  background: rgba(182, 156, 255, 0.12);
  color: #fff;
  outline: none;
}

/* ---------- 页脚 ---------- */
.article-foot {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 14px 24px;
  margin-top: 26px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

.foot-back {
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.1em;
  transition: color 0.2s var(--ease-out);
}

.foot-back:hover,
.foot-back:focus-visible {
  color: var(--gold-bright);
  outline: none;
}

.foot-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 22px;
}

.foot-link {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  max-width: 340px;
  color: var(--text-primary);
  font-size: 12.5px;
  line-height: 1.5;
  transition: color 0.2s var(--ease-out);
}

.foot-link span {
  flex: 0 0 auto;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.1em;
}

.foot-link:hover,
.foot-link:focus-visible {
  color: var(--gold-bright);
  outline: none;
}

@media (max-width: 768px) {
  .article-title {
    font-size: clamp(26px, 8vw, 34px);
  }

  .article-meta {
    gap: 8px 14px;
  }

  .foot-link {
    max-width: 100%;
    font-size: 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .crumb-back,
  .foot-back,
  .foot-link {
    transition: none;
  }
}
</style>
