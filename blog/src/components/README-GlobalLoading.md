# 全局加载组件使用说明

## 概述

全局加载组件是一个基于 Lottie 动画的加载指示器，可以在整个应用中使用，提供统一的加载体验。

## 组件特性

- 🎨 基于 Lottie 动画，视觉效果丰富
- 🔧 可自定义加载文本和动画大小
- 🎭 支持过渡动画效果
- 📱 响应式设计，适配移动端
- 🚫 自动防止页面滚动
- 🎯 提供多种使用方式

## 快速开始

### 1. 基本使用

```typescript
import { globalLoading } from '@/composables/useGlobalLoading'

const { showLoading, hideLoading } = globalLoading

// 显示加载
showLoading('正在加载...', 120)

// 隐藏加载
hideLoading()
```

### 2. 异步操作包装

```typescript
import { globalLoading } from '@/composables/useGlobalLoading'

const { withLoading } = globalLoading

// 自动管理加载状态
const fetchData = async () => {
  await withLoading(async () => {
    const response = await fetch('/api/data')
    return response.json()
  }, '获取数据中...', 150)
}
```

## API 参考

### useGlobalLoading

#### 方法

| 方法名 | 参数 | 描述 |
|--------|------|------|
| `showLoading` | `text?: string, size?: number` | 显示全局加载 |
| `hideLoading` | - | 隐藏全局加载 |
| `toggleLoading` | - | 切换加载状态 |
| `withLoading` | `asyncFn: () => Promise<T>, text?: string, size?: number` | 异步操作包装器 |

#### 状态

| 属性名 | 类型 | 描述 |
|--------|------|------|
| `loadingState.visible` | `boolean` | 加载是否可见 |
| `loadingState.text` | `string` | 加载文本 |
| `loadingState.size` | `number` | 动画大小 |

### GlobalLoading 组件

#### Props

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| `visible` | `boolean` | `true` | 是否显示加载 |
| `text` | `string` | `'加载中...'` | 加载文本 |
| `size` | `number` | `120` | 动画大小（像素） |

## 使用示例

### 1. 页面路由切换

```typescript
// router/index.ts
import { globalLoading } from '@/composables/useGlobalLoading'

const { showLoading, hideLoading } = globalLoading

router.beforeEach(() => {
  showLoading('页面加载中...')
})

router.afterEach(() => {
  hideLoading()
})
```

### 2. API 请求

```typescript
// api/request.ts
import { globalLoading } from '@/composables/useGlobalLoading'

const { withLoading } = globalLoading

export const apiRequest = async (url: string) => {
  return await withLoading(async () => {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('请求失败')
    }
    return response.json()
  }, '请求中...', 100)
}
```

### 3. 表单提交

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="formData.name" placeholder="姓名" />
    <button type="submit">提交</button>
  </form>
</template>

<script setup>
import { globalLoading } from '@/composables/useGlobalLoading'

const { withLoading } = globalLoading

const handleSubmit = async () => {
  await withLoading(async () => {
    // 提交表单数据
    await submitForm(formData)
    // 显示成功消息
    showSuccessMessage()
  }, '提交中...', 130)
}
</script>
```

## 自定义样式

如果需要自定义加载组件的样式，可以通过 CSS 变量进行调整：

```css
:root {
  --primary-color: #your-color;
  --secondary-color: #your-color;
}
```

## 注意事项

1. 全局加载组件会阻止页面滚动，请确保在适当的时候调用 `hideLoading()`
2. 避免同时显示多个加载状态，使用全局状态管理
3. 在组件卸载时确保清理加载状态
4. 建议为不同的操作使用不同的加载文本，提升用户体验

## 故障排除

### 加载动画不显示
- 检查 `@lottiefiles/dotlottie-vue` 是否正确安装
- 确认 Lottie 动画 URL 是否可访问
- 检查网络连接

### 样式问题
- 确认 CSS 变量是否正确定义
- 检查 z-index 层级是否被其他元素覆盖
- 验证响应式断点设置

### 性能问题
- 避免频繁切换加载状态
- 合理设置动画大小
- 考虑使用防抖处理快速操作