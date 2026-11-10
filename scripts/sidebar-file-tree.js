/* global hexo */
'use strict'

/**
 * 左侧文件夹抽屉的数据源
 * 遍历 source/_posts 的真实目录结构（Typora 笔记目录），生成 /js/file-tree-data.js：
 *   window.__FILE_TREE_DATA__ = { n: '_posts', children: [目录/文章节点...] }
 * 节点格式：目录 { t:'d', n:目录名, children:子节点 }，文章 { t:'f', n:文件名, ti:标题, u:链接, p:站点路径 }
 * 前端逻辑在 source/js/file-tree.js，样式在 source/css/file-tree.css。
 */
const fs = require('fs')
const path = require('path')

const POSTS_DIR = '_posts'

function cmp (a, b) {
  if (a.t !== b.t) return a.t === 'd' ? -1 : 1
  try {
    return a.n.localeCompare(b.n, 'zh-Hans-CN', { numeric: true })
  } catch (e) {
    return a.n.localeCompare(b.n)
  }
}

// posts: source -> 文章对象 的映射（含 source、title、path）
function walk (hexo, postMap, dir, base, depth) {
  let entries
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch (e) {
    return []
  }

  const children = []
  for (const ent of entries) {
    // 跳过隐藏文件、编辑器临时文件（xx.md~ 等）
    if (ent.name.startsWith('.') || ent.name.includes('.~')) continue

    if (ent.isDirectory()) {
      const sub = walk(hexo, postMap, path.join(dir, ent.name),
        base ? base + '/' + ent.name : ent.name, depth + 1)
      if (sub.length) {
        children.push({ t: 'd', n: ent.name, children: sub.sort(cmp) })
      }
    } else if (ent.isFile() && /\.md$/i.test(ent.name)) {
      const rel = base ? base + '/' + ent.name : ent.name
      const post = postMap.get(POSTS_DIR + '/' + rel)
      if (!post) continue // 草稿等未发布内容不出现在树里

      const root = hexo.config.root || '/'
      children.push({
        t: 'f',
        n: ent.name.replace(/\.md$/i, ''),
        ti: post.title ? String(post.title) : undefined,
        u: root + post.path,
        p: root + post.path
      })
    }
  }
  return children
}

hexo.extend.generator.register('file-tree-data', () => {
  // 注意：用 hexo.locals.get('posts') 拿到的是带 path 虚拟属性的 Document，
  // 且 Query.find 是按 schema 查询而非谓词过滤，所以要自己建映射
  const postMap = new Map()
  hexo.locals.get('posts').forEach(p => {
    if (p.source) postMap.set(p.source, p)
  })
  const tree = {
    n: POSTS_DIR,
    children: walk(hexo, postMap, path.join(hexo.source_dir, POSTS_DIR), '', 0).sort(cmp)
  }

  if (!tree.children.length) hexo.log.warn('文件树数据为空：未在 ' + POSTS_DIR + ' 找到已发布文章')

  // "<\/" 转义防止 </script> 提前闭合标签
  const json = JSON.stringify(tree).replace(/<\//g, '<\\/')
  return {
    path: 'js/file-tree-data.js',
    data: 'window.__FILE_TREE_DATA__=' + json + ';\n'
  }
})
