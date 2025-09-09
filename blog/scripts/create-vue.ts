#!/usr/bin/env node
/* eslint-disable no-undef */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

// 获取命令行参数
const args = process.argv.slice(2)
const type = args[0] // 'page' 或 'component'
const name = args[1] // 文件名

if (!type || !name) {
  console.error('使用方法: npm run create:vue <type> <name>')
  console.error('类型: page | component')
  console.error('示例: npm run create:vue page Home')
  console.error('示例: npm run create:vue component Button')
  process.exit(1)
}

if (type !== 'page' && type !== 'component') {
  console.error('类型必须是 page 或 component')
  process.exit(1)
}

// 获取当前脚本目录
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

// 确定目标目录
const targetDir = type === 'page' 
  ? path.join(projectRoot, 'src', 'pages')
  : path.join(projectRoot, 'src', 'components')

// 确保目录存在
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true })
}

// 文件路径
const fileName = `${name}.vue`
const filePath = path.join(targetDir, fileName)

// 检查文件是否已存在
if (fs.existsSync(filePath)) {
  console.error(`文件 ${fileName} 已存在于 ${type}s 目录中`)
  process.exit(1)
}

// Vue 文件模板
const pageTemplate = `<script setup lang="ts">
import { ref } from 'vue'

// 页面状态
const loading = ref(false)

// 页面方法
const handleAction = () => {
  console.log('${name} page action')
}
</script>

<template>
  <div class="${name.toLowerCase()}-page">
    <h1>${name} 页面</h1>
    <p>这是 ${name} 页面的内容</p>
    <button @click="handleAction" :disabled="loading">
      {{ loading ? '加载中...' : '执行操作' }}
    </button>
  </div>
</template>

<style scoped>
.${name.toLowerCase()}-page {
  padding: 20px;
}

.${name.toLowerCase()}-page h1 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.${name.toLowerCase()}-page button {
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.${name.toLowerCase()}-page button:hover {
  background-color: #2980b9;
}

.${name.toLowerCase()}-page button:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}
</style>
`

const componentTemplate = `<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue'

// 组件属性
interface Props {
  title?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '${name} 组件',
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
    class="${name.toLowerCase()}-component"
    :class="{ active: isActive, disabled: disabled }"
    @click="handleClick"
  >
    <h3>{{ title }}</h3>
    <p>这是 ${name} 组件的内容</p>
    <slot></slot>
  </div>
</template>

<style scoped>
.${name.toLowerCase()}-component {
  padding: 16px;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.${name.toLowerCase()}-component:hover {
  border-color: #3498db;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.1);
}

.${name.toLowerCase()}-component.active {
  border-color: #3498db;
  background-color: #f8f9fa;
}

.${name.toLowerCase()}-component.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.${name.toLowerCase()}-component h3 {
  margin: 0 0 8px 0;
  color: #2c3e50;
}

.${name.toLowerCase()}-component p {
  margin: 0;
  color: #7f8c8d;
}
</style>
`

// 选择模板
const template = type === 'page' ? pageTemplate : componentTemplate

// 写入文件
try {
  fs.writeFileSync(filePath, template, 'utf8')
  console.log(`✅ 成功创建 ${type}: ${fileName}`)
  console.log(`📁 路径: ${filePath}`)
  
  if (type === 'page') {
    console.log('\n💡 提示: 记得在路由中添加这个页面')
  } else {
    console.log('\n💡 提示: 可以在其他组件中导入使用:')
    console.log(`   import ${name} from '@/components/${name}.vue'`)
  }
} catch (error) {
  console.error('创建文件时出错:', error)
  process.exit(1)
}