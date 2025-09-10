<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import config from '@/config/configs'

interface Photo {
  id: number
  url: string
  alt: string
}

defineProps<{
  photos: Photo[]
}>()

const isVisible = ref(false)
const scrollContainer = ref<HTMLElement>()
const isPaused = ref(false)
const isIntersecting = ref(false)

// 动画控制
let animationId: number
let lastTime = 0
const scrollSpeed = 0.5 // 降低滚动速度，减少抖动
const targetFPS = 60
const frameInterval = 1000 / targetFPS

const startAnimation = () => {
  const animate = (currentTime: number) => {
    // 根据可见性调整帧率
    const currentFrameInterval = isIntersecting.value ? frameInterval : frameInterval * 2
    
    // 控制帧率，减少不必要的重绘
    if (currentTime - lastTime >= currentFrameInterval) {
      if (!isPaused.value && scrollContainer.value) {
        const container = scrollContainer.value
        
        // 使用更平滑的滚动方式
        const currentScroll = container.scrollLeft
        const newScroll = currentScroll + scrollSpeed
        
        // 当滚动到一半时重置位置，实现无缝循环
        if (newScroll >= container.scrollWidth / 2) {
          container.scrollLeft = 0
        } else {
          container.scrollLeft = newScroll
        }
      }
      lastTime = currentTime
    }
    animationId = requestAnimationFrame(animate)
  }
  animationId = requestAnimationFrame(animate)
}

const stopAnimation = () => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
}

const handleMouseEnter = () => {
  isPaused.value = true
}

const handleMouseLeave = () => {
  isPaused.value = false
}

// 使用 Intersection Observer 检测组件是否在视口中
let observer: IntersectionObserver

onMounted(() => {
  setTimeout(() => {
    isVisible.value = true
    
    // 创建 Intersection Observer
    if (scrollContainer.value) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            isIntersecting.value = entry.isIntersecting
          })
        },
        {
          threshold: 0.1, // 当10%的组件可见时触发
          rootMargin: '50px' // 提前50px开始检测
        }
      )
      
      observer.observe(scrollContainer.value.parentElement!)
    }
    
    // 始终开始动画，不受视口状态影响
    startAnimation()
  }, 200)
})

onUnmounted(() => {
  stopAnimation()
  if (observer) {
    observer.disconnect()
  }
})
</script>

<template>
  <div class="photo-wall">
    <div class="section-header">
      <h2>{{ config.aboutPage.photoWall.title }}</h2>
      <p>{{ config.aboutPage.photoWall.subtitle }}</p>
    </div>
    
    <div 
      class="photos-container" 
      :class="{ 'visible': isVisible }"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <div 
        ref="scrollContainer"
        class="photos-scroll"
      >
        <!-- 第一组照片 -->
        <div 
          v-for="photo in photos" 
          :key="`first-${photo.id}`"
          class="photo-item"
        >
          <div class="photo-wrapper">
            <img 
              :src="photo.url" 
              :alt="photo.alt"
              class="photo-image"
              loading="lazy"
            />
            <div class="photo-overlay">
              <span class="photo-alt">{{ photo.alt }}</span>
            </div>
          </div>
        </div>
        
        <!-- 第二组照片（用于无缝循环） -->
        <div 
          v-for="photo in photos" 
          :key="`second-${photo.id}`"
          class="photo-item"
        >
          <div class="photo-wrapper">
            <img 
              :src="photo.url" 
              :alt="photo.alt"
              class="photo-image"
              loading="lazy"
            />
            <div class="photo-overlay">
              <span class="photo-alt">{{ photo.alt }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.photo-wall {
  padding: 60px 20px;
  max-width: 1200px;
  margin: 60px auto;
  overflow: hidden;
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

.photos-container {
  position: relative;
  width: 100%;
  height: 300px;
  border-radius: 20px;
  overflow: hidden;
  background: transparent;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  /* 确保容器完全隐藏溢出内容 */
  contain: layout style paint;
}

.photos-container.visible {
  opacity: 1;
  transform: translateY(0);
}

.photos-scroll {
  display: flex;
  height: 100%;
  overflow: hidden;
  scroll-behavior: smooth;
  /* 确保滚动条完全隐藏 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.photos-scroll::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

.photo-item {
  flex-shrink: 0;
  height: 100%;
  margin-right: 20px;
  position: relative;
}

.photo-wrapper {
  position: relative;
  height: 100%;
  border-radius: 15px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
}

.photo-wrapper:hover {
  transform: scale(1.05);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
}

.photo-image {
  width: auto;
  height: 100%;
  object-fit: cover;
  transition: all 0.4s ease;
}

.photo-wrapper:hover .photo-image {
  transform: scale(1.1);
}

.photo-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: white;
  padding: 20px;
  transform: translateY(100%);
  transition: transform 0.4s ease;
}

.photo-wrapper:hover .photo-overlay {
  transform: translateY(0);
}

.photo-alt {
  font-size: 0.9rem;
  font-weight: 500;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .photo-wall {
    padding: 40px 15px;
  }
  
  .photos-container {
    height: 250px;
  }
  
  .section-header h2 {
    font-size: 2rem;
  }
  
  .photo-item {
    margin-right: 15px;
  }
}

@media (max-width: 480px) {
  .photos-container {
    height: 200px;
  }
  
  .section-header h2 {
    font-size: 1.8rem;
  }
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .photos-container {
    background: transparent;
  }
  
  .section-header h2 {
    color: #ecf0f1;
  }
  
  .section-header p {
    color: #95a5a6;
  }
}
</style>