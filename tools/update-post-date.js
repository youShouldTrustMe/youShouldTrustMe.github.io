#!/usr/bin/env node
'use strict'
/**
 * pre-commit hook 用的脚本：
 * 把本次提交中「被修改/新增」的文章的 front-matter date 写为该文件的「初次上传时间」，
 * 即它在 git 中第一次被加入提交的时间（--diff-filter=A 的最早一次提交）。
 *
 * - 新增文件（还没有任何提交历史）：写入当前时间（本次提交就是它的初次上传）。
 * - 已有文件：无论改多少次，date 始终等于它的初次上传时间，改动不会改变日期。
 * - 未改动的文章不做任何处理。
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

function fmt (d) {
  const p = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

// 取文件「初次上传」时间：最早一次新增（A）提交的作者时间（ISO8601，含时区）。
// 没有提交历史（本次才新增）时返回 null。
function firstUploadDate (rel) {
  try {
    const out = run(`git log --diff-filter=A --format=%aI -- "${rel}"`)
    const lines = out.split(/\r?\n/).map(s => s.trim()).filter(Boolean)
    // git log 输出按时间倒序，最后一行是最早的一次提交
    if (lines.length) return new Date(lines[lines.length - 1])
  } catch (e) { /* 无历史时忽略，按新增处理 */ }
  return null
}

// 本次已暂存的、新增或修改的文章
let files = []
try {
  files = run('git -c core.quotepath=false diff --cached --name-only --diff-filter=ACM')
    .split(/\r?\n/)
    .map(s => s.trim())
    .filter(f => /^source[\\/]_posts[\\/].*\.md$/i.test(f))
    .filter(f => !f.includes('.~'))
} catch (e) {
  process.exit(0)
}

if (!files.length) process.exit(0)

let changed = 0

for (const rel of files) {
  const file = path.join(repo, rel)
  if (!fs.existsSync(file)) continue

  const isNew = firstUploadDate(rel) === null
  const d = isNew ? new Date() : firstUploadDate(rel)
  const dateStr = fmt(d)

  const raw = fs.readFileSync(file, 'utf8')
  const eol = raw.includes('\r\n') ? '\r\n' : '\n'
  const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  let out

  if (fm && /^date:/m.test(fm[1])) {
    // 已有 date，改为初次上传时间（幂等：重复提交值不变）
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
    console.log(`[date] ${rel} -> ${dateStr}${isNew ? ' (新增，取提交时间)' : ''}`)
  }
}

if (changed) console.log(`[date] 已更新 ${changed} 篇文章的日期为初次上传时间`)
