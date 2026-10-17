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

/**
 * 表格单元格合并（VLOOK 在 Typora 导出时的语法）
 *   单元格内容恰好是 "=="   -> 与左侧单元格合并（colspan）
 *   单元格内容恰好是 ":" "：" -> 与上方单元格合并（rowspan）
 * 只有「整个单元格」等于这些标记才生效，含冒号的普通文本（URL、[31:16] 等）不受影响。
 */
function tableMerge (md) {
  md.core.ruler.after('inline', 'vlook_table_merge', state => {
    const tokens = state.tokens
    const del = new Set() // 要删除的 token 下标（最后统一删除，避免索引错乱）

    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type !== 'table_open') continue

      let end = i + 1
      while (end < tokens.length && tokens[end].type !== 'table_close') end++
      if (end >= tokens.length) continue

      // 收集表格的行与单元格
      const rows = []
      let cur = null
      for (let j = i + 1; j < end; j++) {
        const t = tokens[j]
        if (t.type === 'tr_open') { cur = { cells: [] }; rows.push(cur) }
        else if (t.type === 'tr_close') { cur = null }
        else if (t.type === 'th_open' || t.type === 'td_open') {
          const inline = tokens[j + 1]
          cur && cur.cells.push({
            open: j,
            text: inline && inline.type === 'inline' ? String(inline.content).trim() : ''
          })
        }
      }
      if (!rows.length) continue

      const span = rows.map(r => r.cells.map(() => ({ cs: 1, rs: 1 })))
      const alive = rows.map(r => r.cells.map(() => true))

      for (let r = 0; r < rows.length; r++) {
        for (let c = 0; c < rows[r].cells.length; c++) {
          const cell = rows[r].cells[c]

          if (cell.text === '==') {
            // 向左合并：找左侧最近的存活单元格
            let left = c - 1
            while (left >= 0 && !alive[r][left]) left--
            if (left >= 0) {
              span[r][left].cs += 1
              removeCell(rows[r].cells[c], alive, r, c, del)
            }
          } else if (cell.text === ':' || cell.text === '：') {
            // 向上合并：找上方同列最近的存活单元格
            let up = r - 1
            while (up >= 0 && (c >= alive[up].length || !alive[up][c])) up--
            if (up >= 0) {
              span[up][c].rs += 1
              removeCell(rows[r].cells[c], alive, r, c, del)
            }
          }
        }
      }

      // 写回 colspan / rowspan
      for (let r = 0; r < rows.length; r++) {
        for (let c = 0; c < rows[r].cells.length; c++) {
          if (!alive[r][c]) continue
          const t = tokens[rows[r].cells[c].open]
          if (span[r][c].cs > 1) t.attrSet('colspan', String(span[r][c].cs))
          if (span[r][c].rs > 1) t.attrSet('rowspan', String(span[r][c].rs))
        }
      }
    }

    if (del.size) state.tokens = tokens.filter((t, idx) => !del.has(idx))
  })

  // 删除被合并掉的单元格：th/td_open — inline — th/td_close 三个 token
  function removeCell (cell, alive, row, col, del) {
    alive[row][col] = false
    del.add(cell.open)
    del.add(cell.open + 1)
    del.add(cell.open + 2)
  }
}

hexo.extend.filter.register('markdown-it:renderer', parser => {
  parser.use(githubAlerts)
  parser.use(tableMerge)
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

/**
 * 输出本地 mermaid 库：/js/mermaid.min.js
 * 直接放在 source/js/ 下会被 hexo 尝试解析 front-matter（库内含 "---"）而报 js-yaml 错，
 * 所以这里从 node_modules 生成静态路由；同时避免把 3.4MB 的库塞进仓库。
 */
const fs = require('fs')
const path = require('path')

try {
  const lib = path.join(path.dirname(require.resolve('mermaid/package.json')), 'dist/mermaid.min.js')
  if (fs.existsSync(lib)) {
    hexo.extend.generator.register('mermaid-asset', () => ({
      path: 'js/mermaid.min.js',
      data: () => fs.createReadStream(lib)
    }))
  } else {
    hexo.log.warn('未找到 mermaid 库：' + lib)
  }
} catch (e) {
  hexo.log.warn('mermaid 未安装，图表将不会渲染（执行 npm i mermaid 安装）')
}
