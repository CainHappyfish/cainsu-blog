# 脚本使用说明

本目录包含了用于快速创建项目文件的脚本工具。

## 可用脚本

### 1. 创建 Vue 组件/页面

```bash
# 创建页面
npm run create:page PageName

# 创建组件
npm run create:component ComponentName

# 通用创建命令
npm run create:vue <type> <name>
```

**示例：**
```bash
npm run create:page About
npm run create:component Button
```

### 2. 创建博客文章 ✨

```bash
npm run create:blog <filename>
```

**示例：**
```bash
npm run create:blog my-first-blog
```

运行后会交互式地询问以下信息：
- 📝 文章标题
- 📂 文章分类（默认：技术分享）
- 🏷️ 标签（用逗号分隔）
- 📄 文章摘要
- 👤 作者（默认：破酥）
- ⏱️ 预计阅读时间（默认：5分钟）
- 🖼️ 封面图片路径（可选）

**生成的文件格式：**
```markdown
---
title: "文章标题"
date: "2024-01-15"
category: "分类"
tags: ["标签1", "标签2"]
summary: "文章摘要"
author: "作者"
readTime: "阅读时间"
cover: "封面路径"  # 可选
---

# 文章标题

文章摘要

## 介绍

在这里开始编写你的文章内容...

## 主要内容

### 小节标题

这里是具体的内容。

```javascript
// 代码示例
console.log('Hello, World!');
```

## 总结

在这里总结文章的要点。

---

*感谢阅读！如果这篇文章对你有帮助，请不要忘记点赞和分享。*
```

## 文件位置

- **Vue 页面**: `src/pages/`
- **Vue 组件**: `src/components/`
- **博客文章**: `src/blogs/`

## 注意事项

1. 所有脚本都会检查文件是否已存在，避免覆盖现有文件
2. 博客文章的日期会自动设置为当前日期
3. 生成的文件都包含基础模板，可以直接开始编写内容
4. 确保在项目根目录的 `blog` 文件夹中运行这些命令

## 依赖

这些脚本依赖以下工具：
- Node.js
- TypeScript (tsx)
- 项目已安装的依赖包

运行前请确保已执行 `npm install`。