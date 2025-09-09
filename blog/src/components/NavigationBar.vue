<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import config from '@/config/configs'

// 路由相关
const route = useRoute()
const router = useRouter()

// 移动端菜单状态
const isMobileMenuOpen = ref(false)

// 从配置中获取数据
const navItems = config.navItems
const blogInfo = config.blogInfo

// 当前路由判断
const isActiveRoute = (path: string) => {
  return route.path === path
}

// 切换移动端菜单
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

// 导航到指定路由
const navigateTo = (path: string) => {
  router.push(path)
  isMobileMenuOpen.value = false // 移动端点击后关闭菜单
}

// 主题切换状态
const isDarkMode = ref(false)

// 切换主题
const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  document.documentElement.classList.toggle('dark', isDarkMode.value)
}

// 检测系统主题偏好
const checkSystemTheme = () => {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    isDarkMode.value = true
    document.documentElement.classList.add('dark')
  }
}

// 组件挂载时检测主题
checkSystemTheme()
</script>

<template>
  <nav class="navbar">
    <div class="navbar-container">
      <!-- Logo 区域 -->
      <div class="navbar-brand" @click="navigateTo('/')">
        <div class="logo">
          <span class="logo-icon">{{ blogInfo.logo }}</span>
          <span class="logo-text">{{ blogInfo.title }}</span>
        </div>
      </div>

      <!-- 桌面端导航菜单 -->
      <div class="navbar-menu desktop-menu">
        <div class="navbar-nav">
          <a
            v-for="item in navItems"
            :key="item.path"
            class="nav-link"
            :class="{ active: isActiveRoute(item.path) }"
            @click="navigateTo(item.path)"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-text">{{ item.name }}</span>
          </a>
        </div>

        <!-- 主题切换按钮 -->
        <button class="theme-toggle" @click="toggleTheme" :title="isDarkMode ? '切换到亮色主题' : '切换到暗色主题'">
          <span class="theme-icon">{{ isDarkMode ? '☀️' : '🌙' }}</span>
        </button>
      </div>

      <!-- 移动端菜单按钮 -->
      <div class="mobile-menu-toggle">
        <button class="theme-toggle mobile-theme" @click="toggleTheme">
          <span class="theme-icon">{{ isDarkMode ? '☀️' : '🌙' }}</span>
        </button>
        <button 
          class="hamburger"
          :class="{ active: isMobileMenuOpen }"
          @click="toggleMobileMenu"
          aria-label="切换菜单"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </div>

    <!-- 移动端下拉菜单 -->
    <div class="mobile-menu" :class="{ open: isMobileMenuOpen }">
      <div class="mobile-nav">
        <a
          v-for="item in navItems"
          :key="item.path"
          class="mobile-nav-link"
          :class="{ active: isActiveRoute(item.path) }"
          @click="navigateTo(item.path)"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-text">{{ item.name }}</span>
        </a>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 1000;
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-light);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
}

.navbar-container {
  width: 100%;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

/* Logo 区域 */
.navbar-brand {
  cursor: pointer;
  transition: transform var(--transition-fast);
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.logo-icon {
  font-size: var(--text-2xl);
  line-height: 1;
}

.logo-text {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--text-primary);
  background: linear-gradient(135deg, #FF5522, #FFCC11, #FF55BB, #AA66DD, #0077DD);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 桌面端菜单 */
.desktop-menu {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
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
  color: var(--primary-color);
  background-color: var(--bg-secondary);
  font-weight: 600;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 2px;
  background: linear-gradient(90deg, #FF5522, #FFCC11, #FF55BB, #AA66DD, #0077DD);
  border-radius: 1px;
}

.nav-icon {
  font-size: var(--text-base);
  line-height: 1;
}

.nav-text {
  font-size: var(--text-sm);
}

/* 主题切换按钮 */
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: var(--radius-lg);
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.theme-toggle:hover {
  background-color: var(--bg-tertiary);
  transform: scale(1.1);
}

.theme-icon {
  font-size: var(--text-lg);
  line-height: 1;
}

/* 移动端菜单切换 */
.mobile-menu-toggle {
  display: none;
  align-items: center;
  gap: var(--spacing-sm);
}

.mobile-theme {
  width: 36px;
  height: 36px;
}

.hamburger {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  gap: 4px;
}

.hamburger span {
  display: block;
  width: 20px;
  height: 2px;
  background-color: var(--text-primary);
  border-radius: 1px;
  transition: all var(--transition-fast);
  transform-origin: center;
}

.hamburger.active span:nth-child(1) {
  transform: rotate(45deg) translate(4px, 3px);
}

.hamburger.active span:nth-child(2) {
  opacity: 0;
  transform: scale(0);
}

.hamburger.active span:nth-child(3) {
  transform: rotate(-45deg) translate(5px, -5px);
}

/* 移动端下拉菜单 */
.mobile-menu {
  display: none;
  background-color: var(--bg-primary);
  border-top: 1px solid var(--border-light);
  box-shadow: var(--shadow-md);
  max-height: 0;
  overflow: hidden;
  transition: max-height var(--transition-normal);
}

.mobile-menu.open {
  max-height: 300px;
}

.mobile-nav {
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
  transition: all var(--transition-fast);
  cursor: pointer;
}

.mobile-nav-link:hover,
.mobile-nav-link.active {
  color: var(--primary-color);
  background-color: var(--bg-secondary);
}

.mobile-nav-link .nav-icon {
  font-size: var(--text-lg);
}

.mobile-nav-link .nav-text {
  font-size: var(--text-base);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .navbar-container {
    padding: 0 var(--spacing-sm);
    height: 56px;
  }
  
  .desktop-menu {
    display: none;
  }
  
  .mobile-menu-toggle {
    display: flex;
  }
  
  .mobile-menu {
    display: block;
  }
  
  .logo-text {
    font-size: var(--text-lg);
  }
  
  .logo-icon {
    font-size: var(--text-xl);
  }
}

@media (max-width: 480px) {
  .navbar-container {
    height: 52px;
  }
  
  .logo-text {
    display: none;
  }
  
  .mobile-theme {
    width: 32px;
    height: 32px;
  }
  
  .hamburger {
    width: 36px;
    height: 36px;
  }
}

/* 暗色主题适配 */
@media (prefers-color-scheme: dark) {
  .navbar {
    background-color: var(--bg-primary);
    border-bottom-color: var(--border-light);
  }
}

/* 滚动时的效果 */
.navbar.scrolled {
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

@media (prefers-color-scheme: dark) {
  .navbar.scrolled {
    background-color: rgba(17, 24, 39, 0.95);
  }
}

/* 动画效果 */
.mobile-menu {
  animation: slideDown var(--transition-normal) ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 无障碍支持 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .navbar {
    border-bottom-width: 2px;
  }
  
  .nav-link.active::after {
    height: 3px;
  }
}
</style>
