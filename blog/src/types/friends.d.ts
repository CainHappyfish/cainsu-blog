export interface Friend {
  id: number
  name: string
  description: string
  url: string
  avatar: string
  category: 'tech' | 'friend' | 'community'
  tags: string[]
  status: 'active' | 'inactive'
  addTime: string
}

export interface FriendCategory {
  key: string
  name: string
  icon: string
}

export interface ApplyInfo {
  title: string
  description: string
  requirements: string[]
  myInfo: {
    name: string
    description: string
    url: string
    avatar: string
  }
  contact: {
    email: string
    github: string
  }
}

export interface FriendsPageConfig {
  title: string
  subtitle: string
  description: string
  categories: FriendCategory[]
  friends: Friend[]
  applyInfo: ApplyInfo
}