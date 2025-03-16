
import axios from "axios";
import {useUserStore} from "@/stores/modules/user";
import {useConfigStore} from "@/stores/modules/config";
//@ts-ignore
import {WBI} from '@/utils/WBI'

export const neteaseAxios = axios.create()
export const kugouAxios = axios.create()
export const qqAxios = axios.create()

neteaseAxios.interceptors.request.use((config) => {
    const userStore = useUserStore()
    const configStore = useConfigStore();
    if (!config.params) config.params = {};
    config.baseURL = configStore.api.neteaseApi.url;
    config.params['cookie'] = userStore.neteaseUser.auth;
    return config;
})

kugouAxios.interceptors.request.use((config) => {
    const userStore = useUserStore()
    config.baseURL = "http://localhost:35653/";
    config.params = config.params || {}
    config.method === 'post' && (config.data = config.data || {});
    if (userStore.kugouUser.auth) {
        config.params.token = config.params.token || userStore.kugouUser.auth;
        if (config.method === 'post') {
            config.data.token = config.data.token || userStore.kugouUser.auth;
        }
    }
    if (userStore.kugouUser.uid) {
        config.params.userid = config.params.userid || userStore.kugouUser.uid;
    }
    return config
})

qqAxios.interceptors.request.use((config) => {
    const configStore = useConfigStore();
    config.baseURL = configStore.api.qqApi.url;
    return config;
})

// proxyAxios.interceptors.response.use((res) => {
//     if (res.data.code === -352) {
//         const voucher = res.data.data.v_voucher;

//     }
//     return res.data
// })