import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './shared/styles/style.css'
import App from './App.vue'
import router from './app/router'
import { setupAxiosInterceptors } from './core/api/axiosInterceptor'
import { VueQueryPlugin } from '@tanstack/vue-query'

setupAxiosInterceptors(router)

const app = createApp(App)
const pinia = createPinia()

app.use(VueQueryPlugin)
app.use(pinia)
app.use(router)

app.mount('#app')
