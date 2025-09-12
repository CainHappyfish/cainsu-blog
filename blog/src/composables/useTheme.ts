import { ref, watch } from 'vue'

// 主题类型定义
export type Theme = 'light' | 'dark'

// 深色主题配色方案
const darkThemeColors = {
  primary: '#3344AA',
  primaryHover: '#4455BB',
  secondary: '#881188',
  accent: '#DD0088',
  success: '#00AABB',
  warning: '#FFCC11',
  error: '#DD2200',
  
  textPrimary: '#DDDDFF',
  textSecondary: '#BBBBBB',
  textMuted: '#999999',
  textWhite: '#ffffff',
  
  bgPrimary: '#1a1a2e',
  bgSecondary: '#16213e',
  bgTertiary: '#0f3460',
  bgDark: '#0a0a0a',
  bgDarker: '#000000',
  
  borderLight: '#333366',
  borderMedium: '#444477',
  borderDark: '#555588'
}

// 亮色主题配色方案（保持原有配色）
const lightThemeColors = {
  primary: '#FF3377',
  primaryHover: '#FF5522',
  secondary: '#AA66DD',
  accent: '#FF55BB',
  success: '#0077DD',
  warning: '#FFCC11',
  error: '#FF5522',
  
  textPrimary: '#1f2937',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  textWhite: '#ffffff',
  
  bgPrimary: '#fef7f0',
  bgSecondary: '#fff0e6',
  bgTertiary: '#ffe9d9',
  bgDark: '#1f2937',
  bgDarker: '#111827',
  
  borderLight: '#e5e7eb',
  borderMedium: '#d1d5db',
  borderDark: '#374151'
}

// 主题状态
const isDarkMode = ref<boolean>(false)
const currentTheme = ref<Theme>('light')

// 应用主题颜色到CSS变量
const applyThemeColors = (theme: Theme) => {
  const colors = theme === 'dark' ? darkThemeColors : lightThemeColors
  const root = document.documentElement
  
  // 应用颜色变量
  Object.entries(colors).forEach(([key, value]) => {
    const cssVarName = key.replace(/([A-Z])/g, '-$1').toLowerCase()
    root.style.setProperty(`--${cssVarName}`, value)
  })
}

// 切换主题
const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  currentTheme.value = isDarkMode.value ? 'dark' : 'light'
  
  // 应用主题到DOM
  document.documentElement.classList.toggle('dark', isDarkMode.value)
  applyThemeColors(currentTheme.value)
  
  // 保存到本地存储
  localStorage.setItem('theme', currentTheme.value)
}

// 设置主题
const setTheme = (theme: Theme) => {
  isDarkMode.value = theme === 'dark'
  currentTheme.value = theme
  
  document.documentElement.classList.toggle('dark', isDarkMode.value)
  applyThemeColors(currentTheme.value)
  
  localStorage.setItem('theme', theme)
}

// 初始化主题
const initTheme = () => {
  // 从本地存储获取主题设置
  const savedTheme = localStorage.getItem('theme') as Theme | null
  
  if (savedTheme) {
    setTheme(savedTheme)
  } else {
    // 检测系统主题偏好
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    setTheme(prefersDark ? 'dark' : 'light')
  }
  
  // 监听系统主题变化
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    })
  }
}

// 监听主题变化
watch(currentTheme, (newTheme) => {
  applyThemeColors(newTheme)
})

export function useTheme() {
  return {
    isDarkMode,
    currentTheme,
    toggleTheme,
    setTheme,
    initTheme
  }
}