<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue'

// 组件属性
interface Props {
  title?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'BlogIndex 组件',
  disabled: false
})

// 组件事件
interface Emits {
  click: [event: MouseEvent]
  change: [value: string]
}

const emit = defineEmits<Emits>()

// 组件状态
const isActive = ref(false)

// 组件方法
const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    isActive.value = !isActive.value
    emit('click', event)
  }
}
</script>

<template>
  <div 
    class="blogindex-component"
    :class="{ active: isActive, disabled: disabled }"
    @click="handleClick"
  >
    <h3>{{ title }}</h3>
    <p>这是 BlogIndex 组件的内容</p>
    <slot></slot>
  </div>
</template>

<style scoped>
.blogindex-component { 
  padding: 16px;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.blogindex-component:hover {
  border-color: #3498db;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.1);
}

.blogindex-component.active {
  border-color: #3498db;
  background-color: #f8f9fa;
}

.blogindex-component.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.blogindex-component h3 {
  margin: 0 0 8px 0;
  color: #2c3e50;
}

.blogindex-component p {
  margin: 0;
  color: #7f8c8d;
}
</style>
