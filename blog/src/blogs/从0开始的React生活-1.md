---
title: "从0开始的React生活-1"
date: "2025-09-15"
category: "前端学习"
tags: ["react"]
summary: "react 学习的第一部分"
author: "破酥"
readTime: "30分钟"
cover: "https://picx.zhimg.com/70/v2-61300fbdd401d83acc052987b03301ec_1440w.avis?source=172ae18b&biz_tag=Post"
---

# 从0开始的React生活-1

博主一直都是一个忠实的 Vue 使用者，之前的实习遇到 react 相关的需求都比较简单，基本都用 cursor 解决了。由于技术栈过于单一，在面试过程中也因为这个问题吃过亏。闲来无事，来学学 react 吧，毕竟以后的工作很有可能用得上。

# 什么是 React

在准备面试过程中，不少八股都有提到 react 和 vue 两者直接的区别。那么什么是 react 呢？

- 用组件创建用户界面
  - React 让你可以通过组件来构建用户界面。你可以创建像 `Thumbnail`、`LikeButton` 和 `Video` 这样的组件。然后将它们组合成整个应用程序。
- 用代码和标签编写组件
  - React 组件是 JavaScript 函数。
- 在任何地方添加交互
  - React 组件接收数据并返回应该出现在屏幕上的内容。你可以通过响应交互（例如用户输入）向它们传递新数据。然后，React 将更新屏幕以匹配新数据。

不难发现，Vue 和 React 在基本思想上都很相似，都有相应的组件化和响应式实现方式。目前肉眼上能看到的是 Vue 和 React 组织代码方式不同，React 采用了函数式的编程，这使得其对 Typescript 的支持更好，也更加灵活；而 Vue 采用 SFC，更贴近 HTML 的编写方式使得其上手更加容易，代码可读性更高。下面是利用 Vite 创建项目时两者 App 文件的不同实现方式：

Vue

```Vue
<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <HelloWorld msg="Vite + Vue" />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>

```

React

```tsx
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
```

对于项目总入口文件：

Vue 使用`createApp`以及相关 api 在对应元素下创建 Vue 实例：

```Vue
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

createApp(App).mount('#app')
```

而 React 使用` createRoot `在对应元素下创建 React 实例：

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

而对于更详细的区别我们将在后续的学习中一一叙述。在本章中，我们将利用实现一个最简单的登录页面。

# React 项目结构

与 Vue 类似：

- **public** 目录：存放静态文件，如 HTML 文件和图标。**src** 目录：存放源代码，包括 JavaScript、CSS 和图片等。

- 在 **src** 目录下，以下是一些常见的目录和文件：
  - **components**：存放可复用的 UI 组件。
  - **containers**：存放容器组件，这些组件通常负责数据获取和状态管理。
  - **pages/screens**：存放页面组件，通常对应应用的不同视图。
  - **utils**：存放通用的工具函数。
  - **hooks**：存放自定义钩子（hooks）。
  - **assets**：存放资源文件，如图片和字体。
  - **services/apis**：存放与外部 API 交互的服务。

# 


