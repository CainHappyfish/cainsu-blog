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

# 响应式

不同于 Vue 的双向数据流，React 实现响应式的思想是单向数据流，输入数据变化时需要手动更新数据。要做到这一点，你需要在你的组件中添加 **state**：

```tsx
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [error, setError] = useState('');
const [isLoading, setIsLoading] = useState(false);
```

拿邮箱来说，react 在读取数据时使用 email ，而在需要更新数据时使用` setEmail`。这里忘说了，React 中想要使用响应式数据，不论是标签属性还是文本，只需要用大括号包起来就可以了。下面的代码重点看`value`和` onChange `属性：

```tsx
<div className="login-card-input-container">
    <label className="login-card-label" htmlFor="email">邮箱</label>
    <input 
        className="login-card-input" 
        type="email" 
        id="email" 
        name="email"
        placeholder="请输入邮箱地址" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isLoading}
        autoComplete="email"
    />
    </div>
    <div className="login-card-input-container">
        <label className="login-card-label" htmlFor="password">密码</label>
        <input 
            className="login-card-input" 
            type="password" 
            id="password" 
            name="password"
            placeholder="请输入密码" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            autoComplete="current-password"
        />
    </div>
    <button 
        className="login-card-button" 
        type="submit"
        disabled={isLoading}
    >
        {isLoading ? '登录中...' : '登录'}
    </button>
</form>
```

这里的 useState 在 React 中被称为 hook，也是 React 的核心内容。以 `use` 开头的函数被称为 **Hook**。`useState` 是 React 提供的一个内置 Hook。再添加一点细节，一个简单的登录页面就写完了。

# 渲染列表

这里我们需要利用 JavaScript 的特性，例如 [`for` 循环](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/for) 和 [array 的 `map()` 函数](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/map) 来渲染组件列表。这也很符合 React 的思想，React 组件就是一个个 JavaScript 函数。这里我们的例子结合父子组件传参来实现。比如我们在` App.tsx `中有这样的数据：

```tsx
const demos: Demo[] = [
    {
      title: '示例 1',
      description: '这是一个简单的示例'
    },
    {
      title: '示例 2',
      description: '这是另一个示例'
    },
    {
      title: '示例 3',
      description: '第三个示例'
    }
];
```

你可以使用 JSX 的大括号把` demos `丢给 `DemoList` 。于是我们的展示列表可以这么写：

```tsx
import '../styles/demoList.css';

interface Demo {
    title: string;
    description: string;
}

interface DemoListProps {
    demos: Demo[];
    userInfo?: {
        email: string;
        loginTime: string;
    };
}

function DemoList({ demos, userInfo }: DemoListProps) {
    return (
        <div className="demo-list">
            {userInfo && (
                <div className="demo-list-header">
                    <h2>欢迎回来！</h2>
                    <div className="user-info">
                        <p><strong>邮箱:</strong> {userInfo.email}</p>
                        <p><strong>登录时间:</strong> {userInfo.loginTime}</p>
                    </div>
                </div>
            )}
            <div className="demo-list-title">
                <h2>演示列表</h2>
                <p className="demo-count">共 {demos.length} 个演示</p>
            </div>
            <div className="demo-items">
                {demos.length === 0 ? (
                    <div className="demo-empty">
                        <p>暂无演示内容</p>
                    </div>
                ) : (
                    demos.map((demo) => (
                        <div className="demo-item" key={demo.title}>
                            <h3 className="demo-item-title">{demo.title}</h3>
                            <p className="demo-item-description">{demo.description}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default DemoList;
```

你会发现我们只需要像平时使用 Map 一样给每一个数据写一个对应的 HTML 然后返回就行了。

