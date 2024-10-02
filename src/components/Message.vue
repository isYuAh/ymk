<template>
<div class="messageContainer">
    <Transition name="message">
        <div v-show="zks.message.show && zks.message.text" class="message">
            <div class="text">{{ zks.message.text }}</div>
        </div>
    </Transition>
</div>
</template>

<script setup lang='ts'>
import { useZKStore } from '@/stores/useZKstore'
import '@/assets/anim.css'
import {storeToRefs} from "pinia";
const {zks} = storeToRefs(useZKStore());
</script>

<style scoped>
.messageContainer {
    pointer-events: none;
    position: fixed;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    bottom: 20px;
    z-index: 102;
}
.messageContainer .message {
    max-width: 60%;
    border-radius: 6px;
    background-color: rgba(0, 0, 0, .8);
    padding: 5px 10px;
    max-height: 90px;
    overflow: hidden;
}
.messageContainer .message .text {
    font-size: 16px;
    color: #fff;
    line-height: 20px;
}
</style>