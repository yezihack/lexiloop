import { defineStore } from 'pinia';

const STORE_KEY = 'vocab-app-state-v1';
const PROG_KEY = 'vocab-app-progress-v1'; // { [bookid]: { idx, listIdx, views, totalViews, mistakes, passed, shuffle } }

const defaultGlobal = {
  view: 'shelf',         // 'shelf' | 'study'
  currentBook: null,     // bookid
  studyTab: 'card',      // 'card' | 'list' | 'quiz'
  order: 'seq',          // 'seq' | 'rand'
  accent: 'us',          // 'us' | 'uk'
  rate: 1.0,
  autoSpeak: true,
  brainwash: false,
  cardDisplay: 'both',   // 'both' | 'en' | 'zh'
  autoNext: false,
  speakMode: 'en',       // 'en' | 'enzh'
  zhReadAll: false,
  listDisplay: 'both',
  chunkSize: 9,          // 蚕食批次大小
  nibbleDelay: 1000,     // 蚕食延迟：点击后多少毫秒开始卡片消失动画
  theme: 'auto'          // 'auto' | 'light' | 'dark'
};

const defaultProgress = () => ({
  idx: 0,
  listIdx: 0,
  views: {},
  totalViews: 0,
  mistakes: {},
  correct: {},           // 累计答对次数: { word: count }
  passed: [],
  shuffle: null,
  chunkStart: 0          // 蚕食模式：当前批次在 ordered words 中的起始位置
});

function loadGlobal() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { ...defaultGlobal };
    return { ...defaultGlobal, ...JSON.parse(raw) };
  } catch {
    return { ...defaultGlobal };
  }
}
function loadAllProgress() {
  try {
    const raw = localStorage.getItem(PROG_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function shuffleIndices(n) {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const useStore = defineStore('main', {
  state: () => ({
    ...loadGlobal(),
    books: [],          // [{ bookid, bookname, voccount }]
    words: [],          // 当前书的词表
    loading: false,
    progressMap: loadAllProgress()
  }),
  getters: {
    progress(state) {
      if (state.currentBook == null) return defaultProgress();
      if (!state.progressMap[state.currentBook]) {
        state.progressMap[state.currentBook] = defaultProgress();
      }
      return state.progressMap[state.currentBook];
    },
    orderArray(state) {
      if (state.order !== 'rand') return null;
      const p = this.progress;
      if (!Array.isArray(p.shuffle) || p.shuffle.length !== state.words.length) {
        p.shuffle = shuffleIndices(state.words.length);
        this.persist();
      }
      return p.shuffle;
    },
    currentWord(state) {
      const p = this.progress;
      const ord = this.orderArray;
      const realIdx = ord ? ord[p.idx] : p.idx;
      return state.words[realIdx];
    }
  },
  actions: {
    persist() {
      const g = {};
      for (const k of Object.keys(defaultGlobal)) g[k] = this[k];
      localStorage.setItem(STORE_KEY, JSON.stringify(g));
      localStorage.setItem(PROG_KEY, JSON.stringify(this.progressMap));
    },

    async loadBooks() {
      const res = await fetch(import.meta.env.BASE_URL + 'data/books.json');
      this.books = await res.json();
    },

    async openBook(bookid) {
      this.loading = true;
      this.currentBook = bookid;
      const res = await fetch(import.meta.env.BASE_URL + `data/book-${bookid}.json`);
      this.words = await res.json();
      // 兼容旧索引越界
      const p = this.progress;
      if (p.idx >= this.words.length) p.idx = 0;
      if (p.listIdx >= this.words.length) p.listIdx = 0;
      this.view = 'study';
      this.loading = false;
      this.persist();
    },

    backToShelf() {
      this.view = 'shelf';
      this.currentBook = null;
      this.words = [];
      this.persist();
    },

    setStudyTab(t) {
      this.studyTab = t;
      this.persist();
    },

    go(delta) {
      const p = this.progress;
      const next = p.idx + delta;
      if (next < 0 || next >= this.words.length) return;
      p.idx = next;
      this.persist();
    },

    bumpView(word) {
      const p = this.progress;
      p.views[word] = (p.views[word] || 0) + 1;
      p.totalViews += 1;
      this.persist();
    },

    setOrder(v) {
      if (v === this.order) return;
      this.order = v;
      const p = this.progress;
      if (v === 'rand' && (!Array.isArray(p.shuffle) || p.shuffle.length !== this.words.length)) {
        p.shuffle = shuffleIndices(this.words.length);
      }
      p.idx = 0;
      this.persist();
    },

    reshuffle() {
      const p = this.progress;
      p.shuffle = shuffleIndices(this.words.length);
      p.idx = 0;
      this.order = 'rand';
      this.persist();
    },

    resetCurrentBook() {
      if (this.currentBook == null) return;
      this.progressMap[this.currentBook] = defaultProgress();
      this.persist();
    },

    setListIdx(i) {
      this.progress.listIdx = i;
      this.persist();
    },

    addPassed(word) {
      const p = this.progress;
      if (!p.passed.includes(word)) {
        p.passed.push(word);
        this.persist();
        return true;
      }
      return false;
    },

    recordMistake(word, ok) {
      const p = this.progress;
      if (!p.correct) p.correct = {};
      if (ok) {
        p.correct[word] = (p.correct[word] || 0) + 1;
        if (p.mistakes[word]) {
          p.mistakes[word].correct = (p.mistakes[word].correct || 0) + 1;
          if (p.mistakes[word].correct >= 2) delete p.mistakes[word];
        }
      } else {
        if (!p.mistakes[word]) p.mistakes[word] = { wrong: 0, correct: 0 };
        p.mistakes[word].wrong += 1;
        p.mistakes[word].correct = 0;
      }
      this.persist();
    }
  }
});
