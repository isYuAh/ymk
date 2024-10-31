<script setup lang="ts">
import {onUnmounted, ref, watch} from "vue";
import axios, {type AxiosResponse} from "axios";
const phase = defineModel('phase', {type: String})
let key = ''
import {useZKStore} from "@/stores/useZKstore";
import {storeToRefs} from "pinia";
const {neteaseUser, config} = storeToRefs(useZKStore());
let qrimgEl = ref<HTMLImageElement>();
let qrstatus = ref('等待获取')
let timer = (-1 as any);
async function checkQRCodeStatus() {
  const status = await axios.get(config.value.neteaseApi.url + 'login/qr/check', {
    params: {
      timestamp: Date.now(),
      key: key,
    }
  });
  if (status.data.code === 800) {
    clearInterval(timer);
    useZKStore().showMessage(`二维码过期，已自动刷新`);
    getQRCode();
  }
  qrstatus.value = status.data.message;
  if (status.data.code === 803) {
    clearInterval(timer);
    useZKStore().showMessage(`${status.data.message}`);
    neteaseUser.value.auth = status.data.cookie;
    checkStatus(true);
  }
}
function getQRCode() {
  axios.post(config.value.neteaseApi.url + 'login/qr/key', {
    timestamp: Date.now(),
  }).then((res: AxiosResponse) => {
    if (res.data.data.code && res.data.data.code === 200) {
      key = res.data.data.unikey;
    }
  }).finally(() => {
    axios.post(config.value.neteaseApi.url + 'login/qr/create', {
      timestamp: Date.now(),
      key: key,
      qrimg: "true"
    }).then((res: AxiosResponse) => {
      console.log(res.data);
      if (qrimgEl.value) {
        res.data.data.qrimg && (qrimgEl.value.src = res.data.data.qrimg);
      }
      qrstatus.value = '等待扫码';
      timer = setInterval(checkQRCodeStatus, 3000)
    })
  })
}
function checkStatus(refresh: boolean = false) {
  axios.post(config.value.neteaseApi.url + `login/status?timestamp=${Date.now()}`, {
    cookie: neteaseUser.value.auth
  }).then((res: AxiosResponse) => {
    console.log('$login', res.data)
    if (res.data.data.account && res.data.data.account.status == 0 && res.data.data.profile) {
      neteaseUser.value.nickname = res.data.data.profile.nickname;
      neteaseUser.value.avatarUrl = res.data.data.profile.avatarUrl;
      neteaseUser.value.uid = res.data.data.profile.userId;
      neteaseUser.value.vipType = res.data.data.profile.vipType;
      neteaseUser.value.signature = res.data.data.profile.signature || '暂无简介';
      if (refresh) {
        useZKStore().playlistToolkit.refreshPlaylists({notReset: true});
      }
      phase.value = 'logined';
    }else {
      phase.value = 'unlogin'
      neteaseUser.value.nickname = '';
      neteaseUser.value.avatarUrl = '';
      neteaseUser.value.auth = '';
      neteaseUser.value.uid = 0;
      neteaseUser.value.vipType = 0;
    }
  });
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
    <img ref="qrimgEl" src="" alt="">
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
</style>