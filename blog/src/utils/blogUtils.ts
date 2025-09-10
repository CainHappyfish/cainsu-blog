// 博客相关工具函数

// 博客文章接口定义
export interface BlogPost {
  title: string
  date: string
  category: string
  tags: string[]
  summary: string
  author: string
  readTime: string
  cover?: string
  filename: string
}

// 解析markdown文件的yaml前置数据
export function parseFrontMatter(content: string): { frontMatter: Record<string, unknown>; content: string } {
  const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/
  const match = content.match(frontMatterRegex)
  
  if (!match) {
    return { frontMatter: {}, content }
  }
  
  const frontMatterText = match[1]
  const markdownContent = match[2]
  
  // 简单的YAML解析（仅支持基本格式）
  const frontMatter: Record<string, unknown> = {}
  const lines = frontMatterText.split('\n')
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    if (!trimmedLine || trimmedLine.startsWith('#')) continue
    
    const colonIndex = trimmedLine.indexOf(':')
    if (colonIndex === -1) continue
    
    const key = trimmedLine.substring(0, colonIndex).trim()
    let value = trimmedLine.substring(colonIndex + 1).trim()
    
    // 处理引号
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    
    // 处理数组格式 ["item1", "item2"]
    if (value.startsWith('[') && value.endsWith(']')) {
      const arrayContent = value.slice(1, -1)
      const items = arrayContent.split(',').map(item => {
        const trimmed = item.trim()
        if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || 
            (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
          return trimmed.slice(1, -1)
        }
        return trimmed
      })
      frontMatter[key] = items
    } else {
      frontMatter[key] = value
    }
  }
  
  return { frontMatter, content: markdownContent }
}

// 获取所有博客文章
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const blogModules = import.meta.glob('/src/blogs/*.md', { as: 'raw' })
  const posts: BlogPost[] = []
  
  for (const [path, moduleLoader] of Object.entries(blogModules)) {
    try {
      const content = await moduleLoader()
      const { frontMatter } = parseFrontMatter(content)
      
      if (frontMatter.title && frontMatter.date) {
        const filename = path.split('/').pop()?.replace('.md', '') || ''
        posts.push({
          title: frontMatter.title as string,
          date: frontMatter.date as string,
          category: (frontMatter.category as string) || '未分类',
          tags: (frontMatter.tags as string[]) || [],
          summary: (frontMatter.summary as string) || '',
          author: (frontMatter.author as string) || '破酥',
          readTime: (frontMatter.readTime as string) || '5分钟',
          cover: frontMatter.cover as string | undefined,
          filename
        })
      }
    } catch (error) {
      console.error(`Error loading blog post from ${path}:`, error)
    }
  }
  
  // 按日期排序（最新的在前）
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

// 获取所有分类
export function getCategories(posts: BlogPost[]): string[] {
  const categories = new Set(posts.map(post => post.category))
  return Array.from(categories).sort()
}

// 根据分类筛选文章
export function getPostsByCategory(posts: BlogPost[], category: string): BlogPost[] {
  return posts.filter(post => post.category === category)
}

// 格式化日期
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 获取最新文章（前N篇）
export function getLatestPosts(posts: BlogPost[], count: number = 3): BlogPost[] {
  return posts.slice(0, count)
}