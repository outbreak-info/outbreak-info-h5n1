<template>
  <div class="host-view">
    <h1>Compare mutations across lineages</h1>
    <div>
      <MultiSelectComponent
          :options="allLineages"
          label="Select Lineages"
          :showButton="true"
          @buttonClick="getLineageMutations"
      />
    </div>

    <div v-if="isLoading" class="loading">Loading data...</div>
    <div v-for="(data, gene) in chartData" :key="gene" class="chart-section">
      <h2>{{ gene }}</h2>
      <HeatMapChart
          :data="data"
          x="mut"
          y="lineage"
          val="prevalence"
          :cellWidth="20"
          :cellHeight="10"
          yLabel=""
          xLabel=""
          :domain="[0.75, 1]"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { HeatMapChart, MultiSelectComponent } from 'outbreakInfo';
import { getLineageMutationIncidence, getLineagesByLineageSystem } from '../services/munninService.js';

const chartData = ref([]);
const isLoading = ref(false);
const allLineages = ref([]);

async function getAllLineages(lineage_system_name){
  const resp = await getLineagesByLineageSystem(lineage_system_name);
  return resp.map(lineage => ({
    label: lineage.lineage_name,
    value: lineage.lineage_name,
    ...lineage
  }));
}

function mergeMutationCounts(lineage_mutations) {
  const mutation_counts = {};

  for (const { mutation_counts: mc } of lineage_mutations) {
    for (const [region_or_gff, muts] of Object.entries(mc)) {
      (mutation_counts[region_or_gff] ??= []).push(...muts);
    }
  }

  return mutation_counts;
}

async function loadData() {
  allLineages.value = await getAllLineages("usda_genoflu");
}

async function getLineageMutations(selectedLineages) {
  isLoading.value = true;
  let res = await Promise.all(selectedLineages.map(lineage => getLineageMutationIncidence(lineage.lineage_name, lineage.lineage_system_name)));
  isLoading.value = false;
  res = mergeMutationCounts(res);
  chartData.value = res;
}

onMounted(loadData);
</script>

<style scoped>

</style>