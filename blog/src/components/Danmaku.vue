<template>
  <div class="danmaku-container">
    <div
      v-for="danmaku in activeDanmakus"
      :key="danmaku.id"
      class="danmaku-item"
      :style="{
        top: danmaku.top + 'px',
        fontSize: danmaku.fontSize + 'px',
        color: danmaku.color,
        animationDuration: danmaku.duration + 's'
      }"
    >
      {{ danmaku.text }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import config from '@/config/configs'
import { DanmakuItem } from '@/types/danmaku'


const activeDanmakus = ref<DanmakuItem[]>([])
let danmakuId = 0
let intervalId: number | null = null
const timeoutIds = new Set<number>() // 存储所有定时器ID

// 获取随机数
const getRandomNumber = (min: number, max: number): number => {
  return Math.random() * (max - min) + min
}

// 获取随机数组元素
const getRandomArrayItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)]
}

// 创建新弹幕
const createDanmaku = (): DanmakuItem => {
  const danmakuConfig = config.danmaku
  
  return {
    id: danmakuId++,
    text: getRandomArrayItem(danmakuConfig.defaultMessages),
    top: getRandomNumber(50, window.innerHeight - 100), // 随机垂直位置
    fontSize: getRandomNumber(danmakuConfig.style.fontSize.min, danmakuConfig.style.fontSize.max),
    color: getRandomArrayItem(danmakuConfig.style.colors),
    duration: getRandomNumber(danmakuConfig.duration.min, danmakuConfig.duration.max)
  }
}

// 移除弹幕
const removeDanmaku = (danmakuId: number) => {
  const index = activeDanmakus.value.findIndex(item => item.id === danmakuId)
  if (index > -1) {
    activeDanmakus.value.splice(index, 1)
  }
}

// 清理过期弹幕（超过最大数量时移除最旧的）
const cleanupOldDanmakus = () => {
  const maxCount = config.danmaku.performance.maxCount
  while (activeDanmakus.value.length >= maxCount) {
    activeDanmakus.value.shift() // 移除最旧的弹幕
  }
}

// 添加弹幕
const addDanmaku = () => {
  // 清理过期弹幕
  cleanupOldDanmakus()
  
  const newDanmaku = createDanmaku()
  activeDanmakus.value.push(newDanmaku)
  
  // 弹幕动画结束后移除
  const timeoutId = window.setTimeout(() => {
    removeDanmaku(newDanmaku.id)
    timeoutIds.delete(timeoutId)
  }, newDanmaku.duration * 1000)
  
  timeoutIds.add(timeoutId)
}

// 开始弹幕
const startDanmaku = () => {
  const danmakuConfig = config.danmaku
  
  const scheduleNext = () => {
    addDanmaku()
    const nextInterval = getRandomNumber(danmakuConfig.interval.min, danmakuConfig.interval.max)
    intervalId = window.setTimeout(scheduleNext, nextInterval)
  }
  
  scheduleNext()
}

// 停止弹幕
const stopDanmaku = () => {
  // 清理主定时器
  if (intervalId) {
    clearTimeout(intervalId)
    intervalId = null
  }
  
  // 清理所有弹幕定时器
  timeoutIds.forEach(id => {
    clearTimeout(id)
  })
  timeoutIds.clear()
  
  // 清空所有弹幕
  activeDanmakus.value = []
}

onMounted(() => {
  startDanmaku()
})

onUnmounted(() => {
  stopDanmaku()
})
</script>

<style scoped>
.danmaku-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.danmaku-item {
  position: absolute;
  right: -300px; /* 从右侧屏幕外开始 */
  white-space: nowrap;
  font-weight: 500;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  animation: danmaku-move linear;
  pointer-events: none;
  user-select: none;
}

@keyframes danmaku-move {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(calc(-100vw - 300px)); /* 移动到左侧屏幕外 */
  }
}

/* 移动端优化 */
@media (max-width: 768px) {
  .danmaku-item {
    font-size: 12px !important;
    min-font-size: 10px;
    max-font-size: 16px;
  }
}

@media (max-width: 480px) {
  .danmaku-item {
    font-size: 10px !important;
    min-font-size: 8px;
    max-font-size: 14px;
  }
}
</style>