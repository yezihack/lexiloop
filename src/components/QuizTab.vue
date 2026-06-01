<script setup>
import { ref, computed, onBeforeUnmount } from 'vue';
import { useStore } from '../store.js';
import { speakEnglishOnce, cancelSpeak } from '../speak.js';

const store = useStore();

const started = ref(false);
const mistakesOpen = ref(false);
const answer = ref(null);
const enOptions = ref([]);
const zhOptions = ref([]);
const pickedEn = ref(null);
const pickedZh = ref(null);
const locked = ref(false);
const feedback = ref(null);    // { ok: bool, text: string }
const showFw = ref(false);
const fwParticles = ref([]);

// 错题节奏控制
const mistakeQueue = ref([]);          // 待复习错题词形数组（FIFO）
const newSinceLastMistake = ref(0);    // 自上次出错题以来出过的新题数
const nextMistakeAfter = ref(rollGap()); // 下次出错题需要等待的新题数（3~5）
const lastFromQueue = ref(false);      // 当前题是否取自队列

function rollGap() {
  return 3 + Math.floor(Math.random() * 3); // 3,4,5
}

const learned = computed(() =>
  store.words.filter(w =>
    (store.progress.views[w.w] || 0) > 0 && !(store.progress.passed || []).includes(w.w)
  )
);

const status = computed(() => {
  const passed = (store.progress.passed || []).length;
  const mistakeCount = Object.keys(store.progress.mistakes || {}).filter(
    k => store.progress.mistakes[k].wrong > 0
  ).length;
  return `已通过 ${passed} 词 · 错题 ${mistakeCount} 词`;
});

const mistakes = computed(() => {
  const m = store.progress.mistakes || {};
  return Object.entries(m)
    .filter(([, v]) => v.wrong > 0)
    .sort((a, b) => b[1].wrong - a[1].wrong)
    .map(([w, v]) => {
      const it = store.words.find(x => x.w === w);
      return { w, m: it ? it.m : '', wrong: v.wrong, correct: v.correct || 0 };
    });
});

function pickAnswer(pool) {
  // 队列里的错题不在新题池里出现，避免争抢
  const queued = new Set(mistakeQueue.value);
  const fresh = pool.filter(it => !queued.has(it.w));

  // 节奏到了，且队列有词，且队首词还在已学池中 → 出错题
  if (
    mistakeQueue.value.length > 0 &&
    newSinceLastMistake.value >= nextMistakeAfter.value
  ) {
    while (mistakeQueue.value.length > 0) {
      const w = mistakeQueue.value[0];
      const it = pool.find(x => x.w === w);
      if (it) {
        mistakeQueue.value.shift();
        lastFromQueue.value = true;
        return it;
      }
      // 队首词已不在已学池（被清进度等），丢弃继续看下一个
      mistakeQueue.value.shift();
    }
  }

  // 出新题
  lastFromQueue.value = false;
  const candidates = fresh.length > 0 ? fresh : pool;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function nextQuestion() {
  const pool = learned.value;
  if (pool.length < 3) {
    started.value = false;
    return;
  }
  // 首次开始考试：把已有错题本灌入队列（打乱）
  if (!started.value) {
    const existing = Object.keys(store.progress.mistakes || {})
      .filter(k => store.progress.mistakes[k].wrong > 0);
    existing.sort(() => Math.random() - 0.5);
    mistakeQueue.value = existing;
    newSinceLastMistake.value = 0;
    nextMistakeAfter.value = rollGap();
    lastFromQueue.value = false;
  }
  started.value = true;
  feedback.value = null;
  pickedEn.value = null;
  pickedZh.value = null;
  locked.value = false;

  answer.value = pickAnswer(pool);

  // 出干扰项：从已学池中（含队列错题）随机选两个不同的
  const others = pool.filter(it => it.w !== answer.value.w);
  const distractors = [];
  while (distractors.length < 2 && others.length > 0) {
    const idx = Math.floor(Math.random() * others.length);
    distractors.push(others.splice(idx, 1)[0]);
  }
  const all = [answer.value, ...distractors];
  enOptions.value = [...all].sort(() => Math.random() - 0.5);
  zhOptions.value = [...all].sort(() => Math.random() - 0.5);

  cancelSpeak();
  speakEnglishOnce(answer.value.w, store.rate, () => {}, store.accent);
}

function selectEn(it) {
  if (locked.value) return;
  pickedEn.value = it;
  check();
}
function selectZh(it) {
  if (locked.value) return;
  pickedZh.value = it;
  check();
}

function optClass(opt, picked) {
  if (!locked.value) return picked && picked.w === opt.w ? 'selected' : '';
  if (opt.w === answer.value.w) return 'correct';
  if (picked && picked.w === opt.w) return 'wrong';
  return '';
}

function check() {
  if (!pickedEn.value || !pickedZh.value) return;
  locked.value = true;
  const ok = pickedEn.value.w === answer.value.w && pickedZh.value.w === answer.value.w;
  const wasFromQueue = lastFromQueue.value;

  if (ok) {
    store.recordMistake(answer.value.w, true);
    const isFirstPass = store.addPassed(answer.value.w);
    if (isFirstPass) {
      feedback.value = { ok: true, text: '🎉 通过！' };
      fireworks();
    } else {
      feedback.value = { ok: true, text: '✓ 正确' };
    }
  } else {
    store.recordMistake(answer.value.w, false);
    feedback.value = { ok: false, text: '✗ 错误 · 已加入错题本' };
    // 答错入队尾，避免重复入队
    if (!mistakeQueue.value.includes(answer.value.w)) {
      mistakeQueue.value.push(answer.value.w);
    }
  }

  // 节奏：刚出过错题 → 重置计数器并随机新间隔；新题 → 计数 +1
  if (wasFromQueue) {
    newSinceLastMistake.value = 0;
    nextMistakeAfter.value = rollGap();
  } else {
    newSinceLastMistake.value += 1;
  }

  setTimeout(nextQuestion, 1200);
}

function replay() {
  if (answer.value) speakEnglishOnce(answer.value.w, store.rate, () => {}, store.accent);
}

function fireworks() {
  const colors = ['#ff4757','#ffa502','#2ed573','#1e90ff','#a855f7','#ff6b81'];
  const arr = [];
  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2;
    const dist = 60 + Math.random() * 50;
    arr.push({
      dx: Math.cos(angle) * dist + 'px',
      dy: Math.sin(angle) * dist + 'px',
      color: colors[i % colors.length]
    });
  }
  fwParticles.value = arr;
  showFw.value = true;
  setTimeout(() => { showFw.value = false; }, 1000);
}

onBeforeUnmount(() => cancelSpeak());
</script>

<template>
  <div v-if="!started" class="quiz-area">
    <p v-if="learned.length < 3" class="quiz-prompt">可考单词不足 3 个，请先在卡片或列表中学习更多单词</p>
    <p v-else class="quiz-prompt">从已学单词中出题，点击开始</p>
    <button v-if="learned.length >= 3" class="speak-btn" @click="nextQuestion">▶ <span>开始考试</span></button>
  </div>

  <div v-else class="quiz-card">
    <div class="quiz-status">{{ status }}</div>
    <button class="speak-btn" @click="replay">🔊 <span>重听</span></button>
    <div class="quiz-columns">
      <div class="quiz-col">
        <button
          v-for="opt in enOptions"
          :key="'en-' + opt.w"
          class="quiz-opt"
          :class="optClass(opt, pickedEn)"
          @click="selectEn(opt)"
        >{{ opt.w }}</button>
      </div>
      <div class="quiz-col">
        <button
          v-for="opt in zhOptions"
          :key="'zh-' + opt.w"
          class="quiz-opt"
          :class="optClass(opt, pickedZh)"
          @click="selectZh(opt)"
        >{{ opt.m }}</button>
      </div>
    </div>
    <div v-if="feedback" class="quiz-feedback" :class="feedback.ok ? 'ok' : 'fail'">{{ feedback.text }}</div>
  </div>

  <div v-if="showFw" class="firework">
    <div
      v-for="(p, i) in fwParticles"
      :key="i"
      class="particle"
      :style="{ '--dx': p.dx, '--dy': p.dy, background: p.color }"
    ></div>
  </div>

  <p class="section-label mistakes-toggle" style="margin-top:20px" @click="mistakesOpen = !mistakesOpen" role="button" tabindex="0" @keydown.enter.space.prevent="mistakesOpen = !mistakesOpen">
    <span class="caret" :class="{ open: mistakesOpen }">▶</span>
    错题本 <span v-if="mistakes.length">({{ mistakes.length }})</span>
  </p>
  <div v-if="mistakesOpen" class="word-list">
    <div v-if="!mistakes.length" style="padding:12px 14px;font-size:13px;color:var(--text-3)">暂无错题</div>
    <div v-for="m in mistakes" :key="m.w" class="word-row">
      <span class="w">{{ m.w }}<small>错{{ m.wrong }} 对{{ m.correct }}</small></span>
      <span class="m">{{ m.m }}</span>
    </div>
  </div>
</template>
