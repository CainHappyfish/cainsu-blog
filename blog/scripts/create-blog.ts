#!/usr/bin/env node
/* eslint-disable no-undef */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import * as readline from 'readline'

// 获取命令行参数
const args = process.argv.slice(2)
const filename = args[0] // 文件名（不包含.md扩展名）

if (!filename) {
  console.error('使用方法: npm run create:blog <filename>')
  console.error('示例: npm run create:blog my-new-blog')
  process.exit(1)
}

// 获取当前脚本目录
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

// 目标目录
const targetDir = path.join(projectRoot, 'src', 'blogs')

// 确保目录存在
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true })
}

// 文件路径
const fileName = `${filename}.md`
const filePath = path.join(targetDir, fileName)

// 检查文件是否已存在
if (fs.existsSync(filePath)) {
  console.error(`文件 ${fileName} 已存在于 blogs 目录中`)
  process.exit(1)
}

// 创建readline接口用于交互式输入
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

// 提示用户输入博客信息
const askQuestion = (question: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim())
    })
  })
}

// 获取当前日期
const getCurrentDate = (): string => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 主函数
const main = async () => {
  try {
    console.log('\n🚀 创建新的博客文章\n')
    
    const title = await askQuestion('📝 请输入文章标题: ')
    const category = await askQuestion('📂 请输入文章分类 (默认: 技术分享): ') || '技术分享'
    const tagsInput = await askQuestion('🏷️  请输入标签 (用逗号分隔): ')
    const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : []
    const summary = await askQuestion('📄 请输入文章摘要: ')
    const author = await askQuestion('👤 请输入作者 (默认: 破酥): ') || '破酥'
    const readTime = await askQuestion('⏱️  请输入预计阅读时间 (默认: 5分钟): ') || '5分钟'
    const cover = await askQuestion('🖼️  请输入封面图片路径 (可选): ')
    
    const currentDate = getCurrentDate()
    
    // 生成markdown模板
    const template = `---
title: "${title}"
date: "${currentDate}"
category: "${category}"
tags: [${tags.map(tag => `"${tag}"`).join(', ')}]
summary: "${summary}"
author: "${author}"
readTime: "${readTime}"${cover ? `\ncover: "${cover}"` : ''}
---

# ${title}

${summary}

## 介绍

在这里开始编写你的文章内容...

## 主要内容

### 小节标题

这里是具体的内容。

\`\`\`javascript
// 代码示例
console.log('Hello, World!');
\`\`\`

## 总结

在这里总结文章的要点。

---

*感谢阅读！如果这篇文章对你有帮助，请不要忘记点赞和分享。*
`

    // 写入文件
    fs.writeFileSync(filePath, template, 'utf8')
    
    console.log('\n✅ 博客文章创建成功!')
    console.log(`📁 文件位置: ${filePath}`)
    console.log(`📝 文件名: ${fileName}`)
    console.log('\n🎉 现在你可以开始编写你的文章了!')
    
  } catch (error) {
    console.error('❌ 创建文件时出错:', error)
    process.exit(1)
  } finally {
    rl.close()
  }
}

// 运行主函数
main()