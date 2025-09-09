<script setup lang="ts">
import { DotLottieVue } from '@lottiefiles/dotlottie-vue'
import { onMounted, onUnmounted } from 'vue'
import loadingAnimation from '@/lottie/loading.json'

interface Props {
  visible?: boolean
  text?: string
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  visible: true,
  text: '加载中...',
  size: 120
})

// 防止页面滚动
onMounted(() => {
  if (props.visible) {
    document.body.style.overflow = 'hidden'
  }
})

onUnmounted(() => {
  document.body.style.overflow = ''
})

// 监听visible变化
const handleVisibleChange = (visible: boolean) => {
  if (visible) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

// 使用watch监听props.visible变化
import { watch } from 'vue'
watch(() => props.visible, handleVisibleChange)
</script>

<template>
  <Transition name="loading-fade">
    <div v-if="visible" class="global-loading">
      <div class="loading-backdrop" @click.stop></div>
      <div class="loading-content">
        <div class="loading-animation">
          <DotLottieVue 
            :style="{ height: `${size}px`, width: `${size}px` }" 
            autoplay 
            loop 
            :data="loadingAnimation" 
          />
        </div>
        <div class="loading-text">{{ text }}</div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
}

.loading-content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(20px);
  min-width: 200px;
}

.loading-animation {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-text {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  text-align: center;
  background: linear-gradient(135deg, var(--primary-color, #ff3377), var(--secondary-color, #aa66dd));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 过渡动画 */
.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: all 0.3s ease;
}

.loading-fade-enter-from {
  opacity: 0;
}

.loading-fade-enter-to {
  opacity: 1;
}

.loading-fade-leave-from {
  opacity: 1;
}

.loading-fade-leave-to {
  opacity: 0;
}

.loading-fade-enter-active .loading-content {
  animation: loadingBounceIn 0.5s ease-out;
}

.loading-fade-leave-active .loading-content {
  animation: loadingBounceOut 0.3s ease-in;
}

@keyframes loadingBounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3) translateY(-50px);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05) translateY(0);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes loadingBounceOut {
  0% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  100% {
    opacity: 0;
    transform: scale(0.3) translateY(-50px);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .loading-content {
    padding: 30px 20px;
    margin: 20px;
    min-width: 160px;
  }
  
  .loading-text {
    font-size: 14px;
  }
}
</style>