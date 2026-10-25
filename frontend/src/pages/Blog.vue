<template>
  <div class="blog-page">
    <header class="blog-head">
      <p class="blog-kicker"><span aria-hidden="true"></span> JOURNAL / 个人博客文章</p>

      <div class="blog-head-row">
        <div class="blog-intro">
          <h1 id="blog-title">个人博客<span aria-hidden="true">.</span></h1>
        </div>

        <a
          class="gh-link"
          href="https://github.com/wangyulong483"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub 账号：wangyulong483"
          title="GitHub · wangyulong483"
        >
          <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path
              fill="currentColor"
              d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"
            />
          </svg>
          <span>GITHUB</span>
        </a>
      </div>

      <div class="blog-meta" aria-hidden="true">
        <span>NO. 00</span>
        <span>EST. 2026</span>
        <span>CN / WYL</span>
      </div>
    </header>

    <!-- 有文章：按清单列出，点进去看正文 -->
    <section v-if="articles.length" class="blog-list" aria-labelledby="blog-list-title">
      <div class="list-head">
        <h2 id="blog-list-title" class="list-title">文章清单</h2>
        <span class="list-count">{{ pad(articles.length) }} NOTES</span>
      </div>

      <ol class="notes">
        <li v-for="(post, index) in articles" :key="post.slug" class="note">
          <router-link class="note-link" :to="{ name: 'BlogArticle', params: { slug: post.slug } }">
            <span class="note-no" aria-hidden="true">{{ pad(index + 1) }}</span>

            <div class="note-body">
              <div class="note-tags">
                <span v-for="tag in post.tags" :key="tag" class="note-tag">{{ tag }}</span>
              </div>

              <h3 class="note-title">{{ post.title }}</h3>
              <p class="note-summary">{{ post.summary }}</p>

              <div class="note-meta">
                <span>{{ post.date }}</span>
                <i aria-hidden="true"></i>
                <span>{{ post.readMinutes }} MIN READ</span>
              </div>
            </div>

            <figure v-if="post.figure" class="note-figure">
              <img :src="post.figure" alt="" loading="lazy" decoding="async" />
            </figure>
          </router-link>
        </li>
      </ol>
    </section>

    <!-- 没有文章时的空态，保留原来的档案框 -->
    <section v-else class="blog-empty" aria-labelledby="blog-empty-title">
      <p class="empty-index" aria-hidden="true">00</p>

      <div class="empty-copy">
        <p class="empty-label"><span aria-hidden="true"></span> ARCHIVE / EMPTY</p>
        <h2 id="blog-empty-title">还没有文章。</h2>
        <p>具体内容之后再写。这里会留下一段段安静的记录，不急着填满。</p>
      </div>

      <span class="empty-mark" aria-hidden="true">
        <i></i><i></i><i></i>
      </span>
    </section>

    <footer class="blog-foot" aria-hidden="true">
      <span>WYL / JOURNAL</span>
      <span>WRITING IN PROGRESS</span>
    </footer>
  </div>
</template>

<script setup>
// 个人博客文章 — 文章清单页；正文与文章元信息都在 features/blog 里维护
import { onMounted } from 'vue'
import { articles } from '@/features/blog/data/articles.js'

// 序号补零：1 → 01
const pad = (value) => String(value).padStart(2, '0')

onMounted(() => {
  document.title = '个人博客'
})
</script>

<style scoped>
.blog-page {
  width: min(100%, 1080px);
  margin: 0 auto;
  padding: clamp(14px, 2.4vw, 30px) 0 56px;
}

.blog-head {
  position: relative;
  padding-bottom: 30px;
  border-bottom: 1px solid var(--border);
}

.blog-kicker {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  color: var(--gold);
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.16em;
}

.blog-kicker span {
  width: 9px;
  height: 9px;
  background: var(--red);
}

.blog-head-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 32px;
  margin-top: clamp(22px, 4vw, 38px);
}

.blog-intro h1 {
  margin: 0;
  color: var(--text-primary);
  font-family: var(--font-display);
  font-size: clamp(56px, 9vw, 94px);
  font-weight: 800;
  line-height: 0.9;
  letter-spacing: -0.01em;
}

.blog-intro h1 span {
  color: var(--red);
}

.gh-link {
  display: flex;
  flex: 0 0 auto;
  width: 62px;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 14px 0 10px;
  border: 1px solid var(--border);
  color: var(--text-primary);
  text-decoration: none;
  transition: border-color 0.25s var(--ease-out), color 0.25s var(--ease-out), box-shadow 0.25s var(--ease-out), transform 0.25s var(--ease-out);
}

.gh-link svg {
  width: 25px;
  height: 25px;
}

.gh-link span {
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: 8px;
  letter-spacing: 0.1em;
}

.gh-link:hover,
.gh-link:focus-visible {
  border-color: var(--gold);
  color: var(--gold-bright);
  box-shadow: 5px 5px 0 rgba(224, 27, 46, 0.72);
  outline: none;
  transform: translate(-2px, -2px);
}

.gh-link:hover span,
.gh-link:focus-visible span {
  color: var(--gold);
}

.blog-meta {
  display: flex;
  gap: 26px;
  margin-top: 26px;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.1em;
}

.blog-meta span:first-child {
  color: var(--red);
}

.blog-empty {
  position: relative;
  display: grid;
  grid-template-columns: minmax(110px, 0.38fr) minmax(0, 1fr) auto;
  align-items: center;
  gap: clamp(22px, 4vw, 48px);
  min-height: 286px;
  margin-top: clamp(34px, 6vw, 58px);
  padding: clamp(26px, 4.4vw, 48px);
  overflow: hidden;
  border: 1px solid var(--border);
  background:
    linear-gradient(rgba(182, 156, 255, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(182, 156, 255, 0.035) 1px, transparent 1px),
    rgba(19, 19, 24, 0.74);
  background-size: 42px 42px, 42px 42px, 100% 100%;
}

.blog-empty::before {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 3px;
  content: '';
  background: var(--red);
}

.empty-index {
  margin: 0;
  color: transparent;
  font-family: var(--font-display);
  font-size: clamp(96px, 16vw, 176px);
  font-weight: 800;
  line-height: 0.8;
  -webkit-text-stroke: 1px rgba(182, 156, 255, 0.35);
  user-select: none;
}

.empty-label {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 0 0 16px;
  color: var(--gold);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.14em;
}

.empty-label span {
  width: 22px;
  height: 2px;
  background: currentColor;
}

.empty-copy h2 {
  margin: 0;
  color: var(--text-primary);
  font-family: var(--font-serif);
  font-size: clamp(26px, 4vw, 36px);
  font-weight: 500;
  letter-spacing: 0.02em;
}

.empty-copy p:last-child {
  max-width: 430px;
  margin: 16px 0 0;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.9;
}

.empty-mark {
  position: relative;
  display: block;
  width: 70px;
  height: 70px;
  border: 1px solid rgba(216, 178, 90, 0.48);
  border-radius: 50%;
}

.empty-mark i {
  position: absolute;
  display: block;
  background: var(--gold);
}

.empty-mark i:nth-child(1) {
  top: 50%;
  left: -16px;
  width: 32px;
  height: 1px;
}

.empty-mark i:nth-child(2) {
  top: 50%;
  right: -16px;
  width: 32px;
  height: 1px;
}

.empty-mark i:nth-child(3) {
  top: -6px;
  left: 50%;
  width: 1px;
  height: 82px;
  opacity: 0.42;
  transform: translateX(-50%);
}

/* ---------- 文章清单 ---------- */
.blog-list {
  margin-top: clamp(30px, 5vw, 50px);
}

.list-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.list-title {
  margin: 0;
  color: var(--text-secondary);
  font-family: var(--font-serif);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.22em;
}

.list-count {
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.12em;
}

.notes {
  margin: 0;
  padding: 0;
  list-style: none;
}

.note {
  border-bottom: 1px solid var(--border);
}

.note-link {
  position: relative;
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr) 190px;
  align-items: center;
  gap: clamp(16px, 3vw, 32px);
  padding: clamp(20px, 3vw, 30px) 14px;
  color: inherit;
  text-decoration: none;
  transition: background 0.25s var(--ease-out);
}

/* 左侧红色指示条：悬停时从上往下长出来 */
.note-link::before {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 2px;
  content: '';
  background: var(--red);
  transform: scaleY(0);
  transform-origin: top;
  transition: transform 0.3s var(--ease-out);
}

.note-link:hover,
.note-link:focus-visible {
  background: rgba(182, 156, 255, 0.05);
  outline: none;
}

.note-link:hover::before,
.note-link:focus-visible::before {
  transform: scaleY(1);
}

.note-no {
  color: transparent;
  font-family: var(--font-display);
  font-size: clamp(34px, 4vw, 46px);
  font-weight: 800;
  line-height: 1;
  -webkit-text-stroke: 1px rgba(182, 156, 255, 0.4);
  transition: color 0.25s var(--ease-out), -webkit-text-stroke-color 0.25s var(--ease-out);
}

.note-link:hover .note-no,
.note-link:focus-visible .note-no {
  color: var(--red);
  -webkit-text-stroke-color: transparent;
}

.note-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.note-tag {
  padding: 1px 7px;
  border: 1px solid var(--border);
  color: var(--gold);
  font-family: var(--font-mono);
  font-size: 8px;
  letter-spacing: 0.12em;
}

.note-title {
  margin: 0;
  color: var(--text-primary);
  font-family: var(--font-display);
  font-size: clamp(19px, 2.4vw, 26px);
  font-weight: 700;
  line-height: 1.32;
  transition: color 0.2s var(--ease-out);
}

.note-link:hover .note-title,
.note-link:focus-visible .note-title {
  color: var(--gold-bright);
}

.note-summary {
  max-width: 560px;
  margin: 10px 0 0;
  color: var(--text-secondary);
  font-size: 12.5px;
  line-height: 1.85;
  text-wrap: pretty;
}

.note-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 14px;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.1em;
}

.note-meta i {
  width: 14px;
  height: 1px;
  background: currentColor;
}

/* 缩略图：正文是黑白线稿，这里给一张白纸底 */
.note-figure {
  margin: 0;
  overflow: hidden;
  border: 1px solid var(--border);
  background: #fff;
  transition: border-color 0.25s var(--ease-out);
}

.note-figure img {
  display: block;
  width: 100%;
  height: auto;
  transition: transform 0.35s var(--ease-out);
}

.note-link:hover .note-figure,
.note-link:focus-visible .note-figure {
  border-color: var(--gold);
}

.note-link:hover .note-figure img,
.note-link:focus-visible .note-figure img {
  transform: scale(1.035);
}

.blog-foot {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-top: 22px;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.12em;
}

@media (max-width: 720px) {
  .blog-head-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }

  .blog-intro h1 {
    font-size: clamp(46px, 15vw, 64px);
  }

  .gh-link {
    width: auto;
    flex-direction: row;
    gap: 10px;
    padding: 10px 14px;
  }

  .gh-link svg {
    width: 20px;
    height: 20px;
  }

  .blog-empty {
    grid-template-columns: minmax(64px, 0.30fr) minmax(0, 1fr);
    gap: 18px;
    min-height: 250px;
    padding: 24px 20px 24px 18px;
  }

  .empty-index {
    font-size: clamp(72px, 21vw, 108px);
  }

  .empty-mark {
    display: none;
  }

  .empty-copy h2 {
    font-size: 26px;
  }

  .empty-copy p:last-child {
    margin-top: 12px;
    font-size: 12px;
  }

  .note-link {
    grid-template-columns: 40px minmax(0, 1fr);
    gap: 14px;
    padding: 22px 10px;
  }

  .note-no {
    font-size: 30px;
  }

  .note-figure {
    display: none;
  }

  .note-title {
    font-size: 19px;
  }

  .note-summary {
    font-size: 12px;
  }

  .blog-foot span:last-child {
    display: none;
  }
}

@media (max-width: 900px) {
  .note-link {
    grid-template-columns: 46px minmax(0, 1fr);
  }

  .note-figure {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .gh-link,
  .note-link,
  .note-link::before,
  .note-no,
  .note-title,
  .note-figure,
  .note-figure img {
    transition: none;
  }
}
</style>
