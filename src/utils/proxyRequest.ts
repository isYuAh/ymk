import { useUserStore } from "@/stores/modules/user";
import type { AxiosHeaders } from "axios";
import axios from "axios";
//@ts-ignore
import {WBI} from '@/utils/WBI'
let WBIo = {
  valid: false,
  img_key: '',
  sub_key: ''
}
interface proxyRequestParams {
  url: string,
  method: string,
  headers?: Partial<AxiosHeaders>,
  data?: any,
  params?: Record<string, string | boolean | number>,
}
export function proxyRequest(par: proxyRequestParams, adapters = [bilibiliAdapter]) {
  for (const adapter of adapters) {
    par = adapter(par);
  }
  const {url, method, headers, data, params} = par;
  return axios.post('http://localhost:35652/', {
    url, method, headers, data, params
  })
}
proxyRequest.get = function(url: string, par?: Omit<proxyRequestParams, 'method' | 'url'>, adapters = [bilibiliAdapter]) {
  return proxyRequest({
    url,
    method: 'get',
    ...par
  }, adapters)
}
proxyRequest.post = function(url: string, par?: Omit<proxyRequestParams, 'method' | 'url'>, adapters = [bilibiliAdapter]) {
  return proxyRequest({
    url,
    method: 'post',
    ...par
  }, adapters)
}

proxyRequest.get('https://api.bilibili.com/x/web-interface/nav', undefined, []).then(res => {
  const {data: {data: { wbi_img: { img_url, sub_url } } } } = res;
  WBIo = {
      img_key: img_url.slice(
          img_url.lastIndexOf('/') + 1,
          img_url.lastIndexOf('.')
      ),
      sub_key: sub_url.slice(
          sub_url.lastIndexOf('/') + 1,
          sub_url.lastIndexOf('.')
      ),
      valid: true
  }
  console.log('----WBI准备完成----')
}).catch(err => {console.log(err);})

function bilibiliAdapter(par: proxyRequestParams): proxyRequestParams {
  par.headers = par.headers || {};
  par.params = par.params || {};
  const u = useUserStore().bilibiliUser
  if ('auth' in u && u.auth.length && 'Cookie' in par.headers) {
      par.headers['Cookie'] = u.auth.join(';') + ";buvid3=1;"
  }
  par.headers['Origin'] = 'https://www.bilibili.com/';
  par.headers['Referer'] = 'https://www.bilibili.com/';
  par.headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  if (WBIo.valid) {
    par.params = WBI(WBIo, par.params)
  }
  return par;
}