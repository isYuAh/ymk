import {createRouter, createWebHashHistory, type RouteRecordRaw} from 'vue-router';
import App from '@/pages/App.vue';
import Playlist from "@/pages/Playlist.vue";
import PlaylistDetail from "@/pages/PlaylistDetail.vue";
import Search from "@/pages/Search.vue";
import UserCenter from "@/pages/UserCenter.vue";
import Settings from "@/pages/Settings.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: App,
    redirect: '/playlist',
    children: [{
      path: 'playlist',
      component: () => import('@/pages/Playlist.vue')
    },{
      path: 'playlistDetail',
      component: () => import('@/pages/PlaylistDetail.vue')
    },{
      path: 'search',
      component: () => import('@/pages/Search.vue')
    },{
      path: 'userCenter',
      component: () => import('@/pages/UserCenter.vue')
    },{
      path: 'settings',
      component: () => import('@/pages/Settings.vue')
    },{
      path: 'recommendedPlaylists',
      component: () => import('@/pages/RecommendedPlaylists.vue')
    },{
      path: 'loading',
      component: () => import('@/pages/Loading.vue')
    }]
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
