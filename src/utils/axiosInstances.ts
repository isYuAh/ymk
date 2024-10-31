import axios from "axios";
import {useZKStore} from "@/stores/useZKstore";
import {storeToRefs} from "pinia";

export const neteaseAxios = axios.create()
export const kugouAxios = axios.create()

neteaseAxios.interceptors.request.use((config) => {
    const {neteaseUser, config: zkConf} = storeToRefs(useZKStore())
    if (!config.params) config.params = {};
    config.baseURL = zkConf.value.neteaseApi.url;
    config.params['cookie'] = neteaseUser.value.auth;
    return config;
})

kugouAxios.interceptors.request.use((config) => {
    const {kugouUser} = storeToRefs(useZKStore())
    config.baseURL = "http://localhost:35653/";
    if (!config.params) config.params = {};
    if (kugouUser.value.auth) {
        config.params.token = config.params.token || kugouUser.value.auth;
    }
    if (kugouUser.value.uid) {
        config.params.userid = config.params.userid || kugouUser.value.uid;
    }
    return config
})