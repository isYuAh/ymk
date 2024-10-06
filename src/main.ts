import { createApp } from "vue";
import 'normalize.css'
import '@/assets/init.css'
import '@/assets/dialogDefaultStyle.css'
import { createPinia } from 'pinia';
import App from "./App.vue";
import router from "./router";
const pinia = createPinia()
import 'floating-vue/dist/style.css'
import FloatingVue from 'floating-vue'


const app = createApp(App);
app.use(FloatingVue)
app.use(router)
app.use(pinia)
app.mount("#app");
