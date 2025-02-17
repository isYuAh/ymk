import {defineStore} from "pinia";
import {computed, ref, watch} from "vue";
import type {User} from "@/types/config";
import {neteaseAxios} from "@/utils/axiosInstances";

export const useUserStore = defineStore('user', () => {
  const neteaseUser = ref<User>({} as any);
  const kugouUser = ref<User>({} as any);
  const neteaseLikeList = ref<number[]>([]);
  const isVip = () => ({
    netease: neteaseUser.value.vipType === 11
  })
  const isLogin = computed(() => ({
    netease: neteaseUser.value.auth && neteaseUser.value.auth != '',
    kugou: kugouUser.value.auth && kugouUser.value.auth != ''
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
    neteaseLikeList,
    isVip,
    isLogin
  }
})