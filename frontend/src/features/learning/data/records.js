export const learningRecords = [
  {
    id: 'vue-composable-boundaries',
    date: '2026-09-20',
    category: 'Vue',
    title: '把可复用状态留在 composable 里',
    summary: '页面组件负责呈现，composable 负责状态、生命周期和副作用。边界清楚后，功能更容易测试，也不必在多个页面复制监听逻辑。',
    points: [
      '返回 ref 或 readonly 状态，避免调用方绕过业务方法直接改值。',
      '在 composable 内注册的事件，也要在同一处解除。',
      '只抽离真正复用或足够复杂的逻辑，不为简单计算增加层级。',
    ],
    code: {
      language: 'javascript',
      filename: 'useViewport.js',
      value: `import { onMounted, onUnmounted, readonly, ref } from 'vue'

export function useViewport() {
  const width = ref(0)
  const sync = () => { width.value = window.innerWidth }

  onMounted(() => {
    sync()
    window.addEventListener('resize', sync)
  })

  onUnmounted(() => window.removeEventListener('resize', sync))

  return { width: readonly(width) }
}`,
    },
  },
  {
    id: 'ros2-qos-matching',
    date: '2026-09-15',
    category: 'ROS2',
    title: 'QoS 能连上，不代表一定收得到消息',
    summary: 'ROS2 发布端与订阅端会先比较 QoS。可靠性、持久性等策略不兼容时，即使 topic 名称和消息类型完全一致，也不会建立有效通信。',
    points: [
      '传感器数据通常优先低延迟，可从 sensor_data QoS 开始。',
      '先用 ros2 topic info -v 对比两端策略，再排查业务代码。',
      '需要晚加入的订阅者收到旧值时，关注 transient local。',
    ],
    code: {
      language: 'python',
      filename: 'camera_listener.py',
      value: `from rclpy.qos import (
    QoSProfile,
    ReliabilityPolicy,
    HistoryPolicy,
)

sensor_qos = QoSProfile(
    reliability=ReliabilityPolicy.BEST_EFFORT,
    history=HistoryPolicy.KEEP_LAST,
    depth=5,
)

self.subscription = self.create_subscription(
    Image, '/camera/image_raw', self.on_image, sensor_qos
)`,
    },
  },
  {
    id: 'git-small-commits',
    date: '2026-09-08',
    category: '工程实践',
    title: '让每次提交只说明一件事',
    summary: '小而完整的提交更容易审查、回退和定位问题。提交前先看暂存区差异，能避免把日志、构建产物或临时调试代码带进仓库。',
    points: [
      '先检查 git status，再按文件或代码块暂存。',
      '提交信息写清结果与动机，不复述文件名。',
      '生成目录放进 .gitignore，源码和生成物分开管理。',
    ],
    code: {
      language: 'bash',
      filename: 'terminal',
      value: `git status --short
git add -p
git diff --cached
git commit -m "新增学习记录与代码展示"`,
    },
  },
]
