<script setup lang="ts">
import {onUnmounted, ref, watch} from "vue";
import {useZKStore} from "@/stores/useZKstore";
import {storeToRefs} from "pinia";
import {kugouAxios} from "@/utils/axiosInstances";
import {showMessage} from "@/utils/message";
import {useUserStore} from "@/stores/modules/user";

const phase = defineModel('phase', {type: String})
let qrimgEl = ref<HTMLImageElement>();
let key = ''
let qrstatus = ref('获取中')
const user = useUserStore()
let timer = (-1 as any);
async function checkQRCodeStatus() {
  const status = await kugouAxios.get('/login/qr/check', {
    params: {key,timestamp: Date.now()}
  })
  console.log('@checkQRCodeStatus', status.data)
  if (status.data.status === 1) {
    const qrStatusCode = status.data.data.status;
    if (qrStatusCode === 1) {
      qrstatus.value = '等待扫码';
    }else if (qrStatusCode === 2) {
      qrstatus.value = '待确认';key
    }else if (qrStatusCode === 4) {
      qrstatus.value = '授权登录成功';
      clearInterval(timer);
      Object.assign(user.kugouUser, {
        auth: status.data.data.token,
        uid: status.data.data.userid
      })
      checkStatus();
    }else if (qrStatusCode === 0) {
      clearInterval(timer);
      showMessage(`二维码过期，已自动刷新`);
      getQRCode();
    }
  }
}
function getQRCode() {
  kugouAxios.post('/login/qr/key', {
    timestamp: Date.now(),
  }).then(res => {
    console.log('@getQRCode', res.data)
    if ('data' in res.data && res.data.status === 1) {
      const data = res.data.data;
      key = data.qrcode;
      console.log(qrimgEl.value, data)
      if (qrimgEl.value) {
        qrimgEl.value.src = data.qrcode_img;
      }
      qrstatus.value = '等待扫码';
      timer = setInterval(checkQRCodeStatus, 3000)
    }
  })
}
function checkStatus(refresh: boolean = false) {
  kugouAxios.post('/user/detail', {
    token: user.kugouUser.auth,
    userid: user.kugouUser.uid,
  }).then(res => {
    console.log('$checkStatus-kugou', res.data)
    if (res.data.status === 1) {
      Object.assign(user.kugouUser, {
        avatarUrl: res.data.data.pic,
        nickname: res.data.data.nickname,
        signature: res.data.data.descri,
        vipType: res.data.data.vip_type,
      })
      phase.value = 'logined';
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
    <img class="qrimgEl" ref="qrimgEl" src="" alt="">
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