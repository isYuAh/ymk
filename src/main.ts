import { createApp } from "vue";
import 'normalize.css'
import '@/assets/init.css'
import '@/assets/dialogDefaultStyle.css'
import { createPinia } from 'pinia';
import App from "./App.vue";
const pinia = createPinia()
import router from "./router";
import 'floating-vue/dist/style.css'
import FloatingVue from 'floating-vue'
import {useRuntimeDataStore} from "@/stores/modules/runtimeData";

const app = createApp(App);

app.use(FloatingVue)
app.use(router)
app.use(pinia)

const runtimeData = useRuntimeDataStore()
router.beforeEach((to, from) => {
  if (to.path === '/playlistDetail' && runtimeData.playlist.listIndex === -1) return {path: '/playlist'};
  if (to.path === '/albumPreview' && runtimeData.albumPreview.info.title === "") return {path: '/search'};
  if (to.path !== '/') runtimeData.nowTab = to.path.substring(1)
  return true
})

app.mount("#app");
