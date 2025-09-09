/* 博客基础信息的配置 */

// 博客配置对象
const config = {
  // 个人信息配置
  personalInfo: {
    name: '破酥',
    title: '前端开发工程师',
    description: 'まだ消えない夢の唄唱えて\n 唱响那仍未消失的梦之歌。',
    skills: ['Vue.js', 'TypeScript', 'JavaScript', 'CSS/SCSS', 'Node.js', 'Git', 'AI 应用'],
    contact: {
      email: 'c4in_@outlook.com',
      github: 'https://github.com/cainhappyfish',
      blog: 'https://cainhappyfish.github.io'
    }
  },

  // 首页导航菜单配置
  homeNavItems: [
    { name: '首页', path: '/', icon: '🏠' },
    { name: 'Blogs', path: '/blogs', icon: '📝' }
  ],

  // 其他页面导航菜单配置
  navItems: [
    { name: '首页', path: '/', icon: '🏠' },
    { name: 'Blogs', path: '/blogs', icon: '📝' },
    { name: '关于', path: '/about', icon: '👤' },
    { name: '朋友', path: '/friends', icon: '👥' }
  ],

  // 博客基础信息
  blogInfo: {
    title: 'CainSu Blog | 破酥的个人博客',
    logo: '📝',
    description: '记录技术成长与生活感悟的个人博客'
  },

  // 博客介绍页面信息
  blogsIntroduction: {
    title: 'Blogs',
    subtitle: '技术分享与思考',
    description: '在这里记录我的技术学习历程、项目经验和对技术的思考。希望这些内容能够对你有所帮助。当然还有一些碎碎念',
    features: [
      '前端技术分享',
      '项目实战经验',
      '技术思考与总结',
      '开发工具推荐'
    ]
  },

  // 博客摘要配置
  blogsSummary: {
    title: '精选文章',
    subtitle: '最新技术分享与思考',
    blogs: [
      {
        id: 1,
        title: 'Vue 3 Composition API 深度解析',
        image: 'https://pic1.imgdb.cn/item/68c0714658cb8da5c892c3b2.png',
        link: '/blog/vue3-composition-api',
        summary: '深入探讨 Vue 3 Composition API 的设计理念、核心特性以及在实际项目中的应用技巧，帮助开发者更好地理解和使用这一强大的功能。',
        category: '前端技术',
        publishDate: '2024-01-15',
        readTime: '8 分钟',
        isMain: true
      },
      {
        id: 2,
        title: 'TypeScript 进阶技巧',
        image: 'https://pic1.imgdb.cn/item/68c0714658cb8da5c892c3b2.png',
        link: '/blog/typescript-advanced',
        summary: '分享 TypeScript 的高级类型系统、泛型编程以及在大型项目中的最佳实践。',
        category: '编程语言',
        publishDate: '2024-01-10',
        readTime: '6 分钟',
        isMain: false
      },
      {
        id: 3,
        title: '现代前端工程化实践',
        image: 'https://pic1.imgdb.cn/item/68c0714658cb8da5c892c3b2.png',
        link: '/blog/frontend-engineering',
        summary: '从构建工具到部署流程，全面介绍现代前端工程化的核心概念和实践方法。',
        category: '工程化',
        publishDate: '2024-01-05',
        readTime: '10 分钟',
        isMain: false
      },
      {
        id: 4,
        title: 'CSS Grid 布局完全指南',
        image: 'https://pic1.imgdb.cn/item/68c0714658cb8da5c892c3b2.png',
        link: '/blog/css-grid-guide',
        summary: '详细介绍 CSS Grid 布局的各种属性和使用场景，助你掌握现代网页布局技术。',
        category: 'CSS',
        publishDate: '2024-01-01',
        readTime: '7 分钟',
        isMain: false
      }
    ]
  },

  // 弹幕配置
  danmaku: {
    // 默认弹幕内容
    defaultMessages: [
      '欢迎来到破酥的博客！',
      '技术改变世界 ✨',
      '代码创造未来 🚀',
      '学习永无止境 📚',
      '保持好奇心 🤔',
      'Talk is cheap, show me the code 💻'
    ],
    // 弹幕滑过时间配置（秒）
    duration: {
      min: 8,  // 最小滑过时间
      max: 15  // 最大滑过时间
    },
    // 弹幕生成间隔（毫秒）
    interval: {
      min: 500,  // 最小间隔
      max: 2000   // 最大间隔
    },
    // 弹幕样式配置
    style: {
      fontSize: {
        min: 14,  // 最小字体大小
        max: 32   // 最大字体大小
      },
      colors: [
        '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', 
        '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'
      ]
    },
    // 性能配置
    performance: {
      maxCount: 20,  // 最大弹幕数量
    }
  }
}

export default config