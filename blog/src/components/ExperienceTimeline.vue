<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import config from '@/config/configs'

import { TimelineItem } from '@/types/about';

const props = defineProps<{
  experiences: TimelineItem[]
}>()

const timelineRef = ref<HTMLElement>()
const isVisible = ref(false)
const currentItemsPerRow = ref(3)

// 将经历按行分组
const groupedExperiences = ref<TimelineItem[][]>([])

// 根据屏幕宽度动态计算每行展示的个数
const getItemsPerRow = () => {
  const width = window.innerWidth
  if (width <= 480) return 1      // 超小屏：1个
  if (width <= 768) return 2      // 小屏：2个
  if (width <= 1024) return 2     // 中屏：2个
  if (width <= 1200) return 3     // 大屏：3个
  return 4                        // 超大屏：4个
}

const updateItemsPerRow = () => {
  currentItemsPerRow.value = getItemsPerRow()
}

const initializeTimeline = () => {
  const itemsPerRow = currentItemsPerRow.value
  const groups: TimelineItem[][] = []
  for (let i = 0; i < props.experiences.length; i += itemsPerRow) {
    groups.push(props.experiences.slice(i, i + itemsPerRow))
  }
  groupedExperiences.value = groups
}

onMounted(() => {
  updateItemsPerRow()
  initializeTimeline()
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
  
  // 延迟显示动画
  setTimeout(() => {
    isVisible.value = true
  }, 300)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const handleResize = () => {
  const previousItemsPerRow = currentItemsPerRow.value
  updateItemsPerRow()
  // 只有当每行个数发生变化时才重新初始化
  if (previousItemsPerRow !== currentItemsPerRow.value) {
    initializeTimeline()
  }
}

const getTypeColor = (type: string) => {
  const colors = {
    work: '#3498db',
    project: '#e74c3c',
    education: '#2ecc71'
  }
  return colors[type as keyof typeof colors] || '#95a5a6'
}
</script>

<template>
  <div class="experience-timeline" ref="timelineRef">
    <div class="timeline-header">
      <h2>{{ config.experienceTimeline.title }}</h2>
       <p>{{ config.experienceTimeline.subtitle }}</p>
    </div>
    
    <div class="timeline-container" :class="{ 'visible': isVisible }">
      <div 
        v-for="(group, groupIndex) in groupedExperiences" 
        :key="groupIndex"
        class="timeline-row"
      >
        <div class="timeline-items">
          <div 
            v-for="(item, itemIndex) in group"
            :key="item.id"
            class="timeline-item"
            :style="{ 
              '--delay': `${(groupIndex * currentItemsPerRow + itemIndex) * 0.2}s`,
              '--color': getTypeColor(item.type)
            }"
          >
            <!-- 时间线节点 -->
            <div class="timeline-node">
              <div class="node-icon">
                {{ item.icon }}
              </div>
              <div class="node-pulse"></div>
            </div>
            
            <!-- 内容卡片 -->
            <div class="timeline-content">
              <div class="content-header">
                <h3>{{ item.title }}</h3>
                <span v-if="item.company" class="company">@ {{ item.company }}</span>
              </div>
              
              <div class="period">{{ item.period }}</div>
              
              <p class="description">{{ item.description }}</p>
              
              <div class="skills">
                <span 
                  v-for="skill in item.skills" 
                  :key="skill"
                  class="skill-tag"
                >
                  {{ skill }}
                </span>
              </div>
            </div>
            
            <!-- 连接线到下一个节点 -->
            <div 
              v-if="itemIndex < group.length - 1 && itemIndex < currentItemsPerRow - 1"
              class="item-connector"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.experience-timeline {
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.timeline-header {
  text-align: center;
  margin-bottom: 50px;
}

.timeline-header h2 {
  font-size: 3.3rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color), var(--accent-color), var(--success-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: var(--spacing-sm);
  line-height: 1.2;
}

.timeline-header p {
  color: #7f8c8d;
  font-size: 1.1rem;
}

.timeline-container {
  position: relative;
}

.timeline-row {
  position: relative;
  margin-bottom: 60px;
}

.row-connector {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  width: 3px;
  height: 30px;
  background: linear-gradient(to bottom, #3498db, #e74c3c);
  border-radius: 2px;
}

.timeline-items {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 40px;
  flex-wrap: wrap;
  position: relative;
}

.timeline-item {
  position: relative;
  max-width: 280px;
  opacity: 0;
  transform: translateY(50px);
  animation: slideInUp 0.8s ease-out forwards;
  animation-delay: var(--delay);
}

.visible .timeline-item {
  animation-play-state: running;
}

.timeline-node {
  position: relative;
  width: 60px;
  height: 60px;
  margin: 0 auto 20px;
  z-index: 2;
}

.node-icon {
  width: 100%;
  height: 100%;
  background: var(--color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 2;
}

.node-pulse {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: var(--color);
  opacity: 0.3;
  animation: pulse 2s infinite;
}

.timeline-content {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  position: relative;
}

.timeline-content:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
}

.content-header {
  margin-bottom: 10px;
}

.content-header h3 {
  color: #2c3e50;
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 5px;
}

.company {
  color: var(--color);
  font-size: 0.9rem;
  font-weight: 500;
}

.period {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 15px;
  font-weight: 500;
}

.description {
  color: #5a6c7d;
  line-height: 1.6;
  margin-bottom: 20px;
  font-size: 0.95rem;
}

.skills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-tag {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.skill-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.item-connector {
  position: absolute;
  top: 30px;
  right: -40px;
  width: 40px;
  height: 3px;
  background: linear-gradient(to right, var(--color), #95a5a6);
  border-radius: 2px;
  z-index: 1;
}

@keyframes slideInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.1;
  }
  100% {
    transform: scale(1);
    opacity: 0.3;
  }
}

/* 响应式设计 */
/* 超大屏幕 (>1200px) - 4个项目 */
@media (min-width: 1201px) {
  .timeline-items {
    gap: 40px;
  }
  
  .timeline-item {
    max-width: 260px;
  }
}

/* 大屏幕 (1025px-1200px) - 3个项目 */
@media (max-width: 1200px) and (min-width: 1025px) {
  .timeline-items {
    gap: 35px;
  }
  
  .timeline-item {
    max-width: 280px;
  }
}

/* 中等屏幕 (769px-1024px) - 2个项目 */
@media (max-width: 1024px) and (min-width: 769px) {
  .timeline-items {
    gap: 30px;
  }
  
  .timeline-item {
    max-width: 320px;
  }
}

/* 小屏幕 (481px-768px) - 2个项目 */
@media (max-width: 768px) and (min-width: 481px) {
  .timeline-items {
    gap: 25px;
  }
  
  .timeline-item {
    max-width: 300px;
  }
  
  .timeline-content {
    padding: 22px;
  }
}

/* 超小屏幕 (≤480px) - 1个项目 */
@media (max-width: 480px) {
  .experience-timeline {
    padding: 20px 15px;
  }
  
  .timeline-header h2 {
    font-size: 2rem;
  }
  
  .timeline-items {
    flex-direction: column;
    align-items: center;
    gap: 30px;
  }
  
  .timeline-item {
    max-width: 100%;
    width: 100%;
  }
  
  .timeline-content {
    padding: 20px;
  }
  
  .item-connector {
    display: none;
  }
  
  .row-connector {
    display: none;
  }
}
</style>