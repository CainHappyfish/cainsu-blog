# 博客配置说明

本文档介绍如何配置 CainSu Blog 的各项设置。所有配置都集中在 `src/config/configs.ts` 文件中。

## 配置文件结构

配置文件导出一个默认的配置对象，包含以下几个主要部分：

```typescript
const config = {
  personalInfo: { ... },           // 个人信息
  homeNavItems: [ ... ],           // 首页导航菜单
  navItems: [ ... ],               // 其他页面导航菜单
  blogInfo: { ... },               // 博客基础信息
  blogsIntroduction: { ... },      // 博客介绍页面信息
  experienceTimeline: { ... },     // 经验时间线配置
  personalTagsSection: { ... },    // 个人标签配置
  interestsHobbiesSection: { ... }, // 兴趣爱好配置
  blogsSummary: { ... },           // 博客摘要配置
  danmaku: { ... },                // 弹幕配置
  aboutPage: { ... },              // 关于页面配置
  friendsPage: { ... }             // 朋友页面配置
}
```

## 配置项详解

### 1. 个人信息 (personalInfo)

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

### 2. 导航菜单配置

#### 首页导航菜单 (homeNavItems)

首页显示的导航菜单项，通常比较简洁。

```typescript
homeNavItems: [
  { name: '首页', path: '/', icon: '🏠' },
  { name: 'Blogs', path: '/blogs', icon: '📝' }
]
```

#### 其他页面导航菜单 (navItems)

其他页面显示的完整导航菜单。

```typescript
navItems: [
  { name: '首页', path: '/', icon: '🏠' },
  { name: 'Blogs', path: '/blogs', icon: '📝' },
  { name: '关于', path: '/about', icon: '👤' },
  { name: '朋友', path: '/friends', icon: '👥' }
]
```

**修改方法：**
- 添加新菜单项：在数组中添加新的对象
- 修改现有菜单：更改 `name`（显示名称）、`path`（路由路径）、`icon`（图标）
- 删除菜单项：从数组中移除对应对象

### 3. 博客基础信息 (blogInfo)

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

### 4. 弹幕配置 (danmaku)

控制首页弹幕效果的配置。

```typescript
danmaku: {
  defaultMessages: [
    '欢迎来到破酥的博客！',
    '技术改变世界 ✨',
    // ... 更多默认消息
  ],
  duration: {
    min: 8,  // 最小滑过时间（秒）
    max: 15  // 最大滑过时间（秒）
  },
  interval: {
    min: 500,  // 最小间隔（毫秒）
    max: 2000  // 最大间隔（毫秒）
  },
  style: {
    fontSize: {
      min: 14,  // 最小字体大小
      max: 32   // 最大字体大小
    },
    colors: [
      '#ff6b6b', '#4ecdc4', '#45b7d1', // 弹幕颜色数组
      // ... 更多颜色
    ]
  },
  performance: {
    maxCount: 20  // 最大弹幕数量
  }
}
```

**修改方法：**
- `defaultMessages`: 修改默认弹幕消息数组
- `duration`: 调整弹幕滑过时间范围
- `interval`: 调整弹幕出现间隔
- `style.colors`: 修改弹幕颜色
- `performance.maxCount`: 调整最大弹幕数量

### 5. 关于页面配置 (aboutPage)

关于页面的详细配置，包括经历、爱好、个人标签等。

```typescript
aboutPage: {
  experiences: [
    {
      id: 1,
      title: '工作/学习经历标题',
      period: '2022.09 - 2024.10',
      description: '经历描述',
      skills: ['技能1', '技能2'],
      type: 'education' | 'work' | 'project',
      icon: '📝'
    }
    // ... 更多经历
  ],
  hobbies: [
    {
      id: 1,
      name: '爱好名称',
      icon: '💻',
      description: '爱好描述',
      level: 4, // 1-5级
      color: '#3498db',
      tags: ['标签1', '标签2'],
      backgroundImage: '背景图片URL',
      size: 'large' | 'medium' | 'small'
    }
    // ... 更多爱好
  ],
  personalTags: [
    {
      id: 1,
      name: '标签名称',
      category: 'skill' | 'personality' | 'interest',
      level: 5, // 可选，技能等级
      color: '#4fc08d',
      icon: '💻',
      description: '标签描述'
    }
    // ... 更多标签
  ]
}
```

### 6. 朋友页面配置 (friendsPage)

友情链接页面的配置。

```typescript
friendsPage: {
  title: '友情链接',
  subtitle: '一起成长的小伙伴们',
  description: '页面描述',
  categories: [
    { key: 'all', name: '全部', icon: '🌟' },
    { key: 'tech', name: '有用的网站', icon: '💻' },
    { key: 'friend', name: '朋友们', icon: '👥' }
  ],
  friends: [
    {
      id: 1,
      name: '网站名称',
      description: '网站描述',
      url: 'https://example.com',
      avatar: '头像URL',
      category: 'tech' | 'friend' | 'community',
      tags: ['标签1', '标签2'],
      status: 'active' | 'inactive',
      addTime: '2025-09-11'
    }
    // ... 更多友链
  ],
  applyInfo: {
    title: '申请友链标题',
    description: '申请说明',
    requirements: ['要求1', '要求2'],
    myInfo: {
      name: '你的网站名称',
      description: '你的网站描述',
      url: '你的网站URL',
      avatar: '你的头像URL'
    }
  }
}
```

## 使用配置

### 在组件中使用配置

```typescript
// 导入配置
import config from '@/config/configs'

// 使用配置
const personalInfo = ref(config.personalInfo)
const navItems = config.navItems
const homeNavItems = config.homeNavItems
const blogInfo = config.blogInfo
const danmakuConfig = config.danmaku
const aboutPageConfig = config.aboutPage
const friendsPageConfig = config.friendsPage
```

### 配置的自动应用

- **个人信息**: 在 `HomeIntroduction.vue` 组件中显示
- **导航菜单**: 在 `NavigationBar.vue` 组件中渲染，首页使用 `homeNavItems`，其他页面使用 `navItems`
- **博客信息**: 在导航栏中显示博客标题和Logo
- **弹幕效果**: 在首页自动加载弹幕配置
- **关于页面**: 在 `About.vue` 页面中显示经历、爱好、标签等信息
- **朋友页面**: 在 `Friends.vue` 页面中显示友情链接和申请信息

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
// 首页导航菜单（简洁版）
homeNavItems: [
  { name: '首页', path: '/', icon: '🏠' },
  { name: 'Blogs', path: '/blogs', icon: '📝' }
]

// 其他页面导航菜单（完整版）
navItems: [
  { name: '首页', path: '/', icon: '🏠' },
  { name: 'Blogs', path: '/blogs', icon: '📝' },
  { name: '项目', path: '/projects', icon: '💼' },
  { name: '关于', path: '/about', icon: '👤' },
  { name: '朋友', path: '/friends', icon: '👥' },
  { name: '联系', path: '/contact', icon: '📧' }
]
```

### 添加新的友情链接

```typescript
friendsPage: {
  // ... 其他配置
  friends: [
    // ... 现有友链
    {
      id: 999,
      name: '新朋友的博客',
      description: '一个很棒的技术博客',
      url: 'https://newfriend.blog',
      avatar: 'https://newfriend.blog/avatar.jpg',
      category: 'friend',
      tags: ['前端', '技术分享'],
      status: 'active',
      addTime: '2025-01-15'
    }
  ]
}
```

### 自定义弹幕消息

```typescript
danmaku: {
  defaultMessages: [
    '欢迎来到我的博客！',
    '技术改变世界 ✨',
    '代码创造未来 🚀',
    '你的自定义消息',
    // ... 更多消息
  ],
  // ... 其他配置
}
```

## 注意事项

1. **路径配置**: 确保导航菜单中的路径与路由配置一致
2. **图片资源**: 头像、背景图等图片文件建议使用外部图床或放在 `public` 目录下
3. **换行符**: 在描述文本中使用 `\n` 来实现换行
4. **配置更新**: 修改配置后需要重启开发服务器才能看到效果
5. **类型安全**: 配置文件使用 TypeScript，确保类型正确
6. **ID 唯一性**: 确保各个配置项中的 `id` 字段唯一
7. **图片链接**: 使用稳定的图片链接，避免图片失效
8. **弹幕性能**: 弹幕数量过多可能影响页面性能，建议合理设置 `maxCount`

## 扩展配置

如果需要添加新的配置项，可以在配置对象中添加新的属性：

```typescript
const config = {
  // 现有配置...
  
  // 新增主题配置
  theme: {
    primaryColor: '#007bff',
    secondaryColor: '#6c757d',
    darkMode: false
  },
  
  // 新增社交媒体配置
  social: {
    twitter: 'https://twitter.com/username',
    linkedin: 'https://linkedin.com/in/username',
    weibo: 'https://weibo.com/username'
  },
  
  // 新增项目展示配置
  projects: {
    title: '我的项目',
    subtitle: '一些有趣的作品',
    items: [
      {
        id: 1,
        name: '项目名称',
        description: '项目描述',
        url: 'https://project.com',
        github: 'https://github.com/username/project',
        tech: ['Vue.js', 'TypeScript'],
        image: 'project-image.jpg'
      }
    ]
  }
}
```

然后在需要的组件中导入并使用这些配置。

## 配置文件维护建议

1. **定期备份**: 定期备份配置文件，避免意外丢失
2. **版本控制**: 使用 Git 等版本控制工具管理配置变更
3. **注释说明**: 为复杂的配置项添加注释说明
4. **分类管理**: 将相关的配置项归类组织，保持结构清晰
5. **测试验证**: 修改配置后及时测试各个页面的显示效果