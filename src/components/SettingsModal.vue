<script setup>
import { useStore } from '../store.js';

const emit = defineEmits(['close', 'openSponsor']);
const store = useStore();

function setOrder(v) { store.setOrder(v); }
function reshuffle() { store.reshuffle(); }
function reset() {
  if (!confirm('确定清空当前词书的学习记录？此操作不可恢复。')) return;
  store.resetCurrentBook();
  emit('close');
}
function onMaskClick(e) {
  if (e.target.classList.contains('modal-mask')) emit('close');
}
function onChange() { store.persist(); }
function openSponsor() {
  emit('close');
  emit('openSponsor');
}
</script>

<template>
  <div class="modal-mask" @click="onMaskClick">
    <div class="modal">
      <h2>设置</h2>
      <div class="row">
        <label>主题</label>
        <div class="seg">
          <button :class="{on: store.theme === 'auto'}" @click="store.theme = 'auto'; onChange()">跟随系统</button>
          <button :class="{on: store.theme === 'light'}" @click="store.theme = 'light'; onChange()">浅色</button>
          <button :class="{on: store.theme === 'dark'}" @click="store.theme = 'dark'; onChange()">深色</button>
        </div>
      </div>
      <div class="row">
        <label>顺序</label>
        <div class="seg">
          <button :class="{on: store.order === 'seq'}" @click="setOrder('seq')">顺序</button>
          <button :class="{on: store.order === 'rand'}" @click="setOrder('rand')">随机</button>
        </div>
        <button class="btn-text" @click="reshuffle" title="重新生成随机顺序">重置随机</button>
      </div>
      <div class="row">
        <label>发音口音</label>
        <div class="seg">
          <button :class="{on: store.accent === 'us'}" @click="store.accent = 'us'; onChange()">美音</button>
          <button :class="{on: store.accent === 'uk'}" @click="store.accent = 'uk'; onChange()">英音</button>
        </div>
      </div>
      <div class="row">
        <label>语速</label>
        <input type="range" min="0.5" max="1.5" step="0.1" v-model.number="store.rate" @change="onChange">
        <span class="val">{{ store.rate.toFixed(1) }}</span>
      </div>
      <div class="row">
        <label>蚕食速度</label>
        <input type="range" min="0" max="6000" step="100" v-model.number="store.nibbleDelay" @change="onChange">
        <span class="val">{{ (store.nibbleDelay / 1000).toFixed(3) }}s</span>
      </div>
      <div class="row">
        <label>自动发音</label>
        <label class="switch">
          <input type="checkbox" v-model="store.autoSpeak" @change="onChange">
          <span></span>
        </label>
      </div>
      <div class="row">
        <label>中文朗读</label>
        <div class="seg">
          <button :class="{on: !store.zhReadAll}" @click="store.zhReadAll = false; onChange()">第一个意思</button>
          <button :class="{on: store.zhReadAll}" @click="store.zhReadAll = true; onChange()">所有意思</button>
        </div>
      </div>
      <div class="modal-actions">
        <button v-if="store.currentBook != null" class="btn-text danger" @click="reset">清空学习记录</button>
        <button class="btn-text sponsor" @click="openSponsor">💖 赞助支持</button>
        <button class="btn-text" @click="emit('close')">关闭</button>
      </div>
    </div>
  </div>
</template>
