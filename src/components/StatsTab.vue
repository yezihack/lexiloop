<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { useStore } from '../store.js';
import * as echarts from 'echarts';

const store = useStore();

// ---- 核心统计 ----
const stats = computed(() => {
  const total = store.words.length;
  const views = store.progress.views || {};
  const correct = store.progress.correct || {};
  const mistakes = store.progress.mistakes || {};
  const passed = store.progress.passed || [];

  const learnedWords = Object.keys(views).filter(k => views[k] > 0);
  const learned = learnedWords.length;
  const passedCount = passed.length;
  const mistakeWords = Object.keys(mistakes).filter(k => mistakes[k].wrong > 0);
  const mistakeCount = mistakeWords.length;

  let totalCorrect = 0, totalWrong = 0;
  for (const k of Object.keys(correct)) totalCorrect += correct[k] || 0;
  for (const k of Object.keys(mistakes)) totalWrong += mistakes[k].wrong || 0;
  const quizTotal = totalCorrect + totalWrong;
  const accuracy = quizTotal > 0 ? Math.round((totalCorrect / quizTotal) * 100) : 0;

  return {
    total,
    learned,
    passedCount,
    mistakeCount,
    totalViews: store.progress.totalViews || 0,
    totalCorrect,
    totalWrong,
    quizTotal,
    accuracy,
    learnedWords,
    mistakeWords
  };
});

// ---- 图表 refs ----
const elProgress = ref(null);
const elDist = ref(null);
const elTopMistake = ref(null);
const elViewBucket = ref(null);

let cProgress, cDist, cTopMistake, cViewBucket;

function isDark() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function baseTextColor() { return isDark() ? '#ececec' : '#1f1f1f'; }
function baseSubColor() { return isDark() ? '#888' : '#8d8d8d'; }

function renderProgress() {
  if (!elProgress.value) return;
  cProgress?.dispose();
  cProgress = echarts.init(elProgress.value);
  const s = stats.value;
  const learnedPct = s.total ? +(s.learned / s.total * 100).toFixed(1) : 0;
  const passedPct = s.total ? +(s.passedCount / s.total * 100).toFixed(1) : 0;

  cProgress.setOption({
    series: [
      {
        type: 'gauge',
        radius: '90%',
        center: ['25%', '55%'],
        startAngle: 220,
        endAngle: -40,
        min: 0, max: 100,
        progress: { show: true, width: 14, itemStyle: { color: '#2b6cb0' } },
        axisLine: { lineStyle: { width: 14, color: [[1, isDark() ? '#36363a' : '#e3e1dc']] } },
        pointer: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        title: { offsetCenter: [0, '70%'], color: baseSubColor(), fontSize: 12 },
        detail: {
          valueAnimation: true,
          offsetCenter: [0, 0],
          formatter: '{value}%',
          color: baseTextColor(),
          fontSize: 22,
          fontWeight: 600
        },
        data: [{ value: learnedPct, name: '已学占比' }]
      },
      {
        type: 'gauge',
        radius: '90%',
        center: ['75%', '55%'],
        startAngle: 220,
        endAngle: -40,
        min: 0, max: 100,
        progress: { show: true, width: 14, itemStyle: { color: '#2ed573' } },
        axisLine: { lineStyle: { width: 14, color: [[1, isDark() ? '#36363a' : '#e3e1dc']] } },
        pointer: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        title: { offsetCenter: [0, '70%'], color: baseSubColor(), fontSize: 12 },
        detail: {
          valueAnimation: true,
          offsetCenter: [0, 0],
          formatter: '{value}%',
          color: baseTextColor(),
          fontSize: 22,
          fontWeight: 600
        },
        data: [{ value: passedPct, name: '通过占比' }]
      }
    ]
  });
}

function renderDist() {
  if (!elDist.value) return;
  cDist?.dispose();
  cDist = echarts.init(elDist.value);
  const s = stats.value;
  const learnedSet = new Set(s.learnedWords);
  const passedSet = new Set(store.progress.passed || []);
  const mistakeSet = new Set(s.mistakeWords);

  const passed = passedSet.size;
  const inMistake = [...mistakeSet].filter(w => !passedSet.has(w)).length;
  const learnedNotPassed = [...learnedSet].filter(
    w => !passedSet.has(w) && !mistakeSet.has(w)
  ).length;
  const notLearned = Math.max(0, s.total - learnedSet.size);

  cDist.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: {
      bottom: 0,
      textStyle: { color: baseTextColor(), fontSize: 12 },
      itemWidth: 10, itemHeight: 10
    },
    series: [{
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: true,
      itemStyle: { borderColor: isDark() ? '#232325' : '#fff', borderWidth: 2 },
      label: { show: true, formatter: '{b}\n{d}%', fontSize: 11, color: baseTextColor() },
      labelLine: { length: 8, length2: 6 },
      data: [
        { value: passed, name: '已通过', itemStyle: { color: '#2ed573' } },
        { value: inMistake, name: '错题中', itemStyle: { color: '#ff4757' } },
        { value: learnedNotPassed, name: '学过未考', itemStyle: { color: '#ffa502' } },
        { value: notLearned, name: '未学习', itemStyle: { color: isDark() ? '#3a3a3e' : '#d8d6d0' } }
      ]
    }]
  });
}

function renderTopMistake() {
  if (!elTopMistake.value) return;
  cTopMistake?.dispose();
  cTopMistake = echarts.init(elTopMistake.value);
  const m = store.progress.mistakes || {};
  const list = Object.entries(m)
    .filter(([, v]) => v.wrong > 0)
    .sort((a, b) => b[1].wrong - a[1].wrong)
    .slice(0, 10);

  if (!list.length) {
    cTopMistake.setOption({
      title: {
        text: '暂无错题', left: 'center', top: 'middle',
        textStyle: { color: baseSubColor(), fontSize: 13, fontWeight: 400 }
      }
    });
    return;
  }

  const words = list.map(x => x[0]).reverse();
  const wrongs = list.map(x => x[1].wrong).reverse();
  const corrects = list.map(x => x[1].correct || 0).reverse();

  cTopMistake.setOption({
    grid: { left: 70, right: 20, top: 10, bottom: 30 },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: {
      bottom: 0,
      textStyle: { color: baseTextColor(), fontSize: 12 },
      itemWidth: 10, itemHeight: 10
    },
    xAxis: {
      type: 'value',
      axisLabel: { color: baseSubColor() },
      splitLine: { lineStyle: { color: isDark() ? '#36363a' : '#eceae5' } }
    },
    yAxis: {
      type: 'category',
      data: words,
      axisLabel: { color: baseTextColor(), fontFamily: 'ui-monospace, Menlo, monospace' },
      axisLine: { lineStyle: { color: isDark() ? '#36363a' : '#e3e1dc' } }
    },
    series: [
      {
        name: '错误', type: 'bar', stack: 'q',
        itemStyle: { color: '#ff4757', borderRadius: [0, 4, 4, 0] },
        data: wrongs
      },
      {
        name: '答对', type: 'bar', stack: 'q',
        itemStyle: { color: '#2ed573', borderRadius: [0, 4, 4, 0] },
        data: corrects
      }
    ]
  });
}

function renderViewBucket() {
  if (!elViewBucket.value) return;
  cViewBucket?.dispose();
  cViewBucket = echarts.init(elViewBucket.value);
  const views = store.progress.views || {};
  const buckets = [0, 0, 0, 0, 0]; // 1, 2, 3, 4, 5+
  for (const k of Object.keys(views)) {
    const n = views[k];
    if (n <= 0) continue;
    if (n >= 5) buckets[4]++;
    else buckets[n - 1]++;
  }
  const labels = ['1次', '2次', '3次', '4次', '5次+'];

  cViewBucket.setOption({
    grid: { left: 40, right: 20, top: 20, bottom: 30 },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: {
      type: 'category',
      data: labels,
      axisLabel: { color: baseTextColor() },
      axisLine: { lineStyle: { color: isDark() ? '#36363a' : '#e3e1dc' } }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: baseSubColor() },
      splitLine: { lineStyle: { color: isDark() ? '#36363a' : '#eceae5' } }
    },
    series: [{
      type: 'bar',
      data: buckets,
      barWidth: '55%',
      itemStyle: {
        borderRadius: [6, 6, 0, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#6aa9e9' },
          { offset: 1, color: '#2b6cb0' }
        ])
      },
      label: { show: true, position: 'top', color: baseTextColor(), fontSize: 11 }
    }]
  });
}

function renderAll() {
  renderProgress();
  renderDist();
  renderTopMistake();
  renderViewBucket();
}

function onResize() {
  cProgress?.resize();
  cDist?.resize();
  cTopMistake?.resize();
  cViewBucket?.resize();
}

onMounted(async () => {
  await nextTick();
  renderAll();
  window.addEventListener('resize', onResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize);
  cProgress?.dispose();
  cDist?.dispose();
  cTopMistake?.dispose();
  cViewBucket?.dispose();
});

// 当数据变化时重绘
watch(() => [
  store.progress.totalViews,
  store.progress.passed?.length,
  Object.keys(store.progress.views || {}).length,
  Object.keys(store.progress.mistakes || {}).length
], () => {
  nextTick(renderAll);
});
</script>

<template>
  <div class="stats-wrap">
    <div class="kpi-grid">
      <div class="kpi">
        <div class="kpi-num">{{ stats.learned }}<small>/{{ stats.total }}</small></div>
        <div class="kpi-lbl">已学单词</div>
      </div>
      <div class="kpi">
        <div class="kpi-num kpi-green">{{ stats.passedCount }}</div>
        <div class="kpi-lbl">已通过</div>
      </div>
      <div class="kpi">
        <div class="kpi-num kpi-red">{{ stats.mistakeCount }}</div>
        <div class="kpi-lbl">错题</div>
      </div>
      <div class="kpi">
        <div class="kpi-num">{{ stats.accuracy }}<small>%</small></div>
        <div class="kpi-lbl">考试正确率</div>
      </div>
      <div class="kpi">
        <div class="kpi-num">{{ stats.totalViews }}</div>
        <div class="kpi-lbl">总浏览</div>
      </div>
      <div class="kpi">
        <div class="kpi-num">{{ stats.quizTotal }}</div>
        <div class="kpi-lbl">答题总次</div>
      </div>
    </div>

    <div class="chart-card">
      <div class="chart-title">学习进度</div>
      <div ref="elProgress" class="chart-box" style="height:200px"></div>
    </div>

    <div class="chart-card">
      <div class="chart-title">掌握度分布</div>
      <div ref="elDist" class="chart-box" style="height:280px"></div>
    </div>

    <div class="chart-card">
      <div class="chart-title">错题 Top 10</div>
      <div ref="elTopMistake" class="chart-box" style="height:300px"></div>
    </div>

    <div class="chart-card">
      <div class="chart-title">浏览次数分布</div>
      <div ref="elViewBucket" class="chart-box" style="height:240px"></div>
    </div>
  </div>
</template>
