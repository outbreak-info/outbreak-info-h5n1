<template>
  <div class="host-view">
    <h5>Phenotype over time</h5>
    <TextInput
        label="Select a phenotype above and enter a threshold for phenotype value"
        placeholder="Enter threshold for phenotype value"
        buttonText="Submit"
        :modelValue="phenotypeMetricValueThreshold.phenotype_metric_value"
        @submit="handleSubmit"
        class="mb-3"
    />
    <InfoComponent :embedded="true">
      <span v-html="helpText.mutationSurveillance.phenotypeByCollectionDate"></span>
    </InfoComponent>
    <div v-if="isLoading">
      <LoadingSpinner />
    </div>
    <div v-else-if="chartData.length > 0" class="chart-wrapper mt-3">

      <TimeSeriesBarChart
          :data="chartData"
          :height="300"
          :width="1200"
          dateKey="key"
          groupKey="group"
          binInterval="month"
          :isPreBinned="true"
          tickInterval="3 month"
          :marginBottom="50"
          :marginLeft="100"
          :marginTop="40"
          xLabel="Time"
          yLabel="Proportion of unique mutations"
          :rangeColor="outbreakInfoColorPalette.slice(4,20)"
      />
      <TimeSeriesBarChart
          :data="chartDataCounts"
          :height="150"
          :width="1200"
          dateKey="key"
          groupKey="group"
          binInterval="month"
          :isPreBinned="true"
          tickInterval="3 month"
          :marginBottom="50"
          :marginLeft="100"
          :marginTop="40"
          xLabel="Time"
          yLabel="Count of unique mutations"
          :rangeColor="outbreakInfoColorPalette.slice(4,20)"
      />
      </div>
  </div>
</template>

<script setup>
import {computed, onMounted, ref, watch} from 'vue';
import { TimeSeriesBarChart, TextInput, LoadingSpinner, InfoComponent, outbreakInfoColorPalette } from 'outbreakInfo';
import {
  getPhenotypeMetricCountsForMutationsByCollectionDate,
  getPhenotypeMetricCountsForVariantsByCollectionDate, getPhenotypeMetricValueByMutationsQuantile,
  getPhenotypeMetricValueByVariantsQuantile
} from "../services/munninService.js";
import helpText from "../helpInfo/helpInfoText.json";
import {phenotypeMetricLabels} from "../constants/labels.js";

const chartData = ref([])
const chartDataCounts =ref([])
const isLoading = ref(false);
const phenotypeMetricValueThreshold = ref({phenotype_metric_value: null, quantile:0.5});

const props = defineProps({
  dataField: { type: String, default: "variants" },
  selectedPhenotypeScore : { type: String, default: null },
  selectedHost: { type: Object, default: null },
  selectedIsolationSource: { type: Object, default: null }
})

const selectedPhenotypeScoreLabel = computed(() => phenotypeMetricLabels[props.selectedPhenotypeScore] || props.selectedPhenotypeScore);

function ungroupData(data, proportion = false) {
  return data.flatMap(({ date, n_gte, n }) => [
    { key: date, value: (proportion ? n_gte/n : n_gte) ,       group: selectedPhenotypeScoreLabel.value + ' >= ' + phenotypeMetricValueThreshold.value.phenotype_metric_value },
    { key: date, value: (proportion ? (n - n_gte)/n : n - n_gte),   group: selectedPhenotypeScoreLabel.value + ' < ' +  phenotypeMetricValueThreshold.value.phenotype_metric_value  }
  ]);
}

async function getPhenotypeMetricCountsForDataFieldByCollectionDate(dataField, phenotypeMetricName, q) {
  if (dataField === "variants") {
    if(phenotypeMetricValueThreshold.value.phenotype_metric_value === null) {
      phenotypeMetricValueThreshold.value = await getPhenotypeMetricValueByVariantsQuantile(phenotypeMetricName, 0.5);
    }
    return await getPhenotypeMetricCountsForVariantsByCollectionDate(phenotypeMetricName, phenotypeMetricValueThreshold.value.phenotype_metric_value, q);
  } else if (dataField === "mutations") {
    if(phenotypeMetricValueThreshold.value.phenotype_metric_value === null) {
      phenotypeMetricValueThreshold.value = await getPhenotypeMetricValueByMutationsQuantile(phenotypeMetricName, 0.5);
    }
    return await getPhenotypeMetricCountsForMutationsByCollectionDate(phenotypeMetricName, phenotypeMetricValueThreshold.value.phenotype_metric_value, q);
  } else {
    return [];
  }
}

async function loadData() {
  chartData.value = [];
  chartDataCounts.value = [];

  if (isLoading.value) return;
  if (props.selectedPhenotypeScore !== "" && props.selectedPhenotypeScore !== null) {
    let q = "";
    if (props.selectedHost.key !== null && props.selectedIsolationSource.key != null) {
      q = `host=${props.selectedHost.key} ^ isolation_source=${props.selectedIsolationSource.key}`
    } else if(props.selectedHost.key !== null) {
      q = `host=${props.selectedHost.key}`
    } else if(props.selectedIsolationSource.key != null) {
      q = `isolation_source=${props.selectedIsolationSource.key}`
    }
    isLoading.value = true;
    const data = await getPhenotypeMetricCountsForDataFieldByCollectionDate(props.dataField,
        props.selectedPhenotypeScore,
        q);
    isLoading.value = false;
    chartData.value = ungroupData(data, true);
    chartDataCounts.value = ungroupData(data);
  }
}

async function handleSubmit(value) {
  phenotypeMetricValueThreshold.value.phenotype_metric_value = value;
  loadData();
}

onMounted(loadData);
watch(() => props.selectedPhenotypeScore, () => {
  phenotypeMetricValueThreshold.value.phenotype_metric_value = null;
  loadData();
});

watch(() => props.selectedHost, () => {
  phenotypeMetricValueThreshold.value.phenotype_metric_value = null;
  loadData();
}, { deep: true });

watch(() => props.selectedIsolationSource, () => {
  phenotypeMetricValueThreshold.value.phenotype_metric_value = null;
  loadData();
}, { deep: true });
</script>

<style scoped>

</style>