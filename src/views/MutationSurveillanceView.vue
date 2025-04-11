<template>
  <div class="container mt-3">
    <div class="row">
      <div class="col-md-6">
        <CountsByPhenotypeScore :dataService="getVariantFrequencyByScore" title="Host-level" />
      </div>
      <div class="col-md-6">
        <CountsByPhenotypeScore :dataService="getMutationFrequencyByScore" title="Population-level" />
      </div>
    </div>
  </div>
</template>

<script setup>
import CountsByPhenotypeScore from "../components/CountsByPhenotypeScore.vue";
import {getVariantFrequencyByScore, getMutationFrequencyByScore} from "../services/postgresApi.js";
</script>

<style scoped>

</style>