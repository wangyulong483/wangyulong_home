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

## 需求（2026-10-23）

用户提出优化「与影对谈」（`/dialogue`）页面：

1. **时间轴语义纠正**：时间轴应描述**对话历史**，而不是背景故事（鸣神纪年）。
2. **更新模型参数**：调整 Worker 中的对话生成参数，并在页面上可见。
3. **先锋艺术视觉**：在不改变页面主体风格（暗色底、衬线中文、大面积留白）的前提下，加入苏联至上主义与构成主义、马列维奇风格——
   - 完全几何解构：硬朗锐利的三角形、方形、圆形、直线切割；
   - 大面积平涂色块，极致扁平化，无柔和渐变、无软阴影，高撞色对比；
   - 经典苏维埃复古配色：正红、纯黑、米白基底、暗金；
   - 强烈对角线动态构图、粗重工业感线条；
   - 复古做旧粗糙印刷纸张颗粒纹理；
   - 平面抽象构成、秩序感与先锋冲击力，摒弃写实透视，复古前卫海报质感。
4. **部署网页**：可暂不做 GitHub 推送，但必须完成网页部署。

## 方案

### 1. 时间轴：从「鸣神纪年」改为「对话纪年」

- 新增纯函数 `frontend/src/features/dialogue/composables/useDialogueTimeline.js`：`buildConversationTimeline(messages)` 把消息流按「一问一答」配对为对话轮次，输出 `{ greeting, nodes, stats }`。
  - 节点字段：`id / mark / question / answer / userIndex / answerIndex / time / timeLabel / streaming / sources`；`userIndex` 直接指向线程消息下标，供「跳至原文」。
  - 无用户消息时只保留问候语作为卷首引文，节点为空并显示「此卷尚未落笔」。
- 组件 `DialogueChronicle.vue` 退役，新建 `DialogueTimeline.vue`：
  - 保留 nanfu 式 sticky 横向滚动机制（原生 sticky + ScrollTrigger scrub + `--go` 大字揭开），但**总高度与节点数解耦**（`min(4.6, 1.8 + n×0.5) × 100vh`），避免每轮对话把聊天区向下推一整屏。
  - 轨道 = 卷首 + N 个对话轮次 + 卷末「此卷仍在书写」；节点卡正反交替（米白/纯黑），点击可跳回对应对谈原文。
  - 窄屏与 `prefers-reduced-motion` 退化为竖向静态列表；节点增减时重建 ScrollTrigger 并 refresh。
- `Dialogue.vue` 不再引用 `chronicle.js`；该文件保留为知识库 canonical 年表档案（其回归测试继续有效），但不再渲染。

### 2. 构成主义视觉系统（不改主体风格）

- 页内色板：`--red #c8102e`、`--ink #12100e`、`--paper #ece4d3`、`--gold #a67c2e`；金色退为辅助刻度，红色承担主强调。
- 圆角归零，阴影一律硬边偏移（`box-shadow: 10px 10px 0 …`），删除柔和径向渐变与模糊阴影。
- 开篇：保留「一心净土 / 与影对谈」排版与暗底留白，新增马列维奇式海报构成（黑方块、红圆、红楔形、细黑对角线、СУПРЕМАТИЗМ / ДИАЛОГ 字样）、红色斜切色带与鼠标视差。
- 时间轴：红色斜切色块、粗导轨、方形刻度、海报式节点卡、超大轮次编号。
- 对谈区：宣纸面板改为平涂米白 + 2px 黑边 + 红色硬投影 + 左侧红条 + 印刷颗粒；消息序号改方形色块；来源脚注、输入区、按钮全部去圆角、硬边撞色。
- 侧栏：方块标题、红色分段缘分隔线、模型参数表。
- 所有颗粒纹理用内联 SVG `feTurbulence` data URI，不新增依赖；动画遵守 `prefers-reduced-motion`。

### 3. 模型参数

- `frontend/_worker.js`：`DEEPSEEK_CHAT_CONFIG` 调整为 `max_tokens 1200 / temperature 0.85 / top_p 0.94 / frequency_penalty 0.3 / presence_penalty 0.15`；修订配置 `max_tokens 800 / temperature 0.22 / top_p 0.82`。
- `buildChatPayload` 新增 `parameters` 字段（温度、top_p、长度、两种惩罚），经 SSE meta 下发。
- `useDialogue.js` 的 `lastToolState` 增加 `params`，`DialogueAside` 新增「生成参数」块展示。

### 4. 文件改动

| 文件 | 改动 |
|------|------|
| `frontend/src/features/dialogue/composables/useDialogueTimeline.js` | 新增：消息 → 对话轮次纯函数 |
| `frontend/src/features/dialogue/components/DialogueTimeline.vue` | 新增：对话历史时间轴 |
| `frontend/src/features/dialogue/components/DialogueChronicle.vue` | 删除 |
| `frontend/src/pages/Dialogue.vue` | 重构页面视觉与交互 |
| `frontend/src/features/dialogue/components/DialogueThread.vue` | 构成主义重绘 + `focusMessage` |
| `frontend/src/features/dialogue/components/DialogueAside.vue` | 构成主义重绘 + 参数块 |
| `frontend/src/features/dialogue/composables/useDialogue.js` | 用户消息时间戳、参数状态 |
| `frontend/_worker.js` | 模型参数与 `parameters` 下发 |
| `frontend/tests/dialogue-timeline.test.mjs` | 新增：配对、流式、空态、跳转下标 |
| `README.md`、`docs/todo.md` | 文案与执行记录 |

### 5. 验证与部署

- `npm.cmd --prefix frontend run test`、`npm.cmd run build`。
- 无头浏览器检查 1440×900 与 390×844：时间轴吸顶/横向位移/点击跳转、流式渲染、无横向溢出、无控制台错误。
- 部署：`npx wrangler pages deploy frontend/dist --project-name=wangyulong-home --branch=main`（GitHub 推送暂缓）。

### 6. 边界

- 不改路由、侧栏导航与其他页面；不新增依赖；不改 backend FastAPI。
- 不虚构设定；对话纪年只呈现用户真实说过的话。
- `chronicle.js` 与 `dialogue-chronicle.test.mjs` 保留，但不参与页面渲染。

===============================================================

## 执行记录（2026-10-23）

### 完成内容

1. **时间轴改为对话历史**：新增 `useDialogueTimeline.js`（消息 → 轮次纯函数）与 `DialogueTimeline.vue`（sticky 横向轨道）；`Dialogue.vue` 改渲染真实提问/回答轮次，卡片可点击回跳并高亮原文。退役 `DialogueChronicle.vue` 已删除；`chronicle.js` 仅作 canonical 年表归档保留，`dialogue-chronicle.test.mjs` 继续守护其与知识库的一致性。
2. **构成主义视觉**：页面内 `--red #c8102e / --ink #12100e / --paper #ece4d3 / --gold #a67c2e`，全页去圆角、硬边偏移投影、无渐变；首屏马列维奇式黑方块/红圆/红楔形/斜切红带/细黑对角线/俄文字样与鼠标视差；时间轴红斜块、粗导轨、超大编号与正反交替卡片；对谈区平涂纸面 + 2px 黑边 + 红硬投影 + 左侧红条 + SVG `feTurbulence` 印刷颗粒；侧栏方块标题与参数表。动画继续遵守 `prefers-reduced-motion`。
3. **模型参数**：`frontend/_worker.js` 对话 `max_tokens 1200 / temperature 0.85 / top_p 0.94 / frequency_penalty 0.3 / presence_penalty 0.15`，修订 `max_tokens 800 / temperature 0.22 / top_p 0.82`；`buildChatPayload` 增发 `parameters`，`useDialogue.js` 存入 `lastToolState.params`，`DialogueAside` 新增「生成参数」块实时展示。
4. **文档**：README 模块表、模型参数说明与「与影对谈」章节同步为对话纪年 + 构成主义；本记录。

### 验证

- `npm.cmd --prefix frontend run test`：47/47 通过（新增 8 条时间轴配对用例；同步修正 `chat-persona.test.mjs` 中旧的 1000/700 参数断言为 1200/800）。
- `npm.cmd run build`：成功，入口 `assets/index-ROJmPnrR.js`。
- 无头 Edge 1440×900 / 390×844：无横向溢出、sticky 生效、轨道位移 0 → -2543px、移动端「对话纪年」大字可见、未选中轮次回退为「共 04 轮 · 已落笔」。
- 过程中修复：`.tl-track` 的 `transform: none !important` 覆盖 GSAP 内联位移（删除）；窄屏 `--go` 未开启导致标题不可见（补媒体查询）；轨道末端多算 10vw 导致末卡被裁（改为 `scrollWidth - clientWidth` 并重设内边距）；移动端 `talk-era` 未选中时显示「未选中轮次」（回退到最后一轮）。
- 线上复核：`https://wangyulong-home.pages.dev/dialogue` 返回新入口资源，无控制台错误，首屏与本地一致。

### 部署

- 命令：`npx wrangler pages deploy frontend/dist --project-name=wangyulong-home --branch=main`。
- 结果：成功，部署预览 `https://c4f7824d.wangyulong-home.pages.dev`；生产分支 `main` 已生效（`https://wangyulong-home.pages.dev`）。
- GitHub 推送按用户要求暂缓，仅本地提交。

===============================================================

===============================================================

## 执行记录（2026-10-23 · 第二轮：全站三色与首页重构）

### 目标

- 在不删除各页原有功能的前提下，把全站统一到「紫为主 + 正红 + 暗金 + 米白纸面」的三色体系。
- 字体改为现代极简品牌字（Smiley Sans / 得意黑）承担标题，对话正文使用秀丽笔行书（Zhi Mang Xing / 志莽行书）。
- 首页移除影 / Ei 角色图片（旅途同行者模块除外），保留视频与人物档案。
- README 按开源 Web 项目结构重写，明确 DeepSeek Harness 协作，不再使用 Claude Code 表述。
- 部署必须完成；GitHub 推送可暂缓。

### 落地

- 全局令牌：`frontend/src/app/App.vue` 统一紫 `#8b5cf6 / #a78bfa / #4c1d95`、红 `#e01b2e`、金 `#d8b25a / #f0cf7a`、米白 `#ece4d3`、紫墨底 `#0a0714`；字体令牌 `--font-display / --font-hand / --font-body / --font-mono`。
- 页面改造：Dialogue / DialogueTimeline / DialogueThread / DialogueAside、Home、AppList、About、MapZonePainter 与 ZonePainterWorkspace、Shrine、Game、HotTopics、Sidebar、HoyoverseRoster 全部对齐三色与硬边几何语言。
- 首页首屏：保留 Ei 视频，增加可见的人物档案卡（头像 + PERSONNEL // 001），点击进入 /about；视频保留原有色彩与面部细节，构成主义只作为 HUD 上的印刷注脚。
- 首页中段：校园起点照片加内嵌细框、右上红色色条与轻微印刷调色，避免写实图与几何版面脱节。
- README 与字体许可证：README 已按开源项目结构重写；新增 Smiley Sans 与 Zhi Mang Xing 的 OFL 文本到 `frontend/public/third-party-notices/`。

### 首页返工（用户反馈后）

- 用户指出首屏「影的视频和头像都没了、调色和风格融合很糟」。复核确认源码中视频与头像均在，但视频被 `saturate(.28)` + 紫色 `color` 混合与多层遮罩吞掉，头像又被首页路由的侧栏隐藏规则藏起。
- 品牌视觉专家诊断：视频海报 90.4% 为紫色、中位色相 252.4°，头像 244.0°，站点紫 258.3°，紫与紫只差 6–16°；金色 41.9° 与米白 40.0° 仅差 1.9°，导致金线在纸面上不可见；紫色面积 38.9% 已高于墨色 37.5%。
- 处理：删除 `.hp-ink` 紫色叠色与对应 GSAP 目标；视频滤镜改为 `saturate(1.02) contrast(1.06) brightness(1.03)`；网点从 0.55 multiply 降到 0.16 soft-light；颗粒 0.34 → 0.10；扫描线 0.3；底色紫色径向光 0.26 → 0.14；纸面软阴影改为 `12px 12px 0` 硬投影；视频硬投影偏移收至 10/11 与 20/23；主标题实心米白，去掉空心描边与软文字阴影；人物卡 56px 头像、红色硬投影、金色套准点。
- 保留几何元素，但把遮住人物的黑色多边形从 34%×27% 收到 20%×14%，让面部和上半身完整可见。

### 验证

- `npm.cmd --prefix frontend run test`：47/47 通过。
- `npm.cmd --prefix frontend run build`：成功，最终入口 `assets/index-MaH3EY5s.js`。
- 无头 Edge 1440×900 / 390×844：首页无横向溢出、视频 `readyState 4` 且播放中、头像 50×50 / 40×40 可见、人物卡不压 SCROLL 提示、点击头像正确进入 /about；控制台无错误与 GSAP 警告。
- 校园起点段在桌面与移动端均显示内嵌细框与红色色条，无溢出。

### 部署状态

- 按用户 m01023「暂时不要部署」，本轮未执行 wrangler，生产仍是上一版。
- 本地预览保持运行：`http://127.0.0.1:4173/`（preview job `bash-44fb924094a341ca`，绑定 127.0.0.1）。

===============================================================

## 执行记录（2026-10-23 · 第三轮：隐私修正与绝区零主权重平衡）

### 用户反馈

- 用户指出首页不应暴露真名与昵称；「影」不应被反复强调，但角色图片可以保留。
- 构成主义必须辅助原有的绝区零（ZZZ）风格，而不是取代它；上一版构成主义占比过高，属于喧宾夺主。

### 落地

- 人物卡去隐私：`HeroTransition.vue` 头像 `alt=""`，文案只保留 `PERSONNEL // 001` 与 `ARCHIVE RECORD`，移除姓名与昵称；卡片仍可点击进入 /about。
- 首页去「影」字：首屏所有「影」文案删除；侧栏头像水印由「影」改为「01」；导航页名「与影对谈」保留。
- 恢复绝区零主视觉：`HeroTransition.vue` 以全屏 Ei 视频、四角框、顶栏、状态与 SCROLL 提示为底，再叠少量几何（网格、红色竖条、黑方块、金色竖线、紫色圆环与一条细红斜线）；视频恢复原生色彩，主标题回到 Geist 800 + 空心 WEBSITE。
- 颜色令牌回到 ZZZ 近黑 `#0b0b0e`、薰衣草紫 `#b69cff`、酸性黄 `#eaff57`，保留正红 `#e01b2e` 与暗金 `#d8b25a` 作为构成主义注脚；全站旧紫墨底 `#0a0714` 替换为 `#0b0b0e`。
- 与影对谈页：海报缩为 248px 纸面，装入深色 `ARCHIVE PLATE` HUD 画框（酸性黄角标、01 / 01、PLATE 01 · 2026），俄文标记与俄文 intro 全部移除；紫色斜带移到画面右下，首屏主视觉回到深色 HUD，构成主义只作档案注脚；移动端改为文案在前、画框在后。

### 验证

- `npm.cmd --prefix frontend run test`：47/47 通过。
- `npm.cmd --prefix frontend run build`：成功，最终入口 `assets/index-wm72l93Q.js`。
- 无头 Edge 1440×900：首页无横向溢出、视频播放中、标题为 Geist 100px、人物卡匿名且不压 SCROLL；/dialogue 无溢出，画框 302×410、纸面 248px，控制台无错误。
- 无头 Edge 390×844：首页与 /dialogue 均无横向溢出；对谈页首屏先出现标题与文案，档案画框下移；人物卡 158×48。
- 实时检索源码：`王雨龙` 在 `frontend/src` 中 0 命中；首屏与对谈页无俄文标签。

### 部署状态

- 继续遵守用户 m01023「暂时不要部署」，本轮未执行 wrangler，生产仍是上一版。
- 本地预览保持运行：`http://127.0.0.1:4173/`（preview job `bash-44fb924094a341ca`，绑定 127.0.0.1）。
- 待用户确认后执行：`npx.cmd wrangler pages deploy frontend/dist --project-name=wangyulong-home --branch=main`。
