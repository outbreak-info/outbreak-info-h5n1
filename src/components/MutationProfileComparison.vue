<template>
  <h5>Mutation profile comparison</h5>
  <InfoComponent :embedded="true">
    <span v-html="helpText.lineageComparison.mutationProfile"></span>
  </InfoComponent>


  <LineageMultiSelect @lineagesSelectedButtonClick="getAllMutationProfiles" v-model="selectedLineagesObjects" />

  <div v-if="isLoading" class="loading">
    <LoadingSpinner />
  </div>
  <div v-if="error">
    {{ error }}
  </div>
  <div class="container-fluid">
    <div class="row">
      <div v-for="(data, gene) in chartData" :key="gene" class="col-xl-6 col-lg-6 col-md-12 mb-6 chart-section">
        <div class="card shadow-sm h-100 border-light bg-transparent">
          <div class="card-header border-light">
            <h4 class="card-title text-end fw-bold text-right mb-0">
              Segment: {{ gene }}
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
import {computed, onMounted, ref} from 'vue';
import { BarChart, LoadingSpinner, InfoComponent } from 'outbreakInfo';
import { getLineageMutationProfile } from '../services/munninService.js';
import LineageMultiSelect from "./LineageMultiSelect.vue";
import helpText from "../helpInfo/helpInfoText.json";

const chartData = ref([]);
const isLoading = ref(false);
const error = ref(null);
const selectedLineagesObjects = ref([
  {
    label: 'D1.1',
    value: {
      lineage_name: "D1.1",
      lineage_system_name: "usda_genoflu"
    }
  }, {
    label: 'B3.13',
    value: {
      lineage_name: "B3.13",
      lineage_system_name: "usda_genoflu"
    }
  }
])
const selectedLineages = computed(() => {
  if(selectedLineagesObjects.value === null)
    return [];
  return selectedLineagesObjects.value.map(lineage => lineage.value);
})

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

async function getAllMutationProfiles(){
  isLoading.value = true;
  chartData.value = [];
  try {
    let res = await Promise.all(selectedLineages.value.map(lineage => getLineageMutationProfile(lineage.lineage_name, lineage.lineage_system_name)));
    res = mergeMutationProfiles(res);
    chartData.value = res;
  } catch (err) {
    console.error('Error getting mutation profiles:', err);
    error.value = 'Failed to get mutations profiles. Please try again.';
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  getAllMutationProfiles();
});
</script>

<style scoped>

</style>