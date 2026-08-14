Agent 维度目前 6 道，补 3–4 道工作流相关题就能更圆满。下面给你 **4 道 professional Agent 种子题**，继续保持场景化、判断型。

```json
[
  {
    "id": "q-pro-021",
    "dimension": "agent",
    "type": "single",
    "difficulty": "intermediate",
    "cognitiveLevel": "analyze",
    "tags": ["react", "plan-and-execute", "workflow"],
    "volatility": "medium",
    "audience": ["professional"],
    "prompt": "一个需要严格按固定审批链路执行的内部报销 Agent（提交 → 校验发票 → 主管审批 → 财务打款），中途几乎不允许自由探索。更合适的编排方式是？",
    "options": [
      "纯 ReAct，让模型每步自己决定下一步工具",
      "以显式 workflow / 状态机为主，关键节点用确定性规则或人工确认，模型只负责局部理解与填槽",
      "完全去掉工具，只让模型生成一段自然语言建议",
      "多 Agent 互相投票决定每一步"
    ],
    "answer": 1,
    "explanation": "强流程、强合规的任务更适合确定性 workflow，而不是完全开放的 ReAct 探索。模型适合处理非结构化理解，关键控制点应留给规则或人工。",
    "evidence": "ReAct 适合开放探索；固定审批链路更适合 workflow + 受控节点。",
    "sourceIds": [],
    "lastFactCheckAt": "2026-08-14"
  },
  {
    "id": "q-pro-022",
    "dimension": "agent",
    "type": "single",
    "difficulty": "advanced",
    "cognitiveLevel": "analyze",
    "tags": ["tool-failure", "fallback", "reliability"],
    "volatility": "medium",
    "audience": ["professional"],
    "prompt": "Agent 调用外部票务 API 时偶发超时。当前实现是「失败就原样重试 3 次」。上线后仍有用户卡在重试循环。更稳妥的失败处理设计是？",
    "options": [
      "把重试次数加到 10 次",
      "区分错误类型：对超时/限流做有限退避重试，对业务错误（无票、参数非法）快速失败并给出可解释反馈或降级路径，必要时升级为 human-in-the-loop",
      "忽略所有错误，直接返回「请稍后再试」",
      "换成另一个模型，期望它不再触发超时"
    ],
    "answer": 1,
    "explanation": "统一盲目重试会放大瞬时故障并掩盖业务错误。应按错误类型设计重试、快速失败、降级与人工介入。",
    "evidence": "生产 Agent 的工具失败处理需要分类策略，而非单一重试。",
    "sourceIds": [],
    "lastFactCheckAt": "2026-08-14"
  },
  {
    "id": "q-pro-023",
    "dimension": "agent",
    "type": "single",
    "difficulty": "advanced",
    "cognitiveLevel": "analyze",
    "tags": ["multi-agent", "communication", "permission"],
    "volatility": "medium",
    "audience": ["professional"],
    "prompt": "调研 Agent 与执行 Agent 通过共享消息总线通信。执行 Agent 拥有支付权限。为降低「被伪造或篡改的中间结论直接触发支付」的风险，优先应加强的是？",
    "options": [
      "让两个 Agent 使用完全相同的高权限身份",
      "对跨 Agent 消息做身份认证与完整性校验，支付等敏感动作增加独立授权与 human-in-the-loop，并最小化执行 Agent 的默认权限",
      "取消所有权限控制，靠模型「自觉」",
      "只增加 Agent 数量进行多数投票"
    ],
    "answer": 1,
    "explanation": "多 Agent 通信面临伪造与篡改风险（对应 ASI07 等）。敏感动作需要消息可信、权限分离与人工确认，而不是共享高权限身份。",
    "evidence": "不安全的跨 Agent 通信与权限过大是级联风险的重要来源。",
    "sourceIds": ["owasp-agentic-2026"],
    "lastFactCheckAt": "2026-08-14"
  },
  {
    "id": "q-pro-024",
    "dimension": "agent",
    "type": "single",
    "difficulty": "intermediate",
    "cognitiveLevel": "apply",
    "tags": ["human-in-the-loop", "state", "approval"],
    "volatility": "low",
    "audience": ["professional"],
    "prompt": "长任务 Agent 在执行到「即将对外发送客户邮件」时需要人工确认。系统设计上最重要的一点是？",
    "options": [
      "确认过程可以不保存任何状态，重启后从头再来即可",
      "把待确认的动作与完整上下文固化为可恢复的状态（或票据），人工批准/拒绝后能明确继续或终止，并留下审计记录",
      "只在日志里打一行字，不阻塞执行",
      "把确认弹窗做成纯前端装饰，后端仍然自动发送"
    ],
    "answer": 1,
    "explanation": "Human-in-the-loop 必须与可恢复状态和审计结合，否则重启、并发或误操作会导致重复执行或静默跳过。",
    "evidence": "有效的 HITL 需要可恢复状态、明确的批准语义与审计，而不是形式上的弹窗。",
    "sourceIds": [],
    "lastFactCheckAt": "2026-08-14"
  }
]
```

### 补完后预期

| 维度 | 预计 professional 题数 |
|------|------------------------|
| 模型基础 | 9 |
| Prompt / Context | 9 |
| RAG | 8 |
| **Agent** | **10** |
| Tools / Skills / MCP | 8 |
| Eval / Safety | 9 |

六维基本都到 8–10，专业版 MVP 可以认为比较稳了。  
合入后如果还想再打磨（比如给空 `sourceIds` 补引用、或微调某几道的干扰项），随时说。