<template>
  <div class="row">
    <div class="col mb-3">
      <InfoComponent :embedded="true">
        <span class="d-inline" v-html="((dataField==='variants') ? helpText.mutationSurveillance.hostLevel : helpText.mutationSurveillance.populationLevel) + ' ' + helpText.referenceDetails"></span>
      </InfoComponent>
    </div>
  </div>

  <form>
    <div class="row">
      <div class="col col-12">
        <h5>Explore by phenotype</h5>
        <InfoComponent :embedded="true" class="mb-3">
          <span v-html="helpText.mutationSurveillance.phenotype"></span>
        </InfoComponent>
        <PhenotypicMetricNamesMultiSelect class="inline" v-model="selectedPhenotypeScoreObject" />
      </div>
      <div class="col mb-3">
        <CheckBox v-model="useLogScale" text="Log scale" />
      </div>
    </div>
  </form>

  <div class="row">
    <div class="col col-md-6">
      <div v-if="isLoadingChart" class="loading">
        <LoadingSpinner />
      </div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <scatter-chart
          v-else
          :data="chartData"
          xKey="phenotypeScore"
          yKey="count"
          :pointColor="outbreakInfoColorPalette[0]"
          :titleKey="'key'"
          :yLabel="'Number of samples'"
          :logScale="useLogScale"
          :tipFormatString="'Mutation: {key}\nCount: {y}\nDMS: {x}'"
          :showMinMaxXLabels="getAxesAttributes(selectedPhenotypeScore, 'showMinMaxXLabels')"
          :minXLabel="getAxesAttributes(selectedPhenotypeScore, 'showMinMaxXLabels') ? getAxesAttributes(selectedPhenotypeScore, 'minXLabel') : null"
          :maxXLabel="getAxesAttributes(selectedPhenotypeScore, 'showMinMaxXLabels') ? getAxesAttributes(selectedPhenotypeScore, 'maxXLabel') : null"
          :xLabel="!getAxesAttributes(selectedPhenotypeScore, 'showMinMaxXLabels') ? getAxesAttributes(selectedPhenotypeScore, 'xLabel') : null"
      />
    </div>

    <div class="col col-md-3">
      <SelectBarChartWithBarGraph
          :data="hostData"
          fieldName="Host"
          :selectedItem="selectedHost"
          @item-selected="hostBarSelected"
          :width="330"
          :height="310"
          :marginLeft="60"/>
    </div>

    <div class="col col-md-3">
      <SelectBarChartWithBarGraph
          :data="isolationSourceData"
          fieldName="Isolation Source"
          :selectedItem="selectedIsolationSource"
          @item-selected="isolationSourceBarSelected"
          :width="300"
          :height="310" />
    </div>

  </div>
  <div class="row mb-5">
    <div class="col col-md-12">
      <PhenotypeMetricsByCollectionDate
          :selectedPhenotypeScore="selectedPhenotypeScore"
          :selectedHost="selectedHost"
          :selectedIsolationSource="selectedIsolationSource"
          :dataField="props.dataField" />
    </div>
  </div>
  <div class="row mb-5">
    <div class="col col-md-12">
      <AggregatePhenotypeMetricsBySampleAndCollectionDate :selectedPhenotypeScore="selectedPhenotypeScore"
                                                          :selectedHost="selectedHost"
                                                          :selectedIsolationSource="selectedIsolationSource"
                                                          :dataField="props.dataField" />
    </div>
  </div>
  <div class="row mb-5">
    <div class="col col-md-12">
      <AnnotationsByCollectionDate :dataField="props.dataField"
                                   :selectedHost="selectedHost"
                                   :selectedIsolationSource="selectedIsolationSource" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, useId, computed } from 'vue';
import { ScatterChart, outbreakInfoColorPalette, SelectBarChartWithBarGraph, LoadingSpinner, InfoComponent, CheckBox } from 'outbreakInfo';
import { getSampleCountByField, getCountByPhenotypeScore } from '../services/munninService.js';
import PhenotypeMetricsByCollectionDate from './PhenotypeMetricsByCollectionDate.vue';
import AnnotationsByCollectionDate from "./AnnotationsByCollectionDate.vue";
import AggregatePhenotypeMetricsBySampleAndCollectionDate from "./AggregatePhenotypeMetricsBySampleAndCollectionDate.vue";
import PhenotypicMetricNamesMultiSelect from "./PhenotypicMetricNamesMultiSelect.vue";
import helpText from '../helpInfo/helpInfoText.json';
import { phenotypeMetricAxesLabels, defaultValues } from '../constants/labels.js'

const selectedPhenotypeScoreObject = ref(defaultValues.phenotypeScore);
const selectedPhenotypeScore = computed(() => {
  if(selectedPhenotypeScoreObject.value === null)
    return null
  return selectedPhenotypeScoreObject.value.value;
})
const useLogScale = ref(true);
const chartData = ref([]);
const isLoadingChart = ref(false);
const error = ref(null);
const hostData = ref([]);
const selectedHost = ref({key: null, value: null});


function getAxesAttributes(phenotypeScore, attribute) {
  if(!(phenotypeScore in phenotypeMetricAxesLabels))
    return null;
  return phenotypeMetricAxesLabels[phenotypeScore][attribute];
}

const isolationSourceData = ref([]);
const selectedIsolationSource = ref({key: null, value: null});

const props = defineProps({
  dataField: { type: String, default: "variants" },
  title: { type: String, default: "Host-level" }
})

const hostBarSelected = (item) => {
  selectedHost.value = item;
};

const isolationSourceBarSelected = (item) => {
  selectedIsolationSource.value = item;
}

async function getCountByPhenotypeScoreFilterByHostAndIsolationSource(region, phenotypeScore, host, isolationSource, dataField) {
  let q = null;
  if(host !== null && isolationSource !== null){
    q = `host=${host} ^ isolation_source=${isolationSource}`;
  } else if (host !== null) {
    q = `host=${host}`;
  } else if(isolationSource !== null){
    q = `isolation_source=${isolationSource}`;
  }
  return getCountByPhenotypeScore(region, phenotypeScore, q, dataField);
}

async function loadHostAndIsolationSourceData(){
  isLoadingChart.value = true;
  try {
    hostData.value = await getSampleCountByField("host");
    isolationSourceData.value = await getSampleCountByField("isolation_source");
  } catch (err) {
    console.error('Error loading host and isolation source data', err);
  } finally {
    isLoadingChart.value = false;
  }
}

async function loadData() {
  chartData.value = [];
  if(selectedPhenotypeScore.value === null){
    return;
  }
  isLoadingChart.value = true;
  error.value = null;

  try {
    // TODO: Get HA protein ID from API
    chartData.value = await getCountByPhenotypeScoreFilterByHostAndIsolationSource("XAJ25415.1", selectedPhenotypeScore.value, selectedHost.value.key, selectedIsolationSource.value.key, props.dataField);
  } catch (err) {
    console.error('Error loading DMS data:', err);
    error.value = 'Failed to load data. Please try again later.';
    chartData.value = [];
  } finally {
    isLoadingChart.value = false;
  }
}

onMounted(() => {
  loadHostAndIsolationSourceData();
  loadData();
});

watch(() => selectedPhenotypeScoreObject.value, loadData);
watch(() => selectedHost.value, loadData);
watch(() => selectedIsolationSource.value, loadData);
</script>

<style scoped>

</style>