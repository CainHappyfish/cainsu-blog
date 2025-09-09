<script setup lang="ts">
import NavigationBar from '@/components/NavigationBar.vue'
import GlobalLoading from '@/components/GlobalLoading.vue'
import { useRoute } from 'vue-router'
import { globalLoading } from '@/composables/useGlobalLoading'

const route = useRoute()
const { loadingState } = globalLoading
</script>

<template>
  <div id="app">
    <!-- 导航栏 -->
    <NavigationBar v-if="route.path !== '/'" />

    <!-- 主要内容区域 -->
    <main class="main-content">
      <router-view />
    </main>

    <!-- 页脚 -->
    <footer class="footer">
      <div class="footer-content">
        <p>&copy; 2024 C4iN's Blog | 破酥的个人博客. All rights reserved.</p>
      </div>
    </footer>

    <!-- 全局加载组件 -->
    <GlobalLoading 
      :visible="loadingState.visible" 
      :text="loadingState.text" 
      :size="loadingState.size" 
    />
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 主要内容区域 */
.main-content {
  flex: 1;
  min-height: calc(100vh - 120px);
}

/* 页脚样式 */
.footer {
  background-color: var(--bg-primary);
  border-top: 1px solid var(--border-light);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: var(--shadow-sm);
  color: var(--text-primary);
  padding: var(--spacing-lg) 0;
  margin-top: auto;
  transition: all var(--transition-fast);
}

.footer-content {
  width: 100%;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
  text-align: center;
}

.footer-content p {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--text-sm);
  opacity: 0.8;
  transition: opacity var(--transition-fast);
}

.footer-content p:hover {
  opacity: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav-container {
    padding: 0 15px;
  }
  
  .nav-brand .brand-link {
    font-size: 20px;
  }
  
  .nav-menu {
    gap: 15px;
  }
  
  .nav-link {
    padding: 6px 12px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .nav-menu {
    gap: 10px;
  }
  
  .nav-link {
    padding: 4px 8px;
    font-size: 13px;
  }
}
</style>
