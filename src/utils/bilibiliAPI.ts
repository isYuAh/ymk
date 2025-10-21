import { useUserStore } from "@/stores/modules/user";
import { proxyRequest } from "./proxyRequest";

export function getBilibiliVideoView(bv: string) {
  return proxyRequest.get('https://api.bilibili.com/x/web-interface/view', {
    params: {
        bvid: bv,
    }
})
}
export function getBilibiliVideoPlayurl(params: any) {
  const user = useUserStore()
  return proxyRequest.get('https://api.bilibili.com/x/player/wbi/playurl', {
    params,
    headers: {
      Cookie: user.bilibiliUser.auth || '',
    }
  })
}

export function getBilibiliFav(params: any) {
  return proxyRequest.get('https://api.bilibili.com/x/v3/fav/resource/list', {params})
}