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
      blog: 'https://c4in1.github.io/'
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
      '技术思考与总结',
      '生活碎碎念'
    ]
  },

  // 经验时间线配置
  experienceTimeline: {
    title: '鼠鼠的一生',
    subtitle: '逸一时误一世'
  },

  // 个人标签配置
  personalTagsSection: {
    title: '没什么，只是想让你知道',
    subtitle: '是吗...为什么要对我说这个'
  },

  // 兴趣爱好配置
  interestsHobbiesSection: {
    title: '兴趣爱好',
    subtitle: '生活不只有代码，还有诗和远方'
  },

  // 博客摘要配置
  blogsSummary: {
    title: '精选文章',
    subtitle: '最新技术分享与思考',
    blogs: [
      {
        id: 1,
        title: 'Vue 3 响应式原理',
        image: 'https://pic1.imgdb.cn/item/68c0714658cb8da5c892c3b2.png',
        link: 'https://blog.cainsu.site/#/blog/Vue3-reactive',
        summary: '深入探讨 Vue 3 响应式原理的设计理念、核心特性以及在实际项目中的应用技巧，帮助开发者更好地理解和使用这一强大的功能。',
        category: '前端技术',
        publishDate: '2025-09-10',
        readTime: '60 分钟',
        isMain: true
      },
      {
        id: 2,
        title: 'grid-drag自定义布局制作',
        image: 'https://pic1.imgdb.cn/item/68c126d158cb8da5c8963eee.jpg',
        link: 'https://blog.cainsu.site/#/blog/grid-drag%E8%87%AA%E5%AE%9A%E4%B9%89%E5%B8%83%E5%B1%80%E5%88%B6%E4%BD%9C',
        summary: '学习制作拖拽布局，实现可拖拽、可缩放的自定义布局系统',
        category: '前端玩具',
        publishDate: '2024-08-07',
        readTime: '30 分钟',
        isMain: false
      },
      {
        id: 3,
        title: 'Vue3 渲染器原理',
        image: 'https://pic1.imgdb.cn/item/68c0714658cb8da5c892c3b2.png',
        link: 'https://blog.cainsu.site/#/blog/Vue3%E6%B8%B2%E6%9F%93%E5%99%A8%E5%8E%9F%E7%90%86',
        summary: '渲染器是用来执行渲染任务的。在浏览器平台上，用它来渲染其中的真实 DOM 元素。渲染器不仅能够渲染真实 DOM 元素，它还是框架跨平台能力的关键。因此，在设计渲染器的时候一定要考虑好可自定义的能力。',
        category: '前端技术',
        publishDate: '2025-09-05',
        readTime: '60 分钟',
        isMain: false
      },
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
      'Talk is cheap, show me the code 💻',
      'おちてく過去は鮮明で',
      '大好きな歌 約束の歌 永遠の歌，大切な歌 青春の歌 始まりの歌',
      'Popipa pipopa popipapapipopa! ',
      '博客施工中 🔨',
      '博客施工中 🚧'
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
  },

  // About页面相关配置
  aboutPage: {
    // 前端经历时间线
    experiences: [
      {
        id: 1,
        title: '不安desu',
        period: '2022.09 - 2024.10',
        description: '这真是我想要的吗',
        skills: ['密码学', 'MPC', '不努力的保研er'],
        type: 'education' as const,
        icon: '📝'
      },
      {
        id: 2,
        title: '初识前端',
        period: '2024.08 - 2024.10',
        description: '开始从零学习前端，哇晒好酷炫',
        skills: ['Javascript', 'CSS', 'HTML', 'Vue', 'Typescript'],
        type: 'project' as const,
        icon: '⚡'
      },
      {
        id: 3,
        title: '蔚来',
        period: '2024.11 - 2025.1',
        description: '感谢蔚来给我这次实习机会',
        skills: ['NIO', '乐道', '多品牌多端兼容'],
        type: 'work' as const,
        icon: '🔧'
      },
      {
        id: 4,
        title: '微信支付',
        period: '2025.02 - 2025.08',
        description: '当时朋友问我来不来，抱着试试的心态，边复习期末考边准备面试，没想到进了，收获满满的一次实习，遇到了很好的 mt 和同事',
        skills: ['境外支付', '全栈开发','Agent 开发'],
        type: 'work' as const,
        icon: '🚀'
      },
      {
        id: 5,
        title: '回学校秋招/摆烂中',
        period: '2025.8 - 至今',
        description: '我是谁我在哪我 offer 呢',
        skills: [],
        type: 'education' as const,
        icon: '🎯'
      },
      {
        id: 6,
        title: '未完待续...',
        period: '至今 - 未来',
        description: 'みせたい未来は繊細で',
        skills: [],
        type: 'education' as const,
        icon: '🎯'
      }
      
    ],

    // 兴趣爱好
    hobbies: [
      {
        id: 1,
        name: '编程开发',
        icon: '💻',
        description: '我怎么一写代码就停不下来了',
        level: 4,
        color: '#3498db',
        tags: ['前端开发', 'Vue.js', 'TypeScript', 'AI 应用开发', 'NodeJS'],
        backgroundImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        size: 'large' as const 
      },
      {
        id: 2,
        name: '吉他',
        icon: '🎵',
        description: 'ギ夕一持ってる君がいた',
        level: 4,
        color: '#e74c3c',
        tags: ['木吉他', '电吉他', '指弹er'],
        backgroundImage: 'https://pic1.imgdb.cn/item/68c122ae58cb8da5c895fa1c.jpg',
        size: 'medium' as const
      },
      {
        id: 3,
        name: '游戏',
        icon: '🎮',
        description: '和朋友们一起玩玩各种类型的游戏',
        level: 3,
        color: '#f39c12',
        tags: ['游戏', 'FPS', '种田'],
        backgroundImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        size: 'large' as const
      },
      {
        id: 4,
        name: '二偶',
        icon: '❤️',
        description: '到处看各种二次元偶像的莱芜，咦呃女声优痴一股味',
        level: 5,
        color: '#2ecc71',
        tags: ['2.5 次元', 'nsyc', '我不是神人', '液态噶是什么意思啊'],
        backgroundImage: 'https://pic1.imgdb.cn/item/68c1238158cb8da5c8960c64.jpg',
        size: 'medium' as const
      },
      {
        id: 5,
        name: '画画',
        icon: '🎨',
        description: '之前有时间的时候会画点，得找机会重新捡起来了',
        level: 2,
        color: '#9b59b6',
        tags: ['画画', '马克笔', '板绘', '动漫'],
        backgroundImage: 'https://pic1.imgdb.cn/item/68c1253658cb8da5c8962747.jpg',
        size: 'small' as const
      },
      {
        id: 6,
        name: '运动健身',
        icon: '🏃',
        description: '已经变成懒狗力（悲，不过现在该动动了',
        level: 3,
        color: '#1abc9c',
        tags: ['跑步', '健身', '篮球', '其实啥都会一点'],
        backgroundImage: 'https://pic1.imgdb.cn/item/68c1254658cb8da5c896286d.jpg',
        size: 'small' as const
      },
      {
        id: 7,
        name: '莱芜',
        icon: '🥰',
        description: '永远回不到 2025/5/26 那天晚上了',
        level: 5,
        color: '#1abc9c',
        tags: ['邦多利', 'Popipa', 'nysc', '二偶'],
        backgroundImage: 'https://pic1.imgdb.cn/item/68c125a558cb8da5c8962e7c.jpg',
        size: 'large' as const
      },{
        id: 8,
        name: '吃饭睡觉',
        icon: '🍽️',
        description: '人过的开心比什么都重要',
        level: 5,
        color: '#2ecc71',
        tags: ['哦耶摆摆的烂'],
        backgroundImage: 'https://pic1.imgdb.cn/item/68c126d158cb8da5c8963eee.jpg',
        size: 'large' as const
      }
    ],

    // 照片墙配置
    photoWall: {
      title: '路上的景色',
      subtitle: '哇哦原来我留了这么多图片',
      photos: [
        {
          id: 1,
          url: 'https://pic1.imgdb.cn/item/68c1284458cb8da5c896585b.jpg',
          alt: '爱美'
        },
        {
          id: 2,
          url: 'https://pic1.imgdb.cn/item/68c1286f58cb8da5c8965a6d.jpg',
          alt: '20250823 上海 东方体育中心 Popipa 公演'
        },
        {
          id: 3,
          url: 'https://pic1.imgdb.cn/item/68c1288658cb8da5c8965b61.jpg',
          alt: '20250526 东京 武道馆 Popipa 十周年' 
        },
        {
          id: 4,
          url: 'https://pic1.imgdb.cn/item/68c128c258cb8da5c8965e77.jpg',
          alt: '你怎么知道'
        },
        {
          id: 5,
          url: 'https://pic1.imgdb.cn/item/68c1238158cb8da5c8960c64.jpg',
          alt: '20250215 上海 东方体育中心 Roselia 公演'
        },
        {
          id: 6,
          url: 'https://pic1.imgdb.cn/item/68c1293358cb8da5c8965fe9.jpg',
          alt: '20250823 上海'
        },
        {
          id: 7,
          url: 'https://pic1.imgdb.cn/item/68c1253658cb8da5c8962747.jpg',
          alt: '高中课间休息画的'
        },
        {
          id: 8,
          url: 'https://pic1.imgdb.cn/item/68c14a2458cb8da5c898310a.jpg',
          alt: '高中毕业暑假学的，可惜三分钟热度了哈哈'
        },
        {
          id: 9,
          url: 'https://pic1.imgdb.cn/item/68c14a7758cb8da5c898319a.jpg',
          alt: '爱美...'
        },
        {
          id: 10,
          url: 'https://pic1.imgdb.cn/item/68c14a9258cb8da5c89831ea.jpgg',
          alt: 'id 的来源'
        },{
          id: 11,
          url: 'https://pic1.imgdb.cn/item/68c14b5a58cb8da5c89834cc.jpg',
          alt: '我不会再买棉花娃娃了，真的'
        }
      ]
    },

    // 标签分类配置
    tagCategories: [
      { key: 'all', name: '全部', icon: '🏷️' },
      { key: 'skill', name: '技能', icon: '💻' },
      { key: 'personality', name: '性格', icon: '🎭' },
      { key: 'interest', name: '兴趣', icon: '🎨' },
    ],

    // 个人标签
    personalTags: [
      // 技能标签
      {
        id: 1,
        name: 'Frontend',
        category: 'skill' as const,
        level: 5,
        color: '#4fc08d',
        icon: '💻',
        description: '熟练使用Vue.js进行前端开发'
      },
      {
        id: 2,
        name: 'AI 开发',
        category: 'skill' as const,
        level: 4,
        color: '#4fc08d',
        icon: '⚡',
        description: '会一点点 Agent'
      },
      {
        id: 3,
        name: '卷王摆子二相性',
        category: 'personality' as const,
        color: '#2ecc71',
        icon: '🎯',
        description: '感觉今天干了好多事，明天再努力吧'
      },
      {
        id: 4,
        name: '随和',
        category: 'personality' as const,
        color: '#f39c12',
        icon: '🤝',
        description: '不爽的事我会说，但一般我都很爽'
      },
      {
        id: 5,    
        name: '我直接学学学',
        category: 'personality' as const,
        color: '#9b59b6',
        icon: '📚',
        description: '我怎么这么菜啊'
      },
      // 兴趣标签
      {
        id: 6,
        name: '二次元',
        category: 'interest' as const,
        level: 3,
        color: '#ff6b9d',
        icon: '🌸',
        description: '也不是很二次元吧，但是非常喜欢看二偶'
      },
      {
        id: 7,
        name: '会点吉他',
        category: 'interest' as const,
        color: '#667eea',
        icon: '🎵',
        description: '从被逼着学到热爱'
      },
      {
        id: 8,
        name: '游戏玩家',
        category: 'interest' as const,
        color: '#764ba2',
        icon: '🎮',
        description: '啥都玩，不过没人一起我还是挺电子阳痿的'
      },
      {
        id: 9,
        name: 'BangDream',
        category: 'interest' as const,
        color: '#36d1dc',
        icon: '📸',
        description: '喜欢邦多利真是太好了'
      },
      {
        id: 10,
        name: 'Poppin\' Party',
        category: 'interest' as const,
        color: '#36d1dc',
        icon: '⭐',
        description: 'Popipa Pipopa Popipapapipopa'
      },
      {
        id: 11,
        name: '户山香澄',
        level: 5,
        category: 'interest' as const,
        color: '#36d1dc',
        icon: '📸',
        description: '用镜头记录美好瞬间'
      },
      {
        id: 12,
        name: 'nsyc',
        category: 'interest' as const,
        level: 4,
        color: '#36d1dc',
        icon: '📸',
        description: '我就偶尔当当神人，真的'
      }
    ]
  },

  // 友链页面配置
  friendsPage: {
    title: '友情链接',
    subtitle: '一起成长的小伙伴们',
    description: '这里是我在学习和工作中认识的朋友们，感谢大家的陪伴与支持！',
    
    // 友链分类
    categories: [
      { key: 'all', name: '全部', icon: '🌟' },
      { key: 'tech', name: '有用的网站', icon: '💻' },
      { key: 'friend', name: '朋友们', icon: '👥' },
      { key: 'community', name: '社区', icon: '🏠' }
    ],
    
    // 友链列表
    friends: [
      {
        id: 1,
        name: 'Vue.js 官方文档',
        description: 'Vue.js 官方文档，前端开发必备',
        url: 'https://vuejs.org/',
        avatar: 'https://vuejs.org/logo.svg',
        category: 'tech',
        tags: ['Vue', '前端', '官方'],
        status: 'active', // active, inactive
        addTime: '2025-09-11'
      },
      {
        id: 2,
        name: 'TypeScript 官方文档',
        description: 'TypeScript 官方文档，类型安全的 JavaScript',
        url: 'https://www.typescriptlang.org/',
        avatar: 'https://www.typescriptlang.org/favicon-32x32.png',
        category: 'tech',
        tags: ['TypeScript', '前端', '官方'],
        status: 'active',
        addTime: '2025-09-11'
      },
      {
        id: 3,
        name: 'GitHub',
        description: '全球最大的代码托管平台',
        url: 'https://github.com',
        avatar: 'https://github.githubassets.com/favicons/favicon.svg',
        category: 'community',
        tags: ['代码托管', '开源', '社区'],
        status: 'active',
        addTime: '2025-09-11'
      },
      {
        id: 4,
        name: 'MDN Web Docs',
        description: 'Web 开发者的权威参考文档',
        url: 'https://developer.mozilla.org/',
        avatar: 'https://developer.mozilla.org/favicon-48x48.png',
        category: 'tech',
        tags: ['Web', '文档', '参考'],
        status: 'active',
        addTime: '2025-09-11'
      },
      {
        id: 5,
        name: '现代 JavaScript 教程',
        description: '以最新的 JavaScript 标准为基准。通过简单但足够详细的内容，为你讲解从基础到高阶的 JavaScript 相关知识。',
        url: 'https://zh.javascript.info/',
        avatar: 'https://zh.javascript.info/img/favicon/favicon.png',
        category: 'tech',
        tags: ['JavaScript', '前端'],
        status: 'active',
        addTime: '2025-09-11'
      },
      {
        id: 6,
        name: 'CodeTop',
        description: 'CodeTop用于汇总互联网大厂高频面试题，帮助大家更有针对性地刷Leetcode',
        url: 'https://codetop.cc/',
        avatar: 'https://codetop.cc/logo.jpg', 
        category: 'tech',
        tags: ['技术', '个人'],
        status: 'active',
        addTime: '2025-09-11'
      },
      {
        id: 7,
        name: 'ForeverDdB',
        description: 'you go my go here we go',
        url: 'https://blog.foreverddb.top/',
        avatar: 'https://pic1.imgdb.cn/item/68c2601f58cb8da5c89af0d8.jpg',
        category: 'friend',
        tags: ['frontend', 'uestc'],
        status: 'active',
        addTime: '2025-09-11'
      },
      {
        id: 8,
        name: 'YH',
        description: '相遇是最小单位的奇迹',
        url: 'https://yhblogs.cn/',
        avatar: 'https://pic.imgdb.cn/item/6681281bd9c307b7e9f8f3ed.jpg',
        category: 'friend',
        tags: ['frontend', 'uestc'],
        status: 'active',
        addTime: '2025-09-11'
      },
      {
        id: 9,
        name: 'Cakndex',
        description: '看看你的',
        url: 'https://cakndex.github.io/Cakndex.github.io-blog/',
        avatar: 'https://pic.imgdb.cn/item/668132fed9c307b7e90696f1.jpg',
        category: 'friend',
        tags: ['frontend', 'uestc'],
        status: 'active',
        addTime: '2025-09-11'
      },
      {
        id: 10,
        name: 'Zbwer',
        description: '地球其实只是一个柯基的屁股',
        url: 'https://blog.zbwer.work/',
        avatar: 'https://avatars.githubusercontent.com/u/49082837?v=4',
        category: 'friend',
        tags: ['frontend', 'uestc'],
        status: 'active',
        addTime: '2025-09-11'
      },
      {
        id: 11,
        name: 'Andonade',
        description: 'Normal one. Normal days.',
        url: 'https://andonade.github.io',
        avatar: 'https://s2.loli.net/2024/04/26/7LRHdZcFeG3WVi9.jpg',
        category: 'friend',
        tags: ['神', 'thu'],
        status: 'active',
        addTime: '2025-09-11'
      },
      {
        id: 12,
        name: '水沢绫音',
        description: '我从来没有觉得学图形学开心过。',
        url: 'https://pat-chou-li.github.io/ayene-no-blog/',
        avatar: 'https://raw.githubusercontent.com/pat-chou-li/ayene-no-blog/main/resource/avatar.jpg',
        category: 'friend',
        tags: ['frontend', 'fdu'],
        status: 'active',
        addTime: '2025-09-11'
      },
      {
        id: 13,
        name: 'April',
        description: 'Eloim Essaim, Eloim Essaim.',
        url: 'https://cenyuchun.top/',
        avatar: 'https://pic1.imgdb.cn/item/68c26ada58cb8da5c89b28c3.svg',
        category: 'friend',
        tags: ['thu'],
        status: 'active',
        addTime: '2025-09-11'
      },
      {
        id: 14,
        name: 'dusk',
        description: 'just for pleasure',
        url: 'https://jwdusk.github.io/',
        avatar: 'https://jwdusk.github.io/images/avatar.jpg',
        category: 'friend',
        tags: ['tju'],
        status: 'active',
        addTime: '2025-09-11'
      }
    ],
    
    // 申请友链的信息
    applyInfo: {
      title: '你好！我是破酥',
      description: '欢迎志同道合的朋友交换友链',
      requirements: [
        '网站内容积极向上，无违法违规内容',
        '网站能够正常访问，加载速度合理',
        '最好是技术类博客或个人网站，好吧其实都行',
        '希望能够长期维护更新'
      ],
      myInfo: {
        name: 'CainSu Blog',
        description: '普普通通的故事正在继续',
        url: 'https://blog.cainsu.site',
        avatar: '/avatar.jpg'
      },
      contact: {
        email: 'c4in_@outlook.com',
        github: 'https://github.com/cainhappyfish'
      }
    }
  }
}

export default config