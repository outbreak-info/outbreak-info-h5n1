<template>
  <div class="container mt-3">
    <div class="row">
      <div class="col-md-12">
        <h2>Lineage comparison</h2>
        <hr>
        <LineageComparisonHeatMap />
      </div>
    </div>
  </div>

  <div class="container mt-3">
    <div class="row">
      <div class="col-md-12">
        <MutationProfileComparison />
      </div>
    </div>
  </div>
</template>

<script setup>
import LineageComparisonHeatMap from "../components/LineageComparisonHeatMap.vue";
import MutationProfileComparison from "../components/MutationProfileComparison.vue";
</script>

<style scoped>

</style>