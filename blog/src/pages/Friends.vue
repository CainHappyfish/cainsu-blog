<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import config from '@/config/configs'

const { friendsPage } = config
const isVisible = ref(false)
const selectedCategory = ref<string>('all')
const hoveredFriend = ref<number | null>(null)

// 过滤后的友链列表
const filteredFriends = computed(() => {
  if (selectedCategory.value === 'all') {
    return friendsPage.friends.filter(friend => friend.status === 'active')
  }
  return friendsPage.friends.filter(friend => 
    friend.category === selectedCategory.value && friend.status === 'active'
  )
})

// 统计信息
const statsData = computed(() => {
  return friendsPage.categories
    .filter(category => category.key !== 'all')
    .map(category => ({
      key: category.key,
      name: category.name,
      count: friendsPage.friends.filter(friend => 
        friend.category === category.key && friend.status === 'active'
      ).length,
      icon: category.icon
    }))
})

onMounted(() => {
  setTimeout(() => {
    isVisible.value = true
  }, 200)
})

const selectCategory = (category: string) => {
  selectedCategory.value = category
}

const handleFriendHover = (friendId: number | null) => {
  hoveredFriend.value = friendId
}

const openFriendLink = (url: string) => {
  window.open(url, '_blank')
}
</script>

<template>
  <div class="friends-page">
    <!-- 页面头部 -->
    <div class="page-header" :class="{ 'visible': isVisible }">
      <h1>{{ friendsPage.title }}</h1>
      <p class="subtitle">{{ friendsPage.subtitle }}</p>
      <p class="description">{{ friendsPage.description }}</p>
    </div>

    <!-- 申请友链信息 -->
    <div class="apply-section" :class="{ 'visible': isVisible }">
      <div class="apply-card">
        <h2>{{ friendsPage.applyInfo.title }}</h2>
        <p class="apply-description">{{ friendsPage.applyInfo.description }}</p>
        
        <div class="apply-content">
          <div class="requirements">
            <h3>申请要求</h3>
            <ul>
              <li v-for="requirement in friendsPage.applyInfo.requirements" :key="requirement">
                {{ requirement }}
              </li>
            </ul>
          </div>
          
          <div class="my-info">
            <h3>本站信息</h3>
            <div class="site-info">
              <img :src="friendsPage.applyInfo.myInfo.avatar" :alt="friendsPage.applyInfo.myInfo.name">
              <div>
                <h4>{{ friendsPage.applyInfo.myInfo.name }}</h4>
                <p>{{ friendsPage.applyInfo.myInfo.description }}</p>
                <p class="site-url">{{ friendsPage.applyInfo.myInfo.url }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="contact-info">
          <p>联系方式：</p>
          <div class="contact-links">
            <a :href="`mailto:${friendsPage.applyInfo.contact.email}`" class="contact-link">
              📧 {{ friendsPage.applyInfo.contact.email }}
            </a>
            <a :href="friendsPage.applyInfo.contact.github" target="_blank" class="contact-link">
              🐙 GitHub
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- 分类筛选 -->
    <div class="category-filter" :class="{ 'visible': isVisible }">
      <button 
        v-for="category in friendsPage.categories"
        :key="category.key"
        class="filter-button"
        :class="{ 'active': selectedCategory === category.key }"
        @click="selectCategory(category.key)"
      >
        <span class="filter-icon">{{ category.icon }}</span>
        <span class="filter-name">{{ category.name }}</span>
      </button>
    </div>

    <!-- 友链网格 -->
    <div class="friends-grid" :class="{ 'visible': isVisible }">
      <div 
        v-for="(friend, index) in filteredFriends" 
        :key="friend.id"
        class="friend-card"
        :style="{ '--delay': `${index * 0.1}s` }"
        @mouseenter="handleFriendHover(friend.id)"
        @mouseleave="handleFriendHover(null)"
        @click="openFriendLink(friend.url)"
      >
        <div class="card-glow" :class="{ 'active': hoveredFriend === friend.id }"></div>
        
        <div class="friend-avatar">
          <img :src="friend.avatar" :alt="friend.name" @error="($event.target as HTMLImageElement).src = '/avatar.jpg'">
        </div>
        
        <div class="friend-info">
          <h3 class="friend-name">{{ friend.name }}</h3>
          <p class="friend-description">{{ friend.description }}</p>
          
          <div class="friend-tags">
            <span 
              v-for="tag in friend.tags" 
              :key="tag"
              class="friend-tag"
            >
              {{ tag }}
            </span>
          </div>
        </div>
        
        <div class="friend-link-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15,3 21,3 21,9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </div>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="friends-stats" :class="{ 'visible': isVisible }">
      <div 
        v-for="stat in statsData" 
        :key="stat.key"
        class="stat-item"
      >
        <div class="stat-icon">{{ stat.icon }}</div>
        <div class="stat-number">{{ stat.count }}</div>
        <div class="stat-label">{{ stat.name }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.friends-page {
  min-height: 100vh;
  background: transparent;
  padding: 2rem 0;
  position: relative;
}

/* 友链页面专用背景效果 */
.friends-page::after {
  content: '';
  position: fixed;
  bottom: -50px;
  right: -50px;
  width: 1000px;
  height: 1000px;
  background-image: url('@/assets/trim_after_training.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  opacity: 0.3;
  pointer-events: none;
  z-index: -1;
  transition: opacity 0.3s ease;
}

.friends-page:hover::after {
  opacity: 0.8;
}

.friends-page .container {
   max-width: 1400px;
   margin: 0 auto;
   padding: 0 20px;
}

/* 页面头部 */
.page-header {
  text-align: center;
  margin-bottom: 60px;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s ease;
}

.page-header.visible {
  opacity: 1;
  transform: translateY(0);
}

.page-header h1 {
  font-size: 3rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color), var(--accent-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 15px;
  line-height: 1.2;
}

.page-header .subtitle {
  font-size: 1.3rem;
  color: var(--text-secondary);
  margin-bottom: 10px;
  font-weight: 500;
}

.page-header .description {
  font-size: 1.1rem;
  color: var(--text-tertiary);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

/* 分类筛选 */
.category-filter {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 50px;
  flex-wrap: wrap;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease 0.2s;
}

.category-filter.visible {
  opacity: 1;
  transform: translateY(0);
}

.filter-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
  backdrop-filter: blur(10px);
  border: 2px solid var(--border-light);
  border-radius: 25px;
  cursor: pointer;
  transition: var(--transition-normal);
  font-weight: 500;
  color: var(--text-secondary);
  box-shadow: var(--shadow-sm);
}

.filter-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-color);
}

.filter-button.active {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  border-color: var(--primary-color);
  box-shadow: var(--shadow-lg);
}

.filter-icon {
  font-size: 1.1rem;
}

.filter-name {
  font-size: 0.95rem;
}

/* 友链网格 */
.friends-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 25px;
  margin-bottom: 60px;
  padding: 0 20px;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s ease 0.4s;
}

.friends-grid.visible {
  opacity: 1;
  transform: translateY(0);
}

.friend-card {
  position: relative;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85));
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-light);
  border-radius: 20px;
  padding: 25px;
  cursor: pointer;
  transition: var(--transition-normal);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.6s ease forwards;
  animation-delay: var(--delay);
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.friend-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-color);
}

.card-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 20px;
  z-index: -1;
}

.card-glow.active {
  opacity: 0.1;
}

.friend-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 15px;
  border: 3px solid var(--border-light);
  transition: var(--transition-normal);
}

.friend-card:hover .friend-avatar {
  border-color: var(--primary-color);
  transform: scale(1.05);
}

.friend-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.friend-info {
  flex: 1;
}

.friend-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  line-height: 1.3;
}

.friend-description {
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 15px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.friend-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.friend-tag {
  background: linear-gradient(135deg, var(--accent-color), var(--secondary-color));
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.friend-link-icon {
  position: absolute;
  top: 20px;
  right: 20px;
  color: var(--text-tertiary);
  transition: var(--transition-normal);
}

.friend-card:hover .friend-link-icon {
  color: var(--primary-color);
  transform: scale(1.1);
}

/* 统计信息 */
.friends-stats {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 60px;
  flex-wrap: wrap;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease 0.6s;
}

.friends-stats.visible {
  opacity: 1;
  transform: translateY(0);
}

.stat-item {
  text-align: center;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-light);
  border-radius: 15px;
  padding: 20px;
  min-width: 120px;
  box-shadow: var(--shadow-sm);
  transition: var(--transition-normal);
}

.stat-item:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}

.stat-icon {
  font-size: 1.5rem;
  margin-bottom: 8px;
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 500;
}

/* 申请友链区域 */
.apply-section {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s ease 0.8s;
}

.apply-section.visible {
  opacity: 1;
  transform: translateY(0);
}

.apply-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85));
  width: 70%;
  margin: 40px auto;
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-light);
  border-radius: 20px;
  padding: 40px;
  box-shadow: var(--shadow-lg);
}

.apply-card h2 {
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 15px;
  text-align: center;
}

.apply-description {
  text-align: center;
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin-bottom: 30px;
  line-height: 1.6;
}

.apply-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-bottom: 30px;
}

.requirements h3,
.my-info h3 {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 15px;
}

.requirements ul {
  list-style: none;
  padding: 0;
}

.requirements li {
  color: var(--text-secondary);
  margin-bottom: 8px;
  padding-left: 20px;
  position: relative;
  line-height: 1.5;
}

.requirements li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--primary-color);
  font-weight: bold;
}

.site-info {
  display: flex;
  gap: 15px;
  align-items: flex-start;
}

.site-info img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border-light);
}

.site-info h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 5px;
}

.site-info p {
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 5px;
}

.site-url {
  color: var(--primary-color) !important;
  font-weight: 500;
}

.contact-info {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid var(--border-light);
}

.contact-info p {
  color: var(--text-secondary);
  margin-bottom: 15px;
  font-weight: 500;
}

.contact-links {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.contact-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  text-decoration: none;
  border-radius: 15px;
  font-weight: 500;
  transition: var(--transition-normal);
  box-shadow: var(--shadow-sm);
}

.contact-link:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .friends-page {
    padding: 20px 15px;
  }
  
  /* 移动端背景图适配 - 避免遮挡人脸 */
  .friends-page::after {
    bottom: -100px;
    right: -200px;
    width: 800px;
    height: 800px;
    opacity: 0.2;
  }
  
  .friends-page:hover::after {
    opacity: 0.4;
  }
  
  .page-header h1 {
    font-size: 2.2rem;
  }
  
  .page-header .subtitle {
    font-size: 1.1rem;
  }
  
  .friends-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .apply-content {
    grid-template-columns: 1fr;
    gap: 25px;
  }
  
  .apply-card {
    padding: 25px;
  }
  
  .friends-stats {
    gap: 15px;
  }
  
  .contact-links {
    flex-direction: column;
    align-items: center;
  }
}

@media (max-width: 480px) {
  /* 小屏幕设备背景图进一步调整 */
  .friends-page::after {
    bottom: -150px;
    right: -300px;
    width: 600px;
    height: 600px;
    opacity: 0.15;
  }
  
  .friends-page:hover::after {
    opacity: 0.3;
  }
  
  .page-header h1 {
    font-size: 1.8rem;
  }
  
  .filter-button {
    padding: 10px 16px;
    font-size: 0.9rem;
  }
  
  .friend-card {
    padding: 20px;
  }
  
  .apply-card {
    padding: 20px;
    width: 90%;
  }
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .friends-page {
    background: transparent;
  }
  
  .friend-card,
  .apply-card,
  .stat-item,
  .filter-button {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .filter-button.active {
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  }
}
</style>
