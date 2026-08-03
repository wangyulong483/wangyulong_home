<template>
  <div class="lesson-page">
    <header class="lesson-header">
      <div>
        <router-link class="back-link" to="/tutoring">
          <AppIcon icon="arrow-left" size="13" /> 家教备课台
        </router-link>
        <p class="module-code">PEP 2024 AUTUMN / GRADE 7 / CHAPTER 02</p>
        <h1>有理数的运算</h1>
        <p>加减 · 乘除 · 乘方 · 科学记数法 · 近似数</p>
      </div>
      <div class="lesson-objective">
        <span>知识主线</span>
        <strong>从“看见规律”到“说清算法”</strong>
        <p>理解符号来源、掌握绝对值计算，并按运算层级完成有理数混合运算。</p>
      </div>
    </header>

    <div class="teacher-mode-banner">
      <span>KNOWLEDGE MAP</span>
      <strong>符号 → 绝对值 → 运算顺序</strong>
      <p>每道题先确定结果符号，再计算绝对值，最后依据括号、乘方、乘除、加减的层级顺序复核。</p>
    </div>

    <div class="chapter-outline" aria-label="2024 秋新版第二章目录">
      <div>
        <span>2.1</span>
        <strong>有理数的加法与减法</strong>
        <p>2.1.1 加法 · 2.1.2 减法 · 加减混合运算 · 运算律</p>
      </div>
      <div>
        <span>2.2</span>
        <strong>有理数的乘法与除法</strong>
        <p>2.2.1 乘法 · 2.2.2 除法 · 倒数 · 乘法运算律</p>
      </div>
      <div>
        <span>2.3</span>
        <strong>有理数的乘方</strong>
        <p>乘方 · 混合运算 · 科学记数法 · 近似数</p>
      </div>
    </div>

    <div class="lesson-console">
      <div class="timer-block">
        <span>CLASS TIMER</span>
        <strong>{{ elapsedDisplay }}</strong>
        <small>/ 30:00</small>
      </div>
      <div class="timer-progress"><i :style="{ width: `${elapsedPercent}%` }"></i></div>
      <div class="timer-actions">
        <button class="icon-button" :title="timerRunning ? '暂停计时' : '开始计时'" @click="toggleTimer">
          {{ timerRunning ? 'Ⅱ' : '▶' }}
        </button>
        <button class="icon-button" title="复位计时" @click="resetTimer">
          <AppIcon icon="refresh" size="14" />
        </button>
      </div>
      <nav class="stage-nav" aria-label="知识章节">
        <button
          v-for="(stage, index) in stages"
          :key="stage.id"
          :class="{ active: activeStage === index, complete: elapsedSeconds >= stage.end * 60 }"
          @click="goToStage(index)"
        >
          <span>{{ stage.duration }}′</span>
          <strong>{{ stage.short }}</strong>
        </button>
      </nav>
    </div>

    <div class="lesson-layout">
      <aside class="teacher-rail">
        <p class="rail-label">KNOWLEDGE GUIDE / {{ String(activeStage + 1).padStart(2, '0') }}</p>
        <h2>{{ currentStage.title }}</h2>
        <div class="cue-block">
          <span>本段重点</span>
          <p>{{ currentStage.goal }}</p>
        </div>
        <div class="cue-block question-cue">
          <span>推理关键</span>
          <p>{{ currentStage.question }}</p>
        </div>
        <div class="cue-block">
          <span>结论归纳</span>
          <p>{{ currentStage.board }}</p>
        </div>
        <div class="pace-alert" :class="{ overtime: stageOvertime }">
          <span>{{ stageOvertime ? '建议推进下一段' : '本段剩余' }}</span>
          <strong>{{ stageRemaining }}</strong>
        </div>
      </aside>

      <main class="lesson-content">
        <section id="stage-warmup" class="lesson-section warmup-section">
          <div class="section-heading">
            <span>00:00—03:00 / FOUNDATION</span>
            <h2>先辨概念，再开始运算</h2>
            <p>负数大小、减去负数、负号与底数，是整章最容易混淆的三个入口。判断时应回到数轴、相反数和括号的定义。</p>
          </div>
          <div class="definition-grid">
            <div><span>有理数</span><strong>整数与分数的统称</strong><p>任何有理数都能写成 p/q 的形式，其中 p、q 是整数且 q ≠ 0。</p></div>
            <div><span>相反数</span><strong>和为 0 的两个数</strong><p>a 与 −a 互为相反数；0 的相反数仍然是 0。</p></div>
            <div><span>绝对值</span><strong>到原点的距离</strong><p>|a| ≥ 0。正数绝对值是本身，负数绝对值是它的相反数。</p></div>
            <div><span>数轴次序</span><strong>右边的数总比左边大</strong><p>两个负数比较大小时，绝对值较大的数反而更小。</p></div>
          </div>
          <div class="diagnostic-grid">
            <button v-for="item in diagnostics" :key="item.question" :class="{ revealed: item.open }" @click="item.open = !item.open">
              <span>{{ item.code }}</span>
              <strong>{{ item.question }}</strong>
              <p>{{ item.open ? item.answer : '点击查看定义与判断依据' }}</p>
            </button>
          </div>
          <div class="concept-map">
            <span>一个统一动作</span>
            <strong>先确定符号</strong>
            <i></i>
            <strong>再计算绝对值</strong>
            <i></i>
            <strong>最后检查顺序</strong>
          </div>
        </section>

        <section id="stage-add" class="lesson-section">
          <div class="section-heading">
            <span>03:00—10:00 / ADD & SUBTRACT</span>
            <h2>2.1 有理数的加法与减法</h2>
            <p>第一个数决定起点；加数决定移动方向与距离。减法先转化为加上相反数。</p>
          </div>
          <NumberLineLab />
          <FootballFieldLab />
          <div class="knowledge-line">
            <div><span>同号相加</span><strong>绝对值相加，保留共同符号</strong><p>(−3) + (−5) = −(3 + 5) = −8</p></div>
            <div><span>异号相加</span><strong>绝对值相减，取较大绝对值的符号</strong><p>−8 + 3 = −(8 − 3) = −5</p></div>
            <div><span>互为相反数</span><strong>两个数的和为 0</strong><p>7 + (−7) = 0</p></div>
            <div><span>减法统一</span><strong>a − b = a + (−b)</strong><p>减去一个数，等于加上这个数的相反数。</p></div>
          </div>
          <div class="method-grid">
            <div>
              <span>运算律巧算</span>
              <strong>(−3) + 5 + (−2) + 8</strong>
              <p>交换加数位置并重新结合：[(−3) + (−2)] + (5 + 8) = −5 + 13 = 8。加法交换律与结合律不改变各加数的符号。</p>
            </div>
            <div>
              <span>温度变化</span>
              <strong>5℃ + (−8℃) = −3℃</strong>
              <p>升高记为正，降低记为负。从 5℃ 降低 8℃，等价于从 5 出发向数轴左侧移动 8 个单位。</p>
            </div>
            <div>
              <span>海拔差</span>
              <strong>8848.86 − (−11034) = 19882.86 m</strong>
              <p>高度差用较高位置减较低位置。减去负海拔时转化为加上其相反数，因此结果大于两个绝对值中的任一个。</p>
            </div>
          </div>
        </section>

        <section id="stage-multiply" class="lesson-section">
          <div class="section-heading">
            <span>10:00—16:00 / MULTIPLY & DIVIDE</span>
            <h2>2.2 有理数的乘法与除法</h2>
            <p>先只看两个数的符号，再只算绝对值；除法沿用相同的符号规律。</p>
          </div>
          <SignRuleLab />
          <blockquote>乘法与除法的符号规则完全一致：同号得正，异号得负。两个以上有理数相乘时，负因数个数为偶数则积为正，为奇数则积为负；任何数与 0 相乘都得 0，但 0 不能作除数。</blockquote>
          <div class="method-grid compact">
            <div>
              <span>除法转化</span>
              <strong>a ÷ b = a × 1/b（b ≠ 0）</strong>
              <p>除以一个不等于 0 的数，等于乘这个数的倒数。例如 (−12) ÷ 3 = (−12) × 1/3 = −4。</p>
            </div>
            <div>
              <span>多个因数</span>
              <strong>(−2) × 3 × (−4) × (−5) = −120</strong>
              <p>三个负因数，负因数个数为奇数，所以积为负；绝对值为 2 × 3 × 4 × 5 = 120。</p>
            </div>
            <div>
              <span>分配律巧算</span>
              <strong>99 × (−12) = (100 − 1) × (−12)</strong>
              <p>= 100 × (−12) − 1 × (−12) = −1200 + 12 = −1188。展开时每一项都要与括号外因数相乘。</p>
            </div>
          </div>
        </section>

        <section id="stage-power" class="lesson-section">
          <div class="section-heading">
            <span>16:00—22:00 / POWER</span>
            <h2>2.3 有理数的乘方</h2>
            <p>指数表示相同因数的个数；负号是否属于底数，由括号决定。</p>
          </div>
          <PowerLab />
          <div class="power-notes">
            <div><span>指数含义</span><p>aⁿ 表示 n 个 a 相乘，a 是底数，n 是指数。</p></div>
            <div><span>零次幂</span><p>任何非零有理数的 0 次幂都等于 1；0⁰ 在本章中不作定义。</p></div>
            <div><span>符号规律</span><p>负数的奇次幂为负，偶次幂为正；前提是负号属于底数。</p></div>
            <div><span>括号边界</span><p>−aⁿ = −(aⁿ)，而 (−a)ⁿ 的底数包含负号，两式不能混同。</p></div>
          </div>
          <div class="number-expression-grid">
            <article>
              <div class="number-expression-title">
                <span>2.3 / SCIENTIFIC NOTATION</span>
                <strong>科学记数法</strong>
              </div>
              <p>把一个绝对值大于或等于 10 的数写成 <b>a × 10ⁿ</b> 的形式，其中 1 ≤ |a| &lt; 10，n 为正整数。n 等于原数整数位数减 1。</p>
              <div class="formula-cases">
                <div><span>6 100 000</span><strong>6.1 × 10⁶</strong><small>小数点向左移动 6 位</small></div>
                <div><span>−32 500</span><strong>−3.25 × 10⁴</strong><small>负号保留，系数绝对值小于 10</small></div>
              </div>
            </article>
            <article>
              <div class="number-expression-title">
                <span>2.3 / APPROXIMATE NUMBER</span>
                <strong>近似数</strong>
              </div>
              <p>用四舍五入法取近似数时，先确定精确到哪一位，再观察其后一位。近似数末尾的 0 不能随意省略，它表示精确程度。</p>
              <div class="formula-cases">
                <div><span>3.14159（精确到 0.01）</span><strong>≈ 3.14</strong><small>千分位是 1，不进位</small></div>
                <div><span>2.496（精确到 0.01）</span><strong>≈ 2.50</strong><small>千分位是 6，百分位进 1</small></div>
              </div>
            </article>
          </div>
        </section>

        <section id="stage-mixed" class="lesson-section">
          <div class="section-heading">
            <span>22:00—27:00 / MIXED OPERATIONS</span>
            <h2>综合运算：每一步都能解释</h2>
            <p>先乘方，再乘除，最后加减；同级运算从左到右，有括号先算括号。</p>
          </div>
          <div class="order-ladder" aria-label="有理数混合运算顺序">
            <div><span>1</span><strong>括号</strong><p>从最内层开始</p></div>
            <i></i>
            <div><span>2</span><strong>乘方</strong><p>先认准底数</p></div>
            <i></i>
            <div><span>3</span><strong>乘除</strong><p>同级从左到右</p></div>
            <i></i>
            <div><span>4</span><strong>加减</strong><p>统一成加法更稳</p></div>
          </div>
          <WorkedExampleStepper />
          <LessonQuiz />
        </section>

        <section id="stage-summary" class="lesson-section summary-section">
          <div class="section-heading">
            <span>27:00—30:00 / CHAPTER SUMMARY</span>
            <h2>用三句话收束整章规则</h2>
          </div>
          <div class="summary-sentences">
            <div><span>01</span><p>加减法看作数轴上的<strong>方向和位移</strong>，减法转化为加上相反数。</p></div>
            <div><span>02</span><p>乘除法<strong>先定符号，再算绝对值</strong>，同号正、异号负。</p></div>
            <div><span>03</span><p>乘方先辨认<strong>底数和指数</strong>；科学记数法规范数量级，近似数必须注明精确程度。</p></div>
          </div>
          <div class="exit-question">
            <span>核心辨析</span>
            <strong>为什么 −2⁴ 和 (−2)⁴ 的结果不同？</strong>
            <p>−2⁴ 的底数是 2，负号在乘方运算之外，所以结果是 −16；(−2)⁴ 的底数是 −2，四个负因数相乘，所以结果是 16。</p>
          </div>
        </section>

        <footer class="research-sources">
          <div class="source-title">
            <span>GITHUB RESEARCH / SOURCE NOTES</span>
            <strong>可视化方案调研来源</strong>
            <p>本模块由 Vue 与原生 SVG 独立实现，以下项目用于数学可视化、动态参数和分步解析结构研究。</p>
          </div>
          <div class="source-links">
            <a v-for="source in sources" :key="source.url" :href="source.url" target="_blank" rel="noopener noreferrer">
              <span>{{ source.license }}</span>
              <strong>{{ source.name }}</strong>
              <p>{{ source.note }}</p>
            </a>
          </div>
        </footer>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import AppIcon from '@/shared/components/AppIcon.vue'
import LessonQuiz from '@/features/tutoring/components/LessonQuiz.vue'
import NumberLineLab from '@/features/tutoring/components/NumberLineLab.vue'
import PowerLab from '@/features/tutoring/components/PowerLab.vue'
import SignRuleLab from '@/features/tutoring/components/SignRuleLab.vue'
import WorkedExampleStepper from '@/features/tutoring/components/WorkedExampleStepper.vue'
import FootballFieldLab from '@/features/tutoring/components/FootballFieldLab.vue'

const stages = [
  { id: 'stage-warmup', short: '概念', title: '基础概念与辨析', duration: 3, end: 3, goal: '区分负数、相反数、绝对值以及负号在算式中的不同作用。', question: '比较两个负数时，应依据数轴位置还是绝对值大小？', board: '数轴右边的数更大；两个负数绝对值越大，数值越小。' },
  { id: 'stage-add', short: '2.1', title: '有理数的加法与减法', duration: 7, end: 10, goal: '把加法解释成位移，把减法转化为加法，并用交换律、结合律简化计算。', question: '减去 −4 为什么等价于加 4？重新排列加数时哪些符号必须保留？', board: 'a − b = a + (−b)；交换位置时连同加数符号一起移动。' },
  { id: 'stage-multiply', short: '2.2', title: '有理数的乘法与除法', duration: 6, end: 16, goal: '掌握乘除符号规律、倒数关系以及乘法运算律。', question: '负因数个数如何决定积的符号？除法怎样转化为乘法？', board: '同号正、异号负；a ÷ b = a × 1/b（b ≠ 0）。' },
  { id: 'stage-power', short: '2.3', title: '乘方与数的表示', duration: 6, end: 22, goal: '辨认底数、指数与负号范围，并掌握科学记数法和近似数。', question: '−2⁴ 的底数是谁？科学记数法中的系数范围是什么？', board: '括号决定底数；1 ≤ |a| < 10；近似数保留精确程度。' },
  { id: 'stage-mixed', short: '综合', title: '混合运算演示', duration: 5, end: 27, goal: '按层级完成运算，并能说清每一步理由。', question: '这道题第一步做什么？依据是什么？', board: '括号 → 乘方 → 乘除 → 加减。' },
  { id: 'stage-summary', short: '总结', title: '规则归纳与辨析', duration: 3, end: 30, goal: '归纳加减、乘除、乘方与混合运算的统一检查方法。', question: '符号、绝对值和运算顺序分别在计算的哪一步确定？', board: '先辨符号与结构，再算绝对值，最后复核运算层级。' },
]

const diagnostics = reactive([
  { code: 'A', question: '−3 和 −5，谁更大？', answer: '−3 更大，因为它在数轴上更靠右。', open: false },
  { code: 'B', question: '6 − (−2) 会变大还是变小？', answer: '变大。减去 −2 等于加上 2。', open: false },
  { code: 'C', question: '−2² 的底数是 −2 吗？', answer: '不是。没有括号时，底数是 2，负号在乘方外。', open: false },
])

const sources = [
  { name: 'PhET · Number Line: Operations', license: 'GPL-3.0', url: 'https://github.com/phetsims/number-line-operations', note: '参考用数轴、方向与位移呈现运算的交互模型。' },
  { name: 'Mafs · Steven Petryk', license: 'MIT', url: 'https://github.com/stevenpetryk/mafs', note: '参考可调参数、表达式与图形同步，以及数学组件的视觉一致性。' },
  { name: 'JSXGraph · University of Bayreuth', license: 'MIT / LGPL-3.0', url: 'https://github.com/jsxgraph/jsxgraph', note: '参考基于 SVG 的动态点、坐标可视化与多端交互设计。' },
  { name: 'Numbas · Newcastle University', license: 'Apache-2.0', url: 'https://github.com/numbas/Numbas', note: '参考分步解析、针对性错因和变式题目的组织结构。' },
]

const activeStage = ref(0)
const elapsedSeconds = ref(0)
const timerRunning = ref(false)
let timerId

const currentStage = computed(() => stages[activeStage.value])
const elapsedDisplay = computed(() => `${String(Math.floor(elapsedSeconds.value / 60)).padStart(2, '0')}:${String(elapsedSeconds.value % 60).padStart(2, '0')}`)
const elapsedPercent = computed(() => Math.min(100, elapsedSeconds.value / 18))
const stageRemainingSeconds = computed(() => currentStage.value.end * 60 - elapsedSeconds.value)
const stageOvertime = computed(() => elapsedSeconds.value > currentStage.value.end * 60)
const stageRemaining = computed(() => {
  const value = Math.max(0, stageRemainingSeconds.value)
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`
})

function toggleTimer() {
  timerRunning.value = !timerRunning.value
  if (timerRunning.value) {
    timerId = window.setInterval(() => {
      if (elapsedSeconds.value >= 1800) {
        timerRunning.value = false
        window.clearInterval(timerId)
        return
      }
      elapsedSeconds.value += 1
      const timedStage = stages.findIndex(stage => elapsedSeconds.value < stage.end * 60)
      activeStage.value = timedStage === -1 ? stages.length - 1 : timedStage
    }, 1000)
  } else {
    window.clearInterval(timerId)
  }
}

function resetTimer() {
  window.clearInterval(timerId)
  timerRunning.value = false
  elapsedSeconds.value = 0
  activeStage.value = 0
}

function goToStage(index) {
  activeStage.value = index
  document.getElementById(stages[index].id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

onBeforeUnmount(() => window.clearInterval(timerId))
</script>

<style scoped>
.lesson-page { width: min(100%, 1260px); max-width: 100%; min-width: 0; margin: 0 auto; overflow-x: clip; }
.lesson-header { display: grid; padding: 8px 0 24px; grid-template-columns: 1fr minmax(280px,420px); align-items: end; gap: 40px; border-bottom: 1px solid var(--border); }
.back-link { display: inline-flex; margin-bottom: 18px; align-items: center; gap: 6px; color: var(--text-tertiary); font-family: var(--font-mono); font-size: 12px; }
.back-link:hover { color: var(--signal); }
.module-code { color: var(--signal); font-family: var(--font-mono); font-size: 10px; }
.lesson-header h1 { margin: 8px 0 6px; color: var(--text-primary); font-family: var(--font-display); font-size: clamp(34px,5vw,60px); letter-spacing: 0; }
.lesson-header > div:first-child > p:last-child { color: var(--text-tertiary); font-family: var(--font-mono); font-size: 13px; }
.lesson-objective { padding: 16px 0 3px 20px; border-left: 2px solid var(--signal); }
.lesson-objective span { color: var(--signal); font-family: var(--font-mono); font-size: 10px; }
.lesson-objective strong { display: block; margin-top: 5px; color: var(--text-primary); font-size: 17px; }
.lesson-objective p { margin-top: 5px; color: var(--text-tertiary); font-size: 12px; line-height: 1.7; }
.teacher-mode-banner { display: grid; min-height: 48px; margin-top: 14px; padding: 10px 14px; grid-template-columns: auto auto 1fr; align-items: center; gap: 10px 16px; border: 1px solid rgba(67,200,255,.22); border-left: 2px solid #43c8ff; border-radius: 3px; background: rgba(67,200,255,.045); }
.teacher-mode-banner span { color: #72d7ff; font-family: var(--font-mono); font-size: 10px; }
.teacher-mode-banner strong { color: var(--text-primary); font-size: 13px; }
.teacher-mode-banner p { color: var(--text-tertiary); font-size: 12px; }
.chapter-outline { display: grid; margin-top: 10px; grid-template-columns: repeat(3,1fr); border: 1px solid var(--border); border-radius: 3px; overflow: hidden; }
.chapter-outline > div { min-height: 82px; padding: 13px 15px; border-right: 1px solid var(--border); }
.chapter-outline > div:last-child { border-right: 0; }
.chapter-outline span { color: var(--signal); font-family: var(--font-mono); font-size: 10px; }
.chapter-outline strong { display: block; margin-top: 5px; color: var(--text-primary); font-size: 13px; }
.chapter-outline p { margin-top: 5px; color: var(--text-tertiary); font-size: 10px; line-height: 1.55; }
.lesson-console { position: sticky; top: 10px; z-index: 12; display: grid; margin-top: 14px; padding: 10px 12px; grid-template-columns: auto 100px auto 1fr; align-items: center; gap: 12px; border: 1px solid rgba(234,255,87,.18); border-radius: var(--radius); background: rgba(11,11,14,.94); backdrop-filter: blur(16px); box-shadow: 0 10px 35px rgba(0,0,0,.2); }
.timer-block { display: flex; align-items: baseline; gap: 5px; font-family: var(--font-mono); }
.timer-block span { display: none; }
.timer-block strong { color: var(--signal); font-size: 22px; }
.timer-block small { color: var(--text-tertiary); font-size: 10px; }
.timer-progress { height: 4px; background: rgba(255,255,255,.08); overflow: hidden; }
.timer-progress i { display: block; height: 100%; background: var(--signal); transition: width .2s linear; }
.timer-actions { display: flex; gap: 5px; }
.icon-button { display: grid; width: 32px; height: 32px; place-items: center; border: 1px solid var(--border); border-radius: 3px; background: transparent; color: var(--text-secondary); cursor: pointer; font-size: 14px; }
.icon-button:hover { border-color: var(--signal); color: var(--signal); }
.stage-nav { display: grid; min-width: 0; grid-template-columns: repeat(6,1fr); gap: 5px; }
.stage-nav button { min-width: 0; min-height: 40px; padding: 5px 7px; border: 1px solid var(--border); border-radius: 3px; background: transparent; color: var(--text-tertiary); cursor: pointer; text-align: left; }
.stage-nav button span { display: block; font-family: var(--font-mono); font-size: 9px; }
.stage-nav button strong { display: block; margin-top: 2px; overflow: hidden; font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.stage-nav button.active { border-color: rgba(234,255,87,.55); background: var(--signal-muted); color: var(--signal); }
.stage-nav button.complete:not(.active) { color: var(--text-secondary); }
.lesson-layout { display: grid; margin-top: 18px; grid-template-columns: 230px minmax(0,1fr); align-items: start; gap: 24px; }
.teacher-rail { position: sticky; top: 88px; padding: 18px; border: 1px solid var(--border); border-radius: var(--radius); background: rgba(17,17,21,.78); }
.rail-label { color: var(--signal); font-family: var(--font-mono); font-size: 10px; }
.teacher-rail h2 { margin: 7px 0 18px; color: var(--text-primary); font-size: 20px; }
.cue-block { padding: 12px 0; border-top: 1px solid var(--border); }
.cue-block span, .pace-alert span { color: var(--text-tertiary); font-family: var(--font-mono); font-size: 10px; }
.cue-block p { margin-top: 5px; color: var(--text-secondary); font-size: 12px; line-height: 1.7; }
.question-cue p { color: var(--text-primary); }
.pace-alert { margin-top: 10px; padding: 12px; border-left: 2px solid var(--signal); background: var(--signal-muted); }
.pace-alert strong { display: block; margin-top: 4px; color: var(--signal); font-family: var(--font-mono); font-size: 20px; }
.pace-alert.overtime { border-left-color: #ff8999; background: rgba(255,110,131,.08); }
.pace-alert.overtime strong { color: #ff8999; }
.lesson-content { min-width: 0; max-width: 100%; }
.lesson-section { max-width: 100%; min-width: 0; scroll-margin-top: 88px; padding: 30px 0 38px; border-bottom: 1px solid var(--border); }
.lesson-section:first-child { padding-top: 10px; }
.section-heading { max-width: 800px; margin-bottom: 24px; }
.section-heading > span { color: var(--signal); font-family: var(--font-mono); font-size: 10px; }
.section-heading h2 { margin: 7px 0 6px; color: var(--text-primary); font-size: clamp(24px,3vw,34px); letter-spacing: 0; }
.section-heading p { color: var(--text-secondary); font-size: 13px; line-height: 1.7; }
.diagnostic-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; }
.definition-grid { display: grid; margin-bottom: 16px; grid-template-columns: repeat(4,1fr); border: 1px solid var(--border); border-radius: 3px; overflow: hidden; }
.definition-grid > div { min-height: 126px; padding: 15px; border-right: 1px solid var(--border); }
.definition-grid > div:last-child { border-right: 0; }
.definition-grid span, .power-notes span { color: var(--signal); font-family: var(--font-mono); font-size: 10px; }
.definition-grid strong { display: block; margin-top: 10px; color: var(--text-primary); font-size: 14px; }
.definition-grid p, .power-notes p { margin-top: 6px; color: var(--text-tertiary); font-size: 11px; line-height: 1.7; }
.diagnostic-grid button { min-height: 150px; padding: 18px; border: 1px solid var(--border); border-radius: var(--radius); background: rgba(255,255,255,.018); color: var(--text-primary); cursor: pointer; text-align: left; }
.diagnostic-grid button:hover, .diagnostic-grid button.revealed { border-color: rgba(234,255,87,.35); background: var(--signal-muted); }
.diagnostic-grid span { color: var(--signal); font-family: var(--font-mono); font-size: 11px; }
.diagnostic-grid strong { display: block; margin-top: 20px; font-size: 16px; line-height: 1.55; }
.diagnostic-grid p { margin-top: 10px; color: var(--text-tertiary); font-size: 12px; line-height: 1.6; }
.diagnostic-grid .revealed p { color: var(--signal); }
.concept-map { display: flex; margin-top: 12px; padding: 14px; align-items: center; gap: 12px; border: 1px solid var(--border); border-radius: 3px; color: var(--text-secondary); }
.concept-map span { margin-right: auto; color: var(--text-tertiary); font-family: var(--font-mono); font-size: 10px; }
.concept-map strong { font-size: 12px; }
.concept-map i { width: 22px; height: 1px; background: var(--signal); }
.knowledge-line { display: grid; margin-top: 18px; grid-template-columns: repeat(4,1fr); border: 1px solid var(--border); border-radius: 3px; overflow: hidden; }
.knowledge-line div { min-height: 78px; padding: 14px; border-right: 1px solid var(--border); }
.knowledge-line div:last-child { border-right: 0; }
.knowledge-line span { color: var(--text-tertiary); font-family: var(--font-mono); font-size: 10px; }
.knowledge-line strong { display: block; margin-top: 7px; color: var(--text-primary); font-size: 13px; }
.knowledge-line p { margin-top: 7px; color: var(--text-tertiary); font-family: var(--font-mono); font-size: 10px; line-height: 1.6; }
.method-grid { display: grid; margin-top: 12px; grid-template-columns: repeat(3,1fr); border: 1px solid var(--border); border-radius: 3px; overflow: hidden; }
.method-grid > div { min-height: 132px; padding: 14px; border-right: 1px solid var(--border); }
.method-grid > div:last-child { border-right: 0; }
.method-grid span { color: #72d7ff; font-family: var(--font-mono); font-size: 10px; }
.method-grid strong { display: block; margin-top: 9px; color: var(--text-primary); font-family: var(--font-mono); font-size: 14px; line-height: 1.5; }
.method-grid p { margin-top: 7px; color: var(--text-tertiary); font-size: 11px; line-height: 1.7; }
.method-grid.compact > div { min-height: 120px; }
.power-notes { display: grid; margin-top: 16px; grid-template-columns: repeat(2,1fr); border: 1px solid var(--border); border-radius: 3px; overflow: hidden; }
.power-notes > div { min-height: 78px; padding: 13px; border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); }
.power-notes > div:nth-child(2n) { border-right: 0; }
.power-notes > div:nth-last-child(-n+2) { border-bottom: 0; }
.number-expression-grid { display: grid; margin-top: 16px; grid-template-columns: repeat(2,1fr); gap: 10px; }
.number-expression-grid article { padding: 17px; border: 1px solid var(--border); border-radius: 3px; background: rgba(255,255,255,.012); }
.number-expression-title span { color: var(--signal); font-family: var(--font-mono); font-size: 10px; }
.number-expression-title strong { display: block; margin-top: 5px; color: var(--text-primary); font-size: 17px; }
.number-expression-grid article > p { margin-top: 9px; color: var(--text-secondary); font-size: 11px; line-height: 1.75; }
.number-expression-grid article > p b { color: var(--signal); font-family: var(--font-mono); }
.formula-cases { margin-top: 13px; border-top: 1px solid var(--border); }
.formula-cases > div { display: grid; min-height: 58px; padding: 9px 0; grid-template-columns: 1fr auto; align-items: center; gap: 4px 10px; border-bottom: 1px solid var(--border); }
.formula-cases > div:last-child { border-bottom: 0; }
.formula-cases span { color: var(--text-secondary); font-family: var(--font-mono); font-size: 11px; }
.formula-cases strong { color: var(--signal); font-family: var(--font-mono); font-size: 14px; }
.formula-cases small { grid-column: 1 / -1; color: var(--text-tertiary); font-size: 10px; }
blockquote { margin: 18px 0 0; padding: 14px 16px; border-left: 2px solid #43c8ff; background: rgba(67,200,255,.06); color: var(--text-secondary); font-size: 12px; line-height: 1.7; }
.order-ladder { display: grid; margin-bottom: 24px; grid-template-columns: 1fr 20px 1fr 20px 1fr 20px 1fr; align-items: center; gap: 5px; }
.order-ladder > div { min-height: 100px; padding: 14px; border: 1px solid var(--border); border-radius: 3px; }
.order-ladder span { color: var(--signal); font-family: var(--font-mono); font-size: 11px; }
.order-ladder strong { display: block; margin-top: 10px; color: var(--text-primary); font-size: 16px; }
.order-ladder p { margin-top: 4px; color: var(--text-tertiary); font-size: 11px; }
.order-ladder > i { height: 1px; background: var(--signal); }
.summary-sentences { border-top: 1px solid var(--border); }
.summary-sentences > div { display: grid; min-height: 74px; padding: 14px 0; grid-template-columns: 42px 1fr; align-items: center; border-bottom: 1px solid var(--border); }
.summary-sentences span { color: var(--signal); font-family: var(--font-mono); font-size: 11px; }
.summary-sentences p { color: var(--text-secondary); font-size: 14px; line-height: 1.7; }
.summary-sentences strong { color: var(--text-primary); }
.exit-question { margin-top: 18px; padding: 20px; border: 1px solid rgba(234,255,87,.3); border-radius: var(--radius); background: var(--signal-muted); }
.exit-question span { color: var(--signal); font-family: var(--font-mono); font-size: 10px; }
.exit-question strong { display: block; margin-top: 8px; color: var(--text-primary); font-size: 20px; }
.exit-question p { margin-top: 5px; color: var(--text-secondary); font-size: 12px; }
.research-sources { padding: 34px 0 8px; }
.source-title span { color: var(--signal); font-family: var(--font-mono); font-size: 10px; }
.source-title strong { display: block; margin-top: 5px; color: var(--text-primary); font-size: 18px; }
.source-title p { margin-top: 5px; color: var(--text-tertiary); font-size: 12px; }
.source-links { display: grid; margin-top: 16px; grid-template-columns: repeat(2,1fr); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
.source-links a { min-height: 108px; padding: 16px; border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); color: inherit; }
.source-links a:nth-child(2n) { border-right: 0; }
.source-links a:nth-last-child(-n+2) { border-bottom: 0; }
.source-links a:hover { background: rgba(255,255,255,.025); }
.source-links span { color: var(--signal); font-family: var(--font-mono); font-size: 10px; }
.source-links strong { display: block; margin-top: 7px; color: var(--text-primary); font-size: 14px; }
.source-links p { margin-top: 5px; color: var(--text-tertiary); font-size: 11px; line-height: 1.55; }
@media (max-width: 980px) {
  .lesson-layout { grid-template-columns: 1fr; }
  .teacher-rail { position: static; display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
  .teacher-rail .rail-label, .teacher-rail h2, .pace-alert { grid-column: 1 / -1; }
  .cue-block { border-top: 1px solid var(--border); }
}
@media (max-width: 800px) {
  .lesson-header { grid-template-columns: 1fr; gap: 14px; }
  .lesson-console { position: relative; grid-template-columns: 1fr; padding-top: 11px; }
  .timer-block { padding-right: 82px; }
  .timer-actions { position: absolute; top: 8px; right: 9px; }
  .timer-progress { grid-column: 1 / -1; grid-row: 2; }
  .stage-nav { width: 100%; max-width: 100%; grid-column: 1 / -1; grid-row: 3; overflow-x: auto; grid-template-columns: repeat(6,minmax(76px,1fr)); }
  .diagnostic-grid { grid-template-columns: 1fr; }
  .definition-grid { grid-template-columns: repeat(2,1fr); }
  .definition-grid > div:nth-child(2) { border-right: 0; }
  .definition-grid > div:nth-child(-n+2) { border-bottom: 1px solid var(--border); }
  .knowledge-line { grid-template-columns: 1fr; }
  .knowledge-line div { border-right: 0; border-bottom: 1px solid var(--border); }
  .knowledge-line div:last-child { border-bottom: 0; }
  .order-ladder { grid-template-columns: repeat(4,1fr); }
  .order-ladder > i { display: none; }
}
/* 焦点高亮：引导学生注意力到当前讲解区域 */
@keyframes focus-glow {
  0%, 100% { box-shadow: 0 0 0 rgba(234,255,87,0); }
  50% { box-shadow: 0 0 20px rgba(234,255,87,.08), 0 0 3px rgba(234,255,87,.2); }
}
.lesson-section:target {
  animation: focus-glow 2s ease-in-out 1;
  border-radius: var(--radius);
}
/* 交互组件 hover 时的注意力引导 */
.lesson-section :deep(.number-line-lab),
.lesson-section :deep(.football-lab),
.lesson-section :deep(.sign-lab),
.lesson-section :deep(.power-lab),
.lesson-section :deep(.worked-example) {
  transition: border-color .25s, box-shadow .25s;
}
.lesson-section:has(:deep(.number-line-lab:hover)),
.lesson-section:has(:deep(.football-lab:hover)),
.lesson-section:has(:deep(.sign-lab:hover)),
.lesson-section:has(:deep(.power-lab:hover)),
.lesson-section:has(:deep(.worked-example:hover)) {
  border-color: rgba(234,255,87,.15);
}

@media (max-width: 600px) {
  .lesson-header { padding-top: 0; }
  .lesson-objective { padding-left: 14px; }
  .teacher-mode-banner { grid-template-columns: 1fr; gap: 5px; }
  .teacher-mode-banner p { grid-column: auto; }
  .chapter-outline, .method-grid, .number-expression-grid { grid-template-columns: 1fr; }
  .chapter-outline > div, .method-grid > div { border-right: 0; border-bottom: 1px solid var(--border); }
  .chapter-outline > div:last-child, .method-grid > div:last-child { border-bottom: 0; }
  .lesson-console { padding: 9px; }
  .teacher-rail { grid-template-columns: 1fr; }
  .teacher-rail .rail-label, .teacher-rail h2, .pace-alert { grid-column: auto; }
  .concept-map { align-items: flex-start; flex-direction: column; }
  .definition-grid, .power-notes { grid-template-columns: 1fr; }
  .definition-grid > div, .definition-grid > div:nth-child(2), .power-notes > div, .power-notes > div:nth-child(2n), .power-notes > div:nth-last-child(-n+2) { border-right: 0; border-bottom: 1px solid var(--border); }
  .definition-grid > div:last-child, .power-notes > div:last-child { border-bottom: 0; }
  .concept-map span { margin-right: 0; }
  .concept-map i { width: 1px; height: 12px; }
  .order-ladder { grid-template-columns: repeat(2,1fr); }
  .source-links { grid-template-columns: 1fr; }
  .source-links a, .source-links a:nth-child(2n), .source-links a:nth-last-child(-n+2) { border-right: 0; border-bottom: 1px solid var(--border); }
  .source-links a:last-child { border-bottom: 0; }
}
</style>
