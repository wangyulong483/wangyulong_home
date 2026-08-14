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

export const MISTAKE_TYPES = [
  { value: 'concept-confusion', label: '概念混淆' },
  { value: 'scenario-misjudgment', label: '场景判断错误' },
  { value: 'security-gap', label: '安全边界不足' },
  { value: 'tool-mismatch', label: '工具选择错误' },
  { value: 'reasoning-error', label: '推理错误' },
  { value: 'other', label: '其他 / 还没想清楚' },
]
