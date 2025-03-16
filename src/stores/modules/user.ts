import {defineStore} from "pinia";
import {computed, ref, watch} from "vue";
import type {BilibiliUser, User} from "@/types/config";
import {neteaseAxios} from "@/utils/axiosInstances";

export const useUserStore = defineStore('user', () => {
  const neteaseUser = ref<User>({} as any);
  const kugouUser = ref<User>({} as any);
  const bilibiliUser = ref<BilibiliUser>({} as any)
  const neteaseLikeList = ref<number[]>([]);
  const isVip = () => ({
    netease: neteaseUser.value.vipType === 11
  })
  const isLogin = computed(() => ({
    netease: neteaseUser.value.auth && neteaseUser.value.auth != '',
    kugou: kugouUser.value.auth && kugouUser.value.auth != '',
    bilibili: bilibiliUser.value.auth && bilibiliUser.value.auth.length > 0
  }))
  watch(() => neteaseUser.value.auth, (nv) => {
    if (nv) {
      neteaseAxios.get(`/likelist?uid=${neteaseUser.value.uid}`).then((res) => {
        neteaseLikeList.value = res.data.code === 200 ? res.data.ids : []
      })
    }
  })
  return {
    neteaseUser,
    kugouUser,
    bilibiliUser,
    neteaseLikeList,
    isVip,
    isLogin
  }
})