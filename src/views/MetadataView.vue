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

    <!-- Second row with one centered div -->
    <div class="row">
      <div class="col-md-6 offset-md-3">
        <SampleReleaseDate />
      </div>
    </div>
  </div>
</template>

<script setup>
import SampleHost from "../components/SampleHost.vue";
import SampleIsolationSource from "../components/SampleIsolationSource.vue";
import SampleReleaseDate from "../components/SampleReleaseDate.vue";
</script>


<style>
.chart-container svg text {
  font-size: 16px; /* Base font size for all text elements */
}

.chart-container :deep(.tick text) {
  font-size: 14px; /* Font size for axis tick labels */
}

.chart-container :deep(.axis-label) {
  font-size: 18px; /* Font size for axis labels */
  font-weight: 500;
}

/* If you need to adjust specific elements */
.chart-container :deep(.y-axis text) {
  font-size: 14px; /* Y-axis specific font size */
}

.chart-container :deep(.x-axis text) {
  font-size: 14px; /* X-axis specific font size */
}
</style>