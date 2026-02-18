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
      <scatterChart
          v-else
          :data="chartData"
          xKey="phenotypeScore"
          yKey="count"
          :pointColor="outbreakInfoColorPalette[0]"
          :titleKey="'key'"
          :yLabel="'Number of samples'"
          :logScale="useLogScale"
          :additionalAnnotationKeys="selectedPhenotypeScore === 'mutdiffsel' ? [] : ['h3Site']"
          :tipFormatString="selectedPhenotypeScore === 'mutdiffsel' ? 'Mutation: {key}\nCount: {y}\nDMS: {x}' : 'Mutation: {key}\nH3 site number: {additional0}\nCount: {y}\nDMS: {x}'"
          :showMinMaxXLabels="getAxesAttributes(selectedPhenotypeScore, 'showMinMaxXLabels')"
          :minXLabel="getAxesAttributes(selectedPhenotypeScore, 'showMinMaxXLabels') ? getAxesAttributes(selectedPhenotypeScore, 'minXLabel') : null"
          :maxXLabel="getAxesAttributes(selectedPhenotypeScore, 'showMinMaxXLabels') ? getAxesAttributes(selectedPhenotypeScore, 'maxXLabel') : null"
          :xLabel="!getAxesAttributes(selectedPhenotypeScore, 'showMinMaxXLabels') ? getAxesAttributes(selectedPhenotypeScore, 'xLabel') : null"
          :xDomain="phenotypeMetricMinAndMax"
      />
    </div>

    <div class="col col-md-3">
      <SelectBarChartWithBarGraph
          :data="hostData"
          fieldName="Host"
          :selectedItem="selectedHost"
          @item-selected="hostBarSelected"
          :width="270"
          :height="240"
          :xTickFrequency="6"
          :marginLeft="100"/>
    </div>

    <div class="col col-md-3">
      <SelectBarChartWithBarGraph
          :data="isolationSourceData"
          fieldName="Isolation Source"
          :selectedItem="selectedIsolationSource"
          @item-selected="isolationSourceBarSelected"
          :width="270"
          :xTickFrequency="6"
          :height="240"
          :marginLeft="100" />
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
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { ScatterChart, outbreakInfoColorPalette, SelectBarChartWithBarGraph, LoadingSpinner, InfoComponent, CheckBox } from 'outbreakInfo';
import {
  getSampleCountByField,
  getCountByPhenotypeScore,
  getPhenotypeMetricMinAndMax,
  buildStringQuery,
  getRegionToGffFeatureMappingForMutations,
  getRegionToGffFeatureMappingForVariants,
} from '../services/munninService.js';
import PhenotypeMetricsByCollectionDate from './PhenotypeMetricsByCollectionDate.vue';
import AggregatePhenotypeMetricsBySampleAndCollectionDate from "./AggregatePhenotypeMetricsBySampleAndCollectionDate.vue";
import PhenotypicMetricNamesMultiSelect from "./PhenotypicMetricNamesMultiSelect.vue";
import helpText from '../helpInfo/helpInfoText.json';
import { phenotypeMetricAxesLabels, defaultValues } from '../constants/labels.js'
import {convertSiteHANumbering} from "@/utils/utils.js";

const selectedPhenotypeScoreObject = ref(defaultValues.phenotypeScore);
const selectedPhenotypeScore = computed(() => {
  if(selectedPhenotypeScoreObject.value === null)
    return null
  return selectedPhenotypeScoreObject.value.value;
})
const useLogScale = ref(true);
const chartData = ref([]);
const isLoadingSelectData = ref(false);
const isLoadingChart = ref(false);
const error = ref(null);
const hostData = ref([]);
const selectedHost = ref({key: null, value: null});
const phenotypeMetricMinAndMax = ref([null, null]);


function getAxesAttributes(phenotypeScore, attribute) {
  if(!(phenotypeScore in phenotypeMetricAxesLabels))
    return null;
  return phenotypeMetricAxesLabels[phenotypeScore][attribute];
}

const isolationSourceData = ref([]);
const selectedIsolationSource = ref({key: null, value: null});
const regionMapping = ref({});

const props = defineProps({
  dataField: { type: String, default: "variants" },
  title: { type: String, default: "Host-level" }
})

// Looks up the protein accession for a given segment name (e.g. "HA", "PB2")
// from the region mapping returned by the API.
const getRegionForSegment = (segmentName) => {
  const entry = Object.entries(regionMapping.value).find(([, v]) => v === segmentName);
  return entry ? entry[0] : null;
}

const currentRegion = computed(() => {
  const region = selectedPhenotypeScore.value === 'mutdiffsel'
        ? getRegionForSegment('PB2')
        : getRegionForSegment('HA');
    if (!region && !error.value) {
      error.value = 'Unable to determine genomic region for the selected phenotype metric.';
    }
    return region;
});

const hostBarSelected = (item) => {
  selectedHost.value = item;
};

const isolationSourceBarSelected = (item) => {
  selectedIsolationSource.value = item;
}

async function getCountByPhenotypeScoreFilterByHostAndIsolationSource(region, phenotypeScore, host, isolationSource, dataField) {
  const q = buildStringQuery([
    { field: "host", value: host},
    { field: "isolation_source", value: isolationSource }
  ]);
  const res = await getCountByPhenotypeScore(region, phenotypeScore, q, dataField);
  return res.map(item => ({
    h3Site: phenotypeScore !== 'mutdiffsel'
      ? convertSiteHANumbering(item.position_aa, "sequential_site", "reference_site")
      : null,
    ...item
  }))
}

async function loadHostAndIsolationSourceData(){
  isLoadingSelectData.value = true;
  try {
    [hostData.value, isolationSourceData.value] = await Promise.all([
        getSampleCountByField("host"),
        getSampleCountByField("isolation_source")
    ]);
  } catch (err) {
    console.error('Error loading host and isolation source data', err);
  } finally {
    isLoadingSelectData.value = false;
  }
}

async function loadData() {
  chartData.value = [];
  if(selectedPhenotypeScore.value === null || !currentRegion.value){
    return;
  }
  isLoadingChart.value = true;
  error.value = null;

  try {
    [chartData.value, phenotypeMetricMinAndMax.value] = await Promise.all([
      getCountByPhenotypeScoreFilterByHostAndIsolationSource(currentRegion.value, selectedPhenotypeScore.value, selectedHost.value.key, selectedIsolationSource.value.key, props.dataField),
      getPhenotypeMetricMinAndMax(selectedPhenotypeScore.value)
    ]);
  } catch (err) {
    console.error('Error loading DMS data:', err);
    error.value = 'Failed to load data. Please try again later.';
    chartData.value = [];
  } finally {
    isLoadingChart.value = false;
  }
}

async function loadRegionMapping() {
  try {
    regionMapping.value = props.dataField === 'mutations'
      ? await getRegionToGffFeatureMappingForMutations()
      : await getRegionToGffFeatureMappingForVariants();
  } catch (err) {
    console.error('Error loading region mapping:', err);
    error.value = 'Failed to load region mapping. Data cannot be loaded at this time.';
  }
}

onMounted(async () => {
  await loadRegionMapping();
  loadHostAndIsolationSourceData();
  loadData();
});

watch(() => selectedPhenotypeScoreObject.value, loadData);
watch(() => selectedHost.value, loadData);
watch(() => selectedIsolationSource.value, loadData);
</script>

<style scoped>

</style>
