<script setup lang="ts">
import { ref, computed } from 'vue'
import HomeNavigation from '@/components/HomeNavigation.vue'
import HomeIntroduction from '@/components/HomeIntroduction.vue'
import Introduction from '@/components/BlogsIntroduction.vue'
import Danmaku from '@/components/Danmaku.vue'

// 获取导航组件的引用
const homeNavigationRef = ref()

// 计算当前应该显示的Introduction组件
const currentIntroductionComponent = computed(() => {
  const currentIndex = homeNavigationRef.value?.curIndex
  // 根据不同的导航选择返回不同的组件
  switch (currentIndex) {
    case '首页':
      return HomeIntroduction
    case 'Blogs':
      return Introduction
    default:
      return HomeIntroduction
  }
})
</script>

<template>
  <div class="home-page">
    <div class="home-introduction-container">
      <!-- 导航栏 -->
      <HomeNavigation ref="homeNavigationRef" />
      <!-- 动态Introduction组件 -->
      <component :is="currentIntroductionComponent" />
    </div>
    <!-- 弹幕组件 -->
    <Danmaku />
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  background-color: var(--bg-primary);
  
  /* 确保内容居中 */
  display: flex;
  flex-direction: column;
  justify-content: center;

  overflow-x: hidden;
}

.home-introduction-container {
  width: calc(100% - 20px);
  height: calc(100vh - 20px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 20px;
  margin: 10px;
}

/* 移动端调整 */
@media (max-width: 768px) {
  .home-page {
    justify-content: flex-start;
    padding-top: 20px;
  }
}

@media (max-width: 480px) {
  .home-page {
    padding-top: 10px;
  }
}

.star-decoration {
  position: absolute;
  bottom: 10px;
  right: 50px;
}
</style>
