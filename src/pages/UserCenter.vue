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
</style>