<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Hobby } from '@/types/about';
import config from '@/config/configs'


defineProps<{
  hobbies: Hobby[]
}>()

const isVisible = ref(false)
const hoveredCard = ref<number | null>(null)

onMounted(() => {
  setTimeout(() => {
    isVisible.value = true
  }, 200)
})

const renderStars = (level: number) => {
  return Array.from({ length: 5 }, (_, i) => i < level ? '★' : '☆')
}

const handleCardHover = (id: number | null) => {
  hoveredCard.value = id
}
</script>

<template>
  <div class="interests-hobbies">
    <div class="section-header">
      <h2>{{ config.interestsHobbiesSection.title }}</h2>
      <p>{{ config.interestsHobbiesSection.subtitle }}</p>
    </div>
    
    <div class="hobbies-grid" :class="{ 'visible': isVisible }">
      <div 
        v-for="(hobby, index) in hobbies" 
        :key="hobby.id"
        class="hobby-card"
        :class="[`size-${hobby.size || 'medium'}`]"
        :style="{ 
          '--delay': `${index * 0.1}s`,
          '--color': hobby.color,
          '--bg-image': hobby.backgroundImage ? `url(${hobby.backgroundImage})` : 'none'
        }"
        @mouseenter="handleCardHover(hobby.id)"
        @mouseleave="handleCardHover(null)"
      >
        <div class="card-background" :class="{ 'has-image': hobby.backgroundImage }"></div>
        <div class="card-overlay" v-if="hobby.backgroundImage"></div>
        
        <div class="card-content">
          <div class="hobby-icon">
            {{ hobby.icon }}
          </div>
          
          <h3 class="hobby-name">{{ hobby.name }}</h3>
          
          <div class="hobby-level">
            <span 
              v-for="(star, starIndex) in renderStars(hobby.level)"
              :key="starIndex"
              class="star"
              :class="{ 'filled': starIndex < hobby.level }"
            >
              {{ star }}
            </span>
          </div>
          
          <p class="hobby-description">{{ hobby.description }}</p>
          
          <div class="hobby-tags">
            <span 
              v-for="tag in hobby.tags"
              :key="tag"
              class="tag"
            >
              {{ tag }}
            </span>
          </div>
        </div>
        
        <div class="card-glow" :class="{ 'active': hoveredCard === hobby.id }"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.interests-hobbies {
  padding: 60px 20px;
  max-width: 1200px;
  margin: 60px auto;
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
  color: #7f8c8d;
  font-size: 1.1rem;
}

.hobbies-grid {
  columns: 3;
  column-gap: 20px;
  padding: 20px 0;
}

@media (max-width: 1200px) {
  .hobbies-grid {
    columns: 2;
  }
}

@media (max-width: 768px) {
  .hobbies-grid {
    columns: 1;
  }
}

.hobby-card {
  position: relative;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden;
  opacity: 0;
  transform: translateY(50px) scale(0.9);
  animation: cardSlideIn 0.8s ease-out forwards;
  animation-delay: var(--delay);
  cursor: pointer;
  display: inline-block;
  width: 100%;
  margin-bottom: 20px;
  break-inside: avoid;
}

.visible .hobby-card {
  animation-play-state: running;
}

.hobby-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
}

.card-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: linear-gradient(90deg, var(--color), lighten(var(--color), 20%));
  border-radius: 20px 20px 0 0;
}

.card-background.has-image {
  height: 100%;
  background-image: var(--bg-image);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 15px;
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6));
  border-radius: 15px;
  z-index: 1;
}

/* 不同大小的卡片样式 */
.hobby-card.size-small {
  min-height: 180px;
}

.hobby-card.size-medium {
  min-height: 220px;
}

.hobby-card.size-large {
  min-height: 280px;
}

.hobby-card.size-large .hobby-icon {
  font-size: 4rem;
}

.hobby-card.size-large .hobby-name {
  font-size: 1.8rem;
}

.hobby-card.size-large .card-content {
  padding: 40px 30px;
}

.card-content {
  position: relative;
  z-index: 3;
}

/* 有背景图的卡片使用白色文字 */
.hobby-card:has(.card-background.has-image) .card-content {
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.7);
}

.hobby-card:has(.card-background.has-image) .hobby-name {
  color: white;
}

.hobby-card:has(.card-background.has-image) .hobby-description {
  color: rgba(255, 255, 255, 0.9);
}

/* 没有背景图的卡片使用原来的颜色 */
.hobby-card:not(:has(.card-background.has-image)) .card-content {
  color: #2c3e50;
}

.hobby-card:not(:has(.card-background.has-image)) .hobby-name {
  color: white;
}

.hobby-card:not(:has(.card-background.has-image)) .hobby-description {
  color: #5a6c7d;
}

.hobby-icon {
  font-size: 3rem;
  margin-bottom: 20px;
  text-align: center;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

.hobby-name {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 15px;
  text-align: center;
}

.hobby-level {
  display: flex;
  justify-content: center;
  gap: 4px;
  margin-bottom: 20px;
}

.star {
  font-size: 1.2rem;
  color: #ddd;
  transition: all 0.3s ease;
}

.star.filled {
  color: #f39c12;
  text-shadow: 0 0 10px rgba(243, 156, 18, 0.5);
}

.hobby-description {
  color: #5a6c7d;
  line-height: 1.6;
  margin-bottom: 25px;
  text-align: center;
  font-size: 0.95rem;
}

.hobby-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.hobby-tags .tag {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.card-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, var(--color) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
  z-index: 1;
}

.card-glow.active {
  opacity: 0.1;
}

@keyframes cardSlideIn {
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hobbies-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .hobby-card {
    padding: 25px;
  }
  
  .section-header h2 {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .interests-hobbies {
    padding: 40px 15px;
  }
  
  .hobby-card {
    padding: 20px;
  }
  
  .hobby-icon {
    font-size: 2.5rem;
  }
  
  .hobby-name {
    font-size: 1.3rem;
  }
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .hobby-card {
    background: #2c3e50;
    color: #ecf0f1;
  }
  
  .hobby-name {
    color: #ecf0f1;
  }
  
  .hobby-description {
    color: #bdc3c7;
  }
  
  .section-header h2 {
    color: #ecf0f1;
  }
  
  .section-header p {
    color: #95a5a6;
  }
}
</style>