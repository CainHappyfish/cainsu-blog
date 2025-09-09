<script setup lang="ts">
import { ref } from 'vue'
import avatar from '@/assets/avatar.jpg'

import config from '@/config/configs'


// 个人信息数据
const personalInfo = ref(config.personalInfo)
</script>

<template>
  <div class="home-introduction">
    <!-- 左侧个人信息 -->
    <div class="personal-info">
      <div class="info-content">
        <h1 class="name">{{ personalInfo.name }}</h1>
        <h2 class="job-title">{{ personalInfo.title }}</h2>
        <p class="description">{{ personalInfo.description }}</p>
        
        <!-- 技术栈 -->
        <div class="skills">
          <h3>技术栈</h3>
          <div class="skill-tags">
            <span 
              v-for="(skill, index) in personalInfo.skills" 
              :key="skill" 
              class="skill-tag"
              :style="{ animationDelay: `${index * 0.1}s` }"
            >
              {{ skill }}
            </span>
          </div>
        </div>
        
        <!-- 联系方式 -->
        <div class="contact">
          <h3>联系我</h3>
          <div class="contact-links">
            <a :href="`mailto:${personalInfo.contact.email}`" class="contact-link">
              📧 {{ personalInfo.contact.email }}
            </a>
            <a :href="personalInfo.contact.github" target="_blank" class="contact-link">
              🔗 GitHub
            </a>
            <a :href="personalInfo.contact.blog" target="_blank" class="contact-link">
              📝 个人博客
            </a>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 右侧头像 -->
    <div class="avatar-section">
      <div class="avatar-container">
        <div class="avatar">
          <img :src="avatar" alt="个人头像" class="avatar-img">
        </div>
        <div class="avatar-decoration"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-introduction {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 80px;
  min-height: 70vh;
  padding: var(--spacing-lg);
  width: 1200px;
  margin: 0 auto;
  position: relative;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(20px);
  border-radius: var(--radius-xl);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.home-introduction::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('@/assets/kasumi.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  filter: blur(30px);
  opacity: 0.3;
  z-index: -1;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.home-introduction:hover {
  backdrop-filter: blur(5px);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));
  transform: translateY(-2px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
}

.home-introduction:hover::before {
  filter: blur(3px);
  opacity: 0.8;
}

.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  z-index: -1;
}

/* 左侧个人信息 */
.personal-info {
  max-width: 700px;
}

.info-content {
  animation: fadeInLeft 0.8s ease-out;
}

.name {
  font-size: 3.3rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color), var(--accent-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: var(--spacing-sm);
  line-height: 1.2;
}

.job-title {
  font-size: 2.2rem;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color), var(--accent-color), var(--success-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 500;
  margin-bottom: var(--spacing-md);
}

.description {
  font-size: 1.4rem;
  line-height: 1.6;
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
  white-space: pre-line;
}

/* 技能标签 */
.skills {
  margin-bottom: var(--spacing-lg);
}

.skills h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.skill-tag {
  padding: var(--spacing-xs) var(--spacing-md);
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease, background 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
  opacity: 0;
  transform: translateY(20px) scale(0.8);
  animation: skillPopIn 0.6s ease-out forwards;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.skill-tag:hover {
  transform: translateY(-4px) scale(1.05);
  background: linear-gradient(45deg, var(--secondary-color), var(--primary-color));
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.skill-tag:active {
  transform: translateY(-2px) scale(1.02);
  transition: all 0.1s ease;
}

/* 联系方式 */
.contact h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.contact-links {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.contact-link {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--primary-color);
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: all 0.3s;
  font-weight: 500;
  font-size: 1rem;
  width: fit-content;
  outline: none;
  border: none;
}

.contact-link:hover {
  background-color: var(--bg-secondary);
  transform: translateX(4px);
}

.contact-link:focus {
  outline: none;
  border: none;
}

.contact-link:active {
  outline: none;
  border: none;
}

/* 右侧头像 */
.avatar-section {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  width: 300px;
}

.avatar-container {
  position: relative;
  animation: fadeInRight 0.8s ease-out;
}

.avatar {
  position: relative;
  width: 280px;
  height: 280px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 
    0 6px 24px rgba(0, 0, 0, 0.1),
    0 0 40px rgba(255, 51, 119, 0.2),
    0 0 60px rgba(170, 102, 221, 0.15),
    0 0 80px rgba(255, 51, 119, 0.1);
  z-index: 2;
  transition: all 0.3s ease-in-out;
  animation: glowPulse 3s ease-in-out infinite alternate;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-normal);
}





/* 动画 */
@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes skillPopIn {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.8);
  }
  50% {
    opacity: 0.8;
    transform: translateY(-5px) scale(1.1);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}



@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes glowPulse {
  0% {
    box-shadow: 
      0 8px 32px rgba(0, 0, 0, 0.1),
      0 0 60px rgba(255, 51, 119, 0.3),
      0 0 100px rgba(170, 102, 221, 0.2),
      0 0 140px rgba(255, 51, 119, 0.1);
  }
  100% {
    box-shadow: 
      0 8px 32px rgba(0, 0, 0, 0.1),
      0 0 80px rgba(255, 51, 119, 0.5),
      0 0 120px rgba(170, 102, 221, 0.4),
      0 0 160px rgba(255, 51, 119, 0.3),
      0 0 200px rgba(170, 102, 221, 0.2);
  }
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .home-introduction {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-md);
    min-height: 60vh;
    padding: var(--spacing-md);
    max-width: 600px;
  }
  
  .avatar-section {
    order: -1;
    width: auto;
  }
  
  .avatar {
    width: 200px;
    height: 200px;
  }
}

@media (max-width: 768px) {
  .home-introduction {
    padding: var(--spacing-sm);
    gap: var(--spacing-sm);
    max-width: 500px;
  }
  
  .avatar-section {
    order: -1;
    margin-bottom: var(--spacing-sm);
    width: auto;
  }
  
  .name {
    font-size: 2rem;
  }
  
  .job-title {
    font-size: 1.1rem;
  }
  
  .avatar {
    width: 160px;
    height: 160px;
  }
  
  .description {
    font-size: 0.95rem;
  }
  
  .skills {
    margin-bottom: var(--spacing-md);
  }
  
  .skill-tags {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing-xs);
    max-width: 100%;
    justify-items: center;
  }
  
  .skill-tag {
    padding: 6px 8px;
    font-size: 0.8rem;
    white-space: nowrap;
    width: 100%;
    text-align: center;
    min-width: 0;
    opacity: 0;
    transform: translateY(15px) scale(0.9);
    animation: skillPopIn 0.5s ease-out forwards;
  }
  
  .skill-tag:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  }
}
</style>
