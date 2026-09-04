import {createApp} from 'vue'
import './style.css'
import App from './App.vue'

import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import 'primeicons/primeicons.css'

const app = createApp(App)

// Configure PrimeVue with a built-in theme preset
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.my-app-dark', // Optional: customize dark mode scoping if needed
        }
    }
})

app.mount('#app')
