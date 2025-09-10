<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getAllBlogPosts, getCategories, getPostsByCategory, formatDate, getLatestPosts, type BlogPost } from '@/utils/blogUtils'
import defaultCover from '@/assets/kasumi.png'

// 路由实例
const router = useRouter()

// 响应式数据
const allPosts = ref<BlogPost[]>([])
const selectedCategory = ref<string>('全部')
const loading = ref(true)
const currentPage = ref(1)
const postsPerPage = ref(6)
const isVisible = ref(false)

// 计算属性
const categories = computed(() => {
  const cats = getCategories(allPosts.value)
  return ['全部', ...cats]
})

const filteredPosts = computed(() => {
  if (selectedCategory.value === '全部') {
    return allPosts.value
  }
  return getPostsByCategory(allPosts.value, selectedCategory.value)
})

const latestPosts = computed(() => {
  return getLatestPosts(allPosts.value, 3)
})

// 分页相关计算属性
const totalPages = computed(() => {
  return Math.ceil(filteredPosts.value.length / postsPerPage.value)
})

const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * postsPerPage.value
  const end = start + postsPerPage.value
  return filteredPosts.value.slice(start, end)
})

// const paginationInfo = computed(() => {
//   const start = (currentPage.value - 1) * postsPerPage.value + 1
//   const end = Math.min(currentPage.value * postsPerPage.value, filteredPosts.value.length)
//   return {
//     start,
//     end,
//     total: filteredPosts.value.length
//   }
// })

// 方法
const selectCategory = (category: string) => {
  selectedCategory.value = category
  currentPage.value = 1 // 切换分类时重置到第一页
}

const handlePostClick = (post: BlogPost) => {
  // 跳转到文章详情页
  router.push(`/blog/${post.filename}`)
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = defaultCover
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    // 滚动到文章列表顶部
    document.querySelector('.posts-main')?.scrollIntoView({ behavior: 'smooth' })
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    goToPage(currentPage.value - 1)
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    goToPage(currentPage.value + 1)
  }
}

const getVisiblePages = () => {
  const total = totalPages.value
  const current = currentPage.value
  const pages: (number | string)[] = []
  
  if (total <= 7) {
    // 如果总页数小于等于7，显示所有页码
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // 总是显示第一页
    pages.push(1)
    
    if (current <= 4) {
      // 当前页在前面时
      for (let i = 2; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      // 当前页在后面时
      pages.push('...')
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      // 当前页在中间时
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    }
  }
  
  return pages
}

// 生命周期
onMounted(async () => {
  try {
    allPosts.value = await getAllBlogPosts()
    setTimeout(() => {
      isVisible.value = true
    }, 200)
  } catch (error) {
    console.error('Failed to load blog posts:', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="blogs-page">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载博客文章中...</p>
    </div>
    
    <!-- 主要内容 -->
    <div v-else class="blogs-container">
      <!-- 最新文章区域 -->
      <section class="latest-posts" v-if="latestPosts.length > 0">
        <h2 class="section-title">📌 最新文章</h2>
        <div class="latest-posts-grid">
          <article 
            v-for="post in latestPosts" 
            :key="post.filename"
            class="latest-post-card"
            @click="handlePostClick(post)"
          >
            <div class="post-cover">
              <img 
                :src="post.cover || defaultCover" 
                :alt="post.title"
                @error="handleImageError"
              />
            </div>
            <div class="post-content">
              <span class="post-category">{{ post.category }}</span>
              <h3 class="post-title">{{ post.title }}</h3>
              <p class="post-summary">{{ post.summary }}</p>
              <div class="post-meta">
                <span class="post-date">{{ formatDate(post.date) }}</span>
                <span class="post-read-time">{{ post.readTime }}</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      <!-- 主要内容区域 -->
      <div class="main-content">
        <!-- 左侧分类菜单 -->
        <aside class="categories-sidebar">
          <h3 class="sidebar-title">📂 文章分类</h3>
          <nav class="categories-nav">
            <button
              v-for="category in categories"
              :key="category"
              :class="['category-btn', { active: selectedCategory === category }]"
              @click="selectCategory(category)"
            >
              {{ category }}
              <span class="post-count" v-if="category !== '全部'">
                {{ getPostsByCategory(allPosts, category).length }}
              </span>
              <span class="post-count" v-else>
                {{ allPosts.length }}
              </span>
            </button>
          </nav>
        </aside>

        <!-- 右侧博客列表 -->
        <main class="posts-main" :class="{ visible: isVisible }">
          <header class="posts-header">
            <h2 class="posts-title">
              {{ selectedCategory === '全部' ? '所有文章' : selectedCategory }}
              <span class="posts-count">({{ filteredPosts.length }})</span>
            </h2>
          </header>
          
          <!-- 文章列表 -->
          <div class="posts-grid" v-if="paginatedPosts.length > 0">
            <article 
              v-for="(post, index) in paginatedPosts" 
              :key="post.filename"
              class="post-card"
              :style="{ animationDelay: `${index * 0.1}s` }"
              @click="handlePostClick(post)"
            >
              <div class="post-image">
                <img 
                  :src="post.cover || defaultCover" 
                  :alt="post.title"
                  @error="handleImageError"
                />
                <div class="image-overlay">
                  <span class="post-category-badge">{{ post.category }}</span>
                </div>
              </div>
              
              <div class="post-content">
                <header class="post-header">
                  <h3 class="post-title">{{ post.title }}</h3>
                </header>
                
                <p class="post-summary">{{ post.summary }}</p>
                
                <div class="post-tags" v-if="post.tags && post.tags.length > 0">
                  <span v-for="tag in post.tags" :key="tag" class="tag">
                    #{{ tag }}
                    <div class="tag-glow"></div>
                  </span>
                </div>
                
                <footer class="post-footer">
                  <div class="post-meta">
                    <span class="post-date">{{ formatDate(post.date) }}</span>
                    <span class="post-read-time" v-if="post.readTime">{{ post.readTime }}</span>
                    <span class="post-author" v-if="post.author">{{ post.author }}</span>
                  </div>
                </footer>
              </div>
            </article>
          </div>
          
          <!-- 分页组件 -->
          <div class="pagination-wrapper" v-if="filteredPosts.length > 0">
            <div class="pagination">
              <button 
                class="pagination-btn" 
                :disabled="currentPage === 1"
                @click="prevPage"
                title="上一页"
              >
                <span class="btn-icon">‹</span>
              </button>
              
              <div class="pagination-numbers">
                <template v-for="page in getVisiblePages()" :key="page">
                  <button
                    v-if="typeof page === 'number'"
                    :class="['pagination-number', { active: currentPage === page }]"
                    @click="goToPage(page)"
                  >
                    {{ page }}
                  </button>
                  <span v-else class="pagination-ellipsis">{{ page }}</span>
                </template>
              </div>
              
              <button 
                class="pagination-btn" 
                :disabled="currentPage === totalPages"
                @click="nextPage"
                title="下一页"
              >
                <span class="btn-icon">›</span>
              </button>
            </div>
            
            <div class="pagination-info">
              <span class="current-page">第 {{ currentPage }} 页</span>
              <span class="page-separator">·</span>
              <span class="total-pages">共 {{ totalPages }} 页</span>
              <span class="page-separator">·</span>
              <span class="total-items">{{ filteredPosts.length }} 篇文章</span>
            </div>
          </div>
          
          <!-- 空状态 -->
          <div v-else-if="filteredPosts.length === 0" class="empty-state">
            <div class="empty-icon">📝</div>
            <h3>暂无文章</h3>
            <p>{{ selectedCategory === '全部' ? '还没有发布任何文章' : `${selectedCategory} 分类下暂无文章` }}</p>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 页面容器 */
.blogs-page {
  min-height: 100vh;
  background-color: var(--bg-primary);
  padding: var(--spacing-xl) var(--spacing-md);
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

/* 主容器 */
.blogs-container {
  max-width: 1400px;
  margin: 0 auto;
  animation: fadeInUp 0.8s ease-out;
}

/* 最新文章区域 */
.latest-posts {
  margin-bottom: var(--spacing-2xl);
}

.section-title {
  font-size: var(--text-3xl);
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color), var(--accent-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: var(--spacing-lg);
  text-align: center;
}

.latest-posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.latest-post-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-xl);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-lg);
}

.latest-post-card:hover {
  transform: translateY(-4px);
  backdrop-filter: blur(5px);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
}

.post-cover {
  height: 200px;
  overflow: hidden;
}

.post-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-normal);
}

.latest-post-card:hover .post-cover img {
  transform: scale(1.05);
}

.post-content {
  padding: var(--spacing-lg);
}

.post-category {
  display: inline-block;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: var(--text-white);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-xl);
  font-size: var(--text-sm);
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
}

/* 主要内容区域 */
.main-content {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: var(--spacing-2xl);
  align-items: start;
}

/* 左侧分类菜单 */
.categories-sidebar {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-xl);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-lg);
  position: sticky;
  top: var(--spacing-xl);
}

.sidebar-title {
  font-size: var(--text-2xl);
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: var(--spacing-lg);
  text-align: center;
}

.categories-nav {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.category-btn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  background: transparent;
  border: 2px solid transparent;
  border-radius: var(--radius-lg);
  color: var(--text-secondary);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
  text-align: left;
}

.category-btn:hover {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: var(--text-white);
  transform: translateX(4px);
}

.category-btn.active {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: var(--text-white);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

.post-count {
  background: rgba(255, 255, 255, 0.2);
  color: inherit;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  font-weight: 600;
}

/* 右侧博客列表 */
.posts-main {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-lg);
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.posts-main.visible {
  opacity: 1;
  transform: translateY(0);
}

.posts-header {
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.posts-title {
  font-size: var(--text-3xl);
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color), var(--accent-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.posts-count {
  font-size: var(--text-base);
  font-weight: 400;
  color: var(--text-muted);
}

.pagination-info {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  opacity: 0.8;
}

/* 文章网格布局 */
.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
}

.post-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04));
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-xl);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.6s ease-out both;
}

.post-card:hover {
  transform: translateY(-8px);
  backdrop-filter: blur(25px);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.06));
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.25);
}

/* 文章图片 */
.post-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.post-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-normal);
}

.post-card:hover .post-image img {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  top: var(--spacing-md);
  left: var(--spacing-md);
}

.post-category-badge {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: var(--text-white);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  backdrop-filter: blur(10px);
}

/* 文章内容 */
.post-content {
  padding: var(--spacing-lg);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-md);
  gap: var(--spacing-md);
}

.post-title {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.4;
  flex: 1;
  transition: color var(--transition-normal);
}

.post-card:hover .post-title {
  color: var(--primary-color);
}

.post-category-tag {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: var(--text-white);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-xl);
  font-size: var(--text-sm);
  font-weight: 600;
  white-space: nowrap;
}

.post-summary {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: var(--spacing-md);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  margin-top: var(--spacing-sm);
}

.tag {
  position: relative;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.9));
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: var(--spacing-xs) var(--spacing-md);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 2px solid var(--border-light);
  overflow: visible;
  color: var(--text-primary);
  font-size: var(--text-xs);
  font-weight: 600;
}

.tag:hover {
  transform: scale(1.05) translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-color);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.95));
}

.tag-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle, var(--primary-color) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 15px;
  z-index: 1;
}

.tag:hover .tag-glow {
  opacity: 0.1;
}

.post-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: var(--spacing-md);
}

.post-meta {
  display: flex;
  gap: var(--spacing-md);
  font-size: var(--text-sm);
  color: var(--text-muted);
}

.post-author {
  font-weight: 600;
  color: var(--text-secondary);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: var(--spacing-3xl) var(--spacing-md);
  color: var(--text-muted);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-lg);
  opacity: 0.6;
}

.empty-state h3 {
  font-size: var(--text-2xl);
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: var(--spacing-sm);
}

.empty-state p {
  color: var(--text-secondary);
  font-size: var(--text-base);
  opacity: 0.8;
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

/* 分页组件 */
.pagination-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-2xl);
  padding: var(--spacing-xl) 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-sm);
}

.pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04));
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-lg);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(15px);
}

.pagination-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: var(--text-white);
  transform: translateY(-1px) scale(1.05);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}

.pagination-numbers {
  display: flex;
  gap: var(--spacing-xs);
  margin: 0 var(--spacing-sm);
}

.pagination-number {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04));
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-lg);
  color: var(--text-primary);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(15px);
  position: relative;
  overflow: hidden;
}

.pagination-number::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s ease;
}

.pagination-number:hover::before {
  left: 100%;
}

.pagination-number:hover {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));
  transform: translateY(-1px) scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.pagination-number.active {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: var(--text-white);
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

.pagination-number.active:hover {
  transform: translateY(-1px) scale(1.05);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.pagination-ellipsis {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: var(--text-muted);
  font-size: var(--text-base);
  font-weight: bold;
}

.pagination-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: var(--text-sm);
  text-align: center;
  opacity: 0.9;
}

.current-page {
  color: var(--primary-color);
  font-weight: 600;
}

.page-separator {
  color: var(--text-secondary);
  opacity: 0.6;
  font-weight: bold;
}

.total-pages,
.total-items {
  color: var(--text-secondary);
  font-weight: 500;
}

.btn-icon {
  font-size: var(--text-lg);
  font-weight: bold;
  line-height: 1;
  transition: transform var(--transition-normal);
}

.prev-btn:hover .btn-icon {
  transform: translateX(-2px);
}

.next-btn:hover .btn-icon {
  transform: translateX(2px);
}

/* 动画关键帧 */
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

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .posts-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--spacing-lg);
  }
  
  .pagination-wrapper {
    margin-top: 3rem;
    padding: 1.75rem 0;
  }
  
  .pagination-btn {
    width: 2.25rem;
    height: 2.25rem;
  }
  
  .pagination-number {
    width: 2.25rem;
    height: 2.25rem;
  }
  
  .pagination-ellipsis {
    width: 2.25rem;
    height: 2.25rem;
  }
}

@media (max-width: 992px) {
  .pagination-wrapper {
    margin-top: 2.5rem;
    padding: 1.5rem 0;
  }
  
  .pagination {
    gap: 0.375rem;
  }
  
  .pagination-btn {
    width: 2.125rem;
    height: 2.125rem;
  }
  
  .pagination-numbers {
    margin: 0 0.375rem;
    gap: 0.1875rem;
  }
  
  .pagination-number {
    width: 2.125rem;
    height: 2.125rem;
    font-size: 0.85rem;
  }
  
  .pagination-ellipsis {
    width: 2.125rem;
    height: 2.125rem;
    font-size: 0.95rem;
  }
  
  .pagination-info {
    font-size: 0.8rem;
    gap: 0.4rem;
  }
}

@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
    gap: var(--spacing-xl);
  }
  
  .categories-sidebar {
    position: static;
    order: -1;
  }
  
  .categories-nav {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
  }
  
  .category-btn {
    margin-bottom: 0;
    flex: 0 0 auto;
  }
  
  .posts-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
  
  .post-image {
    height: 180px;
  }
  
  .pagination {
    gap: var(--spacing-sm);
    align-items: center;
    justify-content: center;
  }
  
  .pagination-numbers {
    justify-content: center;
    align-items: center;
  }
}

@media (max-width: 768px) {
  .blogs-page {
    padding: var(--spacing-lg) var(--spacing-sm);
  }
  
  .latest-posts-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
  
  .section-title {
    font-size: var(--text-2xl);
  }
  
  .posts-title {
    font-size: var(--text-2xl);
  }
  
  .posts-main {
    padding: var(--spacing-lg);
  }
  
  .post-card {
    padding: var(--spacing-lg);
  }
  
  .post-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
  
  .post-meta {
    flex-direction: column;
    gap: var(--spacing-xs);
  }
  
  .pagination-wrapper {
    margin-top: 2rem;
    padding: 1.5rem 0;
  }
  
  .pagination {
    gap: 0.25rem;
  }
  
  .pagination-btn {
    width: 2rem;
    height: 2rem;
  }
  
  .pagination-numbers {
    margin: 0 0.25rem;
    gap: 0.125rem;
  }
  
  .pagination-number {
    width: 2rem;
    height: 2rem;
    font-size: 0.8rem;
  }
  
  .pagination-ellipsis {
    width: 2rem;
    height: 2rem;
    font-size: 0.9rem;
  }
  
  .pagination-info {
    font-size: 0.75rem;
    gap: 0.375rem;
  }
  
  .btn-icon {
    font-size: 1rem;
  }
}

@media (max-width: 640px) {
  .pagination-wrapper {
    margin-top: 2rem;
    padding: 1.25rem 0;
  }
  
  .pagination {
    gap: 0.3125rem;
  }
  
  .pagination-btn {
    width: 1.875rem;
    height: 1.875rem;
  }
  
  .pagination-numbers {
    margin: 0 0.3125rem;
    gap: 0.15625rem;
  }
  
  .pagination-number {
    width: 1.875rem;
    height: 1.875rem;
    font-size: 0.8125rem;
  }
  
  .pagination-ellipsis {
    width: 1.875rem;
    height: 1.875rem;
    font-size: 0.875rem;
  }
  
  .pagination-info {
    font-size: 0.75rem;
    gap: 0.3125rem;
  }
  
  .btn-icon {
    font-size: 0.9375rem;
  }
}

@media (max-width: 480px) {
  .blogs-page {
    padding: var(--spacing-sm);
  }
  
  .section-title {
    font-size: var(--text-xl);
  }
  
  .posts-title {
    font-size: var(--text-lg);
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }
  
  .categories-nav {
    flex-direction: column;
  }
  
  .post-category-tag {
    margin-left: 0;
    align-self: flex-start;
  }
  
  .post-footer {
    flex-direction: column;
    gap: var(--spacing-sm);
    align-items: flex-start;
  }
  
  .pagination-wrapper {
    margin-top: 1.5rem;
    padding: 1rem 0;
  }
  
  .pagination {
    gap: 0.1875rem;
    justify-content: center;
    align-items: center;
  }
  
  .pagination-btn {
    width: 1.75rem;
    height: 1.75rem;
    min-width: 1.75rem;
  }
  
  .pagination-numbers {
    margin: 0 0.1875rem;
    gap: 0.09375rem;
    justify-content: center;
    align-items: center;
  }
  
  .pagination-number {
    width: 1.75rem;
    height: 1.75rem;
    min-width: 1.75rem;
    font-size: 0.75rem;
  }
  
  .pagination-ellipsis {
    width: 1.75rem;
    height: 1.75rem;
    min-width: 1.75rem;
    font-size: 0.8125rem;
  }
  
  .pagination-info {
    font-size: 0.6875rem;
    gap: 0.25rem;
    flex-wrap: wrap;
    justify-content: center;
    line-height: 1.4;
  }
  
  .btn-icon {
    font-size: 0.875rem;
  }
}

@media (max-width: 360px) {
  .pagination-wrapper {
    margin-top: 1.25rem;
    padding: 0.875rem 0;
  }
  
  .pagination {
    gap: 0.125rem;
    scale: 0.9;
    align-items: center;
  }
  
  .pagination-btn {
    width: 1.625rem;
    height: 1.625rem;
    min-width: 1.625rem;
  }
  
  .pagination-numbers {
    margin: 0 0.125rem;
    gap: 0.0625rem;
    align-items: center;
  }
  
  .pagination-number {
    width: 1.625rem;
    height: 1.625rem;
    min-width: 1.625rem;
    font-size: 0.6875rem;
  }
  
  .pagination-ellipsis {
    width: 1.625rem;
    height: 1.625rem;
    min-width: 1.625rem;
    font-size: 0.75rem;
  }
  
  .pagination-info {
    font-size: 0.625rem;
    gap: 0.1875rem;
    margin-top: 0.25rem;
  }
  
  .btn-icon {
    font-size: 0.8125rem;
  }
}
</style>
