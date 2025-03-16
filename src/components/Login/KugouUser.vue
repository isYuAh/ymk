<script setup lang="ts">
import {ref, useTemplateRef} from "vue";
import UserInfo from "@/components/Login/UserInfo.vue";
import KugouQR from "@/components/Login/KugouQR.vue";
import {useUserStore} from "@/stores/modules/user";

const user = useUserStore()
const qrComponent = useTemplateRef('qrComponent')
const phase = ref(user.kugouUser.auth && user.kugouUser.auth !== '' ? 'logined' : 'unlogin');

function refreshStatus() {
  if (!qrComponent.value) return;
  qrComponent.value.checkStatus(false);
}
function logout() {
  phase.value = 'unlogin'
  user.kugouUser.nickname = '';
  user.kugouUser.avatarUrl = '';
  user.kugouUser.auth = '';
  user.kugouUser.uid = 0;
  user.kugouUser.vipType = 0;
}
defineExpose({
  refreshStatus,
})
</script>

<template>
  <div class="userContainer">
    <div class="title">酷狗音乐</div>
    <div class="tab unloginTab" v-if="phase === 'unlogin'">
      <div class="loginBtn" @click="phase = 'logining'">登录</div>
    </div>
    <KugouQR
        ref="qrComponent"
        v-show="phase === 'logining'"
        v-model:phase="phase"></KugouQR>
    <UserInfo
        :user="user.kugouUser"
        @refreshStatus="refreshStatus"
        @logout="logout"
        v-if="phase === 'logined'"
        v-model:phase="phase"></UserInfo>
  </div>
</template>

<style scoped>
</style>