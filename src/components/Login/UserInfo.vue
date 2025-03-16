<script setup lang="ts">
import type {BilibiliUser, User} from "@/types/config";
const emit = defineEmits(['refreshStatus', 'logout'])

defineProps<{
  user: User | BilibiliUser
}>()
</script>

<template>
  <div class="loginedContainer">
    <div class="userInfo">
      <img :src="user.avatarUrl" class="avatar"  :alt="user.nickname"/>
      <div class="user">
        <div class="nickname">{{user.nickname}}</div>
        <div class="signature">{{user.signature}}</div>
      </div>
    </div>
    <button class="userCenterControlBtn logoutBtn" @click="emit('logout')">退出登录</button>
    <button class="userCenterControlBtn refreshBtn" @click="emit('refreshStatus')">刷新状态</button>
  </div>
</template>

<style scoped>
.loginedContainer {
  width: 100%;
  height: 100%;
}
.loginedContainer .userInfo {
  color: #000;
  display: grid;
  grid-template-columns: 128px 1fr;
  grid-template-rows: 128px 1fr;
  grid-column-gap: 40px;
}
.loginedContainer .userInfo .avatar {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
}
.loginedContainer .userInfo .nickname {
  margin-top: 10px;
  font-family: SourceSansCNM;
  font-size: 28px;
}
.loginedContainer .userInfo .signature {
  margin-left: 20px;
  margin-top: 15px;
  font-family: SourceSansCNM;
  font-size: 16px;
}
.userCenterControlBtn {
  cursor: pointer;
  margin-top: 20px;
  margin-right: 20px;
  padding: 7px 14px;
  border: none;
  color: var(--ymk-text-color);
  background-color: var(--ymk-text-shadow-color);
  transition: all .25s;
}
</style>