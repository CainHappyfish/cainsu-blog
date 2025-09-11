<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import type { BlogPost } from '@/utils/blogUtils'

const props = defineProps<{
  isOpen: boolean
  blogs: BlogPost[]
}>()
const emit = defineEmits<{
  close: []
}>()

const router = useRouter()

// 搜索相关状态
const searchQuery = ref('')
const searchInput = ref<HTMLInputElement>()
const selectedIndex = ref(-1)

// 模糊搜索逻辑
const searchResults = computed(() => {
  if (!searchQuery.value.trim()) {
    return []
  }
  
  const query = searchQuery.value.toLowerCase().trim()
  
  return props.blogs.filter(blog => {
    // 搜索标题
    const titleMatch = blog.title?.toLowerCase().includes(query)
    // 搜索描述
    const descMatch = blog.summary?.toLowerCase().includes(query)
    // 搜索标签
    const tagsMatch = blog.tags?.some((tag: string) => 
      tag.toLowerCase().includes(query)
    )
    // 搜索分类
    const categoryMatch = blog.category?.toLowerCase().includes(query)
    
    return titleMatch || descMatch || tagsMatch || categoryMatch
  }).slice(0, 8) // 限制显示结果数量
})

// 键盘导航
const handleKeydown = (event: KeyboardEvent) => {
  if (!props.isOpen) return
  
  switch (event.key) {
    case 'Escape':
      closeModal()
      break
    case 'ArrowDown':
      event.preventDefault()
      selectedIndex.value = Math.min(selectedIndex.value + 1, searchResults.value.length - 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      selectedIndex.value = Math.max(selectedIndex.value - 1, -1)
      break
    case 'Enter':
      event.preventDefault()
      if (selectedIndex.value >= 0 && searchResults.value[selectedIndex.value]) {
        navigateToBlog(searchResults.value[selectedIndex.value])
      }
      break
  }
}

// 关闭弹窗
const closeModal = () => {
  emit('close')
  searchQuery.value = ''
  selectedIndex.value = -1
}

// 导航到博客详情
const navigateToBlog = (blog: BlogPost) => {
  router.push(`/blogs/${blog.filename}`)
  closeModal()
}

// 高亮搜索关键词
const highlightText = (text: string, query: string) => {
  if (!query.trim()) return text
  
  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

// 监听弹窗打开状态
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    setTimeout(() => {
      searchInput.value?.focus()
    }, 100)
  }
})

// 重置选中索引
watch(searchQuery, () => {
  selectedIndex.value = -1
})

// 生命周期
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div 
      v-if="isOpen" 
      class="search-modal-overlay"
      @click="closeModal"
    >
      <div 
        class="search-modal"
        @click.stop
      >
        <!-- 搜索头部 -->
        <div class="search-header">
          <div class="search-input-wrapper">
            <span class="search-icon">🔍</span>
            <input
              ref="searchInput"
              v-model="searchQuery"
              type="text"
              class="search-input"
              placeholder="搜索文章标题、内容、标签..."
              autocomplete="off"
            >
            <button 
              class="close-btn"
              @click="closeModal"
              title="关闭搜索"
            >
              ✕
            </button>
          </div>
        </div>
        
        <!-- 搜索结果 -->
        <div class="search-results">
          <div v-if="!searchQuery.trim()" class="search-tips">
            <div class="tip-item">
              <span>输入关键词开始搜索</span>
            </div>
            <div class="tip-item">
              <span>使用 ↑↓ 键导航，Enter 键打开</span>
            </div>
            <div class="tip-item">
              <span>支持搜索标题、内容、标签、分类</span>
            </div>
          </div>
          
          <div v-else-if="searchResults.length === 0" class="no-results">
            <span class="no-results-icon">😔</span>
            <p>没有找到相关文章</p>
            <p class="no-results-tip">试试其他关键词吧</p>
          </div>
          
          <div v-else class="results-list">
            <div 
              v-for="(blog, index) in searchResults"
              :key="blog.filename"
              class="result-item"
              :class="{ selected: index === selectedIndex }"
              @click="navigateToBlog(blog)"
              @mouseenter="selectedIndex = index"
            >
              <div class="result-content">
                <h3 
                  class="result-title"
                  v-html="highlightText(blog.title, searchQuery)"
                ></h3>
                <p 
                  class="result-description"
                  v-html="highlightText(blog.summary || '', searchQuery)"
                ></p>
                <div class="result-meta">
                  <span class="result-category">{{ blog.category }}</span>
                  <span class="result-date">{{ blog.date }}</span>
                  <div class="result-tags">
                    <span 
                      v-for="tag in blog.tags?.slice(0, 3)"
                      :key="tag"
                      class="result-tag"
                      v-html="highlightText(tag, searchQuery)"
                    ></span>
                  </div>
                </div>
              </div>
              <div class="result-arrow">→</div>
            </div>
          </div>
        </div>
        
        <!-- 搜索底部提示 -->
        <div class="search-footer">
          <div class="search-stats" v-if="searchQuery.trim()">
            找到 {{ searchResults.length }} 篇相关文章
          </div>
          <div class="keyboard-shortcuts">
            <span class="shortcut"><kbd>ESC</kbd> 关闭</span>
            <span class="shortcut"><kbd>↑↓</kbd> 导航</span>
            <span class="shortcut"><kbd>Enter</kbd> 打开</span>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.search-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 10vh;
  animation: fadeIn 0.2s ease-out;
}

.search-modal {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  width: 90%;
  max-width: 600px;
  max-height: 70vh;
  overflow: hidden;
  border: 1px solid var(--border-light);
  animation: slideDown 0.3s ease-out;
}

.search-header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-light);
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: var(--spacing-md);
  font-size: var(--text-lg);
  color: var(--text-tertiary);
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-xl) var(--spacing-md) 3rem;
  border: 2px solid var(--border-light);
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  background: var(--bg-secondary);
  color: var(--text-primary);
  transition: var(--transition-fast);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
}

.close-btn {
  position: absolute;
  right: var(--spacing-md);
  width: 32px;
  height: 32px;
  border: none;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-fast);
}

.close-btn:hover {
  background: var(--bg-quaternary);
  color: var(--text-primary);
}

.search-results {
  max-height: 400px;
  overflow-y: auto;
}

.search-tips {
  padding: var(--spacing-xl);
  text-align: center;
}

.tip-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  color: var(--text-secondary);
  font-size: var(--text-sm);
}

.no-results {
  padding: var(--spacing-xl);
  text-align: center;
  color: var(--text-secondary);
}

.no-results-icon {
  font-size: 3rem;
  margin-bottom: var(--spacing-md);
}

.no-results-tip {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}

.results-list {
  padding: var(--spacing-sm);
}

.result-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-fast);
  border: 1px solid transparent;
}

.result-item:hover,
.result-item.selected {
  background: var(--bg-secondary);
  border-color: var(--primary-color);
}

.result-content {
  flex: 1;
}

.result-title {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
  line-height: 1.4;
}

.result-description {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.result-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.result-category {
  background: var(--primary-color);
  color: white;
  padding: 2px var(--spacing-xs);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: 500;
}

.result-date {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.result-tags {
  display: flex;
  gap: var(--spacing-xs);
}

.result-tag {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  padding: 2px var(--spacing-xs);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
}

.result-arrow {
  color: var(--text-tertiary);
  font-size: var(--text-lg);
  margin-left: var(--spacing-md);
  transition: var(--transition-fast);
}

.result-item:hover .result-arrow,
.result-item.selected .result-arrow {
  color: var(--primary-color);
  transform: translateX(4px);
}

.search-footer {
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid var(--border-light);
  background: var(--bg-secondary);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-stats {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.keyboard-shortcuts {
  display: flex;
  gap: var(--spacing-sm);
}

.shortcut {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

kbd {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  padding: 2px 6px;
  font-size: var(--text-xs);
  font-family: monospace;
}

/* 高亮样式 */
:deep(mark) {
  background: var(--primary-color);
  color: white;
  padding: 1px 2px;
  border-radius: 2px;
  font-weight: 500;
}

/* 动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-modal-overlay {
    padding-top: 5vh;
  }
  
  .search-modal {
    width: 95%;
    max-height: 80vh;
  }
  
  .search-header {
    padding: var(--spacing-md);
  }
  
  .search-input {
    font-size: var(--text-sm);
  }
  
  .keyboard-shortcuts {
    display: none;
  }
}

@media (max-width: 480px) {
  .result-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }
  
  .result-tags {
    flex-wrap: wrap;
  }
}
</style>