import axios from "axios";
import {useZKStore} from "@/stores/useZKstore";
import {storeToRefs} from "pinia";

export const neteaseAxios = axios.create()
export const kugouAxios = axios.create()

neteaseAxios.interceptors.request.use((config) => {
    const {neteaseUser, config: zkConf} = storeToRefs(useZKStore())
    if (!config.params) config.params = {};
    config.baseURL = zkConf.value.neteaseApi.url;
    config.params['cookie'] = neteaseUser.value.cookie;
    return config;
})

kugouAxios.interceptors.request.use((config) => {
    config.baseURL = "http://localhost:35653/";
    return config
})