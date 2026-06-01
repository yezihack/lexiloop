<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useStore } from '../store.js';
import { speakRepeat, cancelSpeak } from '../speak.js';

const store = useStore();

const flipped = ref(false);
const speaking = ref(false);
const playing = ref(false);

const word = computed(() => store.currentWord);
const seen = computed(() => word.value ? (store.progress.views[word.value.w] || 0) : 0);

const phonetic = computed(() => {
  if (!word.value) return '';
  return store.accent === 'uk' ? (word.value.uk || word.value.us) : (word.value.us || word.value.uk);
});

const cardProgress = computed(() => {
  if (store.words.length === 0) return 0;
  return ((store.progress.idx + 1) / store.words.length) * 100;
});

const front = computed(() => {
  if (!word.value) return { main: '—', sub: '' };
  const d = store.cardDisplay;
  if (d === 'zh') return { main: word.value.m, sub: '' };
  return { main: word.value.w, sub: phonetic.value };
});
const back = computed(() => {
  if (!word.value) return { main: '—', sub: '', phon: '' };
  const d = store.cardDisplay;
  if (d === 'zh') return { main: word.value.w, sub: '', phon: phonetic.value };
  if (d === 'en') return { main: word.value.w, sub: word.value.m, phon: '' };
  return { main: word.value.w, sub: word.value.m, phon: phonetic.value };
});

function flipCard() { flipped.value = !flipped.value; }

function speak() {
  if (!word.value) return;
  speaking.value = true;
  speakRepeat({
    word: word.value.w,
    meaning: word.value.m,
    times: store.brainwash ? 3 : 1,
    rate: store.rate,
    speakMode: store.speakMode,
    brainwash: store.brainwash,
    zhReadAll: store.zhReadAll,
    accent: store.accent,
    onfinish: () => {
      speaking.value = false;
      if (playing.value && store.autoNext && store.studyTab === 'card' && store.progress.idx < store.words.length - 1) {
        setTimeout(() => { if (playing.value) store.go(1); }, 300);
      }
    }
  });
}

function go(delta) {
  store.go(delta);
}

function toggleStart() {
  if (playing.value) {
    playing.value = false;
    cancelSpeak();
    speaking.value = false;
  } else {
    playing.value = true;
    speak();
  }
}

function onAutoNextChange() {
  if (store.autoNext && !store.autoSpeak) {
    store.autoSpeak = true;
  }
  store.persist();
}

// 切词：记录 view、复位翻面、自动朗读、双显示则默认翻到背面
watch(() => [store.progress.idx, store.currentBook, store.order], () => {
  if (!word.value) return;
  store.bumpView(word.value.w);
  flipped.value = store.cardDisplay === 'both';
  if (playing.value && store.autoSpeak) speak();
}, { immediate: true });

watch(() => store.cardDisplay, () => {
  flipped.value = store.cardDisplay === 'both';
});

// 滚轮换词
let wheelLock = false;
function onWheel(e) {
  if (store.studyTab !== 'card') return;
  if (Math.abs(e.deltaY) < 8) return;
  if (wheelLock) return;
  wheelLock = true;
  setTimeout(() => { wheelLock = false; }, 350);
  go(e.deltaY > 0 ? 1 : -1);
}

function onKey(e) {
  if (store.studyTab !== 'card') return;
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
  if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
  else if (e.key === ' ') { e.preventDefault(); flipCard(); }
  else if (e.key === 'Enter') speak();
}

onMounted(() => {
  window.addEventListener('wheel', onWheel, { passive: true });
  document.addEventListener('keydown', onKey);
});
onBeforeUnmount(() => {
  playing.value = false;
  window.removeEventListener('wheel', onWheel);
  document.removeEventListener('keydown', onKey);
  cancelSpeak();
});
</script>

<template>
  <div class="study-meta">
    <span class="progress-num">{{ store.progress.idx + 1 }} / {{ store.words.length }}</span>
    <span>·</span>
    <span class="seen-count">本词已看 <b>{{ seen }}</b> 次</span>
    <select v-model="store.cardDisplay" class="card-display-sel" @change="store.persist()">
      <option value="both">双显示</option>
      <option value="en">只单词</option>
      <option value="zh">只中文</option>
    </select>
    <label class="auto-next-check" title="朗读完自动下一个">
      <input type="checkbox" v-model="store.autoNext" @change="onAutoNextChange">
      <span>自动下一个</span>
    </label>
  </div>

  <div class="card-progress-bar">
    <div class="card-progress-fill" :style="{ width: cardProgress + '%' }"></div>
  </div>

  <div class="card-wrap">
    <div class="card" :class="{flipped}" @click="flipCard">
      <div class="card-face card-front">
        <span class="badge-times">{{ seen }}</span>
        <div class="word">{{ front.main }}</div>
        <div v-if="front.sub" class="phonetic">/{{ front.sub }}/</div>
        <div class="hint">点击 / 空格 翻面</div>
      </div>
      <div class="card-face card-back">
        <span class="badge-times">{{ seen }}</span>
        <div class="word">{{ back.main }}</div>
        <div v-if="back.phon" class="phonetic">/{{ back.phon }}/</div>
        <div v-if="back.sub" class="meaning">{{ back.sub }}</div>
      </div>
    </div>
  </div>

  <div class="controls">
    <button class="nav-btn" :disabled="store.progress.idx <= 0" @click="go(-1)" title="上一个 (←)">‹</button>
    <button class="speak-btn" :class="{active: playing}" @click="toggleStart">
      {{ playing ? '⏸' : '▶' }} <span>{{ playing ? '暂停' : '开始' }}</span>
    </button>
    <button class="speak-btn" :class="{active: speaking}" @click="speak">🔊 <span>朗读</span></button>
    <button class="nav-btn" :disabled="store.progress.idx >= store.words.length - 1" @click="go(1)" title="下一个 (→)">›</button>
  </div>

  <div class="scroll-hint">
    <span class="mouse" aria-hidden="true"></span>
    滚动鼠标滚轮，或按 → 切换下一张
  </div>
</template>
