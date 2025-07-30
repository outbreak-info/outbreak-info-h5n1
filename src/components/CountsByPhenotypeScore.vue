<template>
<!--  <h5>{{ title }}</h5>-->
<!--  <hr>-->
  <div class="row">
    <div class="col mb-3">
      <InfoComponent :embedded="true">
        <span class="d-inline" v-html="(dataField==='variants') ? helpText.mutationSurveillance.hostLevel : helpText.mutationSurveillance.populationLevel"></span>
      </InfoComponent>
    </div>
  </div>

  <form>
    <div class="row">
      <div class="col col-12">
        <h5>Select a phenotype</h5>
        <InfoComponent :embedded="true">
          <span v-html="helpText.mutationSurveillance.phenotype"></span>
        </InfoComponent>
        <PhenotypicMetricNamesMultiSelect class="inline" @update:modelValue="updatedPhenotypeScore" />
      </div>
      <div class="col mb-3">
        <div class="mb-2 mt-2 form-check">
<!--        TODO: Import CheckBoxComponent from component library -->
          <input type="checkbox" v-model="useLogScale" class="form-check-input" :id="elementIds.logScale">
          <label class="form-check-label" :for="elementIds.logScale">
            Log scale
          </label>
        </div>
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
          :x-key="'phenotypeScore'"
          :y-key="'count'"
          :pointColor="outbreakInfoColorPalette[0]"
          :title-key="'key'"
          :x-label="selectedPhenotypeScore"
          :y-label="'Number of samples'"
          :log-scale="useLogScale"
          :tip-format-string="'Mutation: {key}\nCount: {y}\nDMS: {x}'"
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
  <div class="row">
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
      <AnnotationsByCollectionDate :dataField="props.dataField" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, useId, computed } from 'vue';
import { ScatterChart, outbreakInfoColorPalette, SelectBarChartWithBarGraph, LoadingSpinner, InfoComponent } from 'outbreakInfo';
import { getSampleCountByField, getCountByPhenotypeScore } from '../services/munninService.js';
import PhenotypeMetricsByCollectionDate from './PhenotypeMetricsByCollectionDate.vue';
import AnnotationsByCollectionDate from "./AnnotationsByCollectionDate.vue";
import AggregatePhenotypeMetricsBySampleAndCollectionDate from "./AggregatePhenotypeMetricsBySampleAndCollectionDate.vue";
import PhenotypicMetricNamesMultiSelect from "./PhenotypicMetricNamesMultiSelect.vue";
import helpText from '../helpInfo/helpInfoText.json';

const selectedPhenotypeScore = ref('');
const useLogScale = ref(true);
const chartData = ref([]);
const isLoadingChart = ref(false);
const error = ref(null);
const uuid = useId();
const hostData = ref([]);
const selectedHost = ref({key: null, value: null});

const isolationSourceData = ref([]);
const selectedIsolationSource = ref({key: null, value: null});

const elementIds = computed(() => ({
  phenotypeField: `dmsField-${uuid}`,
  logScale: `logScale-${uuid}`
}));

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

async function loadData() {
  isLoadingChart.value = true;
  error.value = null;

  try {
    if(selectedPhenotypeScore.value !== ''){
      // TODO: Get protein ID from API
      chartData.value = await getCountByPhenotypeScoreFilterByHostAndIsolationSource("XAJ25415.1", selectedPhenotypeScore.value, selectedHost.value.key, selectedIsolationSource.value.key, props.dataField);
    }
    hostData.value = await getSampleCountByField("host");
    isolationSourceData.value = await getSampleCountByField("isolation_source");

    if (chartData.value.length === 0) {
      error.value = 'No data found for the selected metric';
    }
  } catch (err) {
    console.error('Error loading DMS data:', err);
    error.value = 'Failed to load data. Please try again later.';
    chartData.value = [];
  } finally {
    isLoadingChart.value = false;
  }
}

async function updatedPhenotypeScore(phenotypeScore) {
  selectedPhenotypeScore.value = phenotypeScore;
}

onMounted(loadData);
watch(() => selectedPhenotypeScore.value, loadData);
watch(() => selectedHost.value, loadData);
watch(() => selectedIsolationSource.value, loadData);
</script>

<style scoped>

</style>