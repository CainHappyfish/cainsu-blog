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

  // 导航菜单配置
  navItems: [
    { name: '首页', path: '/', icon: '🏠' },
    { name: '关于', path: '/about', icon: '👤' },
    { name: '朋友', path: '/friends', icon: '👥' }
  ],

  // 博客基础信息
  blogInfo: {
    title: 'CainSu Blog | 破酥的个人博客',
    logo: '📝',
    description: '记录技术成长与生活感悟的个人博客'
  }
}

export default config