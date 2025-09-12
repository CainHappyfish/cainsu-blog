<script setup lang="ts">
import { ref, computed } from 'vue'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css';

interface Props {
  code: string
  language?: string
  showLineNumbers?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  language: '',
  showLineNumbers: true
})

const codeRef = ref<HTMLElement>()
const copied = ref(false)

// 检测语言
const detectedLanguage = computed(() => {
  if (props.language) {
    return props.language
  }
  
  const result = hljs.highlightAuto(props.code)
  return result.language || 'text'
})

// 获取语言显示名称
const languageDisplayName = computed(() => {
  const langMap: Record<string, string> = {
    'javascript': 'JavaScript',
    'typescript': 'TypeScript',
    'python': 'Python',
    'java': 'Java',
    'cpp': 'C++',
    'c': 'C',
    'csharp': 'C#',
    'php': 'PHP',
    'ruby': 'Ruby',
    'go': 'Go',
    'rust': 'Rust',
    'swift': 'Swift',
    'kotlin': 'Kotlin',
    'scala': 'Scala',
    'html': 'HTML',
    'css': 'CSS',
    'scss': 'SCSS',
    'sass': 'Sass',
    'less': 'Less',
    'json': 'JSON',
    'xml': 'XML',
    'yaml': 'YAML',
    'yml': 'YAML',
    'markdown': 'Markdown',
    'bash': 'Bash',
    'shell': 'Shell',
    'powershell': 'PowerShell',
    'sql': 'SQL',
    'dockerfile': 'Dockerfile',
    'nginx': 'Nginx',
    'apache': 'Apache',
    'text': 'Plain Text'
  }
  
  return langMap[detectedLanguage.value] || detectedLanguage.value.toUpperCase()
})

// 高亮代码
const highlightedCode = computed(() => {
  if (detectedLanguage.value && hljs.getLanguage(detectedLanguage.value)) {
    try {
      console.log('code:', hljs.highlight(props.code, { language: detectedLanguage.value }).value)
      return hljs.highlight(props.code, { language: detectedLanguage.value }).value
    } catch (err) {
      console.error('Highlight error:', err)
    }
  }
  return hljs.highlightAuto(props.code).value
})

// 代码行数组
const codeLines = computed(() => {
  return props.code.split('\n')
})

// 复制代码
const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy code:', err)
    // 降级方案
    const textArea = document.createElement('textarea')
    textArea.value = props.code
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
}
</script>

<template>
  <div class="code-block-container">
    <!-- 代码块头部 -->
    <div class="code-header">
      <div class="code-info">
        <div class="window-controls">
          <span class="control red"></span>
          <span class="control yellow"></span>
          <span class="control green"></span>
        </div>
        <span class="language-tag">{{ languageDisplayName }}</span>
      </div>
      
      <button 
        class="copy-btn" 
        @click="copyCode"
        :class="{ copied }"
        :title="copied ? '已复制!' : '复制代码'"
      >
        <svg v-if="!copied" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20,6 9,17 4,12"></polyline>
        </svg>
        <span class="copy-text">{{ copied ? '已复制' : '复制' }}</span>
      </button>
    </div>
    
    <!-- 代码内容 -->
    <div class="code-content">
      <div class="code-wrapper">
        <!-- 行号 -->
        <div v-if="showLineNumbers" class="line-numbers">
          <span 
            v-for="(_, index) in codeLines" 
            :key="index"
            class="line-number"
          >
            {{ index + 1 }}
          </span>
        </div>
        
        <!-- 代码 -->
        <pre ref="codeRef" class="code-pre"><code class="hljs" v-html="highlightedCode"></code></pre>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.code-block-container {
  background: #1e1e1e;
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin: var(--spacing-xl) 0;
  border: 1px solid #3c3c3c;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background: #2d2d30;
  border-bottom: 1px solid #3c3c3c;
}

.code-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.window-controls {
  display: flex;
  gap: var(--spacing-xs);
}

.control {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  opacity: 0.8;
}

.control.red {
  background: #ff5f56;
}

.control.yellow {
  background: #ffbd2e;
}

.control.green {
  background: #27ca3f;
}

.language-tag {
  font-size: var(--text-sm);
  color: #cccccc;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.copy-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: #3c3c3c;
  border: 1px solid #555555;
  border-radius: var(--radius-sm);
  color: #cccccc;
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.copy-btn:hover {
  background: #4c4c4c;
  color: #ffffff;
  transform: translateY(-1px);
}

.copy-btn.copied {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  border-color: transparent;
}

.copy-text {
  font-weight: 500;
}

.code-content {
  position: relative;
}

.code-wrapper {
  display: flex;
  max-height: 600px;
  overflow: auto;
}

.line-numbers {
  display: flex;
  flex-direction: column;
  padding: var(--spacing-md) var(--spacing-sm);
  background: #252526;
  border-right: 1px solid #3c3c3c;
  user-select: none;
  min-width: 50px;
}

.line-number {
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
  font-size: var(--text-sm);
  color: #858585;
  text-align: right;
  line-height: 1.6;
  padding: 0 var(--spacing-xs);
}

.code-pre {
  flex: 1;
  margin: 0;
  padding: var(--spacing-md);
  overflow: visible;
  font-size: var(--text-sm);
  line-height: 1.6;
}

.code-pre code {
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
  background: transparent !important;
  padding: 0 !important;
  border: none !important;
  display: block;
  background-clip: initial !important;
  -webkit-background-clip: initial !important;
}

/* 滚动条样式 */
.code-wrapper::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.code-wrapper::-webkit-scrollbar-track {
  background: #2d2d30;
}

.code-wrapper::-webkit-scrollbar-thumb {
  background: #555555;
  border-radius: var(--radius-sm);
}

.code-wrapper::-webkit-scrollbar-thumb:hover {
  background: #666666;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .code-block-container {
    margin: var(--spacing-lg) 0;
  }
  
  .code-wrapper {
    max-height: 500px;
  }
}

@media (max-width: 768px) {
  .code-block-container {
    border-radius: var(--radius-md);
    margin: var(--spacing-md) 0;
  }
  
  .code-header {
    padding: var(--spacing-sm) var(--spacing-md);
    flex-wrap: wrap;
    gap: var(--spacing-sm);
  }
  
  .code-info {
    gap: var(--spacing-sm);
    flex: 1;
    min-width: 0;
  }
  
  .language-tag {
    font-size: var(--text-xs);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .copy-btn {
    padding: var(--spacing-xs) var(--spacing-sm);
    min-height: 36px;
    flex-shrink: 0;
  }
  
  .copy-text {
    display: none;
  }
  
  .line-numbers {
    min-width: 35px;
    padding: var(--spacing-sm) var(--spacing-xs);
    font-size: calc(var(--text-xs) - 1px);
  }
  
  .line-number {
    padding: 0 2px;
  }
  
  .code-pre {
    padding: var(--spacing-sm);
    font-size: var(--text-xs);
    line-height: 1.5;
  }
  
  .code-wrapper {
    max-height: 450px;
  }
}

@media (max-width: 640px) {
  .code-block-container {
    margin: var(--spacing-sm) -var(--spacing-xs);
    border-radius: var(--radius-sm);
  }
  
  .code-header {
    padding: var(--spacing-xs) var(--spacing-sm);
  }
  
  .window-controls {
    display: none;
  }
  
  .language-tag {
    font-size: 10px;
  }
  
  .copy-btn {
    padding: var(--spacing-xs);
    min-width: 32px;
    min-height: 32px;
    justify-content: center;
  }
  
  .line-numbers {
    min-width: 30px;
    padding: var(--spacing-xs) 2px;
  }
  
  .code-pre {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: 11px;
  }
  
  .code-wrapper {
    max-height: 350px;
  }
}

@media (max-width: 480px) {
  .code-block-container {
    margin: var(--spacing-sm) -var(--spacing-sm);
    border-radius: 0;
    border-left: none;
    border-right: none;
    max-width: calc(100% - 20px);
  }
  
  .code-header {
    padding: var(--spacing-xs) var(--spacing-sm);
  }
  
  .code-info {
    gap: var(--spacing-xs);
  }
  
  .language-tag {
    font-size: 9px;
    max-width: 80px;
  }
  
  .copy-btn {
    min-width: 28px;
    min-height: 28px;
    padding: 4px;
  }
  
  .copy-btn svg {
    width: 14px;
    height: 14px;
  }
  
  .line-numbers {
    min-width: 25px;
    padding: var(--spacing-xs) 1px;
    font-size: 9px;
  }
  
  .code-pre {
    padding: var(--spacing-xs);
    font-size: 10px;
    line-height: 1.4;
  }
  
  .code-wrapper {
    max-height: 300px;
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .copy-btn {
    min-height: 44px;
    min-width: 44px;
  }
  
  .copy-btn:active {
    transform: scale(0.95);
    background: #5c5c5c;
  }
}
</style>