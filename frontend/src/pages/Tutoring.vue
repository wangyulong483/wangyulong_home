<template>
  <div class="tutoring-page">
    <header class="header tutoring-header">
      <div>
        <router-link class="back-link" to="/applist">
          <AppIcon icon="arrow-left" size="13" /> 应用终端
        </router-link>
        <p class="module-code">MODULE // TUTOR-01</p>
        <h1>家教备课台</h1>
        <p class="subtitle">LESSON FLOW / LIVE DEMO / QUICK CHECK</p>
      </div>
      <div class="header-status">
        <span class="status-dot"></span>
        <span>章节内容已就绪</span>
      </div>
    </header>

    <section class="course-band" aria-labelledby="course-title">
      <div class="course-index">01</div>
      <div class="course-main">
        <div class="course-meta">
          <span>人教版</span>
          <span>2024 秋新版</span>
          <span>七年级上册</span>
          <span>数学</span>
        </div>
        <h2 id="course-title">初一上册数学</h2>
        <p>从数轴、符号与运算层级出发，建立有理数运算的完整规则体系，并用典型例题验证每条结论。</p>
        <div class="chapter-track" aria-label="章节进度">
          <span class="chapter-muted">第 1 章</span>
          <span class="chapter-active">第 2 章 · 有理数的运算</span>
          <span class="chapter-muted">后续章节待建设</span>
        </div>
      </div>
      <div class="course-action">
        <div class="lesson-duration">
          <AppIcon icon="clock" size="17" />
          <strong>30</strong>
          <span>MIN</span>
        </div>
        <router-link class="start-button" to="/tutoring/math-7-1/chapter-2">
          进入章节 <AppIcon icon="arrow-right" size="14" />
        </router-link>
      </div>
    </section>

    <section class="readiness-grid" aria-label="课程准备情况">
      <div>
        <span>01 / VISUAL</span>
        <strong>数轴动态演示</strong>
        <p>把加减法转化为起点、方向与位移。</p>
      </div>
      <div>
        <span>02 / RULE</span>
        <strong>符号规律实验</strong>
        <p>通过同号与异号对比归纳乘除规则。</p>
      </div>
      <div>
        <span>03 / POWER</span>
        <strong>乘方与数的表示</strong>
        <p>辨析底数与指数，并覆盖科学记数法、近似数。</p>
      </div>
      <div>
        <span>04 / CHECK</span>
        <strong>典型例题解析</strong>
        <p>逐层展开步骤、计算依据、常见误区与变式思考。</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import AppIcon from '@/shared/components/AppIcon.vue'
</script>

<style scoped>
.tutoring-page { width: min(100%, 1120px); margin: 0 auto; }
.tutoring-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 32px; }
.back-link { display: inline-flex; margin-bottom: 20px; align-items: center; gap: 6px; color: var(--text-tertiary); font-family: var(--font-mono); font-size: 12px; }
.back-link:hover { color: var(--signal); }
.module-code { margin-bottom: 8px; color: var(--signal); font-family: var(--font-mono); font-size: 10px; }
.header-status { display: flex; padding: 8px 11px; align-items: center; gap: 8px; border: 1px solid rgba(234,255,87,.26); border-radius: 3px; color: var(--text-secondary); font-family: var(--font-mono); font-size: 10px; }
.status-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--signal); box-shadow: 0 0 9px rgba(234,255,87,.7); }
.course-band { display: grid; min-height: 250px; margin-top: 24px; padding: 30px; grid-template-columns: 74px 1fr auto; align-items: center; gap: 28px; border: 1px solid var(--border); border-radius: var(--radius-lg); background: linear-gradient(115deg, rgba(234,255,87,.07), rgba(255,255,255,.018) 42%, rgba(60,199,255,.05)); }
.course-index { color: var(--signal); font-family: var(--font-display); font-size: 36px; align-self: flex-start; }
.course-meta { display: flex; flex-wrap: wrap; gap: 6px; }
.course-meta span, .chapter-track span { padding: 5px 8px; border: 1px solid var(--border); border-radius: 3px; font-family: var(--font-mono); font-size: 10px; }
.course-main h2 { margin: 20px 0 7px; color: var(--text-primary); font-family: var(--font-display); font-size: clamp(28px, 4vw, 46px); letter-spacing: 0; }
.course-main > p { max-width: 620px; color: var(--text-secondary); font-size: 15px; line-height: 1.8; }
.chapter-track { display: flex; margin-top: 24px; flex-wrap: wrap; gap: 7px; }
.chapter-muted { color: var(--text-tertiary); }
.chapter-active { border-color: rgba(234,255,87,.4) !important; background: var(--signal-muted); color: var(--signal); }
.course-action { display: flex; min-width: 178px; flex-direction: column; align-items: stretch; gap: 18px; }
.lesson-duration { display: flex; justify-content: center; align-items: baseline; gap: 7px; color: var(--signal); }
.lesson-duration strong { font-family: var(--font-display); font-size: 34px; }
.lesson-duration span { font-family: var(--font-mono); font-size: 10px; }
.start-button { display: inline-flex; min-height: 48px; padding: 0 18px; align-items: center; justify-content: center; gap: 8px; border: 1px solid var(--signal); border-radius: 3px; background: var(--signal); color: #0b0b0e; font-family: var(--font-mono); font-size: 13px; font-weight: 800; }
.start-button:hover { box-shadow: 0 0 20px rgba(234,255,87,.2); transform: translateY(-1px); }
.readiness-grid { display: grid; margin-top: 18px; grid-template-columns: repeat(4, minmax(0,1fr)); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; }
.readiness-grid > div { min-height: 145px; padding: 22px; border-right: 1px solid var(--border); }
.readiness-grid > div:last-child { border-right: 0; }
.readiness-grid span { color: var(--signal); font-family: var(--font-mono); font-size: 9px; }
.readiness-grid strong { display: block; margin-top: 18px; color: var(--text-primary); font-size: 16px; }
.readiness-grid p { margin-top: 7px; color: var(--text-tertiary); font-size: 12px; line-height: 1.7; }
@media (max-width: 850px) {
  .course-band { grid-template-columns: 54px 1fr; }
  .course-action { grid-column: 1 / -1; min-width: 0; flex-direction: row; align-items: center; justify-content: flex-end; }
  .readiness-grid { grid-template-columns: repeat(2, minmax(0,1fr)); }
  .readiness-grid > div:nth-child(2) { border-right: 0; }
  .readiness-grid > div:nth-child(-n+2) { border-bottom: 1px solid var(--border); }
}
@media (max-width: 600px) {
  .tutoring-header { align-items: flex-start; flex-direction: column; gap: 12px; }
  .course-band { padding: 20px; grid-template-columns: 1fr; gap: 12px; }
  .course-index { font-size: 24px; }
  .course-action { grid-column: auto; align-items: stretch; flex-direction: column; }
  .readiness-grid { grid-template-columns: 1fr; }
  .readiness-grid > div { border-right: 0; border-bottom: 1px solid var(--border); }
  .readiness-grid > div:last-child { border-bottom: 0; }
}
</style>
