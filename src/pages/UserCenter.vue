<script setup lang="ts">
import NeteaseUser from "@/components/Login/NeteaseUser.vue";
import KugouUser from "@/components/Login/KugouUser.vue";
import BilibiliUser from "@/components/Login/BilibiliUser.vue";


</script>

<template>
<div class="UserCenterContainer">
  <NeteaseUser />
  <KugouUser />
  <BilibiliUser />
</div>
</template>

<style scoped>
.UserCenterContainer {
  overflow-y: auto;
  width: 100%;
  height: 100%;
  color: var(--ymk-text-color);
}

:deep(.userContainer) {
  & {
    padding: 20px;
    background-color: rgba(255, 255, 255, .7);
    backdrop-filter: blur(4px);
    margin: 20px;
    border-radius: 16px;
    box-shadow: 0 0 5px rgba(255, 255, 255, 1);
  }
  & .title {
    color: #000;
    font-size: 32px;
    margin-bottom: 18px;
    font-weight: bold;
  }
  & .unloginTab {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  & .loginBtn {
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
  & .loginBtn:after {
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
  & .loginBtn:hover::after {
    border: 1px solid #000;
    width: 50%;
    border-right: 0;
  }
  & .loginBtn:before {
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
  & .loginBtn:hover::before {
    border: 1px solid #000;
    border-left: 0;
    width: 50%;
  }
}
</style>