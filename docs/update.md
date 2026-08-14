# AI 应用能力测评 · 优化方案（调研结论 + 推荐方案）

> 日期：2026-08-14
> 性质：**设计文档，不包含代码改动**。对应两个已确认的问题：
> 1. 面向普通人的题库太简单，答案一眼看出；
> 2. 题库全部塞在单个 `questions.json`，无法支撑未来 ~1000 题的规模。
>
> 检索方式：GitHub MCP（仓库 / 代码检索 + 目录结构比对）。

---

## 一、问题一：普通人题库太简单

### 1.1 诊断（基于现有 questions.json 的事实）

- 普通人题 `q-gen-001..035` 共 **35 题**，其中 **25 题 basic（约 71%）**，10 题 intermediate，0 题 advanced。
- 大量干扰项是「明显荒谬」的选项：如「把字体变小」「删除所有错误提示」「把请字重复三遍」「换成更有创意的语气」「把 SQL 字体变小」。
- 结果：正确答案几乎总是「唯一一个非荒谬选项」，答题者不需要判断，只需排除掉笑话选项。
- 这直接违反 todo.md 的硬规则：「不测名词测判断」「干扰项必须可信，每个错误选项必须对应真实会犯的错误」。
- 次要发现：general 里有 3 道 judge 题（`q-gen-008/019/033`）是 basic/apply 层级，违反 todo.md「judge 仅用于 analyze 层级、总量 ≤8」的约束——judge 题天然容易沦为「背常识」题，general 里更该少用。

### 1.2 根因

| 根因 | 说明 |
|------|------|
| 干扰项卡通化 | 错误项是「谁都不会选的错」，而非「真实用户会踩的坑」 |
| 正确答案 = 唯一安全项 | 题干没有「两难/权衡」，答案是一眼可辨的「标准正确姿势」 |
| 场景缺约束与代价 | 没有时间/成本/合规/受众约束，也没有「选错会怎样」的后果，导致判断难度归零 |
| 难度与认知层级失衡 | general 被误解为「弱智题」；场景可以日常，判断必须有难度 |

### 1.3 外部参考（GitHub 检索结论）

GitHub 上 MCQ 相关项目集中在「自动生成干扰项」（`Question-MCQ-_Answer_Generation`、`MCQGeneratorAnki`、`AutomatedDistractors` 等），共同点印证了一个核心结论：

> **MCQ 的区分度几乎完全由干扰项质量决定**。这些项目把「生成 plausible 的错误项（distractor）」当作独立难题来做，而不是「凑够 4 个选项」。

这反过来说明：当前题目的问题不在题干，而在干扰项——**干扰项必须达到「半对半错、有经验的人也可能选」的可信度**。

### 1.4 推荐方案：重写干扰项 + 加深场景（不动考点、不动 schema）

**原则**：保留现有考点和 schema，只做两件事——把荒谬干扰项换成可信错误，给题干加约束与代价。

**A. 干扰项重写四类模板（来自 todo.md 3.3，落到 daily-use 场景）**

| 类型 | 含义 | daily-use 示例（替换「明显荒谬」项） |
|------|------|-----------------------------------|
| 半对半错 | 真实用户会信的错误认知 | 「平台承诺『不用于训练』，所以直接发没关系」 |
| 过度推广 | 某场景有效 → 所有场景有效 | 「截图比文字更安全」→ 图片同样被上传处理 |
| 正确但不相关 | 选项本身对，但不解决题干问题 | 问隐私时给「把手机号放到提示词最后」 |
| 因果倒置 | 把伴随现象当根本原因 | 「换个问法就对了」 |

**B. 场景加深两招**

1. **加约束**：时间 / 成本 / 合规 / 受众 / 设备，让「通用正确做法」不再唯一。
2. **加代价**：写清「选错会发生什么」，让选项之间出现真实的优劣权衡。

**C. 难度分布重调（配合 audience）**

- general 的 basic 占比从 ~71% 降到 ~30%，以 intermediate 为主；
- general 的认知层级以 apply（给场景选方案）为主，减少 understand（只问原因）。

**D. 改写对照（2 例，取自现有题）**

**例 1：q-gen-003（脱敏）—— 原答案一眼看出**

> 原题干：公司服务器报错日志含客户姓名手机号，想让 AI 分析报错原因，最稳妥做法？
> 原选项：A 直接发送（平台承诺不训练）/ B 先脱敏 / C 只用免费版 / D 截图更安全
> 问题：B 太明显，A/C/D 一眼排除。

改写后（每个干扰项对应一个真实误区）：

- A「直接发送——主流平台都承诺『不将用户数据用于训练』，日志又不涉密」
- B「先脱敏或用合规内部环境处理」✅
- C「只保留手机号以便定位用户，删掉姓名和订单号」（半脱敏，看似谨慎但不够）
- D「把日志打包成加密压缩包再上传，加密后服务端无法读取」（对『传输加密』有误解）

**例 2：q-gen-002（财报幻觉）—— 加入代价与两难**

> 原题干：让 AI 写未上传的某公司财报摘要，它给出具体数字，最合理下一步？
> 原选项：A 直接采用 / B 复制进报告再核对 / C 视为幻觉人工核对 / D 再问一次确保真实
> 问题：C 是唯一「稳妥」项。

改写方向：题干加入「这是季度董事会材料，明天要交」，选项改为：

- A「训练数据通常包含公开财报，可直接引用并标注来源」
- B「先复制进报告初稿，会后让同事顺手核对」❌（错在『顺序』——先引用后核对）
- C「视为可能幻觉，用官方财报核对后才使用」✅
- D「再问一次『请确保数据真实』，它坚持就说明可靠」❌（真实用户会信的自证陷阱）

---

## 二、问题二：题库可扩展性（支撑 1000 题）

### 2.1 诊断

- 现状：83 题 = 2663 行单文件 `questions.json`。按此比例，1000 题 ≈ **3.2 万行 / 数百 KB~1MB**。
- 当前前端 [useQuiz.js](frontend/src/features/ai-quiz/composables/useQuiz.js) 在 `loadData()` 里 `fetch('/ai-quiz-data/questions.json')` **一次性加载全部题目**，而实际只需用其中 20/10 题。
- 带来的问题：

| 维度 | 单文件的问题 |
|------|------------|
| Git | 所有新增/修改题都改同一文件，冲突频繁，无法按维度/受众独立 review |
| 编辑 | 在 3 万行里定位某一道题困难 |
| 校验 | `validate_quiz.py` 必须全量解析，慢且失败无定位 |
| 运行时 | 前端拉整份 JSON，用户只用 20 题，浪费带宽与首屏时间 |
| 维护 | 维度/受众分布统计需全量读，无法快速出报表 |

### 2.2 外部参考（GitHub 检索结论）

**参考 A：Open Trivia Database（OpenTDB）** —— 数千题的公开题库范本（[api-evangelist/open-trivia](https://github.com/api-evangelist/open-trivia)）

- 用 `category + type + difficulty` 三类元数据做**服务端过滤**，用 session token 去重。
- 启示：**选题靠元数据，正文按需下发**。本项目是纯静态、无服务端，等价替代是「元数据索引 + 前端本地筛选」。

**参考 B：typeofnan-javascript-quizzes** —— 100+ 题的 JS 题库站（[nas5w/typeofnan-javascript-quizzes](https://github.com/nas5w/typeofnan-javascript-quizzes)）

- `content/questions/` 目录**一题一文件**（markdown + frontmatter），构建期聚合。
- 启示：**内容拆成小文件，彻底消除合并冲突**；缺点是它依赖构建期聚合，而本项目 `public/` 的 JSON 是直接静态服务的，需权衡。

### 2.3 推荐方案：manifest 索引 + 内容分片 + 按需懒加载

**核心思路**：把「用于组卷的元数据」与「用于展示/判分的正文」分离——索引永远小、全量加载；正文按选中 id 懒加载。这正好契合现有 [scoring.js](frontend/src/features/ai-quiz/lib/scoring.js) 的 `buildPaper` 只依赖 `id/dimension/audience` 的事实。

**目录结构草案**

```
ai-quiz-data/
├── manifest.json              # 索引（小）：schema/version/dimensions/sources + 每题元数据（含 file 指针）
└── questions/
    ├── general/001.json       # 每片 ≤100 题正文
    ├── general/002.json
    ├── professional/001.json
    └── shared/001.json        # audience 含 general+professional 的跨层共享题
```

**manifest.json 草案**（只放元数据，无正文）

```jsonc
{
  "schemaVersion": "1.3.0",
  "quizVersion": "2026-08-14",
  "dimensions": [ /* 同现状 */ ],
  "sources":    [ /* 同现状 */ ],
  "questions": [
    {
      "id": "q-gen-003",
      "dimension": "eval-safety",
      "audience": ["general", "professional"],
      "difficulty": "basic",
      "cognitiveLevel": "apply",
      "volatility": "low",
      "tags": ["privacy", "daily-use"],
      "sourceIds": ["owasp-agentic-2026"],
      "file": "questions/general/001.json"   // 正文所在分片
    }
  ]
}
```

**分片文件草案**（只放正文，id 作为主键）

```jsonc
{
  "file": "questions/general/001.json",
  "questions": [
    {
      "id": "q-gen-003",
      "prompt": "…",
      "options": ["…", "…", "…", "…"],
      "answer": 1,
      "explanation": "…",
      "evidence": "…"
    }
  ]
}
```

**分片策略选择**：一级按 `audience`（general / professional / shared），二级按固定批次（每片 ≤100 题）。理由：

- 运行时懒加载最自然——选了 general 就只拉 `general/*` + `shared/*`；
- 批次固定大小，1000 题 = 10 个 general 片 + 若干 professional 片，文件数量可控、可直接静态服务，无需构建期聚合。

**前端改动点（精确到现有 seam，改动小）**

| 现有代码 | 改动 |
|---------|------|
| `useQuiz.js` `loadData()` 单次 fetch questions.json | 改为 fetch `manifest.json`（轻量），存 `data.meta` |
| `startQuiz()` 里 `buildPaper({ questions: data.questions })` | `buildPaper` 改在 manifest 的 `questions` 元数据上做约束随机（只依赖 id/dimension/audience） |
| 新增 `hydratePaper(ids)` | 按选中 id 的 `file` 字段去重 → 并行 fetch 涉及分片 → 合并正文 → 填回 paper |
| `resumeQuiz()` 用 `paperIds` 找回完整题 | 走同一条 `hydratePaper` 路径（按 file 分组 fetch） |
| `scorePaper()` / `isAnswerCorrect()` | **不变**（hydrate 后 paper 已带 answer） |

约束保持不变：纯静态、零新增依赖、不动 `_worker.js`；多文件 fetch 与现状「fetch 静态 JSON」完全一致，`_redirects` 的 SPA 回退处理沿用。

**作者工作流（作者不手写 manifest，由脚本生成）**

- 作者只在 `questions/**/*.json` 分片里写题。
- 新增 `scripts/build_quiz_manifest.py`：扫描分片 → 从正文里抽元数据字段 → 生成 `manifest.json` 的 `questions` 数组。
- `scripts/validate_quiz.py` 升级：遍历分片 + 校验 manifest 与分片一致（id 全局唯一、sourceIds 有效、file 指向存在、audience/dimension 枚举合法、难度/认知配比统计）。

### 2.4 迁移路径（3 步，可灰度）

1. **先拆文件、保持全量加载**：把 questions 拆到 `questions/{general,professional,shared}/*.json`，`useQuiz` 改成并发 fetch 所有分片再 `concat`。改动最小，先解决 Git/编辑/校验问题。
2. **引入 manifest 索引 + 懒加载正文**：组卷只靠元数据，正文按选中 id 懒加载，解决运行时加载。
3. **脚本化 + CI 闸门**：`build_quiz_manifest.py` + `validate_quiz.py` 升级，纳入 GitHub Actions（path 过滤 questions/）。

### 2.5 替代方案对比

| 方案 | 优点 | 缺点 | 结论 |
|------|------|------|------|
| per-dimension 文件（6 个） | 语义清晰 | 单一维度可达 300 题仍过大；跨维共享/统计不便 | 不推荐 |
| per-audience 文件（3 个） | 与入口对齐 | professional 可达 600 题，单文件仍大 | 作为一级切分，配二级批次 |
| **per-audience × 固定批次（推荐）** | 文件小且数量可控，懒加载自然 | 需 manifest 索引 | ✅ 采用 |
| 一题一文件（typeofnan 模式） | 冲突彻底消除 | 需构建期聚合，与「public 直接静态服务」不符 | 备选，若后续要极细 review 粒度再上 |

---

## 三、参考来源

- [Open Trivia Database（api-evangelist/open-trivia）](https://github.com/api-evangelist/open-trivia) —— 数千题题库的 category/difficulty/type 元数据模型
- [typeofnan-javascript-quizzes（nas5w）](https://github.com/nas5w/typeofnan-javascript-quizzes) —— 一题一文件的 content 目录模式
- [Question-MCQ-_Answer_Generation（FawziElNaggar）](https://github.com/FawziElNaggar/Question-MCQ-_Answer_Generation) —— 干扰项作为独立难题的佐证
- [AutomatedDistractors（manucharanreddy04）](https://github.com/manucharanreddy04/AutomatedDistractors) —— 同上，plausible distractor 是 MCQ 难点

## 四、实施记录（2026-08-14）

已按本方案执行，决策与落地如下：

| 决策点 | 结果 |
|--------|------|
| 分片大小 | 每片 ≤100 题（当前 general/professional/shared 各 1 片） |
| manifest 维护 | 手动维护（作者手写索引，无 build 脚本） |
| 拆分深度 | 完整版：manifest 索引 + 分片 + 按 id 懒加载正文 |
| 问题一重写范围 | 先 5 题风格基准（`q-gen-005/010/012/024/032`），待确认后再批量 |

已改动：

- 数据：删除 `questions.json`，新增 `manifest.json` + `questions/{general,professional,shared}/001.json`（schemaVersion 1.3.0）
- 前端：`useQuiz.js` 改为加载 manifest + `hydratePaper` 按 file 懒加载分片
- 测试：`quiz-scoring.test.mjs` 改为读取 manifest + 分片合并，新增完整性用例
- 校验：新增 `scripts/validate_quiz.py`（exit 0/1）
- 文档：README 更新题库结构与扩展流程

验证：`npm --prefix frontend test` 14/14 通过；`npm --prefix frontend run build` 成功；`python scripts/validate_quiz.py` 通过（2 个维度题量告警）。

续做（2026-08-14 第二轮，已完成）：

- [x] 剩余 general 题批量重写（24 道，`q-gen-034` 本身合格保留）
- [x] 重写 5 道 shared 题（`q-gen-001/002/003/008/014`）+ 10 道非 q-gen 共享题（`q-agent-002/004`、`q-model-002/004`、`q-prompt-001..004`、`q-rag-004`、`q-safety-004`）
- [x] 补 5 道新题（`q-rag-005..008` + `q-tools-005`），rag 与 tools-skills-mcp 均补到 12
- [x] 重写 8 道专业基础题的卡通干扰项（`q-agent-001`、`q-rag-001/002`、`q-safety-001/002/003`、`q-tools-002/004`）
- [x] 新增 `.github/workflows/quiz-validate.yml` CI 闸门

最终验证：validate 通过（88 题、无维度告警）；test 14/14；build 成功。
