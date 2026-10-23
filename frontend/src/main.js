import '@fontsource-variable/geist/wght.css'
import '@fontsource-variable/geist-mono/wght.css'
import 'cn-fontsource-smiley-sans-oblique-regular/font.css'
import '@fontsource/zhi-mang-xing/400.css'
import { createApp } from 'vue'
import App from './app/App.vue'
import router from './app/router.js'

// 创建 Vue 应用 → 安装路由 → 挂载到 #app
createApp(App).use(router).mount('#app')
