===============================================================

## 需求

用户提出（2026-10-14）：

1. **AI 对话独立成模块**：把「与影对话」从厨厨页（`/shrine`）的 Tab 中拆出来，做成独立路由、独占整个页面的模块。
2. **风格高雅朴素**：不喧哗、不霓虹科幻，同时仍与全站「暗色终端 + 科幻档案」体系兼容。
3. **参考 nanfu.global**：
   - 参考其**时间轴**交互（sticky 滚动 + 进度线 + 节点逐个激活）
   - 参考其**动态页面**手法（滚动驱动的入场、揭示、章节过渡）
4. **补全人格**：用**网络搜索**与 **GitHub MCP** 检索雷电将军的角色卡（character card），把角色卡中的说话方式、口头禅、称呼习惯、情绪反应与反差表现提炼进提示词。
5. **提升开发质量**：灵活使用可用插件（GitHub MCP、网络搜索、子代理调研）。

## 方案

### 1. 信息架构：新增独立路由 `/dialogue`

| 文件 | 改动 |
|------|------|
| `frontend/src/app/router.js` | 新增 `/dialogue`（name `Dialogue`） |
| `frontend/src/pages/Dialogue.vue` | 新建页面（三段式纵向叙事） |
| `frontend/src/pages/Shrine.vue` | 移除 `chat` Tab，改为一个克制的入口条指向 `/dialogue` |
| `frontend/src/shared/layout/Sidebar.vue` | 新增导航「与影对谈」（code 03），「关于」顺延为 04 |
| `frontend/src/pages/AppList.vue` | 新增「与影对谈」入口卡片 |
| `frontend/src/pages/Home.vue` | 页脚「热点雷达」列补一条 `/dialogue` 链接 |

「独占整个页面」的处理：该路由不使用 1100px 内容壳，自成一个纵向滚动叙事；桌面端保留右侧栏（维持全站一致），移动端由站点汉堡菜单承载。

### 2. 页面结构（三段式纵向叙事）

**第一段 · 开篇（静默）**
- 满屏留白，衬线（宋体）大标题「一心净土」+ 副题「与影对谈 / DIALOGUE」。
- 一根金色发丝线自上而下延伸（随滚动伸长）—— nanfu 式「时间轴脊椎」的起点。
- 极简 mono 元信息：`PLANE OF EUTHYMIA / 01`；底部细线 + 极小 `SCROLL` 提示。

**第二段 · 鸣神纪年（时间轴，nanfu 式核心交互）**
- 数据源：`frontend/src/features/dialogue/data/chronicle.js`，节点**直接取自站内知识库** `frontend/public/shrine-data/knowledge-base.json` 中 `layer: 经历` 的 8 条 `canonical` 条目，保证不编造年代：
  1. 魔神战争 · 真的影武者（舍弃肉身助真取得神位）
  2. 真受封雷神 · 影被重塑
  3. 五百年前的灾厄（真陨落 · 狐斋宫消逝 · 御舆千代被侵蚀）
  4. 人偶与一心净土计划
  5. 眼狩令与锁国令
  6. 众愿 · 重新审视永恒
  7. 与将军人偶的漫长对决
  8. 走入稻妻城 · 兽境猎犬与旧武士记忆
- 交互（复用已有 `gsap` + `ScrollTrigger`，不新增依赖）：
  - 左侧 sticky 的「时期大字」随滚动切换（文字交接动画）
  - 右侧节点列表进入视口时逐个激活（金线加粗、标题转亮、正文淡入）
  - 纵向进度线随滚动填充（`scaleY` 由 ScrollTrigger `progress` 驱动）
  - 当前节点高亮，与左侧大字联动
  - `prefers-reduced-motion` 下退化为静态可读列表
- **诚实标注**：不写具体年份数字，统一用「魔神战争」「五百年前」「近年」「如今」等时期标签；页面注明「年表依据站内知识库 canonical 条目整理」。

**第三段 · 对谈（对话主线）**
- 对话呈现为**时间轴线程**：消息挂在一条发丝脊线上，每条带极小序号/时刻标记，形成「对话即时间轴」的统一语言。
- 主区：对话线程 + 段内 sticky 输入区。
- 侧区（桌面）：克制的「心境 / 缘分 / 记忆」状态栏，纯文字 + 发丝线，不用重装饰卡片。
- 来源以**学术脚注**形式呈现（编号 + 发丝分隔 + 层级标签），契合「高雅朴素」。
- 提问引导不做方块按钮，改为朴素文字条目（下划线 + 箭头）。
- 保留打字指示器、错误态、清空对话、localStorage 持久化。

### 3. 视觉规范（高雅朴素 + 全站兼容）

- 底色沿用全站 `--bg-primary: #0b0b0e`，文字用 `--text-primary/secondary/tertiary`。
- 强调色以**金 `#C9A96E`** 为主；黄绿 `--signal` 仅保留极少量状态点（与全站一致但更克制）。
- 大留白（区块间距 `clamp(72px, 12vh, 160px)`）、1px 发丝线、圆角 ≤ 3px（对齐全站 `--radius-sm: 3px`）。
- 标题用 `--font-serif` 承载「高雅」，正文 `--font-body`，元信息 `--font-mono`。
- 不引入新依赖、不引入 UI 框架。
- 待用户确认：对话区采用「纯深色」还是「局部宣纸浅色面板」。

### 4. 人格补全（角色卡 → 提示词）

依据 `docs/research/raiden-persona-cards.md` 的调研结论，在 `frontend/_worker.js` 中：

- 新增 `VOICE_ANCHORS`：自称、对他人的称呼、句长节奏、古雅程度、标点与停顿感。
- 新增 `FEW_SHOT_EXAMPLES`：3–6 组「用户说 X → 影会如何回应」，注入 `buildSystemPrompt`。
- 扩展 `CHARACTER_IDENTITY`：补「神性 vs 笨拙」的**具体触发场景**，以及边界与禁忌。
- 新增 `RELATIONSHIP_VOICE`：对八重神子 / 雷电真 / 散兵（流浪者）/ 九条裟罗 / 旅行者的称呼与口吻差异。
- **合规**：角色卡属**社区气质参考**，不写成官设事实，不复制原文，页面标注来源与许可证（CC BY-NC 4.0 仅借鉴风格）。
- 运行时：把 `LC1332/Chat-Haruhi-Suzumiya` 的雷电将军角色卡从「仅档案类问题触发」扩展为**人格参考来源**（`personaCard`），角色扮演类问题（日常/情绪/关系）也加载，缓存 1 小时；作为「声线参考」注入（只影响语气，不新增事实），并在响应中以 `personaCard` 字段暴露给前端脚注展示。

### 5. 测试与验证

- 新增 `frontend/tests/dialogue-chronicle.test.mjs`：校验年表节点与知识库 `经历` 条目一致（数量、id、标题、顺序）、不含编造年份、字段完整。
- 扩展 `frontend/tests/chat-persona.test.mjs`：新增声线锚定 / few-shot / 关系口吻存在性断言，以及 `personaCard` 行为断言。
- 验证命令：`npm.cmd --prefix frontend run test`、`npm.cmd --prefix frontend run build`。
- 部署：按 `docs/rule.md` 执行 `npx wrangler pages deploy frontend/dist --project-name=wangyulong-home --branch=main`（部署前再与用户确认）。

### 6. 实施顺序

1. 调研（GitHub MCP 角色卡 + nanfu 交互）→ `docs/research/*.md`（进行中）
2. 数据层：`chronicle.js` + 测试
3. 组件层：`Dialogue.vue` / `DialogueChronicle.vue` / `DialogueThread.vue` / `useDialogue.js`
4. 后端：`_worker.js` 人格补全 + `personaCard`
5. 集成：router / Shrine / Sidebar / AppList / Home 页脚
6. 测试 + 构建 → 用户确认后部署

### 7. 边界（不做的事）

- 不改动其他模块既有功能与数据
- 不引入新依赖、不引入 UI 框架
- 不编造原作年份与设定；年表只用知识库 canonical 条目
- 不改动 backend FastAPI（仅 Worker）

## 执行记录（2026-10-17）

用户已确认三项选择：视觉为「深色墨底 + 局部宣纸面板」、要真正的 SSE 流式输出、路由 `/dialogue` 命名「与影对谈」。

### 交付物

| 类型 | 文件 |
|------|------|
| 页面 | `frontend/src/pages/Dialogue.vue` |
| 组件 | `frontend/src/features/dialogue/components/{DialogueChronicle,DialogueThread,DialogueAside}.vue` |
| 数据 | `frontend/src/features/dialogue/data/chronicle.js` |
| 状态与流式客户端 | `frontend/src/features/dialogue/composables/useDialogue.js` |
| Worker | `frontend/_worker.js`（SSE 流式 + 人格常量 + `personaCard`） |
| 测试 | `frontend/tests/{dialogue-chronicle,dialogue-stream}.test.mjs`、扩展 `chat-persona.test.mjs` |
| 调研 | `docs/research/{nanfu-interaction,raiden-persona-cards}.md` |

### 集成改动

- `router.js` 新增 `/dialogue`
- `Sidebar.vue` 新增「与影对谈」（code 03），「关于」顺延为 04
- `AppList.vue` 新增入口卡片；厨厨卡片描述去掉「对话」
- `Home.vue` 页脚「热点雷达」列新增 `/dialogue`
- `Shrine.vue` 移除「与影对话」Tab（原 `ChatTab.vue` 已删除），改为一条克制的入口条
- `App.vue`：`body { overflow-x: hidden }` → `clip`（修复 sticky 失效；顺带修好厨厨页 Tab 栏吸顶）

### 调研带来的关键修正

1. **nanfu 时间轴是横向的**，不是竖向进度线：外层高度 `vh × (板块数 + 0.5)`、原生 `position: sticky` 钉 100vh、ScrollTrigger `scrub` 驱动横向 `translateX`。据此重写了时间轴组件。
2. **大字揭开用 `--go` + paused 关键帧**，GSAP 只写一个 CSS 变量，性能远好于逐帧改 `clip-path`。已采用（并按其建议显式声明 `--go: 0`）。
3. **全站唯一签名曲线 `cubic-bezier(0.38, 0, 0, 1)`**（≈ power4.out），滚动补间一律 `ease: 'none'`，手感交给 `scrub`。已在对话页统一采用。
4. **角色卡的硬错误**（自称「朕/吾」、九条早蕨、把真写成「诚」等）经官方语音校正后写入禁令；社区卡只提供「怎么说」，不提供「是什么」。
5. **神性回收铁律**：笨拙 → 自我察觉 → 用威信或「愚问」冷收；无回收的反差视为 OOC。

### 验证结果

- `node --check frontend/_worker.js` 通过
- `npm.cmd --prefix frontend run test`：**39 / 39 通过**（原有 20 + 新增 19）
- `npm.cmd run build`（根目录完整构建）退出码 0，产物含 `dist/_worker.js` 与 Dialogue chunk
- 无头 Edge + CDP 实测 1440×900 与 390×844：时间轴吸顶、横向位移、进度线、节点激活、宣纸面板、流式渲染、脚注、侧栏状态均正常；首页 / 厨厨 / 应用 / 热点四个页面无横向溢出，无控制台错误

### 过程中发现并修掉的真实缺陷

1. `body { overflow-x: hidden }` 让全站 `position: sticky` 失效（对话页时间轴、厨厨页 Tab 栏都受影响）——改为 `clip`。
2. 横向位移错误地用了 `window.innerWidth`，未扣除 200px 右侧栏——改用 `.tl-sticky` 的实际宽度。
3. 窄屏与 `prefers-reduced-motion` 下不跑 ScrollTrigger，`--go` 停在 0，大字会保持暗底字——两处媒体查询里直接显示实色。
4. 上半屏节点文字与吸顶信息条重叠——按奇偶分别补齐竖直留白。

===============================================================
