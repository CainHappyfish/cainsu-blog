<script setup lang="ts">
import { ref } from 'vue'

// 页面状态
const loading = ref(false)

// 页面方法
const handleAction = () => {
  console.log('About page action')
}
</script>

<template>
  <div class="about-page">
    <h1>About 页面</h1>
    <p>这是 About 页面的内容</p>
    <button @click="handleAction" :disabled="loading">
      {{ loading ? '加载中...' : '执行操作' }}
    </button>
  </div>
</template>

<style scoped>
.about-page {
  padding: 20px;
}

.about-page h1 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.about-page button {
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.about-page button:hover {
  background-color: #2980b9;
}

.about-page button:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}
</style>
