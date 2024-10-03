<script setup lang="ts">
import simplebar from "simplebar-vue";
import 'simplebar-vue/dist/simplebar.min.css'
import {ref} from "vue";
import {useZKStore} from "@/stores/useZKstore";
import {storeToRefs} from "pinia";
import PickColors from 'vue-pick-colors'
const {zks, config, colors} = storeToRefs(useZKStore());

let apiConfig = ref({
  neteaseUrl: config.value.neteaseApi.url,
  qqUrl: config.value.qqApi.url,
})
function saveApiConfig () {
  config.value.neteaseApi.url = apiConfig.value.neteaseUrl;
  config.value.qqApi.url = apiConfig.value.qqUrl;
  useZKStore().showMessage('保存成功')
}
function saveColorsConfig () {
  useZKStore().saveColors();
  useZKStore().showMessage('保存成功')
}
</script>

<template>
<div class="SettingsContainer">
  <simplebar class="simplebar">
    <div class="SettingsPane css1">
      <div class="title">API</div>
      <div class="content">
        <div class="apiInput">
          <div class="label">网易云</div>
          <input class="input" v-model="apiConfig.neteaseUrl" type="text" />
        </div>
        <div class="apiInput">
          <div class="label">QQ</div>
          <input class="input" v-model="apiConfig.qqUrl" type="text" />
        </div>
        <div class="controlBtns">
          <div @click="saveApiConfig" class="controlBtn">保存</div>
        </div>
      </div>
    </div>
    <div class="SettingsPane">
      <div class="title">颜色</div>
      <div class="content">
        <div class="colorsSetter">
          <div v-for="(_, k) in colors" class="colorInput">
            <div class="label">{{k}}</div>
            <PickColors style="vertical-align: top" show-alpha format="rgb" :format-options="['rgb', 'hex']" v-model:value="colors[k]" />
          </div>
        </div>
        <div class="controlBtns">
          <div @click="saveColorsConfig" class="controlBtn">保存</div>
        </div>
      </div>
    </div>
  </simplebar>
</div>
</template>

<style scoped>
.simplebar {
  width: 100%;
  height: 100%;
}
.SettingsContainer {
  width: 100%;
  height: 100%;
  padding: 10px 20px;
}
.SettingsPane {
  margin: 10px;
}
.SettingsPane > .title {
  font-family: SourceSansCNM;
  font-size: 28px;
  color: var(--ymk-text-color);
}
.SettingsPane > .content {
  padding-top: 10px;
  padding-left: 20px;
  color: var(--ymk-color);
}
.apiInput {
  margin: 10px 0;
  display: flex;
}
.apiInput .label {
  width: 70px;
  margin-right: 10px;
}
.colorInput .label {
  width: auto;
}
.apiInput .label, .apiInput .input {
  display: inline-block;
  height: 35px;
  line-height: 35px;
  font-size: 16px;
  font-family: SourceSansCNM;
  color: var(--ymk-text-color);
}
.colorInput .label, .colorInput .input {
  display: inline-block;
  height: 35px;
  line-height: 35px;
  font-size: 16px;
  font-family: SourceSansCNM;
}
input {
  background-color: rgba(0,0,0,.3);
}
.apiInput .input {
  flex: 1;
  border: 1px solid #18191C;
  padding:0 10px;
}
.controlBtn {
  cursor: pointer;
  background-color: rgba(0,0,0,0.8);
  border-radius: 16px;
  display: inline-block;
  color: #fff;
  padding: 0 15px;
  height: 35px;
  line-height: 35px;
}
.colorsSetter {
  display: grid;
  grid-gap: 10px;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
}
</style>