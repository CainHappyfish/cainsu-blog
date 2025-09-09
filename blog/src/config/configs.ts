/* 博客基础信息的配置 */

// 博客配置对象
const config = {
  // 网站元信息配置
  // 这里没有实现配置化
  siteInfo: {
    title: 'C4iN\'s Blog | 破酥的个人博客',
    icon: 'blog\\src\\assets\\avatar.jpg',  
  },

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