<template>
  <h5>Literature annotations by amino acid position</h5>
  <InfoComponent :embedded="true" class="mb-3">
    <span v-html="helpText.literatureSurveillance.literatureAnnotationsByAminoAcidPosition"></span>
  </InfoComponent>
  <div v-if="isLoading" class="loading">
    <LoadingSpinner />
  </div>
  <div v-else-if="error" class="error-message">
    {{ error }}
  </div>
  <div class="row" v-else>
    <div v-for="(data, gff_feature) in chartData" :key="gff_feature" class="col-xl-6 col-lg-6 col-md-6 mb-6">
      <div class="card shadow-sm h-100 border-light bg-transparent">
        <div class="card-header border-light">
          <h4 class="card-title text-end fw-bold text-right mb-0">
            Segment: {{ gffFeatureToRegion[gff_feature] }}
          </h4>
        </div>

        <div class="card-body bg-none p-4 d-flex justify-content-center">
          <BarChart
              :data="data"
              :horizontal="false"
              xKey="count"
              yKey="position_aa"
              xLabel="Count"
              yLabel="Amino acid position"
              barColor="Amino acid change"
              :height="500"
              :marginLeft="180"
              :barColor="outbreakInfoColorPalette.primary"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, watch, computed} from 'vue';
import { LoadingSpinner, InfoComponent, outbreakInfoColorPalette, BarChart } from 'outbreakInfo';
import {
  getAnnotationsByVariantsAndAminoAcidPosition,
  getAnnotationsByMutationsAndAminoAcidPosition,
  buildStringQuery, getRegionToGffFeatureMappingForMutations
} from '../services/munninService.js';
import helpText from "../helpInfo/helpInfoText.json";

const chartData = ref([]);
const isLoading = ref(false);
const error = ref(null);

const props = defineProps({
  dataField: { type: String, default: "variants" },
  selectedHost: { type: Object, default: null },
  selectedIsolationSource: { type: Object, default: null },
  selectedLineage: { type: Object, default: null },
  selectedEffectDetail: { type: String, default: "" }
})

const gffFeatureToRegion = ref({});

async function loadData() {
  gffFeatureToRegion.value = await getRegionToGffFeatureMappingForMutations();
}

function reformatAnnotationsByAminoAcidPosition(data) {
  return Object.fromEntries(
      Object.entries(data).map(([gffFeature, siteCounts]) => [
        gffFeature,
        siteCounts.map(
            d => ({
              ...d,
              "Amino acid change": d.ref_aa + " > " + d.alt_aa,
              position_aa: parseInt(d.position_aa)
            })
        )
      ])
  );
}

async function renderChart() {
  isLoading.value = true;
  error.value = null;
  let resp;
  try {
    const q =  buildStringQuery([
      { field: "host", value: props.selectedHost.key },
      { field: "isolation_source", value: props.selectedIsolationSource.key },
      { field: "lineage_name", value: props.selectedLineage.key },
    ]);
    if(props.dataField === "variants") {
      resp = await getAnnotationsByVariantsAndAminoAcidPosition(props.selectedEffectDetail, q);
    } else if(props.dataField === "mutations") {
      resp = await getAnnotationsByMutationsAndAminoAcidPosition(props.selectedEffectDetail, q);
    }
    chartData.value = reformatAnnotationsByAminoAcidPosition(resp);
    console.log(chartData.value);
  } catch (err) {
    console.error('Error searching for annotation:', err);
    error.value = err.message || 'Failed to find annotation. Please try again.';
    chartData.value = [];
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  loadData();
  renderChart();
});

watch(() => props.selectedHost, () => {
  renderChart();
}, { deep: true });

watch(() => props.selectedIsolationSource, () => {
  renderChart();
}, { deep: true });

watch(() => props.selectedLineage, () => {
  renderChart();
}, { deep: true });

watch(() => props.selectedEffectDetail, () => {
  renderChart();
}, { deep: true });

</script>

<style scoped>

</style>