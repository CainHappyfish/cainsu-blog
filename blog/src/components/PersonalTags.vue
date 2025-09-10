<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Tag } from '@/types/about';
import config from '@/config/configs'


const props = defineProps<{
  tags: Tag[],
  tagCategories: Array<{ key: string; name: string; icon: string }>
}>()

const isVisible = ref(false)
const selectedCategory = ref<string>('all')
const hoveredTag = ref<number | null>(null)

const categories = computed(() => props.tagCategories)

const filteredTags = computed(() => {
  if (selectedCategory.value === 'all') {
    return props.tags
  }
  return props.tags.filter(tag => tag.category === selectedCategory.value)
})

// 动态生成统计信息
const statsData = computed(() => {
  return props.tagCategories
    .filter(category => category.key !== 'all') // 过滤掉'全部'分类
    .map(category => ({
      key: category.key,
      name: category.name,
      count: props.tags.filter(tag => tag.category === category.key).length,
      icon: category.icon
    }))
})

onMounted(() => {
  setTimeout(() => {
    isVisible.value = true
  }, 200)
})

const getCategoryColor = (category: string) => {
  const colors = {
    skill: '#3498db',
    personality: '#e74c3c',
    interest: '#f39c12',
    achievement: '#2ecc71'
  }
  return colors[category as keyof typeof colors] || '#95a5a6'
}

const renderSkillLevel = (level?: number) => {
  if (!level) return ''
  return '★'.repeat(level) + '☆'.repeat(5 - level)
}

const handleTagHover = (tagId: number | null) => {
  hoveredTag.value = tagId
}

const selectCategory = (category: string) => {
  selectedCategory.value = category
}
</script>

<template>
  <div class="personal-tags">
    <div class="section-header">
      <h2>{{ config.personalTagsSection.title }}</h2>
      <p>{{ config.personalTagsSection.subtitle }}</p>
    </div>
    
    <!-- 分类筛选 -->
    <div class="category-filter" :class="{ 'visible': isVisible }">
      <button 
        v-for="category in categories"
        :key="category.key"
        class="filter-button"
        :class="{ 'active': selectedCategory === category.key }"
        @click="selectCategory(category.key)"
      >
        <span class="filter-icon">{{ category.icon }}</span>
        <span class="filter-name">{{ category.name }}</span>
      </button>
    </div>
    
    <!-- 标签云 -->
    <div class="tags-container" :class="{ 'visible': isVisible }">
      <div class="tags-cloud">
        <div 
          v-for="(tag, index) in filteredTags" 
          :key="tag.id"
          class="tag-item"
          :class="`tag-${tag.category}`"
          :style="{ 
            '--delay': `${index * 0.05}s`,
            '--color': tag.color || getCategoryColor(tag.category)
          }"
          @mouseenter="handleTagHover(tag.id)"
          @mouseleave="handleTagHover(null)"
        >
          <div class="tag-content">
            <span v-if="tag.icon" class="tag-icon">{{ tag.icon }}</span>
            <span class="tag-name">{{ tag.name }}</span>
            <span v-if="tag.level" class="tag-level">{{ renderSkillLevel(tag.level) }}</span>
          </div>
          
          <!-- 悬浮提示 -->
          <div 
            v-if="tag.description"
            class="tag-tooltip"
            :class="{ 'visible': hoveredTag === tag.id }"
          >
            {{ tag.description }}
          </div>
          
          <!-- 标签光效 -->
          <div class="tag-glow" :class="{ 'active': hoveredTag === tag.id }"></div>
        </div>
      </div>
    </div>
    
    <!-- 统计信息 -->
    <div class="tags-stats" :class="{ 'visible': isVisible }">
      <div 
        v-for="stat in statsData" 
        :key="stat.key"
        class="stat-item"
      >
        <div class="stat-number">{{ stat.count }}</div>
        <div class="stat-label">{{ stat.name }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.personal-tags {
  padding: 60px 20px;
  max-width: 1200px;
  margin: 60px auto;
  background: linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary));
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-lg);
}

.section-header {
  text-align: center;
  margin-bottom: 50px;
}

.section-header h2 {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color), var(--accent-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 10px;
  line-height: 1.2;
}

.section-header p {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.category-filter {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 40px;
  flex-wrap: wrap;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease;
}

.category-filter.visible {
  opacity: 1;
  transform: translateY(0);
}

.filter-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
  backdrop-filter: blur(10px);
  border: 2px solid var(--border-light);
  border-radius: 20px;
  cursor: pointer;
  transition: var(--transition-normal);
  font-weight: 500;
  color: var(--text-secondary);
  box-shadow: var(--shadow-sm);
}

.filter-button:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.filter-button.active {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  border-color: var(--primary-color);
  color: var(--text-white);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.filter-icon {
  font-size: 1.1rem;
}

.tags-container {
  margin-bottom: 50px;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s ease 0.2s;
}

.tags-container.visible {
  opacity: 1;
  transform: translateY(0);
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.tag-item {
  position: relative;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.9));
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 15px 25px;
  box-shadow: var(--shadow-md);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  opacity: 0;
  transform: scale(0.8) translateY(20px);
  animation: tagAppear 0.6s ease-out forwards;
  animation-delay: var(--delay);
  border: 2px solid var(--border-light);
  overflow: visible;
}

.visible .tag-item {
  animation-play-state: running;
}

.tag-item:hover {
  transform: scale(1.05) translateY(-5px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color);
}

.tag-content {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 2;
}

.tag-icon {
  font-size: 1.2rem;
}

.tag-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.95rem;
}

.tag-level {
  font-size: 0.8rem;
  color: #f39c12;
  margin-left: 5px;
}

.tag-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-10px);
  background: #2c3e50;
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: all 0.3s ease;
  z-index: 10;
}

.tag-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: #2c3e50;
}

.tag-tooltip.visible {
  opacity: 1;
  transform: translateX(-50%) translateY(-5px);
}

.tag-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle, var(--color) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 20px;
  z-index: 1;
}

.tag-glow.active {
  opacity: 0.1;
}

/* 不同类别的标签样式 */
.tag-skill {
  border-left: 4px solid #3498db;
}

.tag-personality {
  border-left: 4px solid #e74c3c;
}

.tag-interest {
  border-left: 4px solid #f39c12;
}

.tag-achievement {
  border-left: 4px solid #2ecc71;
}

.tags-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s ease 0.4s;
}

.tags-stats.visible {
  opacity: 1;
  transform: translateY(0);
}

.stat-item {
  text-align: center;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.85));
  padding: 25px;
  border-radius: 15px;
  box-shadow: var(--shadow-md);
  transition: var(--transition-normal);
  border: 1px solid var(--border-light);
}

.stat-item:hover {
  transform: translateY(-5px);
}

.stat-icon {
  font-size: 1.8rem;
  margin-bottom: 10px;
  opacity: 0.8;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 10px;
}

.stat-label {
  color: var(--text-secondary);
  font-weight: 500;
}

@keyframes tagAppear {
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .category-filter {
    gap: 10px;
  }
  
  .filter-button {
    padding: 10px 15px;
    font-size: 0.9rem;
  }
  
  .tags-cloud {
    gap: 10px;
  }
  
  .tag-item {
    padding: 12px 20px;
  }
  
  .tags-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
}

@media (max-width: 480px) {
  .personal-tags {
    padding: 40px 15px;
  }
  
  .section-header h2 {
    font-size: 2rem;
  }
  
  .category-filter {
    flex-direction: column;
    align-items: center;
  }
  
  .filter-button {
    width: 200px;
    justify-content: center;
  }
  
  .tags-stats {
    grid-template-columns: 1fr;
  }
  
  .stat-item {
    padding: 20px;
  }
  
  .stat-number {
    font-size: 2rem;
  }
}


</style>