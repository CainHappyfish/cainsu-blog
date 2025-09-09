<script setup lang="ts">
</script>

<template>
  <div class="blogs-page">
    <h1>🚧 施工中</h1>
  </div>
</template>

<style scoped>
.blogs-page {
  display: flex;
  width: 100vw;
  height: 90vh;
  flex-direction: column;
  align-items: center;  
  justify-content: center;
}

.blogs-page h1 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.blogs-page button {
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.blogs-page button:hover {
  background-color: #2980b9;
}

.blogs-page button:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}
</style>
