<script setup>
import { ref, computed } from 'vue';
import { useStore } from '../store.js';

const store = useStore();

const sortBy = ref('views'); // 'views' | 'wrong' | 'correct' | 'word'
const sortDir = ref('desc');

const learnedList = computed(() => {
  const list = [];
  const correctMap = store.progress.correct || {};
  for (const w of store.words) {
    const n = store.progress.views[w.w] || 0;
    if (n > 0) {
      const m = store.progress.mistakes[w.w];
      list.push({
        ...w,
        views: n,
        wrong: m ? m.wrong : 0,
        correct: correctMap[w.w] || 0
      });
    }
  }
  const dir = sortDir.value === 'asc' ? 1 : -1;
  list.sort((a, b) => {
    if (sortBy.value === 'word') return a.w.localeCompare(b.w) * dir;
    if (sortBy.value === 'wrong') return (a.wrong - b.wrong) * dir;
    if (sortBy.value === 'correct') return (a.correct - b.correct) * dir;
    return (a.views - b.views) * dir;
  });
  return list;
});

function setSort(key) {
  if (sortBy.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = key;
    sortDir.value = key === 'word' ? 'asc' : 'desc';
  }
}

function arrow(key) {
  if (sortBy.value !== key) return '';
  return sortDir.value === 'asc' ? '↑' : '↓';
}
</script>

<template>
  <p class="section-label">
    已学习
    <span style="color:var(--text-3); font-weight:400">（共 {{ learnedList.length }} 词，点击表头排序）</span>
  </p>
  <div class="word-list">
    <div class="learned-head">
      <span class="lh-w" :class="{ active: sortBy === 'word' }" @click="setSort('word')">单词 {{ arrow('word') }}</span>
      <span class="lh-m">释义</span>
      <span class="lh-n" :class="{ active: sortBy === 'views' }" @click="setSort('views')">学过 {{ arrow('views') }}</span>
      <span class="lh-n" :class="{ active: sortBy === 'correct' }" @click="setSort('correct')">通过 {{ arrow('correct') }}</span>
      <span class="lh-n" :class="{ active: sortBy === 'wrong' }" @click="setSort('wrong')">错误 {{ arrow('wrong') }}</span>
    </div>
    <div v-if="!learnedList.length" style="padding:12px 14px;font-size:13px;color:var(--text-3)">尚未学习任何单词</div>
    <div v-for="it in learnedList" :key="it.w" class="word-row learned-row">
      <span class="lh-w">{{ it.w }}</span>
      <span class="lh-m">{{ it.m }}</span>
      <span class="lh-n">{{ it.views }}</span>
      <span class="lh-n">{{ it.correct }}</span>
      <span class="lh-n">{{ it.wrong }}</span>
    </div>
  </div>
</template>
