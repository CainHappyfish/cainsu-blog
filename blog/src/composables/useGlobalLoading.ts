import { reactive } from 'vue'

interface LoadingState {
  visible: boolean
  text: string
  size: number
}

const loadingState = reactive<LoadingState>({
  visible: false,
  text: '加载中...',
  size: 120
})

export function useGlobalLoading() {
  /**
   * 显示全局加载
   * @param text 加载文本
   * @param size 动画大小
   */
  const showLoading = (text: string = '加载中...', size: number = 120) => {
    loadingState.text = text
    loadingState.size = size
    loadingState.visible = true
  }

  /**
   * 隐藏全局加载
   */
  const hideLoading = () => {
    loadingState.visible = false
  }

  /**
   * 切换加载状态
   */
  const toggleLoading = () => {
    loadingState.visible = !loadingState.visible
  }

  /**
   * 异步操作包装器
   * @param asyncFn 异步函数
   * @param loadingText 加载文本
   * @param size 动画大小
   */
  const withLoading = async <T>(
    asyncFn: () => Promise<T>,
    loadingText: string = '加载中...',
    size: number = 120
  ): Promise<T> => {
    try {
      showLoading(loadingText, size)
      const result = await asyncFn()
      return result
    } finally {
      hideLoading()
    }
  }

  return {
    loadingState,
    showLoading,
    hideLoading,
    toggleLoading,
    withLoading
  }
}

// 导出单例实例
export const globalLoading = useGlobalLoading()