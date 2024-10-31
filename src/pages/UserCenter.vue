<script setup lang="ts">
import NeteaseUser from "@/components/Login/NeteaseUser.vue";
import KugouUser from "@/components/Login/KugouUser.vue";


</script>

<template>
<div class="UserCenterContainer">
  <NeteaseUser />
  <KugouUser />
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