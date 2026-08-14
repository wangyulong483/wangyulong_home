# TODO / 需求方案

## AI 应用能力测评（进行中）

> 定位：**独立能力测评**，与 NCRE 解耦。测「面对真实 AI 应用场景能不能做出正确技术判断」，不是「认识多少 AI 名词」。
> 状态：方案设计阶段；已吸收 GPT（docs/data.md）与 Grok 两轮外部建议，能力模型与 schema 已升级。

### 需求背景

用户判断「AI 应用能力」会成为普适、可评测的能力，想提前在个人博客布局一个测评产品。经可行性分析 + 三轮澄清，方向从「押注二级考试」收敛为「押注 AI 能力本身」。

### 核心产品原则（不可妥协）

1. **不测名词，测判断**：硬规则——任何一道题，若只看定义不看选项就能答对，优先怀疑它不是好题。至少 70% 题目无法靠背定义稳定答对。
2. **定位是「能力测评 + 学习导航」，不是「认证/证书」**：视觉、措辞、等级命名都要一致，不做伪认证。
3. **来源 ≠ 事实正确**：题目必须落到「来源 → 断言(evidence) → 题目 → 答案」的事实锚点链，治理幻觉。
4. **工程约束不可动摇**：纯静态、前端本地判分、零新增依赖、不动 `_worker.js`。

### 能力模型（6 维，考点已对齐 2026-08 现状）

> 原 4 维抽象层次不一致；Skills 与 MCP 合并为「工具与能力扩展」，新增 RAG 与 Eval/Safety。MCP 已于 2026-07-28 完成最大修订（stateless 核心），考点须反映这一迁移。

| # | 维度 | 核心考点 | 权重 |
|---|------|----------|:---:|
| 1 | 模型与 AI 基础 | LLM 能力、上下文窗口、Token、幻觉、推理限制、概率性、模型适用边界 | 15% |
| 2 | Prompt / Context Engineering | 指令设计、结构化输出、上下文组织、示例、约束、上下文污染、任务拆解 | 15% |
| 3 | RAG 与知识增强 | Embedding、检索、chunk、召回、rerank、grounding、知识时效、RAG 局限 | 15% |
| 4 | Agent 与工作流编排 | Agent 定义、规划、工具使用、状态、循环、workflow、multi-agent、human-in-the-loop | 20% |
| 5 | Tools / Skills / MCP | function calling、工具选择、Skill 封装与 progressive disclosure、工具权限、MCP 原语与 stateless 迁移（server-minted handles / MRTR / elicitation）、Agent Plugins 打包、生态互操作 | 20% |
| 6 | Eval / Safety / Reliability | OWASP Agentic ASI01–ASI10（Goal Hijack、Tool Misuse、Memory/Context Poisoning、Supply Chain、Inter-Agent Communication）、权限、输出验证、评测集、鲁棒性 | 15% |

- **多模态等热点**：不做独立雷达轴，用 `tags` 承载（如 `stateless-mcp` / `agent-plugins` / `owasp-asi`）。一级维度保持稳定，热点技术交给 tags。
- **Skills vs MCP 职责**：MCP 管「连接/工具」，Skills 管「程序性知识/工作流」，二者互补，不混为一谈。

### 已确认决策

| 决策点 | 选择 |
|--------|------|
| 产品定位 | 独立能力测评（不做考纲、不做认证背书） |
| 能力模型 | 6 维（上表），权重仅参考，MVP 按题等权计分 |
| 引擎形态 | 通用题库引擎，维度/标签模块化，未来可扩展 |
| 内容 | 前沿 AI 应用，考「场景判断」而非「定义记忆」 |
| 内容产出 | 手写种子题 ~90 题（general ≥30、professional ≥60，可跨层共享）+ validate 脚本；LLM 自动化后续再上 |
| 题型 | MVP 仅客观题：single / multiple / judge；schema 预留 open（实操题） |
| 判分 | 前端本地判分，纯静态，不动 `_worker.js`、不接 LLM API |
| 组卷 | 标准卷 20 题（筛查）+ 单维深度 10 题（主测评）；约束随机（硬约束每维≥2，软目标3） |
| 分层 | 单一题库 + `audience` 字段逻辑分层；入口自选「日常应用」/「工程能力」 |

### 分层设计（普通 / 专业）

- **单一题库 + `audience` 字段逻辑分层**（不做两套独立 JSON）：`audience: ["general","professional"]`，数组允许跨层共享（如「别把公司机密发给公网 AI」普通人、工程师都该懂）。
- **入口自选**：`QuizIntro` 两张并列卡片——「AI 日常应用能力（面向所有用户）」/「AI 工程构建能力（面向开发者/PM）」。
- **考点差异**：general 考「工具选择、提示词常识、隐私安全、幻觉识别、模型边界」，不考协议规范/系统架构；professional 考 6 维工程判断。
- **字段配合**：general 多为 basic/intermediate + understand/apply；professional 多为 intermediate/advanced + apply/analyze；tags 分层（daily-use/privacy vs stateless-mcp/owasp-asi）。
- **等级分层**：普通版「AI 新手/熟手/达人/高手/行家」；专业版「探索者/使用者/实践者/构建者/编排者」（定位文案见下方「文案与出题规范」）。
- **衔接（认知台阶）**：日常应用得分 >80 时结果页弹 CTA 引导进阶工程版；general 题埋专业概念的「通俗版」，进阶时形成顿悟。

### MVP 范围

- 通用题库引擎：6 维 → 约束随机组卷 → 判分 → 能力雷达 + 能力画像 → 错题本（含错因）→ 学习建议。
- 纯静态、零新增依赖。

### 数据 Schema（升级 1.2.0）

新文件 `frontend/public/ai-quiz-data/questions.json`：

```jsonc
{
  "schemaVersion": "1.2.0",
  "quizVersion": "2026-08-14",
  "updatedAt": "2026-08-14T00:00:00+08:00",
  "language": "zh",
  "title": "AI 应用能力测评",
  "dimensions": [
    { "id": "model-basics", "title": "模型与 AI 基础", "tagline": "LLM 能力、上下文、Token、幻觉、推理限制、适用边界", "icon": "microchip", "weight": 0.15,
      "advice": "建议系统了解大模型基本原理与局限性", "resources": [{ "title": "示例文档", "url": "https://example.com" }] },
    { "id": "prompt-context", "title": "Prompt / Context Engineering", "tagline": "指令设计、结构化输出、上下文组织、约束、任务拆解", "icon": "code", "weight": 0.15, "advice": "…", "resources": [] },
    { "id": "rag",           "title": "RAG 与知识增强", "tagline": "Embedding、检索、chunk、召回、rerank、grounding、时效", "icon": "book", "weight": 0.15, "advice": "…", "resources": [] },
    { "id": "agent",         "title": "Agent 与工作流编排", "tagline": "规划、工具使用、状态、循环、workflow、multi-agent、human-in-the-loop", "icon": "target", "weight": 0.20, "advice": "…", "resources": [] },
    { "id": "tools-skills-mcp", "title": "Tools / Skills / MCP", "tagline": "function calling、Skill 封装、stateless MCP、Agent Plugins", "icon": "wrench", "weight": 0.20, "advice": "…", "resources": [] },
    { "id": "eval-safety",   "title": "Eval / Safety / Reliability", "tagline": "OWASP Agentic ASI01–ASI10、权限、工具滥用、评测", "icon": "shield-03", "weight": 0.15, "advice": "…", "resources": [] }
  ],
  "sources": [
    { "id": "mcp-2026-07-28", "title": "MCP 规范 2026-07-28（stateless）", "publisher": "modelcontextprotocol.io",
      "url": "https://modelcontextprotocol.io/specification/2026-07-28", "tier": "primary", "retrievedAt": "2026-08-14" },
    { "id": "agentskills", "title": "Agent Skills 开放规范", "publisher": "agentskills.io",
      "url": "https://agentskills.io/", "tier": "primary", "retrievedAt": "2026-08-14" },
    { "id": "owasp-agentic-2026", "title": "OWASP Top 10 for Agentic Applications 2026", "publisher": "OWASP",
      "url": "https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/", "tier": "primary", "retrievedAt": "2026-08-14" },
    { "id": "agent-plugins", "title": "Agent Plugins 1.0（AWS 开源博客）", "publisher": "AWS",
      "url": "https://aws.amazon.com/blogs/opensource/aws-supports-agent-plugins-an-open-standard-for-portable-agent-extensions/", "tier": "primary", "retrievedAt": "2026-08-14" }
  ],
  "questions": [
    {
      "id": "q-tools-001",
      "dimension": "tools-skills-mcp",
      "type": "single",              // single | multiple | judge
      "difficulty": "intermediate",  // basic | intermediate | advanced
      "cognitiveLevel": "apply",     // remember | understand | apply | analyze
      "tags": ["stateless-mcp", "migration"],
      "volatility": "high",          // low | medium | high
      "audience": ["professional"], // general | professional（数组，可跨层共享）
      "prompt": "（场景化题干，避免「XX 是什么？」）",
      "options": ["…", "…", "…", "…"],
      "answer": 2,                   // single/judge → 下标；multiple → 下标数组 [0,2]
      "explanation": "（解释 + 为什么其他选项错）",
      "evidence": "（该题依据的关键事实断言，可附 ASI 编号）",
      "sourceIds": ["mcp-2026-07-28"],
      "lastFactCheckAt": "2026-08-14"
    }
  ]
}
```

- 复用 shrine 引用机制：顶层 `sources[]` 稳定 `id` + **锁版本**，题目 `sourceIds[]` + `evidence` 锚定事实。
- `judge` 题 `options` 固定 `["正确", "错误"]`，**约定 `answer` 0=正确、1=错误**（validate 校验顺序）；judge 易沦为背定义题，**总量 ≤ 8（≤10%），仅用于 analyze 层级**。
- `audience` 数组（`general`/`professional`）做普通/专业分层，逻辑分层而非物理分库；允许跨层共享（如数据脱敏题）。
- `type` 即扩展位：未来加 `open`（实操题）判分主流程不变，前端只做「提交 + 人工/后续 LLM 判分」占位，不假装本地判。
- 每个 `dimension` 带 `advice`（短板建议）+ `resources[]`（推荐阅读，优先链官方 changelog / OWASP）。
- `weight` 仅参考；MVP 按题等权计分，维度得分 = 该维 correct/total。
- `dimension.icon` 锁定白名单：`microchip / code / book / target / wrench / shield-03`（validate 校验）。
- 用户答题状态存 localStorage（版本化 key `ai-quiz-progress-v1`），`userQuizState` 结构与错因枚举见下方「用户答题状态 localStorage 结构」。

### 组卷与判分

- **两种模式**：标准卷 20 题（入口筛查）；**单维深度模式 10 题（主测评，每维深挖）**——回应「20 题 ÷ 6 维 ≈ 3 题/维，区分度接近噪声」。
- **分层入口**：用户先选「AI 日常应用能力」或「AI 工程构建能力」，组卷仅在对应 `audience` 题池中抽取（含跨层共享题）。
- **约束随机（放宽版）**：硬约束「每维 ≥ 2 题」、软目标「尽量向 3 题靠拢」；降级算法——先保证每维 2 题，剩余题数按维度权重随机分配；难度/认知配比（basic 20% / intermediate 50% / advanced 30%；remember 10% / understand 20% / apply 45% / analyze 25%）为**软目标**，不满足时优雅降级。支持 `?seed=` 复现同一套卷。
- **替代方案（后续）**：预生成多套带 seed 的固定标准卷，随机选套（组卷更稳、可复现）。
- **多选判分**：全对才给分（漏选/多选/错选均算错）。
- **等级（分层命名）**：普通版「AI 新手/熟手/达人/高手/行家」；专业版「探索者/使用者/实践者/构建者/编排者」，分值同档可调；**所有展示处强制显示「自测参考，非能力认证」**，描述用「本次测评中你的表现更接近…」而非「你已具备/已达到」（定位描述见下方「文案与出题规范」）。

### 前端改动

新增 `frontend/src/features/ai-quiz/`：

```
features/ai-quiz/
├── lib/scoring.js                 # 纯函数：约束随机组卷（硬约束+软目标+seed）+ 判分 + 维度得分 + 等级
├── composables/useQuiz.js         # 数据加载 + 状态机（intro→running→result）+ localStorage
└── components/
    ├── QuizIntro.vue              # 入口：标准卷(20)/单维深度(10) 模式
    ├── QuizRunner.vue             # 答题流：按 type 渲染、提交、反馈（解析 + 来源引用）
    ├── QuizResult.vue             # 能力画像 + 等级 + 雷达 + 条形 + 错题本(错因) + 学习建议
    └── RadarChart.vue             # 手写 SVG 雷达（6 轴）+ 横向条形，无图表依赖
```

修改现有文件：
- `frontend/src/app/router.js`：加 `/ai-quiz` 路由（懒加载）。
- 新增 `frontend/src/pages/AiQuiz.vue`：薄壳，沿用 MapZonePainter 模块头。
- `frontend/src/pages/AppList.vue`：加卡片，`AppIcon icon="microchip"`，名称「AI 应用能力测评」。
- `frontend/public/_redirects`：`/ai-quiz` 路由由现有 `/* → /index.html 200` 覆盖；数据 JSON 静态可达（shrine-data 先例）。仅当 JSON 被 SPA 回退吞掉时才加 `/ai-quiz-data/*`。

### 前端 UI 与组件布局配置方案

#### 设计定位

- **不是落地页**：`/ai-quiz` 首屏直接进入测评选择，不做营销 Hero；页面标题只承担模块识别和返回导航。
- **视觉基调**：沿用现有 2026 dark utility UI（`--bg-primary`、`--bg-card`、`--signal`、`--accent`、`--font-mono`、`AppIcon`），保持“应用终端/工具台”气质；不引入新的主色系统，不做证书、奖章、金榜等认证化视觉。
- **信息密度**：测评页是工作流界面，优先让用户快速选择、答题、复盘；卡片只用于入口选择、题目容器、结果模块和错题条目，不做卡片套卡片。
- **可信措辞**：所有分数、等级、画像都写成“本次自测参考”；页面上任何位置不得出现“认证”“通过”“达标”“胜任”等暗示官方背书的词。

#### 页面骨架

`frontend/src/pages/AiQuiz.vue` 作为薄壳页面，结构固定为：

```text
AiQuiz.vue
├── header.ai-quiz-header
│   ├── 返回 /applist
│   ├── MODULE // AI-QUIZ-01
│   ├── h1: AI 应用能力测评
│   ├── subtitle: LOCAL STATIC QUIZ / SCENARIO JUDGEMENT / NO CERTIFICATION
│   └── tags: STATIC / LOCAL SCORE / 2026-08
└── QuizShell.vue（或 useQuiz + 当前状态组件）
    ├── QuizIntro.vue
    ├── QuizRunner.vue
    └── QuizResult.vue
```

- 页面宽度：`width: min(100%, 1180px); margin: 0 auto;`，比 MapZonePainter 略窄，保证阅读舒服。
- Header 复用 MapZonePainter 的 `back-link / module-code / header-tags` 语义；移动端 header 改为纵向堆叠。
- 页面主体使用单层容器 `.quiz-workspace`，不再包一层 `.card`，避免页面区块卡片化。

#### UI 配置文件

新增 `frontend/src/features/ai-quiz/config/ui.js`，集中放纯展示配置，避免组件内散落 magic number：

```js
export const QUIZ_UI = {
  maxWidth: 1180,
  standardCount: 20,
  deepCount: 10,
  progressSegments: 20,
  staleRetestMonths: 3,
  resultBands: [
    { min: 0, max: 39, tone: 'weak' },
    { min: 40, max: 59, tone: 'basic' },
    { min: 60, max: 74, tone: 'steady' },
    { min: 75, max: 89, tone: 'strong' },
    { min: 90, max: 100, tone: 'expert' },
  ],
  dimensionIconMap: {
    'model-basics': 'microchip',
    'prompt-context': 'code',
    rag: 'book',
    agent: 'target',
    'tools-skills-mcp': 'wrench',
    'eval-safety': 'shield-03',
  },
}
```

- `QUIZ_UI` 只存 UI 常量，不存判分规则；判分和组卷仍归 `lib/scoring.js`。
- 图标必须来自 `AppIcon.vue` 已有映射；没有图标时先补映射或改用白名单内图标，不用临时 SVG。
- 颜色用 CSS 变量和少量语义 class（`tone-weak/basic/steady/strong/expert`），不在 JS 中硬编码色值。

#### 组件层级与职责

| 组件 | 职责 | 主要输入 | 主要输出/事件 |
|------|------|----------|---------------|
| `QuizIntro.vue` | 选择受众、卷型、单维深度维度；展示自测声明 | `dimensions`、`savedState` | `start({ audience, mode, dimensionId })`、`resume`、`clear-progress` |
| `QuizRunner.vue` | 答题主流程、进度、选项、提交后反馈、上一题/下一题 | `paper`、`currentIndex`、`answers` | `select`、`submit-current`、`next`、`prev`、`finish` |
| `QuestionCard.vue` | 单题题干、选项、解析、来源引用 | `question`、`selected`、`submitted` | `update:selected` |
| `QuizProgress.vue` | 顶部/侧栏进度，显示已答/总题、维度覆盖 | `paper`、`answers`、`currentIndex` | `jump(index)`（只允许跳到已解锁题） |
| `AudienceSwitch.vue` | 普通/专业入口的双卡选择 | `value` | `update:value` |
| `ModeSelector.vue` | 标准卷/单维深度切换 | `mode`、`dimensions` | `update:mode`、`update:dimensionId` |
| `QuizResult.vue` | 总分、等级、画像、维度雷达、错题本、学习建议 | `result`、`dimensions`、`answers` | `restart`、`review-question`、`start-deep` |
| `RadarChart.vue` | 手写 SVG 雷达 + 降级条形图 | `dimensionScores`、`dimensions` | 无 |
| `MistakeNotebook.vue` | 错题列表与错因自标 | `wrongAnswers` | `set-mistake-type` |

- MVP 可先不拆 `AudienceSwitch/ModeSelector/QuestionCard/QuizProgress/MistakeNotebook`，但布局和状态边界按上表预留。
- `QuizRunner` 不直接读 JSON，不直接写 localStorage；统一通过 `useQuiz.js` 暴露的状态和动作操作。
- `RadarChart` 不依赖第三方图表库，SVG 尺寸固定，移动端改为 `Radar + bars` 纵向堆叠。

#### 入口页布局（QuizIntro）

桌面端：

```text
┌─────────────────────────────────────────────┐
│ 自测声明 / 数据版本 / 题量说明               │
├───────────────────────┬─────────────────────┤
│ AI 日常应用能力         │ AI 工程构建能力       │
│ 面向所有用户             │ 面向开发者/PM         │
├───────────────────────┴─────────────────────┤
│ 卷型 segmented control: 标准卷 / 单维深度     │
│ 单维深度时显示 6 维横向 chips                 │
│ [开始测评] [继续上次] [清除进度]              │
└─────────────────────────────────────────────┘
```

- 双入口卡片使用 `grid-template-columns: repeat(2, minmax(0, 1fr))`，移动端变为单列。
- 受众选择卡片必须显示短标题 + 一句副标题 + 题目取样说明；不要显示长段教学文案。
- 卷型切换用 segmented control，不用两个大按钮；单维深度维度选择用 icon chips。
- `继续上次` 仅在 localStorage 有同版本未完成记录时显示；`清除进度` 使用次要按钮。

#### 答题页布局（QuizRunner）

桌面端采用 `main + aside` 两栏：

```text
┌────────────────────────────────────────────────────────┐
│ 顶部细进度条：第 8 / 20 题 · professional · standard    │
├──────────────────────────────────────┬─────────────────┤
│ QuestionCard                          │ Aside           │
│ - 维度/难度/tag/时效标记              │ - 6维覆盖        │
│ - 场景化题干                          │ - 已答列表        │
│ - 单选/多选/判断选项                  │ - 数据版本        │
│ - 提交后解析 + sourceIds              │ - 自测声明        │
│ - 上一题 / 提交 / 下一题              │                 │
└──────────────────────────────────────┴─────────────────┘
```

- `QuestionCard` 宽度优先，`aside` 固定 `280px`；小于 `960px` 时 aside 移到题卡下方。
- 选项按钮高度稳定，`min-height: 52px`，左侧显示 `A/B/C/D` 或判断图标；多选题用 checkbox 视觉，单选题用 radio 视觉。
- 提交前不展示答案；提交后显示“你的选择 / 正确答案 / 解析 / 来源”，并允许继续下一题。
- 高时效题在维度标签旁显示小型 `⚡` 或 `AppIcon icon="lightning"`，hover/title 为“本题依赖快速演进的技术规范”。
- 移动端底部固定操作条只放主要动作（提交/下一题），上一题放题卡底部，避免按钮挤压。

#### 结果页布局（QuizResult）

桌面端：

```text
┌────────────────────────────────────────────────────────┐
│ 时效提示横幅                                            │
├───────────────────────┬────────────────────────────────┤
│ 总分 + 等级卡片          │ 能力画像一句话                 │
├───────────────────────┴────────────────────────────────┤
│ RadarChart + 6维条形得分                                │
├────────────────────────────────────────────────────────┤
│ 学习建议：短板维度优先，官方资源链接                     │
├────────────────────────────────────────────────────────┤
│ 错题本：题目、你的选择、正确答案、解析、错因自标          │
└────────────────────────────────────────────────────────┘
```

- 总分卡片只显示数字、等级、非认证声明；不放奖杯、证书章、通过状态。
- 雷达图必须同时提供条形列表，避免 SVG 在移动端或读屏场景下承载全部信息。
- 错题本默认折叠到 3 条，提供“展开全部”；每条错题可自标错因，写回 localStorage。
- 学习建议按“最低维度 → 高时效错题 → advanced 错题较多”排序，不做 AI 生成分析。
- 结果页 CTA：`再测一次`、`进入单维深度`、`返回应用列表`；普通版分数 >80 时额外显示 `挑战工程构建能力`。

#### 状态与数据流

```text
questions.json
  ↓ fetch + html fallback 检测
useQuiz.js
  ├── intro: audience/mode/dimensionId/seed
  ├── running: paper/currentIndex/answers/submitted flags
  └── result: scoring summary/dimension scores/wrong answers/profile
      ↓
localStorage ai-quiz-progress-v1
```

- 数据加载失败时显示错误态 + 使用内嵌最小兜底题库（仅开发期可用）；正式发布前优先保证 JSON 静态可达。
- 每次选择答案、提交题目、标错因都持久化；完成后写入 `submittedAt`，再次进入默认显示结果摘要和“重新开始”。
- `?seed=` 只影响组卷，不影响用户选择；URL 中 seed 合法时优先于随机 seed。
- 如果 `schemaVersion` 或 `quizVersion` 变化，旧进度标记为不可继续，只允许查看历史摘要或清除重测。

#### 响应式断点

| 断点 | 布局规则 |
|------|----------|
| `>= 1180px` | 页面居中，答题页两栏，aside 固定宽度 |
| `960px - 1179px` | 两栏仍保留，缩小 aside，题卡保持最小 `minmax(0, 1fr)` |
| `< 960px` | 答题页改单列，进度组件下移，操作区保持可触达 |
| `< 640px` | 入口双卡单列，维度 chips 两列，结果页所有模块单列 |
| `< 480px` | 选项按钮全宽，题号/标签换行；按钮文字不得溢出 |

#### 交互与可访问性

- 所有按钮最小触控高度 `44px`；选项支持键盘焦点和 `Enter/Space` 选择。
- 单选/多选使用真实语义：`role="radiogroup"` / checkbox 语义，提交后解析区使用 `aria-live="polite"`。
- 进度条不仅用颜色表示状态，还要有文本：`已完成 8 / 20`。
- 错误、加载、空题库都要有明确状态页；空题库时提示“当前分层题量不足，无法生成测评卷”。
- 动画只用于页面切换和轻量 hover，尊重 `prefers-reduced-motion`。

#### 样式命名约束

- AI 测评私有样式统一前缀 `.ai-quiz-*` 或 `.quiz-*`，避免污染 Shrine / MapZonePainter。
- 不修改全局 CSS 变量；如需局部主题，在 `.ai-quiz-page` 下定义局部变量。
- 卡片圆角沿用 `var(--radius-lg)`（当前约 7px），工具按钮用 `var(--radius)`；不使用大圆角胶囊风格。
- 不使用渐变球、装饰插画、复杂背景；现有粒子背景已经足够，主体要保持可读。

#### 验收标准

- `/applist` 能看到「AI 应用能力测评」入口，点击进入 `/ai-quiz`。
- `/ai-quiz` 首屏可在 5 秒内理解并开始：选择受众、选择卷型、开始测评。
- 标准卷 20 题、单维深度 10 题均可完成；刷新页面后进度可恢复。
- 移动端 360px 宽度下无文字溢出、按钮重叠、题卡横向滚动。
- 结果页完整包含：总分、等级、非认证声明、能力画像、维度得分、错题本、学习建议、时效提示。
- 题目 JSON 被 Cloudflare SPA fallback 吞掉时，前端能识别 `text/html` 并进入兜底错误态，而不是抛出白屏。

#### 结果页内容规则

- **能力画像一句话**：**模板化生成**（非 AI 分析）——取正确率最高 2 维 + 最低 1 维 + 占比最高错因，套入 4 套模板（A/B/C/D，见下方「能力画像一句话」），强制带「仅供参考，建议复测确认」。
- **时效提示**：结果页加「本测评基于 2026-08 数据，MCP/Skills 变化快，建议 3 个月后复测」。
- **即将过期标记**：高 volatility 题用 subtle ⚡ 标记（hover 提示「本题依赖快速演进的技术规范」），结果页标注复查日期。
- RadarChart 6 轴固定按 `dimensions` 数组顺序渲染，避免卷次间轴序漂移。
- 学习建议可提示「你错的多为 advanced 题，属正常」，缓解高难度失分挫败感。
- **措辞克制**（样本量有限）：用「本次测评中 XX 维度表现偏弱，建议复测确认」，不做「你的 XX 能力 N 分」绝对断言。
- 错题本含**错因**（可选自标：概念混淆/场景判断错误/安全边界不足/工具选择错误/推理错误）。
- 学习建议直接链接官方 changelog 与 OWASP 页面。

### 校验 + CI

- 新增 `scripts/validate_quiz.py`（exit 0/1，镜像 validate_shrine.py）：
  - schemaVersion 1.1.0；6 个已知维度 id、id 唯一；sources id 唯一。
  - 题量 ≥ 60（目标 ~90）；id 唯一；**每维 ≥ 12**；`audience` 存在且为数组、长度 ≥1、元素 ∈ {general, professional}，且 **general 题 ≥ 30**；枚举合法（type/difficulty/cognitiveLevel/volatility）；`dimension.icon` 在白名单内。
  - 答案下标合法；judge 题 options 顺序固定 `["正确","错误"]`（0=正确）；`prompt`/`explanation`/`evidence` 非空；`sourceIds` 指向已知 source。
  - **事实复查按 `volatility` 分档**：low ≤ 365 天、medium ≤ 180 天、high ≤ 90 天，超出失败。
- 新增 `.github/workflows/quiz-validate.yml`：push（path 过滤）+ workflow_dispatch，跑 validate 做闸门。

### 测试

- 新增 `frontend/tests/quiz-scoring.test.mjs`（node:test）：约束随机组卷（每维≥2–3、软目标降级、seed 复现、无重复）、single/judge/multiple 判分、维度得分、等级边界、非法输入兜底。

### 内容可持续（演进路径）

```text
人工定义 6 维能力模型 → 建「事实锚点金标集」(source→evidence→question)
  → 手写 80 题种子 → LLM 生成候选题 → 自动结构校验 → 自动事实核查
  → 多模型交叉评审 → 人工只审金标差异 → 灰度上线 → 据真实答题数据做题目分析
```

- **事实锚点金标集优先**：先建 source→evidence→question；MVP 阶段**先手写 30 题金标题作为风格基准**，再考虑 LLM 扩写，避免 80 题风格漂移。
- **半衰期分层**：L1 长期稳定原理（2–5 年）为主干；L2 中期范式（1–3 年）；L3 工具/协议具体实现只能作「热点/更新题」。高 volatility 题强制 90 天复查 + 「下次必须更新」标记。

### 种子题示例（首批，来自 Grok 反馈，纳入 questions.json）

1. **tools-skills-mcp / single / intermediate / apply**：MCP 升级到 2026-07-28 stateless 后，跨调用状态最稳妥迁移 = 改 server-minted handle 作普通 tool 参数（答案 B）。
2. **tools-skills-mcp / single / intermediate / analyze**：一次打包、跨 Claude/Cursor/VS Code 等客户端复用 = 用 Agent Plugins 1.0 把 Skills+MCP 打成 plugin.json（答案 B）。
3. **eval-safety / multiple / advanced / analyze**：多 Agent + MCP 调外部工具 + 持久记忆，属 OWASP Agentic Top 10 高风险项 = Goal Hijack / Tool Misuse / Memory Poisoning（答案 [0,1,2]，普通幻觉非 Agentic 特有）。
4. **agent / judge / intermediate / apply**：MCP 2026-07-28 长任务需用户确认时，用 InputRequiredResult + MRTR 重试而非长连接（答案 正确）。
5. **eval-safety / single / advanced / analyze**：Skill 含可执行脚本且无沙箱、无 provenance 检查 → 典型 ASI04 供应链攻击（答案 B）。

普通人版示例（来自「分层」反馈，纳入 questions.json）：

6. **model-basics / single / basic / understand（general+professional）**：让 AI 写财报总结却给出你未提供的「真实」数据 → 幻觉，必须人工核对（⚠️ sourceIds 应引通用模型文档，**非 MCP 规范**，实现时补 sources）。
7. **prompt-context / multiple / intermediate / apply（general）**：中文说明翻译成地道英文 → 给受众背景 + 多版本对比 + 参考示例（多选）。
8. **eval-safety / single / basic / apply（general+professional）**：日志含客户姓名手机号，需 AI 分析报错 → 先脱敏再发送。

### 文案与出题规范（内置内容）

> 来源：多轮外部评审（Kimi 文案/出题规范 + 普通人分层反馈）。用户可见中文文案与 80 题出题规范，实现 UI 与编写题目时直接采用。

#### 零、分层文案（普通 / 专业）

##### 入口卡片（QuizIntro）

- 卡片 A：「AI 日常应用能力」——副标题「面向所有用户，测测你用 AI 提效的姿势对不对」
- 卡片 B：「AI 工程构建能力」——副标题「面向开发者/PM，测测你对 Agent、RAG、MCP 的技术判断力」

##### 普通人版等级定位（general，0–100）

| 等级 | 分值 | 定位描述 |
|------|------|----------|
| AI 新手 | 0–39 | 刚开始用 AI，主要在摸索。当前重点是建立「AI 会说错话」的认知，学会验证输出，而非追求「一次答对」。 |
| AI 熟手 | 40–59 | 能用 AI 完成日常写、译、总结，开始有意识地写提示词。建议学会给 AI 明确的背景与约束。 |
| AI 达人 | 60–74 | 能把 AI 用得顺手，懂得选对工具、给对上下文。下一步是让 AI 稳定输出你要的结构。 |
| AI 高手 | 75–89 | 能用 AI 明显提效，并注意隐私与边界。可尝试把 AI 接入自己的工作流。 |
| AI 行家 | 90–100 | 你已把 AI 融入日常，用得克制又高效。可挑战「工程构建能力」版，理解这些工具底层怎么运作。 |

专业版等级沿用「探索者/使用者/实践者/构建者/编排者」（见 2.1）。

##### 分层措辞原则

- 普通人版学习建议**不出现术语**：不说「RAG 召回率低」，说「你可能还不太擅长让 AI 结合特定文档回答问题」。
- 普通人版建议链接科普文（如《如何写好提示词》）；专业版链接官方 changelog / OWASP。
- 普通人版错因标签可更接地气（如「被 AI 幻觉骗了」「不知道这个工具」「泄露了隐私」），存储值沿用 6 类枚举，仅展示文案分层。

#### 一、用户答题状态 localStorage 结构（userQuizState）

版本化 key：`ai-quiz-progress-v1`。结构：

```jsonc
{
  "sessionId": "uuid",
  "mode": "standard|deep",
  "dimensionId": "agent",            // deep 模式时
  "seed": 42,
  "answers": [
    { "qId": "q-001", "selected": [1], "isCorrect": false,
      "mistakeType": "scenario-misjudgment" }  // 用户自标，可空
  ],
  "submittedAt": "2026-08-14T10:00:00+08:00"
}
```

错因标签枚举（存储值）：`concept-confusion` / `scenario-misjudgment` / `security-gap` / `tool-mismatch` / `reasoning-error` / `other`。

#### 二、中文产品文案（可直接采用）

##### 2.1 五等级定位描述（结果页等级卡片）

> 统一前缀（等级名称下方必须显示，字号 ≥ 等级名称 60%）：
> `以上仅为本次自测参考，不构成能力认证。`

| 等级 | 分值 | 定位描述 |
|------|------|----------|
| **探索者** | 0–39 | 你正在建立对 AI 应用的基础感知。当前阶段的重点是拓宽视野——了解大模型能做什么、在什么条件下会失效，不必急于深入某一技术细节。 |
| **使用者** | 40–59 | 你已具备日常调用 AI 工具的基本意识，能够完成简单的提示词交互。接下来建议在真实工作流中刻意观察模型的边界与失效模式，而非只关注「答对了」的结果。 |
| **实践者** | 60–74 | 你能够将 AI 能力对接具体场景，在 Prompt 设计、工具选择或 RAG 搭建中做出初步判断。继续精进的方向是「系统化」：让零散经验变成可复用、可调试的工作流。 |
| **构建者** | 75–89 | 你已具备搭建 AI 应用系统的能力，能在 Agent 编排、MCP 集成或安全评估中做出权衡。下一步可关注多 Agent 协作中的复杂状态管理、异常回退与权限隔离。 |
| **编排者** | 90–100 | 你对 AI 应用全栈有较为系统的把握，能在模型、工具、安全与评测之间做全局决策。保持优势的方法是持续跟踪协议演进（如 MCP/Skills 的 changelog）与新型攻击面，而非停留于当前得分。 |

##### 2.2 「能力画像一句话」模板（模板化生成，非 AI 分析）

生成逻辑：取**答对率最高的 2 维 + 答对率最低的 1 维 + 占比最高的错因（若自标）**套入模板；未自标错因则省略错因部分。

**模板 A（有强有弱，最常见）：**
> 本次测评中，你在「{维度名}」与「{维度名}」的相对表现较好；主要失分集中在「{维度名}」，错因以「{错因标签}」为主——这通常意味着你对该领域的**场景约束**（如上下文长度、安全边界、版本差异）还需加强。  
> ——以上仅为基于 {N} 题的粗略画像，受题目随机性影响较大，建议通过单维深度模式复测或结合实操项目确认。

**模板 B（各维度较均衡，无显著短板）：**
> 本次测评显示你的各维度表现较为均衡，未出现明显偏科，但在「{错因标签}」类错误上仍有零星失分。建议保持广度学习的同时，挑选一个最感兴趣的方向做深度实践。  
> ——样本量有限，结果仅供参考，不构成能力认证。

**模板 C（全面偏弱）：**
> 本次测评显示各维度均有提升空间，其中「{错因标签}」类错误占比最高。建议从「{维度名}」的基础概念与典型失效模式入手，优先建立「模型会犯错」的基准认知，再逐步深入。  
> ——20 题覆盖 6 个维度，单维度题量有限，不宜作为能力绝对排序的依据。

**模板 D（高分）：**
> 本次测评中你在多数维度表现稳定，仅在「{维度名}」的「{错因标签}」类题目上出现零星失分。可针对性关注该领域的进阶场景与前沿协议变更。  
> ——高分不等于全栈精通，建议通过实际项目或开源贡献验证。

##### 2.3 结果页时效提示与样本量措辞

**时效提示（固定横幅，结果页顶部）：**
> ⚠️ 本测评基于 2026 年 8 月的技术现状与事实锚点。AI 领域协议（如 MCP/Skills）与安全威胁（如 OWASP Agentic Top 10）更新较快，部分高时效性题目已标注「即将过期」，建议 3 个月后复测以获取最新反馈。

**样本量有限措辞（维度得分下方小字）：**
> 本卷「{维度名}」共 {N} 题，样本量较小，且受本次抽题随机性影响，该维度得分不宜解读为绝对能力水平。若该维度对你关键，建议使用「单维深度模式」复测。

**总分下方必须显示：**
> 本次测评共 {N} 题，按题等权计分。得分仅为自测参考，不代表行业认证或岗位胜任力评估。

##### 2.4 六维度学习建议（写入 dimensions[].advice）

| 维度 | 学习建议文案 |
|------|-------------|
| 模型与 AI 基础 | 重点理解「模型能做什么」的边界，而非「模型是什么」的定义。建议从上下文窗口的实际限制、幻觉的不可消除性、概率性输出的置信度解读三个方向入手，观察主流模型在相同任务上的差异表现。优先阅读官方 API 文档的「限制与最佳实践」章节。 |
| Prompt / Context Engineering | 从「写提示词」转向「设计上下文结构」。重点学习：系统消息与用户消息的分工、少样本示例的格式一致性、长上下文中的信息丢失（中间位置效应）、以及如何通过约束条件（如 JSON Schema）控制结构化输出。建议用同一复杂任务对比 3 种不同上下文组织方式的输出稳定性。 |
| RAG 与知识增强 | 关注「检索」到「生成」之间的信息损耗。重点理解：Embedding 模型的语义偏差、Chunk 策略对召回率的影响、Rerank 的作用边界、以及 Grounding 与纯生成的可信度差异。建议搭建一个最小 RAG 系统，分别测试不同 Chunk 大小和 Top-K 配置下的答案准确率。 |
| Agent 与工作流编排 | 从「调用工具」升级到「管理状态」。重点学习：ReAct / Plan-and-Execute 等规划模式的适用边界、工具调用失败时的回退策略、多 Agent 通信中的权限与消息格式、以及 Human-in-the-Loop 的介入时机。建议用一个具体业务场景（如自动审批）画出完整的状态流转图。 |
| Tools / Skills / MCP | 把工具当作「接口契约」而非黑盒。重点理解：Function Calling 的 Schema 设计原则、MCP stateless 迁移对状态管理的影响（server-minted handles / MRTR）、Skill 封装中的渐进式披露（Progressive Disclosure）、以及 Agent Plugins 的跨客户端复用机制。建议阅读 MCP 官方 changelog，对比 stateful 与 stateless 版本的工具调用流程差异。 |
| Eval / Safety / Reliability | 建立「攻击者视角」。重点学习：OWASP Agentic ASI01–ASI10 中 Goal Hijack、Tool Misuse、Memory Poisoning 的具体触发条件、输出验证（Output Validation）与输入过滤的区别、以及供应链攻击（ASI04）在 Skill / MCP 插件中的表现形式。建议针对一个 Agent 工作流，逐一排查 ASI01–ASI10 中的高风险项。 |

##### 2.5 错题本「错因」标签（用户自标，可选）

| 存储值 | 用户可见文案 | 适用场景提示 |
|--------|-------------|-------------|
| `concept-confusion` | **概念混淆** —— 我知道相关概念，但把 A 和 B 的特性/适用场景搞混了 | 如：把 RAG 的召回率与重排序的作用搞混 |
| `scenario-misjudgment` | **场景判断错误** —— 我对概念有印象，但没看出这道题的真实场景约束 | 如：没注意到上下文长度限制或安全边界 |
| `security-gap` | **安全边界不足** —— 我忽略了权限、攻击面或异常处理，选了「看起来能用」但「实际上有风险」的选项 | 如：选了无沙箱的 Skill 方案 |
| `tool-mismatch` | **工具选择错误** —— 我在 Function Calling、MCP、Skill 或 RAG 组件之间做了错误匹配 | 如：该用 stateless handle 却选了长连接 |
| `reasoning-error` | **推理错误** —— 我理解了题干和选项，但在逻辑推导或因果链条上出现了跳跃/遗漏 | 如：忽略了「全对才给分」的约束 |
| `other` | **其他 / 还没想清楚** —— 暂时无法归类，或是因为粗心 | — |

#### 三、出题规范（80 题写作指南）

##### 3.1 选题三铁律

1. **必须有场景**：题干必须包含「谁在什么情境下要做什么」。去掉选项后，若题干变成「以下关于 XX 的说法正确的是」，必须重写。
2. **必须依赖判断**：不能通过背诵某句话/某个名词定义直接锁定答案。不知道选项也能猜出考点的，优先怀疑是差题。
3. **干扰项必须可信**：每个错误选项必须对应真实项目中的一种 plausible mistake，禁止荒谬干扰项（如「因为 AI 有了自我意识所以选 A」）。

##### 3.2 场景化题干写法

推荐公式：`[角色/系统] + [具体情境/约束] + [明确目标或已出现的异常] + [需要做出的判断]`

- 题干（不含选项）80–150 字。过长增加阅读负担，过短往往场景不足。
- 绝对禁忌：❌「以下关于 X 的说法，正确的是」；❌「下列哪项是 RAG 的核心组件」；❌「在理想情况下/不考虑任何限制时…」（消解了场景约束）。

合格改写对照：
- ❌ 差：「MCP 2026-07-28 的 stateless 规范中，MRTR 的全称是什么？」
- ✅ 好：「你正在将一个基于 MCP 旧版长连接实现的 Weather Server 迁移到 2026-07-28 stateless 规范。该 Server 之前依赖会话状态在多次调用间保持用户选定的城市偏好。迁移后，最稳妥的做法是？」

##### 3.3 干扰项写法（每道至少覆盖 2 种有效类型）

| 类型 | 说明 | 示例 |
|------|------|------|
| 时序/版本混淆 | 把旧版行为、已弃用方案当作当前最佳实践 | MCP stateless 题里出现「用 SSE 长连接保持会话状态」 |
| 边界过度推广 | 把「某场景有效」推广为「所有场景都有效」 | 「RAG 能缓解幻觉 → 用了 RAG 就能消除幻觉」 |
| 因果倒置 | 把结果当原因，或把伴随现象当根本原因 | 「Agent 调错工具，是因为 temperature 太高」 |
| 正确但不相关 | 选项本身对，但不解决题干具体问题 | 题干问「多 Agent 通信防篡改」，选项给「JSON Schema 校验输出」（对但非通信安全） |

禁用干扰项：❌ 明显荒谬（无需理解考点即可排除）；❌ 无关常识（与 AI 应用无关的真命题）。

##### 3.4 认知层级（cognitiveLevel）体现

| 层级 | 占比目标 | 题干特征 | 选项特征 |
|------|---------|---------|---------|
| remember | ≤10% | 尽量避免，仅作更高层题目的基础信息 | — |
| understand | ~20% | 呈现现象/结果，要求选「背后原理/原因」 | 选项是「为什么」 |
| apply | ~45% | 给场景+目标，要求选「最佳操作/方案」 | 选项是具体动作/策略/架构选择 |
| analyze | ~25% | 给复杂系统/失败案例/多方约束，要求选「根因/最高风险点」 | 选项是诊断结论/风险评级 |

句式示例：understand「…出现 XXX 现象，最可能的原因是」；apply「…在这种情况下，你首先应该」；analyze「…系统上线后频繁出现 XXX，最可能的根因是」。

##### 3.5 好题 / 差题对照（3 组）

**对照 1（tools-skills-mcp / apply）**
- ❌ 差：「MCP 2026-07-28 stateless 规范中，server-minted handle 的主要作用是？」（A 加密 / B 传状态 / C 替代 OAuth / D 压缩参数）——纯定义，无场景。
- ✅ 好：「你维护一个基于 MCP 的代码审查 Agent，需跨多次工具调用跟踪『审查到第几行』。团队决定升级到 stateless 规范，担心状态丢失。最符合 stateless 核心原则的做法是？」（A 本地全局变量 / B 每次调用传行号、Server mint 新 handle、下次携带 / C 保留旧长连接 / D 用户每次手动输入行号）——有场景、有动机、考迁移实践而非定义。

**对照 2（eval-safety / analyze）**
- ❌ 差：「OWASP Agentic ASI04 对应哪种攻击？」——纯编码对应，背表格即可。
- ✅ 好：「你在内部知识库发现一个社区贡献的 Skill，可自动执行 shell 清理临时文件，但无签名、无 provenance、无沙箱，接入了一个已有文件系统权限的 Agent。这最符合 OWASP Agentic Top 10 2026 哪项？」（A ASI01 / B ASI02 / C ASI04 / D ASI07）——有发现过程、有权限上下文，考 ASI04「不可信第三方组件」本质。

**对照 3（agent / analyze）**
- ❌ 差：「关于 ReAct 的说法正确的是？」——定义原文 + 荒谬干扰项。
- ✅ 好：「客服 Agent 用 ReAct 处理退款。Thought 推断要查订单，Action 因工具描述笼统误调了『取消订单』。最能在根因上降低此类错误的是？」（A 增加重试 / B 优化工具描述与 JSON Schema / C 换 Plan-and-Execute / D 每次加人工确认）——有失败案例、有后果，考「描述不清」与「架构模式」的根因权衡。

##### 3.6 题目自检清单（每题提交前必检）

1. 场景检验：题干有具体角色/情境/约束，去掉选项仍是完整问题？
2. 反背诵检验：背过定义/原文仍可能选错？（期望：是）
3. 干扰项检验：每个错误选项对应真实会犯的错误，无荒谬项？
4. 互斥检验：选项之间有明确互斥/优劣对比？
5. 锚点检验：至少锚定 1 个 sourceId + 1 条可追溯 evidence？
6. 多选陷阱检验：多选题是否存在「部分正确」干扰？（本测评多选全对才给分）
7. 长度检验：题干 ≤150 字、选项 ≤30 字？
8. 时效检验：依赖的技术假设是否已过期？volatility 标注是否准确？
9. 经验检验：不背定义但有 3 个月 AI 项目经验的人，能否靠场景推理答对？
10. 答案唯一检验：正确答案依据充分，无「某些条件下另一选项也成立」争议？

### 后续规划（本次不做）

- grok/gemini/gpt 或 DeepSeek 自动搜索+出题管线（多模型审核、事实核查、人工抽检、灰度）。
- 题目统计（p-value、区分度、选项分布）——需真实用户量。
- `/api/quiz/grade` Worker 端点与 AI 判分实操题。
- 快速模式（10 题）、预生成固定卷、按错因定向出题、认证/证书化、用户系统、排行榜。
