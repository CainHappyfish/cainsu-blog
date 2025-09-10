<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import config from '@/config/configs'

// 从配置文件获取博客摘要信息
const blogsSummaryConfig = ref(config.blogsSummary)

// 计算主要博客（第一个设置为主要展示的博客）
const mainBlog = computed(() => {
  return blogsSummaryConfig.value.blogs.find(blog => blog.isMain) || blogsSummaryConfig.value.blogs[0]
})

// 计算副博客（最多三个）
const subBlogs = computed(() => {
  return blogsSummaryConfig.value.blogs
    .filter(blog => !blog.isMain)
    .slice(0, 3)
})

// 动画控制
const isVisible = ref(false)

// 处理博客点击
const handleBlogClick = (link: string) => {
  // 这里可以添加路由跳转逻辑
  window.open(link, '_blank')
  console.log('Navigate to:', link)
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

onMounted(() => {
  if (blogsSummaryConfig.value.blogs.length >  0) {
    setTimeout(() => {
      isVisible.value = true
    }, 200)
  }
})
</script>

<template>
  <div class="blogs-summary" :class="{ visible: isVisible }" v-if="blogsSummaryConfig.blogs.length >  0">
    <div class="container">
      <!-- 标题区域 -->
      <div class="header">
        <h2 class="title">{{ blogsSummaryConfig.title }}</h2>
        <p class="subtitle">{{ blogsSummaryConfig.subtitle }}</p>
      </div>

      <!-- 博客内容区域 -->
      <div class="blogs-content">
        <!-- 主要博客 -->
        <div class="main-blog" @click="handleBlogClick(mainBlog.link)">
          <div class="blog-image">
            <img :src="mainBlog.image" :alt="mainBlog.title" />
            <div class="image-overlay">
              <span class="category">{{ mainBlog.category }}</span>
            </div>
          </div>
          <div class="blog-content">
            <h3 class="blog-title">{{ mainBlog.title }}</h3>
            <p class="blog-summary">{{ mainBlog.summary }}</p>
            <div class="blog-meta">
              <span class="publish-date">{{ formatDate(mainBlog.publishDate) }}</span>
              <span class="read-time">{{ mainBlog.readTime }}</span>
            </div>
          </div>
        </div>

        <!-- 副博客列表 -->
        <div class="sub-blogs">
          <div 
            v-for="(blog, index) in subBlogs" 
            :key="blog.id"
            class="sub-blog"
            :style="{ animationDelay: `${index * 0.1 + 0.3}s` }"
            @click="handleBlogClick(blog.link)"
          >
            <div class="sub-blog-image">
              <img :src="blog.image" :alt="blog.title" />
              <div class="sub-image-overlay">
                <span class="sub-category">{{ blog.category }}</span>
              </div>
            </div>
            <div class="sub-blog-content">
              <h4 class="sub-blog-title">{{ blog.title }}</h4>
              <p class="sub-blog-summary">{{ blog.summary }}</p>
              <div class="sub-blog-meta">
                <span class="sub-publish-date">{{ formatDate(blog.publishDate) }}</span>
                <span class="sub-read-time">{{ blog.readTime }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.blogs-summary {
  width: 100%;  
  max-width: 1200px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(20px);
  border-radius: var(--radius-xl);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  transform: translateY(30px);
}

.blogs-summary.visible {
  opacity: 1;
  transform: translateY(0);
}

.blogs-summary:hover {
  backdrop-filter: blur(25px);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));
  transform: translateY(-2px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
}

.container {
  width: 100%;
}

/* 标题区域 */
.header {
  text-align: center;
  margin: var(--spacing-xl) 0;
}

.title {
  font-size: var(--text-3xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
  background: linear-gradient(135deg, #FF5522, #FFCC11, #FF55BB, #AA66DD, #0077DD);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: fadeInUp 0.8s ease-out;
}

.subtitle {
  font-size: var(--text-lg);
  color: var(--text-secondary);
  animation: fadeInUp 0.8s ease-out 0.1s both;
}

/* 博客内容区域 */
.blogs-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--spacing-xl);
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

/* 主要博客 */
.main-blog {
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-fast);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.main-blog:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

.blog-image {
  position: relative;
  height: 250px;
  overflow: hidden;
}

.blog-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-normal);
}

.main-blog:hover .blog-image img {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  top: var(--spacing-md);
  left: var(--spacing-md);
}

.category {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
}

.blog-content {
  padding: var(--spacing-lg);
}

.blog-title {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
  line-height: 1.4;
}

.blog-summary {
  font-size: var(--text-base);
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: var(--spacing-md);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.blog-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}

/* 副博客列表 */
.sub-blogs {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.sub-blog {
  background: rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-fast);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  animation: fadeInRight 0.8s ease-out both;
}

.sub-blog:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateX(4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.sub-blog-image {
  position: relative;
  width: 120px;
  height: 100px;
  flex-shrink: 0;
  overflow: hidden;
}

.sub-blog-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-normal);
}

.sub-blog:hover .sub-blog-image img {
  transform: scale(1.1);
}

.sub-image-overlay {
  position: absolute;
  top: var(--spacing-xs);
  left: var(--spacing-xs);
}

.sub-category {
  background: linear-gradient(135deg, var(--accent-color), var(--primary-color));
  color: white;
  padding: 2px var(--spacing-xs);
  border-radius: var(--radius-sm);
  font-size: 10px;
  font-weight: 600;
}

.sub-blog-content {
  padding: var(--spacing-sm);
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.sub-blog-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.sub-blog-summary {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  line-height: 1.4;
  margin-bottom: var(--spacing-xs);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.sub-blog-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;
  color: var(--text-tertiary);
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

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .blogs-content {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
  
  .sub-blogs {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--spacing-md);
  }
  
  .sub-blog {
    flex-direction: column;
  }
  
  .sub-blog-image {
    width: 100%;
    height: 150px;
  }
}

@media (max-width: 768px) {
  .blogs-summary {
    padding: var(--spacing-md);
    margin: var(--spacing-lg) auto;
  }
  
  .title {
    font-size: var(--text-2xl);
  }
  
  .subtitle {
    font-size: var(--text-base);
  }
  
  .blog-image {
    height: 200px;
  }
  
  .blog-content {
    padding: var(--spacing-md);
  }
  
  .blog-title {
    font-size: var(--text-lg);
  }
  
  .sub-blogs {
    grid-template-columns: 1fr;
  }
  
  .sub-blog-image {
    height: 120px;
  }
}

@media (max-width: 480px) {
  .blogs-summary {
    padding: var(--spacing-sm);
    margin: var(--spacing-md) auto;
  }
  
  .blog-image {
    height: 160px;
  }
  
  .blog-content {
    padding: var(--spacing-sm);
  }
  
  .sub-blog-content {
    padding: var(--spacing-xs);
  }
}
</style>
