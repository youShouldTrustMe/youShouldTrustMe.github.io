/* global document */
/**
 * 文章标题自动编号（h1~h4）
 * 浏览器的 CSS counter 链式 reset 存在兼容性问题（兄弟元素间 reset 不生效），
 * 改为 JS 直接计算编号并写入 CSS 变量 --h-num，由 custom.css 的 ::before 显示。
 * pjax 切换页面后自动重算。
 */
;(function () {
  'use strict'

  function numberHeadings () {
    var container = document.getElementById('article-container')
    if (!container) return
    var counters = [0, 0, 0, 0, 0, 0]
    var heads = container.querySelectorAll('h1, h2, h3, h4')
    for (var i = 0; i < heads.length; i++) {
      var level = Number(heads[i].tagName[1])
      counters[level - 1]++
      // 进入下一章，重置更深的层级
      for (var j = level; j < 6; j++) counters[j] = 0
      var num = counters.slice(0, level).join('.')
      // h1 形如 "5. "，其余形如 "5.1 "
      var text = level === 1 ? num + '. ' : num + ' '
      heads[i].style.setProperty('--h-num', '"' + text + '"')
    }
  }

  numberHeadings()
  document.addEventListener('pjax:complete', numberHeadings)
})()
