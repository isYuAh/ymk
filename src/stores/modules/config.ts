import {defineStore} from "pinia";
import {ref} from "vue";
import type {apiConfig} from "@/types/config";

export const useConfigStore = defineStore('config', () => {
  const api = ref({
    neteaseApi: <apiConfig>{
      enable: false,
    },
    qqApi: <apiConfig>{
      enable: false,
    },
  })
  const bg = ref("")
  return {
    api,
    bg
  }
})