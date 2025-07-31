<template>
  <h5>Lag between release and collection date</h5>
  <TimeSeriesPointRangeChart
      :data="chartData"
      :isPreBinned="true"
      binInterval="month"
      xLabel="Month"
      dateKey="collection_date_bin"
      q1Attribute="lag_q1"
      q3Attribute="lag_q3"
      medianAttribute="lag_median"
      tickInterval="6 month"
      :marginBottom="70"
      :marginLeft="100"
      :marginTop="50"
      yLabel="Lag between collection date release date"
      :height="500"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { TimeSeriesPointRangeChart, LoadingSpinner } from 'outbreakInfo';
import {onMounted} from "vue";
import { getSampleCollectionReleaseLag } from "../services/munninService.js";

const chartData = ref([]);

async function loadData() {
  const res = await getSampleCollectionReleaseLag();
  chartData.value = res.filter(obj => obj.lag_median > 0);
}

onMounted(loadData);
</script>

<style scoped>

</style>