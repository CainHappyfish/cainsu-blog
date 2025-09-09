<script setup lang="ts">
import BlogsIntroduction from '@/components/BlogsIntroduction.vue'
import BlogsSummary from '@/components/BlogsSummary.vue'
</script>

<template>
  <div class="introduction-container">
    <!-- BlogsIntroduction 组件 -->
    <BlogsIntroduction />
    
    <!-- BlogsSummary 组件，显示在 BlogsIntroduction 下方 -->
    <BlogsSummary />
  </div>
</template>

<style scoped>
.introduction-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xl);
  width: calc(100% - 20px);
  margin: 0 10px;
  max-width: 1200px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .introduction-container {
    gap: var(--spacing-lg);
    padding: var(--spacing-md);
  }
}

@media (max-width: 480px) {
  .introduction-container {
    gap: var(--spacing-md);
    padding: var(--spacing-sm);
  }
}
</style>