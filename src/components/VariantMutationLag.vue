<template>
  <LineageMultiSelect @update:modelValue="renderCharts" :multiple="false" :showButton="false" />
  <div v-if="isLoading" class="loading">Loading data...</div>
  <div v-else-if="Object.keys(chartData).length > 0">
    <div class="container-fluid">
      <div class="row">
        <div v-for="(data, region_or_gff_feature) in chartData" :key="region_or_gff_feature" class="chart-section col-xl-6 col-lg-6 col-md-12 mb-6 chart-section">
          <div class="card shadow-sm h-100 border-light bg-transparent">
            <div class="card-header border-light">
              <h4 class="card-title text-end fw-bold text-right mb-0">
                {{ region_or_gff_feature }}
                <small class="text-muted">{{ region_or_gff_feature in gffFeatureToRegion ? "Region: " + gffFeatureToRegion[region_or_gff_feature] : "" }}</small>
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
import { ref, onMounted } from 'vue';
import { DumbbellChart } from 'outbreakInfo';
import {getRegionToGffFeatureMappingForMutations, getRegionToGffFeatureMappingForVariants, getVariantMutationLag} from "../services/munninService.js";
import LineageMultiSelect from "./LineageMultiSelect.vue";

const chartData = ref([]);
const gffFeatureToRegion = ref({});
const isLoading = ref(false);

async function getGffFeatureToRegionMapping() {
  let gffFeatureToRegionMutations = await getRegionToGffFeatureMappingForMutations();
  let gffFeatureToRegionVariants = await getRegionToGffFeatureMappingForVariants();
  return { ...gffFeatureToRegionMutations, ...gffFeatureToRegionVariants };
}

async function renderCharts(selectedLineage) {
  isLoading.value = true;
  chartData.value = await getVariantMutationLag(selectedLineage, "usda_genoflu");
  isLoading.value = false;
}

async function loadData() {
  gffFeatureToRegion.value = await getGffFeatureToRegionMapping();
}

onMounted(loadData);
</script>

<style scoped>

</style>