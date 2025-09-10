<script setup lang="ts">
import { ref } from 'vue'
import { DotLottieVue } from '@lottiefiles/dotlottie-vue'
import loadingAnimation from '@/lottie/loading.json'

const size = ref(300)
</script>

<template>
  <div class="friends-page">
    <div class="loading-animation">
      <DotLottieVue 
        :style="{ height: `${size}px`, width: `${size}px` }" 
        autoplay 
        loop 
        :data="loadingAnimation" 
      />
    </div>
    <h1>🚧 施工中</h1>
  </div>
</template>

<style scoped>
.friends-page {
  display: flex;
  width: 100vw;
  height: 90vh;
  flex-direction: column;
  align-items: center;  
  justify-content: center;
}
</style>
