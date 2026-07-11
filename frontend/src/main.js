import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// 创建 Vue 应用 → 安装路由 → 挂载到 #app
createApp(App).use(router).mount('#app')
