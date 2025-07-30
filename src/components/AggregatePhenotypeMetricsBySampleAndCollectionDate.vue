<template>
  <div class="host-view">
    <h5>Phenotype aggregate by sample</h5>
    <InfoComponent :embedded="true">
      <span v-html="helpText.mutationSurveillance.phenotypeAggregateBySample"></span>
    </InfoComponent>
    <div v-if="isLoading">
      <LoadingSpinner />
    </div>

    <div v-else-if="chartData.length > 0" class="chart-wrapper mt-3">
      <TimeSeriesPointRangeChart
          :data="chartData"
          :isPreBinned="true"
          binInterval="month"
          xLabel="Month"
          q1Attribute="aggregate_value_q1"
          q3Attribute="aggregate_value_q3"
          medianAttribute="aggregate_value_median"
          tickInterval="6 month"
          :marginBottom="70"
          :marginLeft="100"
          :marginTop="50"
          :yLabel="selectedPhenotypeScore"
          :width="1200"
          :height="300"
      />
    </div>
  </div>
</template>

<script setup>
import {onMounted, ref, watch} from 'vue';
import { TimeSeriesPointRangeChart, LoadingSpinner, InfoComponent, outbreakInfoColorPalette } from 'outbreakInfo';
import {
  getAggregatePhenotypeMetricValuesForVariantsBySampleAndCollectionDate,
  getAggregatePhenotypeMetricValuesForMutationsBySampleAndCollectionDate,
} from "../services/munninService.js";
import helpText from "../helpInfo/helpInfoText.json";

const chartData = ref([])
const isLoading = ref(false);

const props = defineProps({
  dataField: { type: String, default: "variants" },
  selectedPhenotypeScore : { type: String, default: null },
  selectedHost: { type: Object, default: null },
  selectedIsolationSource: { type: Object, default: null }
})

async function getAggregatePhenotypeMetricValuesForDataFieldBySampleAndCollectionDate(dataField, phenotypeMetricName, q) {
  if(dataField === "variants") {
    return await getAggregatePhenotypeMetricValuesForVariantsBySampleAndCollectionDate(phenotypeMetricName, q);
  } else if (dataField === "mutations") {
    return await getAggregatePhenotypeMetricValuesForMutationsBySampleAndCollectionDate(phenotypeMetricName, q);
  }
  return [];
}

async function loadData() {
  if (isLoading.value) return;
  
  chartData.value = [];
  if (props.selectedPhenotypeScore !== "") {
    let q = "";
    if (props.selectedHost.key !== null && props.selectedIsolationSource.key != null) {
      q = `host=${props.selectedHost.key} ^ isolation_source=${props.selectedIsolationSource.key}`
    } else if(props.selectedHost.key !== null) {
      q = `host=${props.selectedHost.key}`
    } else if(props.selectedIsolationSource.key != null) {
      q = `isolation_source=${props.selectedIsolationSource.key}`
    }
    isLoading.value = true;
    chartData.value = await getAggregatePhenotypeMetricValuesForDataFieldBySampleAndCollectionDate(props.dataField,
        props.selectedPhenotypeScore,
        q);
    isLoading.value = false;
  }
}

onMounted(loadData);
watch(() => props.selectedPhenotypeScore, () => {
  loadData();
}, { deep: true });

watch(() => props.selectedHost, () => {
  loadData();
}, { deep: true });

watch(() => props.selectedIsolationSource, () => {
  loadData();
}, { deep: true });
</script>

<style scoped>

</style>