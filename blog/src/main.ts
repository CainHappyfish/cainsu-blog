import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import 'highlight.js/styles/github.css'
import { useTheme } from './composables/useTheme'

// import config from './config/configs'

// // 动态设置页面title和favicon
// todo
// document.title = config.siteInfo.title

// // 设置favicon
// const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
// if (favicon) {
//   favicon.href = config.siteInfo.icon
// }

// 初始化主题系统
const { initTheme } = useTheme()
initTheme()

const app = createApp(App)
app.use(router)
app.mount('#app')
