<script setup lang="ts">
import {storeToRefs} from "pinia";
import {useZKStore} from "@/stores/useZKstore";
import {ref} from "vue";
import NeteaseQR from "@/components/Login/NeteaseQR.vue";
import UserInfo from "@/components/Login/UserInfo.vue";
import axios from "axios";

const {neteaseUser, config} = storeToRefs(useZKStore());
const qrComponent = ref()
const phase = ref(neteaseUser.value.auth && neteaseUser.value.auth !== '' ? 'logined' : 'unlogin');

function refreshStatus() {
  if (!qrComponent.value) return;
  qrComponent.value.checkStatus(false);
}
function logout() {
  axios.post(config.value.neteaseApi.url + 'logout', {
    cookie: neteaseUser.value.auth
  }).finally(() => {
    phase.value = 'unlogin'
    neteaseUser.value.nickname = '';
    neteaseUser.value.avatarUrl = '';
    neteaseUser.value.auth = '';
    neteaseUser.value.uid = 0;
    neteaseUser.value.vipType = 0;
  })
}
defineExpose({
  refreshStatus,
})
</script>

<template>
  <div class="userContainer">
    <div class="title">网易云</div>
    <div class="tab unloginTab" v-if="phase === 'unlogin'">
      <button class="loginBtn" @click="phase = 'logining'">登录</button>
    </div>
    <NeteaseQR
        ref="qrComponent"
        v-show="phase === 'logining'"
        v-model:phase="phase"></NeteaseQR>
    <UserInfo
        :user="neteaseUser"
        @refreshStatus="refreshStatus"
        @logout="logout"
        v-if="phase === 'logined'"
        v-model:phase="phase"></UserInfo>
  </div>
</template>

<style scoped>
.userContainer {
  padding: 20px;
  background-color: rgba(255, 255, 255, .8);
  margin: 20px;
  border-radius: 16px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
}
.title {
  color: #000;
  font-size: 32px;
  margin-bottom: 18px;
  font-weight: bold;
}
.unloginTab {
  display: flex;
  align-items: center;
  justify-content: center;
}
.loginBtn {
  color: #000;
  display: flex;
  justify-content: center;
  align-items: center;
  outline: 0;
  background-color: transparent;
  border: 0;
  font-weight: bold;
  height: 45px;
  width: 90px;
  font-size: 20px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all .25s;
}
.loginBtn:after {
  box-sizing: border-box;
  border: 1px solid transparent;
  content: "";
  position: absolute;
  height: 100%;
  width: 0;
  top: 0;
  left: 0;
  transition: all .25s;
  border-right: 0;
}
.loginBtn:hover::after {
  border: 1px solid #000;
  width: 50%;
  border-right: 0;
}
.loginBtn:before {
  box-sizing: border-box;
  border: 1px solid transparent;
  content: "";
  position: absolute;
  height: 100%;
  width: 0;
  top: 0;
  right: 0;
  transition: all .25s;
  border-left: 0;
}
.loginBtn:hover::before {
  border: 1px solid #000;
  border-left: 0;
  width: 50%;
}
</style>