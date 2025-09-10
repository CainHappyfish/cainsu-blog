<script setup lang="ts">
import { ref, onMounted } from 'vue'
import config from '@/config/configs'
import { useRouter } from 'vue-router'

const router = useRouter()

const gotoBlogs = () => {
  router.push('/blogs')
}

// 从配置文件获取博客介绍信息
const blogInfo = ref(config.blogsIntroduction)

// 动画控制
const isVisible = ref(false)

onMounted(() => {
  setTimeout(() => {
    isVisible.value = true
  }, 100)
})
</script>

<template>
  <div class="introduction" :class="{ visible: isVisible }">
    <div class="content">
      <!-- 标题区域 -->
      <div class="header">
        <h1 class="title">{{ blogInfo.title }}</h1>
        <h2 class="subtitle">{{ blogInfo.subtitle }}</h2>
        <p class="description">{{ blogInfo.description }}</p>
      </div>
      
      <!-- 特色功能 -->
      <div class="features">
        <h3>内容特色</h3>
        <div class="feature-list">
          <div 
            v-for="(feature, index) in blogInfo.features" 
            :key="feature"
            class="feature-item"
            :style="{ animationDelay: `${index * 0.1 + 0.3}s` }"
          >
            <span class="feature-icon">✨</span>
            <span class="feature-text">{{ feature }}</span>
          </div>
        </div>
      </div>
      
      <!-- 行动按钮 -->
      <div class="actions">
        <button class="action-btn primary" @click="gotoBlogs">
          <span class="btn-icon">📚</span>
          开始阅读
        </button>
        <button class="action-btn secondary">
          <span class="btn-icon">🔍</span>
          搜索文章
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.introduction {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  padding: var(--spacing-lg);
  width: 100%;
  position: relative;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(20px);
  border-radius: var(--radius-xl);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  transform: translateY(30px);
}

.introduction.visible {
  opacity: 1;
  transform: translateY(0);
}

.introduction:hover {
  backdrop-filter: blur(25px);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));
  transform: translateY(-2px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
}

.content {
  text-align: center;
  width: 100%;
}

/* 标题区域 */
.header {
  margin-bottom: var(--spacing-xl);
}

.title {
  font-size: var(--text-4xl);
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
  background: linear-gradient(135deg, #FF5522, #FFCC11, #FF55BB, #AA66DD, #0077DD);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: fadeInUp 0.8s ease-out;
}

.subtitle {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
  animation: fadeInUp 0.8s ease-out 0.1s both;
}

.description {
  font-size: var(--text-base);
  color: var(--text-secondary);
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

/* 特色功能 */
.features {
  margin-bottom: var(--spacing-xl);
}

.features h3 {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
  animation: fadeInUp 0.8s ease-out 0.3s both;
}

.feature-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
  max-width: 800px;
  margin: 0 auto;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all var(--transition-fast);
  animation: fadeInUp 0.8s ease-out both;
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: var(--text-lg);
}

.feature-text {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  font-weight: 500;
}

/* 行动按钮 */
.actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  animation: fadeInUp 0.8s ease-out 0.5s both;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-md) var(--spacing-lg);
  border: none;
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  text-decoration: none;
}

.action-btn.primary {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 123, 255, 0.3);
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.action-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.btn-icon {
  font-size: var(--text-base);
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

/* 响应式设计 */
@media (max-width: 768px) {
  .introduction {
    min-height: 60vh;
    padding: var(--spacing-md);
  }
  
  .title {
    font-size: var(--text-3xl);
  }
  
  .subtitle {
    font-size: var(--text-lg);
  }
  
  .feature-list {
    grid-template-columns: 1fr;
  }
  
  .actions {
    flex-direction: column;
    align-items: center;
  }
  
  .action-btn {
    width: 100%;
    max-width: 200px;
  }
}
</style>