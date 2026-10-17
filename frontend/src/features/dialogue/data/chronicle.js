/*
  鸣神纪年 — 年表数据

  数据纪律（重要）：
  - 每个节点都必须能对应到站内知识库 frontend/public/shrine-data/knowledge-base.json
    中 certainty 为 canonical 的 timeline 条目，通过 entryId 关联。
  - 原神并未给出这些事件的具体年份，因此这里只使用「时期」标签
    （魔神战争 / 五百年前 / 灾厄之后 …），不补写任何具体年份数字。
  - frontend/tests/dialogue-chronicle.test.mjs 会校验以上两点。
*/

/** 年表节点的资料来源说明，直接展示在页面上 */
export const CHRONICLE_SOURCE = {
  label: '站内知识库 · 确定性条目',
  detail: '年表依据站内知识库（knowledge-base.json）中 certainty 为 canonical 的时间线条目整理；原作未给出具体年份的事件，只用时期标注，不补写年份。',
}

/**
 * 年表节点（按时间先后排列）
 * - id      节点自身 id
 * - entryId 对应知识库条目 id（测试会校验其存在性与确定性）
 * - era     时期标签（大字）
 * - eraNote 时期注脚（大字下方小字）
 * - mark    序号标记，用于左侧导轨
 * - title   节点标题
 * - summary 节点摘要（改写自知识库条目内容，不新增事实）
 * - them    该节点在角色人格上的落点（用于连接「年表」与「对谈」）
 */
export const CHRONICLE_NODES = [
  {
    id: 'era-shadow-warrior',
    entryId: 'timeline-shadow-warrior',
    era: '魔神战争',
    eraNote: '双生魔神',
    mark: 'I',
    title: '真的影武者',
    summary: '真更擅长治理与理解众人的梦想，影则以影武者的身份承担战斗。她曾舍弃肉身助真取得神位，其后由真重塑其身。',
    them: '她的「武」从一开始就是为守护他人而存在，而非为了统治。',
  },
  {
    id: 'era-cataclysm',
    entryId: 'timeline-cataclysm-loss',
    era: '五百年前',
    eraNote: '坎瑞亚灾厄',
    mark: 'II',
    title: '灾厄与失去',
    summary: '五百年前的灾厄席卷稻妻。真前往坎瑞亚后陨落，狐斋宫在守护稻妻时消逝，御舆千代遭黑暗侵蚀。影接连失去重要之人。',
    them: '她把变化与失去紧紧绑在一起，这是她后来一切选择的起点。',
  },
  {
    id: 'era-eternity-plan',
    entryId: 'timeline-eternity-plan',
    era: '灾厄之后',
    eraNote: '永恒之策',
    mark: 'III',
    title: '人偶与一心净土',
    summary: '为避免肉身与意志受磨损影响，影研制能长期运转的人偶，将将军设定为永恒规则的执行者，并把自己的意识置于一心净土。',
    them: '这个方案稳住了统治形式，也让她远离了真实变化中的稻妻。',
  },
  {
    id: 'era-vision-hunt',
    entryId: 'timeline-vision-hunt',
    era: '近年',
    eraNote: '锁国与眼狩',
    mark: 'IV',
    title: '眼狩令与锁国令',
    summary: '眼狩令收缴神之眼，锁国令限制人员与贸易流动，并引发抵抗与广泛伤害。影知道眼狩令，却没有及时否定。',
    them: '作为最高统治者，她不能把责任推给臣下或人偶——这一点她始终承认。',
  },
  {
    id: 'era-awakening',
    entryId: 'timeline-awakening',
    era: '旅者东来',
    eraNote: '众愿入净土',
    mark: 'V',
    title: '重新审视永恒',
    summary: '旅行者带着被收缴神之眼中寄托的众多愿望进入一心净土，八重神子也迫使影直面自己的孤独与稻妻的变化。影败于众愿后废止眼狩令。',
    them: '她第一次承认：静止并不能守住任何东西。',
  },
  {
    id: 'era-puppet-duel',
    entryId: 'timeline-puppet-duel',
    era: '法则更易',
    eraNote: '与己相抗',
    mark: 'VI',
    title: '与将军人偶的漫长对决',
    summary: '当影决定修改永恒法则时，将军人偶依照最初设定把她视为永恒的敌人。两者在特殊空间中进行漫长而反复的对决；影以从未动摇的意志获得人偶认可。',
    them: '她要说服的不是人偶，而是五百年前那个拒绝变化的自己。',
  },
  {
    id: 'era-city-walk',
    entryId: 'timeline-city-walk',
    era: '解令之后',
    eraNote: '重观稻妻',
    mark: 'VII',
    title: '走入稻妻城',
    summary: '解除眼狩令后，影在旅行者与派蒙陪同下亲自走进稻妻城，接触团子牛奶、轻小说与留影等新事物。她发现城市虽与记忆大不相同，居民对生活的热爱仍在。',
    them: '她开始允许自己不熟悉、不擅长，也允许自己觉得有趣。',
  },
  {
    id: 'era-rifthounds',
    entryId: 'timeline-rifthounds-memory',
    era: '如今',
    eraNote: '神樱与旧忆',
    mark: 'VIII',
    title: '兽境猎犬与旧武士记忆',
    summary: '兽境猎犬攻击神樱根系时，影没有把问题完全交给三奉行，而是亲自追击。受损根系逸出的地脉记忆让她再次听见五百年前武士与茶匠的声音。',
    them: '她更具体地理解了自己守护的是活生生的人，而不是秩序本身。',
  },
]

export default CHRONICLE_NODES
