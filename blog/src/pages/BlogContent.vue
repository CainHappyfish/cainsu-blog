<script setup lang="ts">
import { ref, onMounted, nextTick, onBeforeUnmount, createApp } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marked } from 'marked'

import { parseFrontMatter } from '@/utils/blogUtils'
import type { BlogPost } from '@/utils/blogUtils'
import CodeBlock from '@/components/CodeBlock.vue'
import 'highlight.js/styles/github-dark.css'
import '@/styles/markdown.css'

import defaultCover from '@/assets/kasumi.png'

const route = useRoute()
const router = useRouter()

// 页面状态
const loading = ref(true)
const article = ref<BlogPost | null>(null)
const markdownContent = ref('')
const htmlContent = ref('')
const tocItems = ref<Array<{ id: string; text: string; level: number }>>([])  
const activeHeading = ref('')

// 代码块数据存储
const codeBlocks = ref<Array<{ id: string; code: string; language: string }>>([])

// 自定义markdown渲染器
const customRenderer = new marked.Renderer()

// 重写代码块渲染
customRenderer.code = function({ text, lang }: { text: string; lang?: string }) {
  const id = `code-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  const language = lang || 'text'
  
  // 存储代码块数据
  codeBlocks.value.push({
    id,
    code: text,
    language
  })
  
  // 返回占位符
  return `<div class="code-block-wrapper" data-code-id="${id}"></div>`
}

// 配置marked
marked.setOptions({
  renderer: customRenderer,
  breaks: true,
  gfm: true
})

// 解析markdown并生成目录
const parseMarkdownContent = async (markdown: string) => {
  // 清空之前的代码块数据
  codeBlocks.value = []
  
  // 解析markdown
  const html = await marked(markdown)
  
  // 生成目录
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html
  
  const headings = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6')
  const toc: Array<{ id: string; text: string; level: number }> = []
  
  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.charAt(1))
    const text = heading.textContent || ''
    const id = `heading-${index}`
    
    heading.id = id
    toc.push({ id, text, level })
  })
  
  htmlContent.value = tempDiv.innerHTML
  tocItems.value = toc
}

// 渲染代码块组件
const renderCodeBlocks = async () => {
  await nextTick()
  
  // 添加延迟确保DOM完全更新
  setTimeout(() => {
    // 查找所有代码块占位符并渲染
    const wrappers = document.querySelectorAll('.code-block-wrapper')
    
    wrappers.forEach((wrapper) => {
      const codeId = wrapper.getAttribute('data-code-id')
      const codeBlockData = codeBlocks.value.find(block => block.id === codeId)
      
      if (codeBlockData) {
        // 创建CodeBlock组件实例
        const app = createApp(CodeBlock, {
          code: codeBlockData.code,
          language: codeBlockData.language,
          showLineNumbers: true
        })
        
        // 清空容器并挂载组件
        wrapper.innerHTML = ''
        app.mount(wrapper as HTMLElement)
      }
    })
  }, 100)
}

// 滚动到指定标题
const scrollToHeading = (id: string) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    activeHeading.value = id
  }
}

// 监听滚动，更新活跃标题
const handleScroll = () => {
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
  let current = ''
  
  headings.forEach(heading => {
    const rect = heading.getBoundingClientRect()
    if (rect.top <= 100) {
      current = heading.id
    }
  })
  
  activeHeading.value = current
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 返回博客列表
const goBack = () => {
  router.push('/blogs')
}

// 处理图片加载错误
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = defaultCover
}

// 加载文章内容
const loadArticle = async () => {
  try {
    const articleId = route.params.filename as string
    const blogModules = import.meta.glob('/src/blogs/*.md', { as: 'raw' })
    
    const modulePath = `/src/blogs/${articleId}.md`
    const moduleLoader = blogModules[modulePath]
    
    if (!moduleLoader) {
      throw new Error('文章不存在')
    }
    
    const content = await moduleLoader()
    const { frontMatter, content: markdown } = parseFrontMatter(content)
    
    // 设置文章信息
    article.value = {
      title: (frontMatter.title as string) || '无标题',
      date: (frontMatter.date as string) || '',
      category: (frontMatter.category as string) || '未分类',
      tags: (frontMatter.tags as string[]) || [],
      summary: (frontMatter.summary as string) || '',
      author: (frontMatter.author as string) || '破酥',
      readTime: (frontMatter.readTime as string) || '5分钟',
      cover: frontMatter.cover as string | undefined,
      filename: articleId
    }
    
    markdownContent.value = markdown
    
    // 解析markdown内容并生成目录
    await parseMarkdownContent(markdown)
    
    // 等待DOM更新后渲染代码块组件
    await nextTick()
    await renderCodeBlocks()
    
  } catch (error) {
    console.error('加载文章失败:', error)
    router.push('/404')
  } finally {
    loading.value = false
  }
}

// 生命周期
onMounted(async () => {
  await loadArticle()
  
  // 添加滚动监听
  await nextTick()
  window.addEventListener('scroll', handleScroll)
})

// 清理
onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="blog-content-page">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载文章中...</p>
    </div>
    
    <!-- 文章内容 -->
    <div v-else-if="article" class="article-container">
      <!-- 返回按钮 -->
      <button class="back-btn" @click="goBack">
        <span class="back-icon">←</span>
        返回博客列表
      </button>
      
      <!-- 文章头部 -->
       <header class="article-header">
         <div class="article-cover">
           <img 
             :src="article.cover || defaultCover" 
             :alt="article.title" 
             @error="handleImageError"
           />
         </div>
        
        <div class="article-meta">
          <h1 class="article-title">{{ article.title }}</h1>
          
          <div class="article-info">
            <div class="info-item">
              <span class="info-label">发布时间</span>
              <span class="info-value">{{ formatDate(article.date) }}</span>
            </div>
            
            <div class="info-item">
              <span class="info-label">分类</span>
              <span class="info-value category">{{ article.category }}</span>
            </div>
            
            <div class="info-item">
              <span class="info-label">作者</span>
              <span class="info-value">{{ article.author }}</span>
            </div>
            
            <div class="info-item">
              <span class="info-label">阅读时间</span>
              <span class="info-value">{{ article.readTime }}</span>
            </div>
          </div>
          
          <div class="article-tags" v-if="article.tags && article.tags.length > 0">
            <span v-for="tag in article.tags" :key="tag" class="tag">
              #{{ tag }}
            </span>
          </div>
          
          <p class="article-summary" v-if="article.summary">
            {{ article.summary }}
          </p>
        </div>
      </header>
      
      <!-- 主要内容区域 -->
      <div class="main-content">
        <!-- 目录侧边栏 -->
        <aside class="toc-sidebar" v-if="tocItems.length > 0">
          <div class="toc-container">
            <h3 class="toc-title">📋 目录</h3>
            <nav class="toc-nav">
              <ul class="toc-list">
                <li 
                  v-for="item in tocItems" 
                  :key="item.id"
                  :class="[
                    'toc-item', 
                    `toc-level-${item.level}`,
                    { active: activeHeading === item.id }
                  ]"
                  @click="scrollToHeading(item.id)"
                >
                  {{ item.text }}
                </li>
              </ul>
            </nav>
          </div>
        </aside>
        
        <!-- 文章正文 -->
        <article class="article-body">
          <div class="markdown-content" v-html="htmlContent"></div>
        </article>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 页面容器 */
.blog-content-page {
  min-height: 100vh;
  background-color: var(--bg-primary);
  padding: var(--spacing-lg) var(--spacing-md);
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  color: var(--text-primary);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-light);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--spacing-md);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 文章容器 */
.article-container {
  max-width: 1400px;
  margin: 0 auto;
  animation: fadeInUp 0.8s ease-out;
}

/* 返回按钮 */
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  margin-bottom: var(--spacing-lg);
  backdrop-filter: blur(10px);
  min-height: 44px;
  touch-action: manipulation;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateX(-2px);
}

.back-btn:active {
  transform: scale(0.98) translateX(-2px);
  background: rgba(255, 255, 255, 0.2);
}

.back-icon {
  font-size: var(--text-lg);
  font-weight: bold;
}

/* 文章头部 */
.article-header {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(20px);
  border-radius: var(--radius-xl);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  margin-bottom: var(--spacing-xl);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.article-cover {
  width: 100%;
  height: 400px;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.article-cover img {
  width: 100%;
  height: auto;
  min-height: 100%;
  object-fit: contain;
  object-position: center;
  transition: transform var(--transition-slow);
}

.article-cover:hover img {
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .article-cover {
    height: 280px;
  }
}

@media (max-width: 480px) {
  .article-cover {
    height: 220px;
  }
}

.article-meta {
  padding: var(--spacing-xl);
}

.article-title {
  font-size: var(--text-4xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
  line-height: 1.2;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.article-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.info-label {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  font-weight: 500;
}

.info-value {
  font-size: var(--text-base);
  color: var(--text-primary);
  font-weight: 600;
}

.info-value.category {
  color: var(--primary-color);
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

.tag {
  padding: var(--spacing-xs) var(--spacing-sm);
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 500;
  transition: transform var(--transition-fast);
}

.tag:hover {
  transform: translateY(-2px);
}

.article-summary {
  font-size: var(--text-lg);
  color: var(--text-secondary);
  line-height: 1.6;
  font-style: italic;
  padding: var(--spacing-md);
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--primary-color);
}

/* 主要内容区域 */
.main-content {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: var(--spacing-xl);
  align-items: start;
}

/* 目录侧边栏 */
.toc-sidebar {
  position: sticky;
  top: calc(var(--spacing-lg) + 60px);
}

.toc-container {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(20px);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: var(--spacing-lg);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  max-height: 70vh;
  overflow-y: auto;
}

.toc-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-item {
  padding: var(--spacing-xs) var(--spacing-sm);
  margin-bottom: var(--spacing-xs);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  line-height: 1.4;
}

.toc-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
  transform: translateX(4px);
}

.toc-item.active {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  font-weight: 600;
}

.toc-level-1 { padding-left: var(--spacing-sm); }
.toc-level-2 { padding-left: var(--spacing-md); }
.toc-level-3 { padding-left: var(--spacing-lg); }
.toc-level-4 { padding-left: var(--spacing-xl); }
.toc-level-5 { padding-left: calc(var(--spacing-xl) + var(--spacing-sm)); }
.toc-level-6 { padding-left: calc(var(--spacing-xl) + var(--spacing-md)); }

/* 文章正文 */
.article-body {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(20px);
  border-radius: var(--radius-xl);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: var(--spacing-xl);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-content {
    grid-template-columns: 200px 1fr;
    gap: var(--spacing-lg);
  }
}

@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
  
  .toc-sidebar {
    position: static;
    order: -1;
  }
  
  .toc-container {
    max-height: 200px;
    overflow-y: auto;
    padding: var(--spacing-md);
  }
  
  .toc-title {
    font-size: var(--text-base);
  }
  
  .toc-item {
    font-size: var(--text-xs);
    padding: var(--spacing-xs);
  }
}

@media (max-width: 768px) {
  .blog-content-page {
    padding: var(--spacing-md) var(--spacing-sm);
  }
  
  .article-container {
    animation: fadeInUp 0.6s ease-out;
  }
  
  .back-btn {
    margin-bottom: var(--spacing-md);
    padding: var(--spacing-sm);
    font-size: var(--text-xs);
  }
  
  .article-header {
    margin-bottom: var(--spacing-lg);
    border-radius: var(--radius-lg);
  }
  
  .article-title {
    font-size: var(--text-2xl);
    margin-bottom: var(--spacing-md);
    line-height: 1.3;
  }
  
  .article-info {
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-sm);
  }
  
  .article-meta {
    padding: var(--spacing-lg);
  }
  
  .article-tags {
    margin-bottom: var(--spacing-md);
  }
  
  .tag {
    font-size: var(--text-xs);
    padding: 4px var(--spacing-xs);
  }
  
  .article-summary {
    font-size: var(--text-base);
    padding: var(--spacing-sm);
  }
  
  .article-body {
    padding: var(--spacing-lg);
    border-radius: var(--radius-lg);
  }
  
  .toc-container {
    border-radius: var(--radius-md);
  }
}

@media (max-width: 640px) {
  .blog-content-page {
    padding: var(--spacing-sm);
  }
  
  .back-btn {
    width: 100%;
    justify-content: center;
    margin-bottom: var(--spacing-sm);
  }
  
  .article-header {
    border-radius: var(--radius-md);
  }
  
  .article-title {
    font-size: var(--text-xl);
    text-align: center;
  }
  
  .article-info {
    grid-template-columns: 1fr;
    gap: var(--spacing-xs);
  }
  
  .info-item {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-xs) 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .info-item:last-child {
    border-bottom: none;
  }
  
  .article-tags {
    justify-content: center;
  }
  
  .article-summary {
    text-align: center;
    font-size: var(--text-sm);
  }
  
  .toc-container {
    padding: var(--spacing-sm);
  }
  
  .toc-item {
    padding: var(--spacing-xs) var(--spacing-sm);
  }
}

@media (max-width: 480px) {
  .blog-content-page {
    padding: var(--spacing-xs);
  }
  
  .back-btn {
    font-size: 12px;
    padding: var(--spacing-xs) var(--spacing-sm);
  }
  
  .article-header {
    border-radius: var(--radius-sm);
  }
  
  .article-title {
    font-size: var(--text-lg);
    margin-bottom: var(--spacing-sm);
  }
  
  .article-meta {
    padding: var(--spacing-md);
  }
  
  .info-label {
    font-size: var(--text-xs);
  }
  
  .info-value {
    font-size: var(--text-sm);
  }
  
  .tag {
    font-size: 10px;
    padding: 2px var(--spacing-xs);
  }
  
  .article-summary {
    font-size: var(--text-xs);
    line-height: 1.5;
  }
  
  .article-body {
    padding: var(--spacing-md);
    border-radius: var(--radius-sm);
    max-width: calc(100vw - 10px);
  }

  .toc-sidebar {
    max-width: calc(100vw - 10px);
  }
  
  .toc-container {
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-sm);
  }
  
  .toc-title {
    font-size: var(--text-sm);
    margin-bottom: var(--spacing-sm);
  }
  
  .toc-item {
    font-size: 11px;
    padding: 4px var(--spacing-xs);
    line-height: 1.3;
  }
  
  .toc-level-1 { padding-left: var(--spacing-xs); }
  .toc-level-2 { padding-left: var(--spacing-sm); }
  .toc-level-3 { padding-left: var(--spacing-md); }
  .toc-level-4 { padding-left: var(--spacing-lg); }
  .toc-level-5 { padding-left: calc(var(--spacing-lg) + var(--spacing-xs)); }
  .toc-level-6 { padding-left: calc(var(--spacing-lg) + var(--spacing-sm)); }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .back-btn {
    min-height: 48px;
  }
  
  .toc-item {
    min-height: 40px;
    display: flex;
    align-items: center;
  }
  
  .tag {
    min-height: 32px;
    display: inline-flex;
    align-items: center;
  }
}

/* 代码块容器样式 */
.code-block-wrapper {
  margin: var(--spacing-lg) 0;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

/* 动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
