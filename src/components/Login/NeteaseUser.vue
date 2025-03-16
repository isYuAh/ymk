<script setup lang="ts">
import {ref, useTemplateRef} from "vue";
import NeteaseQR from "@/components/Login/NeteaseQR.vue";
import UserInfo from "@/components/Login/UserInfo.vue";
import axios from "axios";
import {useUserStore} from "@/stores/modules/user";
import {useConfigStore} from "@/stores/modules/config";

const qrComponent = useTemplateRef('qrComponent')
const user = useUserStore()
const config = useConfigStore()
const phase = ref(user.neteaseUser.auth && user.neteaseUser.auth !== '' ? 'logined' : 'unlogin');
function refreshStatus() {
  if (!qrComponent.value) return;
  qrComponent.value.checkStatus(false);
}
function logout() {
  axios.post(config.api.neteaseApi.url + 'logout', {
    cookie: user.neteaseUser.auth
  }).finally(() => {
    phase.value = 'unlogin'
    user.neteaseUser.nickname = '';
    user.neteaseUser.avatarUrl = '';
    user.neteaseUser.auth = '';
    user.neteaseUser.uid = 0;
    user.neteaseUser.vipType = 0;
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
        :user="user.neteaseUser"
        @refreshStatus="refreshStatus"
        @logout="logout"
        v-if="phase === 'logined'"
        v-model:phase="phase"></UserInfo>
  </div>
</template>

<style scoped>
</style>