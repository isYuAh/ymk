<script setup lang="ts">
defineProps(['text'])

</script>

<template>
<div class="TooltipContainer">
  <div class="tooltipText">{{text}}</div>
  <slot></slot>
</div>
</template>

<style scoped>
.TooltipContainer {
  position: relative;
}
.TooltipContainer:hover .tooltipText {
  display: inline-block;
}
.tooltipText {
  display: none;
  font-family: PingFang SC;
  position: absolute;
  right: 0;
  width: 74px;
  bottom: 4px;
  background-color: rgba(0, 0, 0);
  padding: 2px 5px;
  line-height: 20px;
  color: #fff;
  z-index: 1;
}
</style>