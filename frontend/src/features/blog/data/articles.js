/*
  articles.js — 个人博客文章清单

  正文是独立的 Markdown 文件，放在 public/writer_works/ 下（作者自己的写作目录），
  标题、摘要、日期、标签这些元信息只写在这里。
  约定：正文里不写文章题目，题目由清单提供。
    file    正文地址（相对站点根目录）
    baseDir 正文所在目录，用于把 ./xxx.svg 这类相对图片路径补全
*/
export const articles = [
  {
    slug: 'nn-study',
    title: '神经网络：从单个神经元到两层网络',
    subtitle: '结构 / 层次 / 激活函数 / 手写实现',
    summary:
      '把神经网络拆回一个个神经元，再从单层、感知机、多层一路搭到用 numpy 亲手训练一遍；配 9 张黑白示意图与一次真实运行结果，供复习时快速回看。',
    date: '2026-10-25',
    readMinutes: 12,
    tags: ['神经网络', '机器学习', 'numpy'],
    file: '/writer_works/NNstudy.md',
    baseDir: '/writer_works/',
    figure: '/writer_works/NNstudy/nn-fig1-neuron.svg',
  },
]

// 按 slug 找一篇；找不到返回 null，页面据此显示文章不存在
export function findArticle(slug) {
  return articles.find((item) => item.slug === slug) || null
}

// 上一篇 / 下一篇（清单顺序即展示顺序）
export function neighboursOf(slug) {
  const index = articles.findIndex((item) => item.slug === slug)
  if (index < 0) return { prev: null, next: null }
  return {
    prev: index > 0 ? articles[index - 1] : null,
    next: index < articles.length - 1 ? articles[index + 1] : null,
  }
}
