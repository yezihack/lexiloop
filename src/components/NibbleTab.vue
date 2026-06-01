<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useStore } from '../store.js';
import { speakRepeat, cancelSpeak } from '../speak.js';

const store = useStore();

const orderedWords = computed(() => {
  const ord = store.orderArray;
  return ord ? ord.map(i => store.words[i]) : store.words;
});

const learnedSet = computed(() => {
  const s = new Set();
  for (const k of Object.keys(store.progress.views)) {
    if (store.progress.views[k] > 0) s.add(k);
  }
  return s;
});

// 锁定批次：消失一个就少一个，全部消失后才重新填满
const batch = ref([]);
const fadingOut = ref(new Set());
const shownMeanings = ref({});
const showFw = ref(false);
const fwParticles = ref([]);

function fillBatch() {
  const all = orderedWords.value;
  const start = store.progress.chunkStart || 0;
  const out = [];
  for (let i = start; i < all.length && out.length < store.chunkSize; i++) {
    if (!learnedSet.value.has(all[i].w)) out.push(all[i]);
  }
  batch.value = out;
}

function eat(item) {
  if (fadingOut.value.has(item.w)) return;
  shownMeanings.value[item.w] = true;

  speakRepeat({
    word: item.w,
    meaning: item.m,
    times: store.brainwash ? 3 : 1,
    rate: store.rate,
    speakMode: 'enzh',
    brainwash: store.brainwash,
    zhReadAll: store.zhReadAll,
    accent: store.accent,
  });

  const delay = Math.max(0, store.nibbleDelay || 0);
  setTimeout(() => {
    fadingOut.value.add(item.w);
    fadingOut.value = new Set(fadingOut.value);

    setTimeout(() => {
      store.bumpView(item.w);
      fadingOut.value.delete(item.w);
      delete shownMeanings.value[item.w];
      // 从锁定批次中移除该词，不补充
      batch.value = batch.value.filter(it => it.w !== item.w);
      if (batch.value.length === 0) onBatchCleared();
    }, 1100);
  }, delay);
}

function onBatchCleared() {
  bigFirework();
  // 烟花结束后再补满下一批
  setTimeout(fillBatch, 1500);
}

function bigFirework() {
  const colors = ['#ff4757','#ffa502','#2ed573','#1e90ff','#a855f7','#ff6b81','#ffd700','#3ec8b3'];
  const arr = [];
  const N = 60;
  for (let i = 0; i < N; i++) {
    const angle = (i / N) * Math.PI * 2 + Math.random() * 0.2;
    const dist = 120 + Math.random() * 140;
    arr.push({
      dx: Math.cos(angle) * dist + 'px',
      dy: Math.sin(angle) * dist + 'px',
      color: colors[i % colors.length]
    });
  }
  fwParticles.value = arr;
  showFw.value = true;
  setTimeout(() => { showFw.value = false; }, 1400);
}

function loadNext() {
  const all = orderedWords.value;
  let i = store.progress.chunkStart || 0;
  let count = 0;
  while (i < all.length && count < store.chunkSize) {
    if (!learnedSet.value.has(all[i].w)) count++;
    i++;
  }
  store.progress.chunkStart = i;
  store.persist();
  fillBatch();
}

function resetChunk() {
  store.progress.chunkStart = 0;
  store.persist();
  fillBatch();
}

const totalLearned = computed(() => learnedSet.value.size);
const allDone = computed(() => totalLearned.value >= store.words.length);

onMounted(fillBatch);
watch(orderedWords, fillBatch);

onBeforeUnmount(cancelSpeak);
</script>

<template>
  <div class="nibble-bar">
    <span class="nibble-stat">
      本批 <b>{{ batch.length }}</b> 词 · 已学 <b>{{ totalLearned }}</b> / {{ store.words.length }}
    </span>
    <label class="nibble-size">
      批量
      <input type="number" min="1" max="200" step="1" v-model.number="store.chunkSize" @change="store.persist()" />
    </label>
    <button class="speak-btn" @click="loadNext" :disabled="allDone">下一批</button>
    <button class="btn-text" @click="resetChunk">重置位置</button>
  </div>

  <div v-if="!batch.length && !allDone" class="loading">本批已消灭，正在加载下一批…</div>
  <div v-else-if="allDone" class="loading">🎉 全本词书已学完</div>

  <div class="nibble-grid">
    <div
      v-for="it in batch"
      :key="it.w"
      class="nibble-card"
      :class="{ revealed: shownMeanings[it.w], fading: fadingOut.has(it.w) }"
      @click="eat(it)"
    >
      <div class="nibble-word">{{ it.w }}</div>
      <div class="nibble-phon" v-if="store.accent === 'uk' ? (it.uk || it.us) : (it.us || it.uk)">
        /{{ store.accent === 'uk' ? (it.uk || it.us) : (it.us || it.uk) }}/
      </div>
      <div class="nibble-mean" v-if="shownMeanings[it.w]">{{ it.m }}</div>
    </div>
  </div>

  <div v-if="showFw" class="firework big">
    <div
      v-for="(p, i) in fwParticles"
      :key="i"
      class="particle"
      :style="{ '--dx': p.dx, '--dy': p.dy, background: p.color }"
    ></div>
  </div>
</template>
