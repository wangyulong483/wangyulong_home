<template>
  <div class="blog-page">
    <header class="blog-head">
      <p class="blog-kicker"><span aria-hidden="true"></span> JOURNAL / 个人博客文章</p>

      <div class="blog-head-row">
        <div class="blog-intro">
          <h1 id="blog-title">个人博客<span aria-hidden="true">.</span></h1>
          <p class="blog-lede">记录机器人、代码与日常里值得留下的部分。<br />文章会在这里慢慢长出来。</p>
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

    <section class="blog-empty" aria-labelledby="blog-empty-title">
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
// 个人博客文章 — 内容暂缺，仅保留页面骨架与 GitHub 入口
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

.blog-lede {
  max-width: 470px;
  margin: 20px 0 0;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.95;
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

  .blog-lede {
    max-width: calc(100% - 52px);
    margin-top: 16px;
    font-size: 13px;
  }

  .blog-lede br {
    display: none;
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

  .blog-foot span:last-child {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .gh-link {
    transition: none;
  }
}
</style>
