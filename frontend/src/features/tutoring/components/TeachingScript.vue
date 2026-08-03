<template>
  <div class="teaching-script">
    <div class="script-head">
      <span>TEACHING SCRIPT / {{ periodLabel }}</span>
      <strong>{{ title }}</strong>
      <p>{{ subtitle }}</p>
    </div>

    <div class="script-flow">
      <div
        v-for="(segment, index) in segments"
        :key="index"
        class="script-segment"
        :class="{
          'teacher-speak': segment.role === 'teacher',
          'student-think': segment.role === 'think',
          'student-answer': segment.role === 'answer',
          'board-note': segment.role === 'board',
          'transition': segment.role === 'transition',
        }"
      >
        <div class="segment-badge">
          <span v-if="segment.role === 'teacher'">👨‍🏫 教师</span>
          <span v-else-if="segment.role === 'think'">🤔 思考</span>
          <span v-else-if="segment.role === 'answer'">🙋 学生</span>
          <span v-else-if="segment.role === 'board'">📋 板书</span>
          <span v-else-if="segment.role === 'transition'">🔀 过渡</span>
        </div>
        <div class="segment-body">
          <p v-if="segment.text">{{ segment.text }}</p>
          <div v-if="segment.expr" class="segment-expr">{{ segment.expr }}</div>
          <ul v-if="segment.items">
            <li v-for="item in segment.items" :key="item">{{ item }}</li>
          </ul>
          <div v-if="segment.note" class="segment-note">{{ segment.note }}</div>
        </div>
        <div v-if="segment.duration" class="segment-time">{{ segment.duration }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  periodLabel: { type: String, default: '第1课时' },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  segments: { type: Array, default: () => [] },
})
</script>

<style scoped>
.teaching-script { margin: 24px 0; border: 1px solid var(--border); border-radius: var(--radius); background: rgba(255,255,255,.008); overflow: hidden; }
.script-head { padding: 20px 22px 16px; border-bottom: 1px solid var(--border); }
.script-head span { color: var(--signal); font-family: var(--font-mono); font-size: 8px; }
.script-head strong { display: block; margin-top: 6px; color: var(--text-primary); font-size: 18px; }
.script-head p { margin-top: 4px; color: var(--text-tertiary); font-size: 10px; line-height: 1.5; }

.script-flow { padding: 8px 0; }
.script-segment { display: grid; padding: 14px 22px; grid-template-columns: 72px 1fr auto; align-items: flex-start; gap: 14px; border-bottom: 1px solid rgba(255,255,255,.04); transition: background .12s; }
.script-segment:last-child { border-bottom: 0; }
.script-segment:hover { background: rgba(255,255,255,.01); }

.segment-badge span {
  display: inline-block; padding: 3px 7px; border-radius: 3px;
  font-family: var(--font-mono); font-size: 8px; white-space: nowrap;
}
.teacher-speak .segment-badge span { border: 1px solid rgba(67,200,255,.35); background: rgba(67,200,255,.08); color: #72d7ff; }
.student-think .segment-badge span { border: 1px solid rgba(234,255,87,.25); background: var(--signal-muted); color: var(--signal); }
.student-answer .segment-badge span { border: 1px solid rgba(120,255,160,.3); background: rgba(120,255,160,.06); color: #78ffa0; }
.board-note .segment-badge span { border: 1px solid rgba(255,210,115,.3); background: rgba(255,210,115,.06); color: #ffd273; }
.transition .segment-badge span { border: 1px solid var(--border); background: transparent; color: var(--text-tertiary); }

.segment-body { min-width: 0; }
.segment-body p { color: var(--text-secondary); font-size: 12px; line-height: 1.75; }
.teacher-speak .segment-body p { color: var(--text-primary); }
.board-note .segment-body p { color: var(--text-primary); font-family: var(--font-mono); font-size: 13px; }

.segment-expr {
  margin-top: 8px; padding: 12px 16px; border: 1px solid var(--border); border-radius: 3px;
  background: rgba(0,0,0,.2); color: var(--signal); font-family: var(--font-mono); font-size: 14px;
  text-align: center; line-height: 1.6;
}

.segment-body ul { margin: 6px 0 0; padding-left: 18px; color: var(--text-secondary); font-size: 11px; line-height: 1.8; }

.segment-note {
  margin-top: 8px; padding: 8px 10px; border-left: 2px solid var(--signal);
  background: var(--signal-muted); color: var(--text-secondary); font-size: 10px; line-height: 1.6;
}

.segment-time {
  padding: 3px 7px; border-radius: 3px; background: rgba(255,255,255,.04);
  color: var(--text-tertiary); font-family: var(--font-mono); font-size: 9px; white-space: nowrap;
  align-self: flex-start;
}

@media (max-width: 680px) {
  .script-segment { grid-template-columns: 1fr; gap: 6px; padding: 12px 14px; }
  .segment-time { justify-self: flex-start; }
}
</style>
