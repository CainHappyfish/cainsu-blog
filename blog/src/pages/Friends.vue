<script setup lang="ts">
import { ref } from 'vue'

// 页面状态
const loading = ref(false)

// 页面方法
const handleAction = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 2000)
  console.log('index page action')
}
</script>

<template>
  <div class="index-page">
    <h1>好友列表 页面</h1>
    <ul>
      <li>
        <img src="https://picsum.photos/200/200" alt="好友1">
        <p>好友1</p>
      </li>
    </ul>
    <button @click="handleAction" :disabled="loading">
      {{ loading ? '加载中...' : '执行操作' }}
    </button>
  </div>
</template>

<style scoped>
</style>
