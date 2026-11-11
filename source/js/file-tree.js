/* global window, document, location */
;(function () {
  'use strict'

  var data = window.__FILE_TREE_DATA__
  if (!data || !data.children || !data.children.length) return

  function esc (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    })
  }

  // 目录内文章总数（递归）
  function count (node) {
    var n = 0
    node.children.forEach(function (c) {
      n += c.t === 'd' ? count(c) : 1
    })
    return n
  }

  // 默认全部折叠
  function render (node) {
    var html = ''
    node.children.forEach(function (child) {
      if (child.t === 'd') {
        html += '<details class="ft-dir">' +
          '<summary>' +
            '<i class="fas fa-chevron-right ft-angle"></i>' +
            '<i class="fas fa-folder ft-ic"></i>' +
            '<span class="ft-name">' + esc(child.n) + '</span>' +
            '<span class="ft-count">' + count(child) + '</span>' +
          '</summary>' +
          render(child) +
          '</details>'
      } else {
        html += '<a class="ft-file" href="' + esc(child.u) + '" data-path="' + esc(child.p) + '">' +
          '<i class="fas fa-file-lines ft-ic"></i>' +
          '<span class="ft-name">' + esc(child.ti || child.n) + '</span>' +
        '</a>'
      }
    })
    return '<div class="ft-group">' + html + '</div>'
  }

  var overlay = document.createElement('div')
  overlay.id = 'ft-overlay'

  var aside = document.createElement('aside')
  aside.id = 'file-tree'
  aside.innerHTML =
    '<div class="ft-head">' +
      '<span class="ft-title"><i class="fas fa-folder-open"></i>文件夹</span>' +
      '<button class="ft-close" type="button" aria-label="关闭"><i class="fas fa-xmark"></i></button>' +
    '</div>' +
    '<nav class="ft-body">' + render(data) + '</nav>'

  var toggle = document.createElement('button')
  toggle.id = 'ft-toggle'
  toggle.type = 'button'
  toggle.title = '文章文件夹'
  toggle.innerHTML = '<i class="fas fa-folder-open"></i>'

  document.body.appendChild(overlay)
  document.body.appendChild(aside)
  document.body.appendChild(toggle)

  function openDrawer () { document.documentElement.classList.add('ft-open') }
  function closeDrawer () { document.documentElement.classList.remove('ft-open') }

  toggle.addEventListener('click', function () {
    var open = document.documentElement.classList.toggle('ft-open')
    // 每次打开抽屉都把当前文章滚动定位到可见区域
    if (open) markCurrent()
  })
  overlay.addEventListener('click', closeDrawer)
  aside.querySelector('.ft-close').addEventListener('click', closeDrawer)
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeDrawer()
  })

  // 点击文章链接：立刻高亮该项，再收起抽屉让内容展示出来
  aside.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('a.ft-file')
    if (!link) return
    var old = aside.querySelector('.ft-file.ft-current')
    if (old) old.classList.remove('ft-current')
    link.classList.add('ft-current')
    closeDrawer()
  })

  // 当前文章高亮 + 自动展开所在目录
  function norm (p) {
    try {
      p = decodeURIComponent(p)
    } catch (e) { /* 非法编码时保持原样 */ }
    p = String(p || '').replace(/index\.html$/, '').replace(/\/+$/, '')
    return p || '/'
  }

  function attrEsc (s) {
    return String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  }

  function markCurrent () {
    var old = aside.querySelector('.ft-file.ft-current')
    if (old) old.classList.remove('ft-current')

    var path = norm(location.pathname)
    var link = aside.querySelector('.ft-file[data-path="' + attrEsc(path) + '"]')
    if (!link) return

    link.classList.add('ft-current')
    var d = link.closest('details')
    while (d) {
      d.open = true
      d = d.parentElement ? d.parentElement.closest('details') : null
    }
    requestAnimationFrame(function () {
      link.scrollIntoView({ block: 'center' })
    })
  }

  markCurrent()
  // pjax 翻页后重新高亮（抽屉 DOM 挂在 body 上，pjax 不会重建它）
  document.addEventListener('pjax:complete', markCurrent)
})()
