# 博客配置说明

本文档介绍如何配置 CainSu Blog 的各项设置。所有配置都集中在 `src/config/configs.ts` 文件中。

## 配置文件结构

配置文件导出一个默认的配置对象，包含以下几个主要部分：

```typescript
const config = {
  siteInfo: { ... },      // 网站元信息
  personalInfo: { ... },  // 个人信息
  navItems: [ ... ],      // 导航菜单
  blogInfo: { ... }       // 博客基础信息
}
```

## 配置项详解

### 1. 网站元信息 (siteInfo)

控制网站的基本元数据，会动态设置到页面的 `<title>` 和 `<link rel="icon">` 标签中。

```typescript
siteInfo: {
  title: 'C4iN\'s Blog | 破酥的个人博客',  // 网站标题
  icon: '/vite.svg',                      // 网站图标路径
  description: '记录技术成长与生活感悟的个人博客'  // 网站描述
}
```

**修改方法：**
- `title`: 修改为你想要的网站标题
- `icon`: 将图标文件放在 `public` 目录下，然后修改路径
- `description`: 修改为你的网站描述

### 2. 个人信息 (personalInfo)

在首页介绍区域显示的个人信息。

```typescript
personalInfo: {
  name: '破酥',                    // 姓名
  title: '前端开发工程师',          // 职位/标题
  description: 'まだ消えない夢の唄唱えて\n 唱响那仍未消失的梦之歌。', // 个人描述
  skills: ['Vue.js', 'TypeScript', ...], // 技能列表
  contact: {
    email: 'c4in_@outlook.com',
    github: 'https://github.com/cainhappyfish',
    blog: 'https://cainhappyfish.github.io'
  }
}
```

**修改方法：**
- `name`: 修改为你的姓名
- `title`: 修改为你的职位或个人标签
- `description`: 修改个人描述，支持 `\n` 换行符
- `skills`: 修改技能数组，添加或删除技能项
- `contact`: 修改联系方式信息

### 3. 导航菜单 (navItems)

网站顶部导航栏的菜单项。

```typescript
navItems: [
  { name: '首页', path: '/', icon: '🏠' },
  { name: '关于', path: '/about', icon: '👤' },
  { name: '朋友', path: '/friends', icon: '👥' }
]
```

**修改方法：**
- 添加新菜单项：在数组中添加新的对象
- 修改现有菜单：更改 `name`（显示名称）、`path`（路由路径）、`icon`（图标）
- 删除菜单项：从数组中移除对应对象

### 4. 博客基础信息 (blogInfo)

博客的基础信息，主要用于导航栏显示。

```typescript
blogInfo: {
  title: 'CainSu Blog | 破酥的个人博客',  // 博客标题
  logo: '📝',                           // 博客Logo
  description: '记录技术成长与生活感悟的个人博客'  // 博客描述
}
```

**修改方法：**
- `title`: 修改博客标题（显示在导航栏）
- `logo`: 修改博客Logo，可以是emoji或文字
- `description`: 修改博客描述

## 使用配置

### 在组件中使用配置

```typescript
// 导入配置
import config from '@/config/configs'

// 使用配置
const personalInfo = ref(config.personalInfo)
const navItems = config.navItems
const blogInfo = config.blogInfo
```

### 配置的自动应用

- **网站元信息**: 在 `main.ts` 中自动设置页面标题和图标
- **个人信息**: 在 `HomeIntroduction.vue` 组件中显示
- **导航菜单**: 在 `NavigationBar.vue` 组件中渲染
- **博客信息**: 在导航栏中显示博客标题和Logo

## 配置示例

### 修改个人信息

```typescript
personalInfo: {
  name: '张三',
  title: '全栈开发工程师',
  description: '热爱编程，专注于Web开发\n喜欢学习新技术，分享技术心得',
  skills: ['React', 'Node.js', 'Python', 'Docker'],
  contact: {
    email: 'zhangsan@example.com',
    github: 'https://github.com/zhangsan',
    blog: 'https://zhangsan.dev'
  }
}
```

### 添加新的导航菜单

```typescript
navItems: [
  { name: '首页', path: '/', icon: '🏠' },
  { name: '博客', path: '/blog', icon: '📝' },
  { name: '项目', path: '/projects', icon: '💼' },
  { name: '关于', path: '/about', icon: '👤' },
  { name: '联系', path: '/contact', icon: '📧' }
]
```

## 注意事项

1. **路径配置**: 确保导航菜单中的路径与路由配置一致
2. **图标资源**: 网站图标文件需要放在 `public` 目录下
3. **换行符**: 在描述文本中使用 `\n` 来实现换行
4. **配置更新**: 修改配置后需要重启开发服务器才能看到效果
5. **类型安全**: 配置文件使用 TypeScript，确保类型正确

## 扩展配置

如果需要添加新的配置项，可以在配置对象中添加新的属性：

```typescript
const config = {
  // 现有配置...
  
  // 新增配置
  theme: {
    primaryColor: '#007bff',
    darkMode: false
  },
  
  social: {
    twitter: 'https://twitter.com/username',
    linkedin: 'https://linkedin.com/in/username'
  }
}
```

然后在需要的组件中导入并使用这些配置。