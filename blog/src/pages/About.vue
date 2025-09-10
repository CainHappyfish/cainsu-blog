<script setup lang="ts">
import HomeIntroduction from '@/components/HomeIntroduction.vue'
import ExperienceTimeline from '@/components/ExperienceTimeline.vue'
import InterestsHobbies from '@/components/InterestsHobbies.vue'
import PersonalTags from '@/components/PersonalTags.vue'
import PhotoWall from '@/components/PhotoWall.vue'
import config from '@/config/configs'


// 从配置文件获取数据
const { experiences, hobbies, personalTags, tagCategories, photoWall } = config.aboutPage
</script>

<template>
  <div class="about-page">
    <!-- 个人介绍 -->
    <section class="intro-section">
      <HomeIntroduction />
    </section>
    
    <!-- 前端经历时间线 -->
    <section class="timeline-section">
      <ExperienceTimeline :experiences="experiences" />
    </section>
    
    <!-- 个人标签 -->
    <section class="tags-section">
      <PersonalTags :tags="personalTags" :tag-categories="tagCategories" />
    </section>
    
    <!-- 兴趣爱好 -->
    <section class="hobbies-section">
      <InterestsHobbies :hobbies="hobbies" />
    </section>
    
    <!-- 照片墙 -->
    <section class="photos-section">
      <PhotoWall :photos="photoWall.photos" />
    </section>
    
  </div>
</template>

<style scoped>
.about-page {
  min-height: 100vh;
  background: transparent;
}

/* 各个section的通用样式 */
section {
  position: relative;
  overflow: hidden;
}

.intro-section {
  background: transparent;
  padding: 0;
}

.timeline-section {
  background: transparent;
  position: relative;
}

.tags-section {
  background: transparent;
  position: relative;
}

.hobbies-section {
  background: transparent;
  position: relative;
}

.photos-section {
  background: transparent;
  position: relative;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .about-page {
    padding: 0;
  }
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .about-page {
    background: transparent;
  }
  
  .timeline-section,
  .hobbies-section,
  .tags-section,
  .photos-section {
    background: transparent;
  }
}

/* 平滑滚动 */
html {
  scroll-behavior: smooth;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}
</style>
