import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createGtag } from 'vue-gtag'

const app = createApp(App)

if (import.meta.env.MODE === 'production') {
    app.use(createGtag({ tagId: 'G-R0C31MMH0Z' }))
}

app.use(router)
app.mount('#app')