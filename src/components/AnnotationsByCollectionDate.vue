<template>
  <h5>Literature annotations over time</h5>
  <InfoComponent :embedded="true">
    <span v-html="helpText.mutationSurveillance.literatureAnnotationsOverTime"></span>
  </InfoComponent>
  <MultiSelectComponent
      :multiple="false"
      :options="allAnnotationEffects"
      label="Select annotation effect"
      placeholder="Select annotation effect"
      :showButton="false"
      @update:modelValue="annotationSelected"
  />

  <div v-if="isLoading" class="loading">
    <LoadingSpinner />
  </div>
  <TimeSeriesBarChart
      v-else
      :data="chartData"
      :height="300"
      :width="1200"
      dateKey="date"
      valueKey="n"
      groupKey="group"
      binInterval="month"
      :isPreBinned="true"
      tickInterval="3 month"
      :marginBottom="70"
      :marginLeft="100"
      xLabel="Time"
      yLabel="Count"
      :rangeColor="outbreakInfoColorPalette.slice(6, 10)"
  />
</template>

<script setup>
import {ref, onMounted } from 'vue';
import { MultiSelectComponent, InfoComponent, TimeSeriesBarChart, LoadingSpinner, outbreakInfoColorPalette } from 'outbreakInfo';
import { getAnnotationsByVariantsAndCollectionDate, getAnnotationsByMutationsAndCollectionDate, getAllAnnotationEffects } from '../services/munninService.js';
import helpText from "../helpInfo/helpInfoText.json";

const chartData = ref([]);
const allAnnotationEffects = ref([]);
const isLoading = ref(false);


const props = defineProps({
  dataField: { type: String, default: "variants" }
})

async function loadData() {
  let resp = await getAllAnnotationEffects();
  allAnnotationEffects.value = resp.map(effect => ({
    label: effect,
    value: effect,
  }));
}

async function annotationSelected(effectDetail) {
  isLoading.value = true;
  let resp;
  if(props.dataField === "variants") {
    resp = await getAnnotationsByVariantsAndCollectionDate(effectDetail);
  } else if(props.dataField === "mutations") {
    resp = await getAnnotationsByMutationsAndCollectionDate(effectDetail);
  }
  isLoading.value = false;
  chartData.value = resp.map(effect => ({
    ...effect,
    group: effectDetail
  }))
}

onMounted(loadData);
</script>

<style scoped>

</style>