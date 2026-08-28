import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { setupGuards } from './router/guards'
import { canDirective } from './directives/can'
import './assets/styles/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Register global v-can permission directive
app.directive('can', canDirective)

// Setup route guards after pinia is installed
setupGuards(router)

app.mount('#app')
