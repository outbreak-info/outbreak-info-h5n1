<template>
  <div class="container mt-5">
    <!-- First row with two divs -->
    <div class="row">
      <div class="col-md-6">
        <SampleHost />
      </div>
      <div class="col-md-6">
        <div class="custom-div div2">
          <SampleIsolationSource />
        </div>
      </div>
    </div>

    <!-- Second row with two divs -->
    <div class="row mt-4">
      <div class="col-md-6">
        <SampleReleaseDate />
      </div>
      <div class="col-md-6">
        <MonthlyCasesChart />
      </div>
    </div>
  </div>
</template>

<script setup>
import SampleHost from "../components/SampleHost.vue";
import SampleIsolationSource from "../components/SampleIsolationSource.vue";
import SampleReleaseDate from "../components/SampleReleaseDate.vue";
import MonthlyCasesChart from "../components/MonthlyCasesChart.vue";
</script>


<style>

</style>