<script setup>
import { onMounted, onUnmounted, ref, watchEffect } from 'vue';
import { useStore } from './store.js';
import config from './config.js';
import Shelf from './components/Shelf.vue';
import Study from './components/Study.vue';
import SettingsModal from './components/SettingsModal.vue';
import { cancelSpeak } from './speak.js';

const store = useStore();
const showSettings = ref(false);
const showBackToTop = ref(false);
const year = new Date().getFullYear();

watchEffect(() => {
  const t = store.theme;
  if (t === 'light' || t === 'dark') {
    document.documentElement.dataset.theme = t;
  } else {
    delete document.documentElement.dataset.theme;
  }
});

function onScroll() {
  showBackToTop.value = window.scrollY > 300;
}

function backToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

onMounted(async () => {
  window.addEventListener('scroll', onScroll, { passive: true });
  await store.loadBooks();
  // 恢复上次打开的书
  if (store.view === 'study' && store.currentBook != null) {
    await store.openBook(store.currentBook);
  }
});

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
});

function back() {
  cancelSpeak();
  store.backToShelf();
}
</script>

<template>
  <a
    class="github-corner"
    :href="config.github"
    target="_blank"
    rel="noopener"
    :aria-label="`在 GitHub 上为 ${config.nameEn} 点亮一颗 Star`"
    title="在 GitHub 上点个 Star ⭐"
  >
    <svg width="80" height="80" viewBox="0 0 250 250" aria-hidden="true">
      <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path>
      <path d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2" fill="currentColor" class="octo-arm"/>
      <path d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.1 197.7,73.1 200.1,77.5 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z" fill="currentColor" class="octo-body"/>
    </svg>
  </a>

  <div class="site">
    <header class="site-header">
      <div class="brand" @click="back" style="cursor:pointer" role="button" title="返回首页">
        <svg class="brand-logo" width="32" height="32" viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="32" cy="32" r="20" fill="none" stroke="var(--accent)" stroke-width="7"
                  stroke-linecap="round" stroke-dasharray="100 26" transform="rotate(-58 32 32)"/>
          <circle cx="32" cy="32" r="6" fill="var(--accent)"/>
        </svg>
        <div class="brand-text">
          <span class="brand-zh">{{ config.name }}</span>
          <span class="brand-en">{{ config.nameEn }}</span>
        </div>
      </div>
      <span class="brand-tagline">{{ config.slogan }}</span>
    </header>

  <div class="app">
    <div class="topbar">
      <button v-if="store.view === 'study'" class="icon-btn" @click="back" title="返回">‹</button>
      <h1>{{ store.view === 'study' ? (store.books.find(b => b.bookid === store.currentBook)?.bookname || '学习中') : '我的词书' }}</h1>
      <span v-if="store.view === 'study'" class="pill">{{ store.order === 'rand' ? '随机' : '顺序' }}</span>
      <label v-if="store.view === 'study'" class="brainwash-check" title="洗脑模式：连读 3 次">
        <input type="checkbox" v-model="store.brainwash" @change="store.persist()">
        <span>🔁 洗脑</span>
      </label>
      <select v-if="store.view === 'study'" v-model="store.speakMode" class="card-display-sel" title="朗读内容" @change="store.persist()">
        <option value="en">纯英语</option>
        <option value="enzh">英语+中文</option>
      </select>
      <a class="icon-btn" href="/help.html" title="使用说明" target="_blank">?</a>
      <button class="icon-btn" @click="showSettings = true" title="设置">⚙</button>
    </div>

    <Shelf v-if="store.view === 'shelf'" />
    <Study v-else />

    <SettingsModal v-if="showSettings" @close="showSettings = false" />

    <button
      v-show="showBackToTop"
      class="back-to-top"
      @click="backToTop"
      title="回到顶部"
      aria-label="回到顶部"
    >↑</button>
  </div>

    <footer class="site-footer">
      <div class="foot-row">
        <span class="foot-brand">{{ config.name }} · {{ config.nameEn }}</span>
        <span class="foot-dot">·</span>
        <span>© {{ year }}</span>
        <span class="foot-dot">·</span>
        <a :href="config.github" target="_blank" rel="noopener" class="foot-link">
          ⭐ 在 GitHub 上点个 Star
        </a>
      </div>
      <div class="foot-tip">如果它帮到了你，给我点个 Star 是最大的鼓励 💌</div>
    </footer>
  </div>
</template>
