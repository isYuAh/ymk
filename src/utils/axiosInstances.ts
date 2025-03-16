import axios from "axios";
import {useUserStore} from "@/stores/modules/user";
import {useConfigStore} from "@/stores/modules/config";
//@ts-ignore
import {WBI} from '@/utils/WBI'

export const neteaseAxios = axios.create()
export const kugouAxios = axios.create()
export const qqAxios = axios.create()
export const proxyAxios = axios.create()

proxyAxios.defaults.baseURL = "http://localhost:35652/";
proxyAxios.interceptors.request.use((config) => {
    const originalUrl = config.url;
    const originalMethod = config.method;
    const originalHeaders = config.headers || {};
    const originalParams = config.params;
    const u = useUserStore().bilibiliUser
    if ('auth' in u && u.auth.length) {
        originalHeaders['Cookie'] = u.auth.join(';')
    }
    config.url = '/';
    config.data = {
        url: originalUrl,
        method: originalMethod,
        headers: originalHeaders,
        params: originalParams,
        data: config.data
    }
    config.method = "post"
    config.params = {}
    return config
})

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

proxyAxios.get('https://api.bilibili.com/x/web-interface/nav').then(res => {
    const {data: {data: { wbi_img: { img_url, sub_url } } } } = res;
    let wbi = {
        img_key: img_url.slice(
            img_url.lastIndexOf('/') + 1,
            img_url.lastIndexOf('.')
        ),
        sub_key: sub_url.slice(
            sub_url.lastIndexOf('/') + 1,
            sub_url.lastIndexOf('.')
        )
    }
    proxyAxios.interceptors.request.use((config) => {
        if (!config.params) config.params = {}
        config.params = WBI(wbi, config.params);
        return config;
    })
}).catch(err => {console.log(err);})