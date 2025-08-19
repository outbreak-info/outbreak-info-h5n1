<template>
  <h5>Literature annotations over time</h5>
  <InfoComponent :embedded="true" class="mb-3">
    <span v-html="helpText.mutationSurveillance.literatureAnnotationsOverTime"></span>
  </InfoComponent>
  <MultiSelectComponent
      class="mb-1"
      :multiple="false"
      :options="allAnnotationEffects"
      label="Select an annotation effect. You can filter by host and isolation source using the filters above."
      placeholder="Select annotation effect"
      :showButton="false"
      v-model="selectedEffectDetailObject"
  />

  <div class="row">
    <div class="col">
      <TagComponent class="d-inline m-1" v-if="props.selectedHost.key" type="error" :text="'Filter by host: ' + props.selectedHost.key" />
      <TagComponent class="d-inline m-1" v-if="props.selectedIsolationSource.key" type="error" :text="'Filter by isolation source: ' + props.selectedIsolationSource.key" />
      <TagComponent class="d-inline m-1" v-if="props.selectedLineage.key" type="error" :text="'Filter by lineage: ' + props.selectedLineage.key" />
    </div>
  </div>

  <div v-if="isLoading" class="loading">
    <LoadingSpinner />
  </div>
  <div v-else-if="error" class="error-message">
    {{ error }}
  </div>
  <div class="row" v-else>
    <div class="col col-md-12">
      <TimeSeriesBarChart
          :data="chartData"
          :height="300"
          :width="1200"
          dateKey="key"
          valueKey="value"
          groupKey="group"
          binInterval="month"
          :isPreBinned="true"
          tickInterval="3 month"
          :marginBottom="50"
          :marginLeft="100"
          :marginTop="40"
          xLabel="Month"
          yLabel="Proportion of unique mutations"
          :rangeColor="outbreakInfoColorPalette.slice(6, 10)"
      />
    </div>
    <div class="col col-md-12">
      <TimeSeriesBarChart
          :data="chartDataCounts"
          :height="150"
          :width="1200"
          dateKey="key"
          valueKey="value"
          groupKey="group"
          binInterval="month"
          :isPreBinned="true"
          tickInterval="3 month"
          :marginBottom="50"
          :marginLeft="100"
          :marginTop="40"
          xLabel="Time"
          yLabel="Count of unique mutations"
          :rangeColor="outbreakInfoColorPalette.slice(6,10)"
      />
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, watch, computed} from 'vue';
import { MultiSelectComponent, InfoComponent, TimeSeriesBarChart, LoadingSpinner, outbreakInfoColorPalette, TagComponent } from 'outbreakInfo';
import {
  getAnnotationsByVariantsAndCollectionDate,
  getAnnotationsByMutationsAndCollectionDate,
  getAllAnnotationEffects,
  buildStringQuery
} from '../services/munninService.js';
import helpText from "../helpInfo/helpInfoText.json";
import { defaultValues } from "../constants/labels.js";

const chartData = ref([]);
const chartDataCounts = ref([]);
const allAnnotationEffects = ref([]);
const isLoading = ref(false);
const error = ref(null);
const selectedEffectDetailObject = ref(defaultValues.effectDetail);

const selectedEffectDetail = computed(() => {
  if(selectedEffectDetailObject.value === null)
    return null;
  return selectedEffectDetailObject.value.value;
})

const props = defineProps({
  dataField: { type: String, default: "variants" },
  selectedHost: { type: Object, default: null },
  selectedIsolationSource: { type: Object, default: null },
  selectedLineage: { type: Object, default: null }
})

async function loadData() {
  let resp = await getAllAnnotationEffects();
  allAnnotationEffects.value = resp.map(effect => ({
    label: effect,
    value: effect,
  }));
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
      resp = await getAnnotationsByVariantsAndCollectionDate(selectedEffectDetail.value, q);
    } else if(props.dataField === "mutations") {
      resp = await getAnnotationsByMutationsAndCollectionDate(selectedEffectDetail.value, q);
    }
    chartData.value = resp.flatMap(({ date, proportion }) => [
      { key: date, value: proportion ,       group: selectedEffectDetail.value},
      { key: date, value: 1 - proportion,   group:  "Not annotated with " + selectedEffectDetail.value}
    ]);
    chartDataCounts.value = resp.flatMap(({ date, n, n_total }) => [
      { key: date, value: n ,       group: selectedEffectDetail.value},
      { key: date, value: n_total - n,   group:  "Not annotated with " + selectedEffectDetail.value}
    ])
  } catch (err) {
    console.error('Error searching site:', err);
    error.value = err.message || 'Failed to search for site. Please try again.';
    chartData.value = [];
    chartDataCounts.value = [];
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

watch(() => selectedEffectDetailObject, () => {
  renderChart();
}, { deep: true });

</script>

<style scoped>

</style>