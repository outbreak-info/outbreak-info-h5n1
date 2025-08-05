<template>
  <div class="host-view">
    <h5>Compare mutations across lineages</h5>
    <InfoComponent :embedded="true">
      <span v-html="helpText.lineageComparison.compareMutations"></span>
    </InfoComponent>

    <TextInput
        label="Select a mutation prevalence threshold (0-1)"
        placeholder="Select a mutation prevalence threshold (0-1)"
        v-model="selectedPrevalenceThreshold"
        :showButton="false"
    />
    <LineageMultiSelect @lineagesSelectedButtonClick="getAllLineageMutationIncidence" v-model="selectedLineagesObjects" />


    <div v-if="isLoading" class="loading">
      <LoadingSpinner />
    </div>
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    <div v-else class="container-fluid">
      <div class="row">
        <div v-for="(data, gene) in chartData" :key="gene" class="col-xl-6 col-lg-6 col-md-12 mb-6 chart-section">
          <div class="card shadow-sm h-100 border-light bg-transparent">
            <div class="card-header border-light">
              <h4 class="card-title text-end fw-bold text-right mb-0">
                <small class="text-muted">{{ gene in gffFeatureToRegion ? "Segment: " + gffFeatureToRegion[gene] : "" }}</small>
                <br>
                <span>Protein: <a target="_blank" :href="`https://www.ncbi.nlm.nih.gov/protein/${encodeURIComponent(gene)}`">{{ gene }}</a></span>
              </h4>
            </div>

            <div class="card-body bg-none p-4 d-flex justify-content-center">
              <HeatMapChart
                  :data="data"
                  x="mut"
                  y="lineage"
                  val="prevalence"
                  :cellWidth="20"
                  :cellHeight="10"
                  yLabel=""
                  xLabel=""
                  :domain="[selectedPrevalenceThreshold, 1]"
              />
            </div>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup>
import {ref, onMounted, computed } from 'vue';
import { HeatMapChart, LoadingSpinner, InfoComponent, TextInput } from 'outbreakInfo';
import {
  getLineageMutationIncidence,
  getRegionToGffFeatureMappingForMutations
} from '../services/munninService.js';
import LineageMultiSelect from "./LineageMultiSelect.vue";
import helpText from "../helpInfo/helpInfoText.json";

const chartData = ref([]);
const isLoading = ref(false);
const gffFeatureToRegion = ref({})
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
const selectedPrevalenceThreshold = ref(0.75);

async function loadData() {
  gffFeatureToRegion.value = await getRegionToGffFeatureMappingForMutations();
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

function isValidPrevalenceThreshold(value) {
  return (typeof value === 'number' && Number.isFinite(value)) && value >= 0 && value <= 1;
}

async function getAllLineageMutationIncidence(){
  const selectedPrevalenceThresholdFloat = parseFloat(selectedPrevalenceThreshold.value);
  if(!isValidPrevalenceThreshold(selectedPrevalenceThresholdFloat))
    return;
  isLoading.value = true;
  error.value = null;
  try {
    const res = await Promise.all(selectedLineages.value.map(lineage => getLineageMutationIncidence(lineage.lineage_name, lineage.lineage_system_name, selectedPrevalenceThresholdFloat)));
    chartData.value = mergeMutationCounts(res);
  } catch (err) {
    console.error('Error getting lineage mutation incidence:', err);
    error.value = err.message || 'Failed to search for mutation. Please try again.';
  } finally {
    isLoading.value = false;
    error.value = null;
  }
}

onMounted(() => {
  loadData();
  getAllLineageMutationIncidence();
});
</script>

<style scoped>

</style>