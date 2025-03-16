<script setup lang="ts">
import {onUnmounted, ref, watch} from "vue";
import QRCode from 'qrcode'
import {showMessage} from "@/utils/message";
import {useUserStore} from "@/stores/modules/user";
import { proxyRequest } from "@/utils/proxyRequest";

const phase = defineModel('phase', {type: String})
let qrimgEl = ref<HTMLImageElement>();
let key = ''
let qrstatus = ref('获取中')
let cookies = <string[]>[]
const user = useUserStore()
let timer = (-1 as any);
async function checkQRCodeStatus() {
  const status = await proxyRequest.get('https://passport.bilibili.com/x/passport-login/web/qrcode/poll', {
    params: {
      qrcode_key: key
    }
  })
  console.log('@checkQRCodeStatus', status.data)
  if (status.data.code === 0) {
    const qrStatusCode = status.data.data;
    if (qrStatusCode.code === 86101) {
      qrstatus.value = '等待扫码';
    }else if (qrStatusCode.code === 86090) {
      qrstatus.value = '待确认';
    }else if (qrStatusCode.code === 0) {
      qrstatus.value = '授权登录成功';
      clearInterval(timer);
      console.log(JSON.parse(status.headers['x-set-cookies']))
      cookies = JSON.parse(status.headers['x-set-cookies'])
      checkStatus();
    }else if (qrStatusCode.code === 86038) {
      clearInterval(timer);
      showMessage(`二维码过期，已自动刷新`);
      getQRCode();
    }
  }
}
function getQRCode() {
  proxyRequest.get('https://passport.bilibili.com/x/passport-login/web/qrcode/generate').then(async res => {
    console.log('@getQRCode', res.data)
    if ('data' in res.data && res.data.code === 0) {
      const data = res.data.data;
      key = data.qrcode_key;
      qrimgEl.value!.src = await QRCode.toDataURL(data.url);
      qrstatus.value = '等待扫码';
      timer = setInterval(checkQRCodeStatus, 3000)
    }
  })
}
function checkStatus(refresh: boolean = false) {
  proxyRequest.get('https://api.bilibili.com/x/web-interface/nav',{
    headers: {
      Cookie: cookies.join(';')
    }
  }).then(res => {
    console.log('$checkStatus-bilibili', res.data)
    if (res.data.code === 0) {
      const mid = res.data.data.mid;
      proxyRequest.get('https://api.bilibili.com/x/space/wbi/acc/info', {
        headers: {
          Cookie: cookies.join(';') + ";buvid3=1"
        },
        params: {
          mid,
        }
      }).then((res) => {
        console.log('$checkStatus-bilibili-2', res.data)
        if (res.data.code === 0) {
          const data = res.data.data;
          user.$patch({
            bilibiliUser: {
              nickname: data.name,
              avatarUrl: data.face,
              uid: data.mid,
              vipType: data.vip.type,
              signature: data.sign,
              auth: cookies
            }
          })
          phase.value = 'logined';
        }else {
          showMessage(`获取信息失败`);
        }
      })
    }else {
      showMessage(`获取信息失败`);
    }
  })
}

onUnmounted(() => {
  clearInterval(timer)
})

defineExpose({
  checkStatus
})

watch(phase, (nv) => {
  if (nv && nv === 'logining') {
    getQRCode();
  }
})
</script>

<template>
  <div class="unloginContainer">
    <div class="text">请扫码登陆</div>
    <img class="qrimgEl" referrerpolicy='no-referrer' ref="qrimgEl" src="" alt="">
    <div class="text">{{ qrstatus }}</div>
  </div>
</template>

<style scoped>
.unloginContainer {
  color: #000;
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
.qrimgEl {
  max-width: 180px;
}
</style>