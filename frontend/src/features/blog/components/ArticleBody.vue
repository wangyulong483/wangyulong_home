<template>
  <!--
    ArticleBody — 文章正文阅读区
    左侧目录（桌面 sticky）+ 右侧"纸面"正文；正文 HTML 由 articleMarkdown.js 渲染后传入。
  -->
  <div class="reader">
    <aside v-if="toc.length" class="toc" aria-label="文章目录">
      <p class="toc-head"><span aria-hidden="true"></span>目录 / CONTENTS</p>

      <ol class="toc-list">
        <li v-for="(item, index) in toc" :key="item.id">
          <button type="button" class="toc-link" @click="jump(item.id)">
            <span class="toc-no">{{ String(index + 1).padStart(2, '0') }}</span>
            <span class="toc-text">{{ item.text }}</span>
          </button>
        </li>
      </ol>

      <p class="toc-note">正文由 Markdown 渲染</p>
    </aside>

    <article class="paper">
      <div class="paper-inner prose" v-html="html"></div>

      <footer class="paper-foot" aria-hidden="true">
        <span>END OF NOTE</span>
        <span>WYL / JOURNAL</span>
      </footer>
    </article>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  // 渲染好的正文 HTML
  html: { type: String, default: '' },
  // 二级标题目录：[{ id, text }]
  toc: { type: Array, default: () => [] },
})

// 点目录跳到对应小节（平滑滚动，交给浏览器）
function jump(id) {
  const target = document.getElementById(id)
  if (!target) return
  target.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<style scoped>
.reader {
  display: grid;
  grid-template-columns: 196px minmax(0, 1fr);
  align-items: start;
  gap: 24px;
  margin-top: clamp(24px, 4vw, 40px);
}

/* ---------- 目录 ---------- */
.toc {
  position: sticky;
  top: 28px;
  padding: 16px 14px 14px;
  border: 1px solid var(--border);
  border-left: 2px solid var(--red);
  background: rgba(19, 19, 24, 0.72);
}

.toc-head {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0 0 14px;
  color: var(--gold);
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.12em;
}

.toc-head span {
  width: 14px;
  height: 1px;
  background: currentColor;
}

.toc-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.toc-list li + li {
  margin-top: 2px;
}

.toc-link {
  display: flex;
  align-items: baseline;
  gap: 8px;
  width: 100%;
  padding: 7px 4px;
  border: 0;
  background: none;
  color: var(--text-secondary);
  font-family: inherit;
  font-size: 12.5px;
  line-height: 1.5;
  text-align: left;
  cursor: pointer;
  transition: color 0.2s var(--ease-out), background 0.2s var(--ease-out);
}

.toc-link:hover,
.toc-link:focus-visible {
  background: rgba(182, 156, 255, 0.08);
  color: var(--text-primary);
  outline: none;
}

.toc-no {
  flex: 0 0 auto;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.08em;
}

.toc-link:hover .toc-no,
.toc-link:focus-visible .toc-no {
  color: var(--red);
}

.toc-note {
  margin: 14px 0 0;
  padding-top: 10px;
  border-top: 1px solid var(--border);
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.06em;
}

/* ---------- 纸面 ---------- */
.paper {
  position: relative;
  padding: clamp(24px, 3.4vw, 46px) clamp(20px, 3.6vw, 52px) 0;
  border: 1px solid rgba(20, 20, 24, 0.16);
  background: #f2eee3;
  box-shadow: 7px 7px 0 rgba(6, 3, 14, 0.55);
  color: #1b1720;
}

/* 左上角红色标记，和全站档案画框保持同一套语言 */
.paper::before {
  position: absolute;
  top: 0;
  left: 0;
  width: 74px;
  height: 3px;
  content: '';
  background: var(--red);
}

.paper-inner {
  max-width: 720px;
}

.paper-foot {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-top: clamp(28px, 4vw, 46px);
  padding: 12px 0 14px;
  border-top: 1px solid rgba(20, 20, 24, 0.16);
  color: #6f6759;
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.12em;
}

/* ---------- 正文排版（作用在 v-html 内容上，必须用 :deep） ---------- */
.prose {
  font-size: 15.5px;
  line-height: 1.95;
  letter-spacing: 0.005em;
}

.prose :deep(> *:first-child) {
  margin-top: 0;
}

.prose :deep(p) {
  margin: 0 0 16px;
}

.prose :deep(h2) {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 38px 0 18px;
  padding-top: 18px;
  border-top: 1px solid rgba(20, 20, 24, 0.18);
  color: #14111a;
  font-family: var(--font-display);
  font-size: clamp(20px, 2.2vw, 24px);
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: 0.01em;
  scroll-margin-top: 24px;
}

.prose :deep(h2::before) {
  flex: 0 0 auto;
  width: 7px;
  height: 19px;
  content: '';
  background: #c8102e;
}

.prose :deep(h3) {
  margin: 28px 0 12px;
  color: #14111a;
  font-family: var(--font-display);
  font-size: 16.5px;
  font-weight: 700;
  letter-spacing: 0.02em;
  scroll-margin-top: 24px;
}

.prose :deep(h3::before) {
  margin-right: 8px;
  color: #c8102e;
  content: '//';
  font-family: var(--font-mono);
  font-size: 12px;
}

/* 图注：原文用斜体段落写成 */
.prose :deep(em) {
  display: block;
  margin: 10px 0 22px;
  color: #6f6759;
  font-size: 12.5px;
  font-style: normal;
  line-height: 1.8;
  text-align: center;
  text-wrap: pretty;
}

.prose :deep(img) {
  display: block;
  width: 100%;
  max-width: 100%;
  height: auto;
  margin: 20px auto 4px;
  background: #fff;
}

.prose :deep(ul),
.prose :deep(ol) {
  margin: 0 0 18px;
  padding-left: 20px;
}

.prose :deep(li) {
  margin-bottom: 8px;
  padding-left: 2px;
}

.prose :deep(ul li)::marker {
  color: #c8102e;
  content: '▪ ';
}

.prose :deep(strong) {
  color: #14111a;
  font-weight: 700;
}

.prose :deep(a) {
  color: #9d0f20;
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-thickness: 1px;
}

.prose :deep(a:hover) {
  color: #c8102e;
}

/* 行内代码 */
.prose :deep(p code),
.prose :deep(li code),
.prose :deep(td code) {
  padding: 1px 5px;
  border: 1px solid rgba(20, 20, 24, 0.2);
  background: rgba(20, 20, 24, 0.055);
  color: #2b2438;
  font-family: var(--font-mono);
  font-size: 12.5px;
}

/* 表格 */
.prose :deep(table) {
  width: 100%;
  margin: 18px 0 22px;
  border-collapse: collapse;
  font-size: 13.5px;
  line-height: 1.7;
}

.prose :deep(th),
.prose :deep(td) {
  padding: 8px 10px;
  border: 1px solid rgba(20, 20, 24, 0.28);
  text-align: left;
  vertical-align: top;
}

.prose :deep(th) {
  background: rgba(20, 20, 24, 0.06);
  color: #14111a;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.08em;
}

/* 代码块：外层卡片 + 语言标签，内层交给 hljs 类名配色 */
.prose :deep(.code-card) {
  position: relative;
  margin: 20px 0 22px;
  border: 1px solid rgba(20, 20, 24, 0.2);
  background: #fbfaf6;
}

.prose :deep(.code-lang) {
  position: absolute;
  top: 0;
  right: 0;
  padding: 3px 9px;
  border-bottom: 1px solid rgba(20, 20, 24, 0.16);
  border-left: 1px solid rgba(20, 20, 24, 0.16);
  background: rgba(20, 20, 24, 0.05);
  color: #6f6759;
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.prose :deep(pre) {
  margin: 0;
  padding: 26px 16px 16px;
  overflow-x: auto;
  font-size: 12.5px;
  line-height: 1.72;
}

.prose :deep(pre code) {
  color: #23202b;
  font-family: var(--font-mono);
  font-size: 12.5px;
  line-height: 1.75;
  tab-size: 4;
}

/* hljs 配色：与纸面同一套墨色 / 红 / 暗金 */
.prose :deep(.hljs-comment),
.prose :deep(.hljs-quote) {
  color: #8a8272;
  font-style: italic;
}

.prose :deep(.hljs-keyword),
.prose :deep(.hljs-selector-tag),
.prose :deep(.hljs-literal) {
  color: #a3122a;
  font-weight: 600;
}

.prose :deep(.hljs-string),
.prose :deep(.hljs-doctag),
.prose :deep(.hljs-regexp) {
  color: #7a5a1c;
}

.prose :deep(.hljs-number),
.prose :deep(.hljs-built_in),
.prose :deep(.hljs-symbol) {
  color: #1f5c86;
}

.prose :deep(.hljs-title),
.prose :deep(.hljs-function .hljs-title),
.prose :deep(.hljs-section) {
  color: #4b2d86;
  font-weight: 600;
}

.prose :deep(.hljs-params),
.prose :deep(.hljs-variable),
.prose :deep(.hljs-attr) {
  color: #23202b;
}

/* 分屏与窄屏：目录从左侧栏退回正文上方 */
@media (max-width: 1080px) {
  .reader {
    display: block;
  }

  .toc {
    position: static;
    margin-bottom: 16px;
  }

  .toc-list {
    display: flex;
    flex-wrap: wrap;
    gap: 2px 10px;
  }

  .toc-list li {
    margin: 0;
  }

  .toc-list li + li {
    margin-top: 0;
  }

  .toc-link {
    width: auto;
    padding: 5px 2px;
  }

  .toc-note {
    display: none;
  }
}

@media (max-width: 768px) {
  .paper {
    box-shadow: 5px 5px 0 rgba(6, 3, 14, 0.5);
  }

  .prose {
    font-size: 15px;
  }

  .prose :deep(h2) {
    margin: 30px 0 14px;
  }

  .prose :deep(pre) {
    padding: 24px 12px 12px;
  }

  .prose :deep(pre code) {
    font-size: 11.5px;
  }

  .prose :deep(th),
  .prose :deep(td) {
    padding: 6px 8px;
    font-size: 12.5px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .toc-link {
    transition: none;
  }
}
</style>
