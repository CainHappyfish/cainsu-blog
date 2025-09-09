<script setup lang="ts">
import HomeIntroduction from '@/components/HomeIntroduction.vue'
</script>

<template>
  <div class="home-page">
    <HomeIntroduction />
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
}
</style>
