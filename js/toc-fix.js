/* 目录点击兜底
 * 官方 main.js 用 document.getElementById(decodeURI(href)) 定位标题，
 * 一旦运行时 id 缺失或被改写就会抛出 getBoundingClientRect 错误。
 * 这里在捕获阶段接管点击：先按 id 找，找不到再按目录文本匹配标题。
 */
(() => {
  const HEAD_SELECTOR = '#article-container h1, #article-container h2, #article-container h3,' +
    '#article-container h4, #article-container h5, #article-container h6'

  const findTarget = link => {
    const href = link.getAttribute('href') || ''
    let id = href
    try { id = decodeURI(href) } catch (e) { /* 非法编码时保持原值 */ }
    id = id.replace(/^#/, '')

    if (id && id !== 'null' && id !== 'undefined') {
      let el = document.getElementById(id)
      if (!el) {
        try {
          el = document.querySelector('[id="' + id.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"]')
        } catch (e) { /* id 含特殊字符时跳过 */ }
      }
      if (el) return el
    }

    // 回退：按目录文字匹配标题
    const textEl = link.querySelector('.toc-text')
    const text = ((textEl && textEl.textContent) || link.textContent || '').trim()
    if (text) {
      const hit = [...document.querySelectorAll(HEAD_SELECTOR)].find(h => h.textContent.trim() === text)
      if (hit) return hit
    }

    console.warn('[toc-fix] 未找到对应标题：', href, text)
    return null
  }

  document.addEventListener('click', e => {
    const link = e.target && e.target.closest ? e.target.closest('.toc-link') : null
    if (!link) return

    // 阻止冒泡，避免 main.js 中定位失败的处理函数执行
    e.preventDefault()
    e.stopPropagation()

    const el = findTarget(link)
    if (!el) return

    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: 'smooth' })

    if (window.innerWidth < 900) {
      const card = document.getElementById('card-toc')
      if (card) card.classList.remove('open')
    }
  }, true)
})()
