/*
  articleMarkdown.js — 文章 Markdown 渲染

  博客正文写成 Markdown，存放在 public/writer_works/ 下（作者自己的写作目录），
  页面运行时取回来渲染。这里只做三件事：
    1. 把正文里的相对图片路径补成绝对路径（./NNstudy/x.svg → /writer_works/NNstudy/x.svg）
    2. 代码块用 highlight.js 上色，并带上语言标签
    3. 顺手抽出二级标题，给页面做目录
  只依赖项目已有的 marked + highlight.js，不引入新依赖。
*/
import { Marked } from 'marked'
// 只注册用得上的语言：整包 highlight.js 会把文章页的 chunk 撑到 900 KB
import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import javascript from 'highlight.js/lib/languages/javascript'
import plaintext from 'highlight.js/lib/languages/plaintext'
import python from 'highlight.js/lib/languages/python'

hljs.registerLanguage('bash', bash)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('plaintext', plaintext)
hljs.registerLanguage('python', python)

const ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

// 防止正文文字破坏 HTML 结构
export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ESCAPE_MAP[char])
}

// 把相对路径补成以 / 开头的绝对路径；绝对地址与站外地址原样返回
export function resolveAsset(href, baseDir = '/') {
  const raw = String(href || '').trim()
  if (!raw) return ''
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(raw)) return raw
  if (raw.startsWith('/')) return raw
  const dir = baseDir.endsWith('/') ? baseDir : baseDir + '/'
  return dir + raw.replace(/^\.\//, '')
}

// 二级标题进目录（每篇文章不带题目，正文里不出现一级标题）
function collectHeadingText(token) {
  return String(token.text || '').replace(/[*`_]/g, '').trim()
}

export function renderArticle(markdown, options = {}) {
  const baseDir = options.baseDir || '/'
  const marked = new Marked({ gfm: true, breaks: false })
  const toc = []
  let subIndex = 0

  marked.use({
    renderer: {
      heading(token) {
        const inner = this.parser.parseInline(token.tokens)
        let id
        if (token.depth === 2) {
          id = 'sec-' + (toc.length + 1)
          toc.push({ id, text: collectHeadingText(token), depth: 2 })
        } else {
          subIndex += 1
          id = 'sub-' + token.depth + '-' + subIndex
        }
        return '<h' + token.depth + ' id="' + id + '">' + inner + '</h' + token.depth + '>' + String.fromCharCode(10)
      },

      image(token) {
        const src = escapeHtml(resolveAsset(token.href, baseDir))
        const alt = escapeHtml(token.text || '')
        return '<img src="' + src + '" alt="' + alt + '" loading="lazy" decoding="async">'
      },

      code(token) {
        const lang = String(token.lang || '').trim().split(/\s+/)[0]
        const language = lang && hljs.getLanguage(lang) ? lang : ''
        const body = hljs.highlight(token.text, {
          language: language || 'plaintext',
          ignoreIllegals: true,
        }).value
        const label = language || 'text'
        return (
          '<div class="code-card"><span class="code-lang">' + escapeHtml(label) + '</span>' +
          '<pre><code class="hljs language-' + escapeHtml(label) + '">' + body + '</code></pre></div>'
        )
      },

      link(token) {
        const href = escapeHtml(token.href || '')
        const external = /^https?:\/\//i.test(token.href || '')
        const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : ''
        return '<a href="' + href + '"' + attrs + '>' + this.parser.parseInline(token.tokens) + '</a>'
      },
    },
  })

  const html = marked.parse(markdown)
  return { html, toc }
}
