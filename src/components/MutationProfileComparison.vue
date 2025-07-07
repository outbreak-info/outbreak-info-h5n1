<template>
  <h2>Mutation profile comparison</h2>
  <hr>
  <LineageMultiSelect @lineagesSelectedButtonClick="getAllMutationProfiles" />

  <div v-if="isLoading" class="loading">Loading data...</div>
  <div class="container-fluid">
    <div class="row">
      <div v-for="(data, gene) in chartData" :key="gene" class="col-xl-6 col-lg-6 col-md-12 mb-6 chart-section">
        <div class="card shadow-sm h-100 border-light bg-transparent">
          <div class="card-header border-light">
            <h4 class="card-title text-end fw-bold text-right mb-0">
              {{ gene }}
            </h4>
          </div>

          <div class="card-body bg-none p-4 d-flex justify-content-center">
            <BarChart
                :data="data"
                :horizontal="false"
                :height="500"
                :marginLeft="180"
                :marginBottom="100"
                barColor="lineage"
                groupBy="key"
                colorBy="lineage"
                yLabel="Count"
                sortOrder="None"
            />
          </div>
        </div>
      </div>
    </div>

  </div>


</template>

<script setup>
import { ref } from 'vue';
import { BarChart } from 'outbreakInfo';
import { getLineageMutationProfile } from '../services/munninService.js';
import LineageMultiSelect from "./LineageMultiSelect.vue";

const chartData = ref([]);
const isLoading = ref(false);

async function renderCharts() {
  isLoading.value = true;
  chartData.value = await getLineageMutationProfile("D1.1", "usda_genoflu");
  isLoading.value = false;
  console.log(chartData.value)
}

function mergeMutationProfiles(data) {
  const merged = {};
  for (const d of data) {
    for (const [region, arr] of Object.entries(d)) {
      (merged[region] ??= []).push(...arr);
    }
  }

  for (const arr of Object.values(merged)) {
    arr.sort((a, b) => a.key.localeCompare(b.key));
  }

  return merged;
}

async function getAllMutationProfiles(selectedLineages){
  isLoading.value = true;
  let res = await Promise.all(selectedLineages.map(lineage => getLineageMutationProfile(lineage.lineage_name, lineage.lineage_system_name)));
  isLoading.value = false;
  res = mergeMutationProfiles(res);
  chartData.value = res;
  console.log(res);
}

// onMounted(loadData);
</script>

<style scoped>

</style>