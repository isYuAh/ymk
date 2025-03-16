<script setup lang="ts">
import {ref, useTemplateRef} from "vue";
import UserInfo from "@/components/Login/UserInfo.vue";
import {useUserStore} from "@/stores/modules/user";
import BilibiliQR from "./BilibiliQR.vue";

const user = useUserStore()
const qrComponent = useTemplateRef('qrComponent')
const phase = ref(user.isLogin.bilibili ? 'logined' : 'unlogin');

function refreshStatus() {
  if (!qrComponent.value) return;
  qrComponent.value.checkStatus(false);
}
function logout() {
  user.$patch({
    bilibiliUser: {
      nickname: '',
      avatarUrl: '',
      auth: [],
      uid: 0,
      signature: '',
      vipType: 0
    }
  })
  phase.value = 'unlogin'
}
defineExpose({
  refreshStatus,
})
</script>

<template>
  <div class="userContainer">
    <div class="title">哔哩哔哩</div>
    <div class="tab unloginTab" v-if="phase === 'unlogin'">
      <div class="loginBtn" @click="phase = 'logining'">登录</div>
    </div>
    <BilibiliQR
        ref="qrComponent"
        v-show="phase === 'logining'"
        v-model:phase="phase"></BilibiliQR>
    <UserInfo
        :user="user.bilibiliUser"
        @refreshStatus="refreshStatus"
        @logout="logout"
        v-if="phase === 'logined'"
        v-model:phase="phase"></UserInfo>
  </div>
</template>

<style scoped>
</style>