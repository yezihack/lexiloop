<script setup>
import { useStore } from '../store.js';
import CardTab from './CardTab.vue';
import ListTab from './ListTab.vue';
import QuizTab from './QuizTab.vue';
import NibbleTab from './NibbleTab.vue';
import LearnedTab from './LearnedTab.vue';
import StatsTab from './StatsTab.vue';

const store = useStore();
</script>

<template>
  <section v-if="store.loading" class="loading">加载词书数据中…</section>
  <section v-else>
    <div class="tab-bar">
      <button class="tab-btn" :class="{on: store.studyTab === 'card'}" @click="store.setStudyTab('card')"><span class="tab-icon">🎴</span>卡片</button>
      <button class="tab-btn" :class="{on: store.studyTab === 'nibble'}" @click="store.setStudyTab('nibble')"><span class="tab-icon">🐛</span>蚕食</button>
      <button class="tab-btn" :class="{on: store.studyTab === 'list'}" @click="store.setStudyTab('list')"><span class="tab-icon">📋</span>列表</button>
      <button class="tab-btn" :class="{on: store.studyTab === 'quiz'}" @click="store.setStudyTab('quiz')"><span class="tab-icon">✏️</span>考试</button>
      <button class="tab-btn" :class="{on: store.studyTab === 'learned'}" @click="store.setStudyTab('learned')"><span class="tab-icon">✓</span>已学习</button>
      <button class="tab-btn" :class="{on: store.studyTab === 'stats'}" @click="store.setStudyTab('stats')"><span class="tab-icon">📊</span>统计</button>
    </div>
    <CardTab v-if="store.studyTab === 'card'" />
    <NibbleTab v-else-if="store.studyTab === 'nibble'" />
    <ListTab v-else-if="store.studyTab === 'list'" />
    <QuizTab v-else-if="store.studyTab === 'quiz'" />
    <LearnedTab v-else-if="store.studyTab === 'learned'" />
    <StatsTab v-else />
  </section>
</template>
