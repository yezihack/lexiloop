<script setup>
import { computed } from 'vue';
import { useStore } from '../store.js';

const store = useStore();

const stats = computed(() => {
  const m = {};
  for (const b of store.books) {
    const p = store.progressMap[b.bookid];
    const seen = p ? Object.keys(p.views).filter(k => p.views[k] > 0).length : 0;
    const passed = p ? (p.passed || []).length : 0;
    const totalViews = p ? p.totalViews : 0;
    m[b.bookid] = { seen, passed, totalViews, total: b.voccount };
  }
  return m;
});

function open(bookid) {
  store.openBook(bookid);
}
</script>

<template>
  <section class="shelf-grid">
    <div v-if="!store.books.length" class="loading">加载词书目录中…</div>
    <div
      v-for="b in store.books"
      :key="b.bookid"
      class="book"
      @click="open(b.bookid)"
    >
      <div class="book-cover" :class="'c' + b.bookid">
        <div class="label">VOCABULARY</div>
        <div class="title">{{ b.bookname }}</div>
        <div class="subtitle">{{ b.voccount }} 词</div>
      </div>
      <div class="book-stats">
        <span>共 <b>{{ b.voccount }}</b> 词</span>
        <span>已学 <b>{{ stats[b.bookid]?.seen || 0 }}</b></span>
        <span>已通过 <b>{{ stats[b.bookid]?.passed || 0 }}</b></span>
        <span>累计 <b>{{ stats[b.bookid]?.totalViews || 0 }}</b> 次</span>
      </div>
      <div class="progress-bar">
        <div :style="{ width: ((stats[b.bookid]?.seen || 0) / b.voccount * 100).toFixed(1) + '%' }"></div>
      </div>
    </div>
  </section>
</template>
