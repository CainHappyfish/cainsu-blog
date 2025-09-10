<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import config from '@/config/configs'

import { Photo } from '@/types/about'

const props = defineProps<{
  photos: Photo[]
}>()

const containerRef = ref<HTMLElement>()
// 控制照片显示状态
const visiblePhotos = ref<Photo[]>([])
const isVisible = ref(false)
const isIntersecting = ref(false)
let observer: IntersectionObserver | null = null

// 瀑布流动画
const startWaterfallAnimation = async () => {
  // 初始化所有照片为不可见
  visiblePhotos.value = props.photos.map(photo => ({ ...photo, visible: false, loaded: false }))
  
  // 等待DOM更新
  await nextTick()
  
  // 逐张显示照片，创建瀑布流效果
  for (let i = 0; i < visiblePhotos.value.length; i++) {
    setTimeout(() => {
      visiblePhotos.value[i].visible = true
      // 延迟加载图片
      setTimeout(() => {
        visiblePhotos.value[i].loaded = true
      }, 100)
    }, i * 150) // 每张照片间隔150ms弹出
  }
}

const setupIntersectionObserver = () => {
  if (!containerRef.value) return
  
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !isIntersecting.value) {
          isIntersecting.value = true
          isVisible.value = true
          startWaterfallAnimation()
        }
      })
    },
    {
      threshold: 0.1,
      rootMargin: '50px'
    }
  )
  
  observer.observe(containerRef.value)
}

onMounted(() => {
  setupIntersectionObserver()
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>

<template>
  <div class="photo-wall" ref="containerRef">
    <div class="section-header">
      <h2>{{ config.aboutPage.photoWall.title }}</h2>
      <p>{{ config.aboutPage.photoWall.subtitle }}</p>
    </div>
    
    <div 
      class="photos-container" 
      :class="{ 'visible': isVisible }"
    >
      <div class="photos-grid">
        <!-- 瀑布流照片网格 -->
        <div 
          v-for="photo in visiblePhotos" 
          :key="photo.id"
          class="photo-item"
          :class="{ 'photo-visible': photo.visible }"
        >
          <div class="photo-wrapper">
            <img 
              v-if="photo.loaded"
              :src="photo.url" 
              :alt="photo.alt"
              class="photo-image"
            />
            <div v-else class="photo-placeholder">
              <div class="loading-spinner"></div>
            </div>
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
  border-radius: 20px;
  background: transparent;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.photos-container.visible {
  opacity: 1;
  transform: translateY(0);
}

.photos-grid {
  column-count: 4;
  column-gap: 20px;
  padding: 20px 0;
}

@media (max-width: 1200px) {
  .photos-grid {
    column-count: 3;
  }
}

@media (max-width: 768px) {
  .photos-grid {
    column-count: 2;
    column-gap: 16px;
  }
}

@media (max-width: 480px) {
  .photos-grid {
    column-count: 1;
  }
}

.photo-item {
  position: relative;
  break-inside: avoid;
  margin-bottom: 20px;
  opacity: 0;
  transform: translateY(50px) scale(0.8);
  transition: all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.photo-item.photo-visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.photo-wrapper {
   width: 100%;
   border-radius: 16px;
   overflow: hidden;
   background: linear-gradient(135deg, 
     rgba(255, 255, 255, 0.1) 0%, 
     rgba(255, 255, 255, 0.05) 100%);
   backdrop-filter: blur(10px);
   border: 1px solid rgba(255, 255, 255, 0.1);
   box-shadow: 
     0 8px 32px rgba(0, 0, 0, 0.1),
     0 2px 8px rgba(0, 0, 0, 0.05);
   transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
   cursor: pointer;
   position: relative;
 }

.photo-wrapper:hover {
  transform: translateY(-12px) scale(1.03);
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.2),
    0 12px 24px rgba(0, 0, 0, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.photo-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.15) 0%, 
    transparent 50%, 
    rgba(0, 0, 0, 0.1) 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
  z-index: 1;
}

.photo-wrapper:hover::before {
  opacity: 1;
}

.photo-image {
   width: 100%;
   height: auto;
   display: block;
   transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
 }

.photo-wrapper:hover .photo-image {
  transform: scale(1.08);
}

.photo-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: white;
  padding: 24px;
  transform: translateY(100%);
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  z-index: 2;
}

.photo-wrapper:hover .photo-overlay {
  transform: translateY(0);
}

.photo-alt {
  font-size: 18px;
  font-weight: 600;
  line-height: 1.3;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

.photo-placeholder {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.05) 0%, 
    rgba(255, 255, 255, 0.02) 100%);
  border-radius: 12px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top: 3px solid rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .photo-wall {
    padding: 30px 16px;
    margin: 30px auto;
  }
  
  .section-header {
    margin-bottom: 30px;
  }
  
  .section-header h2 {
    font-size: 2rem;
  }
  
  .section-header p {
    font-size: 1rem;
    padding: 0 10px;
  }
  
  .photos-grid {
    column-gap: 12px;
    padding: 15px 0;
  }
  
  .photo-item {
    margin-bottom: 16px;
  }
  
  .photo-wrapper {
    border-radius: 12px;
  }
  
  .photo-overlay {
    padding: 16px;
  }
  
  .photo-alt {
    font-size: 14px;
  }
  
  .photo-placeholder {
    height: 150px;
  }
  
  .loading-spinner {
    width: 30px;
    height: 30px;
  }
}

@media (max-width: 480px) {
  .photo-wall {
    padding: 20px 12px;
    margin: 20px auto;
  }
  
  .section-header {
    margin-bottom: 25px;
  }
  
  .section-header h2 {
    font-size: 1.6rem;
    line-height: 1.3;
  }
  
  .section-header p {
    font-size: 0.9rem;
    padding: 0 5px;
  }
  
  .photos-grid {
    column-gap: 10px;
    padding: 10px 0;
  }
  
  .photo-item {
    margin-bottom: 12px;
  }
  
  .photo-wrapper {
    border-radius: 10px;
  }
  
  .photo-wrapper:hover {
    transform: translateY(-6px) scale(1.02);
  }
  
  .photo-overlay {
    padding: 12px;
  }
  
  .photo-alt {
    font-size: 13px;
    line-height: 1.4;
  }
  
  .photo-placeholder {
    height: 120px;
  }
  
  .loading-spinner {
    width: 25px;
    height: 25px;
    border-width: 2px;
  }
}

/* 超小屏幕优化 */
@media (max-width: 360px) {
  .photo-wall {
    padding: 15px 8px;
  }
  
  .section-header h2 {
    font-size: 1.4rem;
  }
  
  .photos-grid {
    column-gap: 8px;
  }
  
  .photo-item {
    margin-bottom: 10px;
  }
  
  .photo-overlay {
    padding: 10px;
  }
  
  .photo-alt {
    font-size: 12px;
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