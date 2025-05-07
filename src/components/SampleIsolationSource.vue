<template>
  <div class="isolation-view">
    <h1>Samples by isolation source</h1>
    <BarChart
      :data="chartData"
      :horizontal="horizontal"
      :height="500"
      :marginLeft="180"
      :barColor="outbreakInfoColorPalette.primary"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { BarChart, outbreakInfoColorPalette } from 'outbreakInfo';
import { getSampleCountByField } from '../services/munninService.js';

const displayLimit = ref(20);
const horizontal = ref(true);
const chartData = ref([]);

async function loadData() {
  chartData.value = await getSampleCountByField("isolation_source", displayLimit.value);
}

onMounted(loadData);
</script>

<style scoped>
.isolation-view {
  max-width: 1000px;
  margin: 0 auto;
  padding: 1rem;
}

.controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}
</style>