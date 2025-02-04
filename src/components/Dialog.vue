<template>
  <Transition name="uianim" @after-leave="onDestroy">
    <div v-show="visible" class="dialogMask">
      <div class="dialogContainer">
        <component :closeDialog="handleClose" :is="component" :data="data" />
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import {defineProps, defineEmits, onMounted, ref} from 'vue'

const props = defineProps<{
  component: object, // 动态组件
  data: any, // 动态组件的 props
}>()
const visible = ref(false);

const emit = defineEmits(['close', 'destroy'])
onMounted(() => {
  visible.value = true;
})
// 关闭对话框
const handleClose = () => {
  emit('close')
}

// 销毁对话框
const onDestroy = () => {
  emit('destroy')
}
</script>

<style scoped>
.dialogMask {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 105;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.4);
}
/*
.dialogContainer {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
*/
</style>