<script setup>
import { ref, computed, nextTick, onBeforeUnmount } from 'vue';
import { useStore } from '../store.js';
import { speakRepeat, cancelSpeak } from '../speak.js';

const store = useStore();
const playing = ref(false);
let seq = 0;

// 按当前 order 排序后的词表
const orderedWords = computed(() => {
  const ord = store.orderArray;
  return ord ? ord.map(i => store.words[i]) : store.words;
});

const maxView = computed(() => Math.max(1, ...store.words.map(w => store.progress.views[w.w] || 0)));

function rowBg(w) {
  const n = store.progress.views[w.w] || 0;
  return `rgba(43,108,176,${(n / maxView.value * 0.55).toFixed(3)})`;
}
function viewCount(w) {
  return store.progress.views[w.w] || 0;
}

function startFrom(i) {
  store.setListIdx(i);
  if (!playing.value) {
    playing.value = true;
  }
  seq++;
  loop(seq);
}

function loop(mySeq) {
  if (mySeq !== seq || !playing.value) return;
  const it = orderedWords.value[store.progress.listIdx];
  if (!it) { stop(); return; }
  store.bumpView(it.w);
  nextTick(scrollToCurrent);
  speakRepeat({
    word: it.w,
    meaning: it.m,
    times: store.brainwash ? 3 : 1,
    rate: store.rate,
    speakMode: store.speakMode,
    brainwash: store.brainwash,
    zhReadAll: store.zhReadAll,
    accent: store.accent,
    onfinish: () => {
      if (mySeq !== seq || !playing.value) return;
      if (store.progress.listIdx >= orderedWords.value.length - 1) { stop(); return; }
      store.setListIdx(store.progress.listIdx + 1);
      setTimeout(() => loop(mySeq), 200);
    }
  });
}

function toggle() {
  if (playing.value) stop();
  else {
    playing.value = true;
    seq++;
    loop(seq);
  }
}

function stop() {
  playing.value = false;
  seq++;
  cancelSpeak();
}

function scrollToCurrent() {
  const el = document.querySelector(`.word-row[data-i="${store.progress.listIdx}"]`);
  if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

const nowText = computed(() => {
  const it = orderedWords.value[store.progress.listIdx];
  if (!it) return '点击下方任意单词开始播放';
  return playing.value
    ? `正在朗读：${it.w} · ${it.m}`
    : `就绪：${it.w} · ${it.m}`;
});

onBeforeUnmount(stop);
</script>

<template>
  <div class="list-bar">
    <button class="speak-btn" :class="{active: playing}" @click="toggle">
      {{ playing ? '⏸' : '▶' }} <span>{{ playing ? '暂停' : '开始' }}</span>
    </button>
    <select v-model="store.listDisplay" class="card-display-sel" @change="store.persist()">
      <option value="both">双显示</option>
      <option value="en">只英文</option>
      <option value="zh">只中文</option>
    </select>
    <span class="list-now">{{ nowText }}</span>
  </div>
  <div class="word-list">
    <div
      v-for="(w, i) in orderedWords"
      :key="w.id"
      :data-i="i"
      class="word-row"
      :class="{playing: playing && i === store.progress.listIdx}"
      :style="{ background: rowBg(w) }"
      @click="startFrom(i)"
    >
      <span v-if="store.listDisplay !== 'zh'" class="w">{{ w.w }}<small>×{{ viewCount(w) }}</small></span>
      <span v-else class="w">{{ w.m }}<small>×{{ viewCount(w) }}</small></span>
      <span v-if="store.listDisplay === 'both'" class="m">{{ w.m }}</span>
    </div>
  </div>
</template>
