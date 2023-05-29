import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)
app.use(store)
app.use(router)
app.use(ElementPlus)
app.mount('#app')

// 1.
//   先自己构造一些假数据，要能够根据位置来渲染内容
// 2.
//   配置组件对应的映射关系 {preview: xxx,render: xxx}