<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import config from '@/config/configs'
import { useTheme } from '@/composables/useTheme'

const router = useRouter()
const curIndex = ref('首页')

// 从配置中获取数据
const navItems = config.navItems
const homeNavItems = config.homeNavItems.map(item => item.name)
// 当前索引判断
const isActiveIndex = (index: string) => {
  return index === curIndex.value
}

// 处理导航点击
const handleNavClick = (item: any) => {
  if (homeNavItems.includes(item.name)) {
    // 首页和 Blogs 在当前页面内切换
    curIndex.value = item.name
  } else {
    // 其他导航项直接跳转到对应页面
    router.push(item.path)
  }
}


// 使用主题管理
const { isDarkMode, toggleTheme } = useTheme()

// 暴露curIndex给父组件
defineExpose({
  curIndex
})
</script>

<template>
  <!-- 桌面端导航菜单 -->
  <div class="navbar-menu desktop-menu">
    <div class="navbar-nav">
      <a
        v-for="item in navItems"
        :key="item.path"
        class="nav-link"
        :class="{ active: isActiveIndex(item.name) }"
        @click="handleNavClick(item)" 
      >
        <span class="nav-text">{{ item.name }}</span>
      </a>
    </div>

    <!-- 主题切换按钮 -->
    <button class="theme-toggle" @click="toggleTheme" :title="isDarkMode ? '切换到亮色主题' : '切换到暗色主题'">
      <span class="theme-icon">{{ isDarkMode ? '☀️' : '🌙' }}</span>
    </button>
  </div>
</template>

<style scoped>
.navbar-menu {
  display: flex;
  width: calc(100% - 20px);  
  max-width: 1200px;
  justify-content: space-between;
  align-items: center;
  background-color: var(--bg-primary);
  margin-bottom: 20px;
}

.navbar-nav {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-lg);
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
  transition: all var(--transition-fast);
  cursor: pointer;
  position: relative;
}

.nav-link:hover {
  color: var(--primary-color);
  background-color: var(--bg-secondary);
  transform: translateY(-1px);
}

.nav-link.active {
  color: white;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  font-weight: 600;
}
</style>
