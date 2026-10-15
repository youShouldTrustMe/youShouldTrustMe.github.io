/* global hexo */
'use strict'

/**
 * GitHub 风格警示框
 *   > [!NOTE] / [!TIP] / [!IMPORTANT] / [!WARNING] / [!CAUTION]
 * 渲染为 <blockquote class="markdown-alert markdown-alert-tip">，配合 custom.css 显示样式
 */
const ALERT_TYPES = ['note', 'tip', 'important', 'warning', 'caution', 'danger']

function githubAlerts (md) {
  // 必须在 inline 规则之后，此时 inline token 的 children 才能取到文本
  md.core.ruler.after('inline', 'github_alerts', state => {
    for (let i = 0; i < state.tokens.length; i++) {
      if (state.tokens[i].type !== 'blockquote_open') continue

      // 找到引用块内第一个段落的 inline token
      let j = i + 1
      while (j < state.tokens.length &&
             state.tokens[j].type !== 'paragraph_open' &&
             state.tokens[j].type !== 'blockquote_close') j++

      const paraOpen = state.tokens[j]
      const inline = state.tokens[j + 1]
      if (!paraOpen || paraOpen.type !== 'paragraph_open') continue
      if (!inline || inline.type !== 'inline') continue

      const first = inline.children[0]
      if (!first || first.type !== 'text') continue

      const matched = first.content.match(/^\s*\[!(\w+)\]\s*/i)
      if (!matched) continue

      const type = matched[1].toLowerCase()
      if (!ALERT_TYPES.includes(type)) continue

      // 给引用块加上类型 class
      state.tokens[i].attrSet('class', 'markdown-alert markdown-alert-' + type)

      // 去掉正文里的 [!XXX] 标记本身
      first.content = first.content.slice(matched[0].length)
      if (!first.content.trim()) {
        inline.children.shift()
        // 顺带清掉紧随的换行/br，避免标题行留下空行
        while (inline.children.length &&
               (inline.children[0].type === 'softbreak' || inline.children[0].type === 'hardbreak')) {
          inline.children.shift()
        }
      }
      // 整段只剩标记时，连空段落一起删掉，避免留下 <p></p> 撑开间距
      const paraClose = state.tokens[j + 2]
      if (!inline.children.length && paraClose && paraClose.type === 'paragraph_close') {
        state.tokens.splice(j, 3)
      }
    }
  })
}

hexo.extend.filter.register('markdown-it:renderer', parser => {
  parser.use(githubAlerts)
})

/**
 * 公式页面自动开启 MathJax
 * 主题配置了 math.per_page: true，只有 front-matter 标记 mathjax: true 的页面才加载，
 * 逐个手动维护太麻烦，这里检测文章内容里有没有公式，有就自动标记。
 */
function detectMath (source) {
  // 先剔除代码块和行内代码，避免 shell 的 $VAR 之类被误判
  const text = String(source)
    .replace(/```[\s\S]*?```/g, '')
    .replace(/~~~[\s\S]*?~~~/g, '')
    .replace(/`[^`\n]*`/g, '')

  // 块级公式 $$...$$
  if (/\$\$[\s\S]+?\$\$/.test(text)) return true

  // 行内公式 $...$，要求内含 LaTeX 特征，降低误判
  const inline = text.match(/(?<!\\)\$[^$\n]+\$/g) || []
  return inline.some(s => /[_^]|\\(frac|sum|int|cdot|times|sqrt|begin|left|right|text|alpha|beta|theta|pi|delta|mu|sigma|leq|geq|neq)/.test(s))
}

hexo.extend.filter.register('before_post_render', data => {
  // 文章已显式配置时不干预
  if (data.mathjax !== undefined) return data
  if (detectMath(data.content || data.raw || '')) data.mathjax = true
  return data
})
