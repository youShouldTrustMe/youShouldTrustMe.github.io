#!/usr/bin/env node
'use strict'
/**
 * pre-commit hook 用的脚本：
 * 把本次提交中「被修改/新增」的文章的 front-matter date 更新为当前时间。
 * 未改动的文章保持原日期，这样归档里改过的文章日期是今天，没动的是老日期。
 *
 * 之所以不用文件的修改时间：GitHub Actions 的 checkout 会重置所有文件的时间戳，
 * 会导致每次部署时全部文章的日期都变成部署当天。
 */
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const repo = process.cwd()

function run (cmd) {
  return execSync(cmd, { cwd: repo, encoding: 'utf8' })
}

function now () {
  const d = new Date()
  const p = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

// 本次已暂存的、新增或修改的文章
let files = []
try {
  files = run('git diff --cached --name-only --diff-filter=ACM')
    .split(/\r?\n/)
    .map(s => s.trim())
    .filter(f => /^source[\\/]_posts[\\/].*\.md$/i.test(f))
    .filter(f => !f.includes('.~'))
} catch (e) {
  process.exit(0)
}

if (!files.length) process.exit(0)

const dateStr = now()
let changed = 0

for (const rel of files) {
  const file = path.join(repo, rel)
  if (!fs.existsSync(file)) continue

  const raw = fs.readFileSync(file, 'utf8')
  const eol = raw.includes('\r\n') ? '\r\n' : '\n'
  const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  let out

  if (fm && /^date:/m.test(fm[1])) {
    // 已有 date，更新为当前时间
    out = raw.replace(/^date:.*$/m, 'date: ' + dateStr)
  } else if (fm) {
    // 有 front-matter 但没有 date，补在开头
    out = raw.replace(/^---\r?\n/, '---' + eol + 'date: ' + dateStr + eol)
  } else {
    // 完全没有 front-matter
    out = '---' + eol + 'date: ' + dateStr + eol + '---' + eol + eol + raw
  }

  if (out !== raw) {
    fs.writeFileSync(file, out, 'utf8')
    run(`git add -- "${rel}"`)
    changed++
    console.log(`[date] ${rel} -> ${dateStr}`)
  }
}

if (changed) console.log(`[date] 已更新 ${changed} 篇文章的日期`)
