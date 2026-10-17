<!--
  与影对谈 — 侧栏状态

  克制原则：只用发丝线与小字，不做卡片堆积。
  内容：她的心境与缘分、她记得的事、本轮检索状态、生成说明。
-->
<template>
  <aside class="aside">
    <section class="block">
      <h2 class="block-title">此刻</h2>
      <dl class="state-list">
        <div>
          <dt>心境</dt>
          <dd>{{ session.personaLabel }}<span v-if="session.emotionLabel"> · {{ session.emotionLabel }}</span></dd>
        </div>
        <div>
          <dt>缘分</dt>
          <dd>{{ session.relationshipLabel }}</dd>
        </div>
      </dl>
      <div class="trust-line" :title="`缘分值 ${session.trustScore} / 24`">
        <span :style="{ width: `${trustPercent}%` }"></span>
      </div>
      <p class="trust-note">第 {{ session.turnCount }} 次交谈 · 缘分 {{ session.trustScore }} / 24</p>
    </section>

    <section class="block">
      <h2 class="block-title">她记得的事</h2>
      <ul v-if="session.memory.length" class="memory-list">
        <li v-for="item in session.memory" :key="item.key">
          <span>{{ item.kind }}</span>{{ item.value }}
        </li>
      </ul>
      <p v-else class="block-empty">还没有值得她记下的事。</p>
    </section>

    <section class="block">
      <h2 class="block-title">本轮的检索</h2>
      <ul class="tool-list">
        <li>
          <span>网络搜索</span>
          <em>{{ describeWeb }}</em>
        </li>
        <li>
          <span>GitHub 档案</span>
          <em>{{ describeGithub }}</em>
        </li>
        <li>
          <span>角色卡声线</span>
          <em>{{ describePersonaCard }}</em>
        </li>
        <li>
          <span>生成模型</span>
          <em>{{ tools.model || '待命' }}</em>
        </li>
      </ul>
      <p v-if="tools.safety?.revision === 'applied'" class="block-empty">本轮回复经二次核对后修订。</p>
    </section>

    <section class="block block-note">
      <h2 class="block-title">生成说明</h2>
      <p>
        回复由 DeepSeek 依据角色档案、站内知识库、Brave 网络搜索与 GitHub 结构化档案生成。
        角色卡仅用于参考说话方式，不构成设定事实。
      </p>
      <p>
        本站为同人作品，与米哈游无关；角色与设定版权归米哈游所有，不商用、不整段复制官方台词。
      </p>
    </section>
  </aside>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  session: { type: Object, required: true },
  tools: { type: Object, default: () => ({}) },
})

const trustPercent = computed(() => {
  const score = Number(props.session.trustScore) || 0
  return Math.min(100, Math.round((score / 24) * 100))
})

const describeWeb = computed(() => {
  const web = props.tools.web
  if (!web) return '未触发'
  if (web.skipped === 'missing-key') return '未配置密钥'
  if (web.resultCount) return `${web.resultCount} 条已采用`
  if (web.skipped) return `未采用（${web.skipped}）`
  return '未触发'
})

const describeGithub = computed(() => {
  const github = props.tools.github
  if (!github) return '未触发'
  if (github.resultCount) return `${github.resultCount} 份档案`
  if (github.skipped && github.skipped !== 'not-needed') return `未采用（${github.skipped}）`
  return '未触发'
})

const describePersonaCard = computed(() => {
  const card = props.tools.personaCard
  if (!card) return '未加载'
  return card.loaded ? '已加载' : '不可用'
})
</script>

<style scoped>
.aside { display: grid; gap: 26px; align-content: start; }

.block { padding-bottom: 22px; border-bottom: 1px solid var(--border); }
.block:last-child { border-bottom: 0; padding-bottom: 0; }

.block-title {
  margin: 0 0 12px;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: 0.56rem;
  font-weight: 400;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.block-title::before {
  margin-right: 7px;
  color: #c9a96e;
  content: '—';
}

.state-list { display: grid; gap: 7px; margin: 0; }

.state-list > div {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.state-list dt {
  color: var(--text-tertiary);
  font-size: 0.68rem;
}

.state-list dd {
  margin: 0;
  color: var(--text-primary);
  font-family: var(--font-serif);
  font-size: 0.86rem;
}

.trust-line {
  position: relative;
  height: 1px;
  margin: 14px 0 8px;
  background: rgba(246, 243, 233, 0.12);
}

.trust-line span {
  position: absolute;
  inset: 0 auto 0 0;
  background: #c9a96e;
  transition: width 0.6s var(--ease-out);
}

.trust-note {
  margin: 0;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: 0.56rem;
}

.memory-list {
  display: grid;
  gap: 9px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.memory-list li {
  color: var(--text-secondary);
  font-size: 0.72rem;
  line-height: 1.6;
}

.memory-list li span {
  margin-right: 7px;
  color: #c9a96e;
  font-family: var(--font-mono);
  font-size: 0.54rem;
}

.block-empty {
  margin: 0;
  color: var(--text-tertiary);
  font-size: 0.68rem;
  line-height: 1.65;
}

.tool-list {
  display: grid;
  gap: 7px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.tool-list li {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  font-size: 0.68rem;
}

.tool-list span { color: var(--text-tertiary); }

.tool-list em {
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-size: 0.6rem;
  font-style: normal;
  text-align: right;
}

.block-note p {
  margin: 0 0 9px;
  color: var(--text-tertiary);
  font-size: 0.66rem;
  line-height: 1.75;
}

.block-note p:last-child { margin-bottom: 0; }
</style>
