/*
  blog-articles.test.mjs — 博客文章模块自检

  文章正文是 Markdown 文件 + 一堆图片，路径错了页面就是一片裂图，
  这类问题跑构建也发现不了，所以在这里先兜住：
    1. 清单里的元信息齐全、slug 不重复、正文文件和封面图真实存在
    2. 正文里引用的每一张图都能在 public/ 下找到
    3. 正文不带一级标题（题目统一由清单提供）
    4. 渲染器：图片路径补全、目录抽取、代码块上色
*/
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { articles, findArticle, neighboursOf } from '../src/features/blog/data/articles.js'
import { renderArticle, resolveAsset, escapeHtml } from '../src/features/blog/lib/articleMarkdown.js'

const here = dirname(fileURLToPath(import.meta.url))
const publicDir = resolve(here, '../public')

// publicDir + 站内绝对路径 → 磁盘路径
const onDisk = (url) => join(publicDir, url.replace(/^\/+/, ''))

// 正文里所有 ![](___) 的地址
function imageRefs(markdown) {
  return [...markdown.matchAll(/!\[[^\]]*\]\(([^)\s]+)[^)]*\)/g)].map((m) => m[1])
}

// 去掉 fenced 代码块：代码里的 # 注释不是 Markdown 标题
function stripFences(markdown) {
  return markdown.replace(/`{3}[\s\S]*?`{3}/g, '')
}

test('文章清单：字段齐全、slug 唯一、正文与封面存在', () => {
  assert.ok(articles.length > 0, '至少要有一篇文章')

  const slugs = new Set()
  for (const post of articles) {
    for (const key of ['slug', 'title', 'subtitle', 'summary', 'date', 'file', 'baseDir']) {
      assert.ok(post[key], post.slug + ' 缺少字段 ' + key)
    }
    assert.ok(Array.isArray(post.tags) && post.tags.length > 0, post.slug + ' 缺少标签')
    assert.ok(Number.isFinite(post.readMinutes) && post.readMinutes > 0, post.slug + ' 阅读时长不合法')

    assert.ok(!slugs.has(post.slug), 'slug 重复：' + post.slug)
    slugs.add(post.slug)

    assert.ok(post.file.startsWith('/'), post.slug + ' 的 file 应以 / 开头')
    assert.ok(existsSync(onDisk(post.file)), post.slug + ' 的正文文件不存在：' + post.file)
    assert.ok(existsSync(onDisk(post.figure)), post.slug + ' 的封面图不存在：' + post.figure)
  }
})

test('正文：不带一级标题，引用的图片都在', () => {
  for (const post of articles) {
    const markdown = readFileSync(onDisk(post.file), 'utf8')

    assert.equal(/^#\s/m.test(stripFences(markdown)), false, post.slug + ' 的正文里出现了 # 开头的一级标题')

    const refs = imageRefs(markdown)
    assert.ok(refs.length > 0, post.slug + ' 的正文里没有图片')
    for (const ref of refs) {
      const url = resolveAsset(ref, post.baseDir)
      assert.ok(existsSync(onDisk(url)), post.slug + ' 引用了不存在的图片：' + ref + ' → ' + url)
    }
  }
})

test('文章查找与上下篇', () => {
  const first = articles[0]
  assert.equal(findArticle(first.slug), first)
  assert.equal(findArticle('__missing__'), null)

  const links = neighboursOf(first.slug)
  assert.equal(links.prev, null)
  assert.equal(links.next, articles[1] || null)
  assert.deepEqual(neighboursOf('__missing__'), { prev: null, next: null })
})

test('渲染器：图片路径补全', () => {
  assert.equal(resolveAsset('./NNstudy/a.svg', '/writer_works/'), '/writer_works/NNstudy/a.svg')
  assert.equal(resolveAsset('./a.svg', '/writer_works'), '/writer_works/a.svg')
  assert.equal(resolveAsset('/abs/a.svg', '/writer_works/'), '/abs/a.svg')
  assert.equal(resolveAsset('https://x.test/a.png', '/writer_works/'), 'https://x.test/a.png')
  assert.equal(resolveAsset('', '/writer_works/'), '')
  assert.equal(escapeHtml('<b>&"'), '&lt;b&gt;&amp;&quot;')
})

test('渲染器：目录、图片与代码块', () => {
  const post = articles[0]
  const markdown = readFileSync(onDisk(post.file), 'utf8')
  const { html, toc } = renderArticle(markdown, { baseDir: post.baseDir })

  // 目录：四个二级标题，编号连续
  assert.equal(toc.length, 4)
  assert.deepEqual(toc.map((item) => item.id), ['sec-1', 'sec-2', 'sec-3', 'sec-4'])
  assert.equal(toc[0].text, '一、单个神经元')
  for (const item of toc) {
    assert.ok(html.includes('id="' + item.id + '"'), '正文缺少锚点 ' + item.id)
  }

  // 图片：相对路径被补成站内绝对路径，并带上懒加载
  assert.ok(html.includes('src="/writer_works/NNstudy/nn-fig1-neuron.svg"'))
  assert.ok(!html.includes('src="./NNstudy/'))
  assert.ok(html.includes('loading="lazy"'))

  // 代码块：语言标签 + highlight.js 上色的 class
  assert.ok(html.includes('class="code-card"'))
  assert.ok(html.includes('code-lang">python'))
  assert.ok(html.includes('code-lang">text'))
  assert.ok(html.includes('hljs-keyword'))

  // 正文不应残留一级标题标签
  assert.ok(!html.includes('<h1'))
})
