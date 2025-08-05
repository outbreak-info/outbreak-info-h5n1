<template>
  <LineageMultiSelect :multiple="false" :showButton="false" v-model="selectedLineageObject" />
  <div v-if="isLoading" class="loading">
    <LoadingSpinner />
  </div>
  <div v-else-if="error">
    {{ error.value }}
  </div>
  <div v-else-if="Object.keys(chartData).length > 0">
    <div class="container-fluid">
      <div class="row">
        <div v-for="(data, region_or_gff_feature) in chartData" :key="region_or_gff_feature" class="chart-section col-xl-6 col-lg-6 col-md-12 mb-6 chart-section">
          <div class="card shadow-sm h-100 border-light bg-transparent">
            <div class="card-header border-light">
              <h4 class="card-title text-end fw-bold text-right mb-0">
                <small class="text-muted">{{ region_or_gff_feature in gffFeatureToRegion ? "Segment: " + gffFeatureToRegion[region_or_gff_feature] : "" }}</small>
                <br>
                <span>Protein: <a target="_blank" :href="`https://www.ncbi.nlm.nih.gov/protein/${encodeURIComponent(region_or_gff_feature)}`">{{ region_or_gff_feature }}</a></span>
              </h4>
            </div>

            <div class="card-body bg-none p-4 d-flex justify-content-center">
              <DumbbellChart
                  :data="data"
                  :width="800"
                  :height="800"
                  categoryKey="mut"
                  time1Key="variants_start_date"
                  time2Key="mutations_start_date"
                  time1Label="Variants"
                  time2Label="Mutations"
                  xLabel="Time"
                  yLabel="Mutations"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, watch, computed} from 'vue';
import { DumbbellChart, LoadingSpinner } from 'outbreakInfo';
import {getRegionToGffFeatureMappingForMutations, getRegionToGffFeatureMappingForVariants, getVariantMutationLag} from "../services/munninService.js";
import LineageMultiSelect from "./LineageMultiSelect.vue";

const chartData = ref([]);
const gffFeatureToRegion = ref({});
const isLoading = ref(false);
const error = ref(null);
const selectedLineageObject = ref({
  label: 'B3.13',
  value: {
    lineage_name: "B3.13",
    lineage_system_name: "usda_genoflu"
  }
})
const selectedLineage = computed(() => {
  if (selectedLineageObject.value.value === null)
    return null;
  return selectedLineageObject.value.value;
});

async function getGffFeatureToRegionMapping() {
  let gffFeatureToRegionMutations = await getRegionToGffFeatureMappingForMutations();
  let gffFeatureToRegionVariants = await getRegionToGffFeatureMappingForVariants();
  return { ...gffFeatureToRegionMutations, ...gffFeatureToRegionVariants };
}

async function renderCharts() {
  if(selectedLineage.value === null) {
    chartData.value = [];
    return;
  }
  isLoading.value = true;
  try{
    chartData.value = await getVariantMutationLag(selectedLineage.value.lineage_name, "usda_genoflu");
  } catch (err) {
    console.log('Error getting variant mutation lag:', err);
    error.value = "Error getting variant mutation lag. Please try again.";
  } finally {
    isLoading.value = false;
  }
}

async function loadData() {
  gffFeatureToRegion.value = await getGffFeatureToRegionMapping();
}

onMounted(() => {
  loadData();
  renderCharts();
});

watch(selectedLineage, () => {
  renderCharts();
}, {deep: true});
</script>

<style scoped>

</style>