export interface TimelineItem {
  id: number
  title: string
  company?: string
  period: string
  description: string
  skills: string[]
  type: 'work' | 'project' | 'education'
  icon: string
}

export interface PhotoCategory {
  id: number
  title: string
  description: string
  icon: string
  photos: {
    id: number
    url: string
    title: string
    description?: string
    date?: string
  }[]
}

export interface Tag {
  id: number
  name: string
  category: 'skill' | 'personality' | 'interest' | 'achievement'
  level?: number // 1-5 for skills
  color: string
  icon?: string
  description?: string
}

export interface Hobby {
  id: number
  name: string
  icon: string
  description: string
  level: number // 1-5 星级
  color: string
  tags: string[]
  size?: 'small' | 'medium' | 'large' // 卡片大小
  backgroundImage?: string // 背景图片
}

export interface Photo {
  id: number
  url: string
  alt: string
  visible?: boolean
  loaded?: boolean
}
