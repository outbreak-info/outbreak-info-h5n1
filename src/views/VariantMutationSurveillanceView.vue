<template>
  <div class="container mt-3">
    <div class="row">
      <h2>First detection of mutation at host- and population-level</h2>
      <InfoComponent :embedded="true" class="mb-3">
        <span v-html="helpText.variantMutationSurveillance.firstDetection"></span>
      </InfoComponent>
      <VariantMutationLag />
    </div>
  </div>
  <div class="container mt-3">
    <div class="row">
      <h2>Host-level frequency and population-level mutations over time</h2>
      <InfoComponent :embedded="true">
        <span v-html="helpText.variantMutationSurveillance.variantFrequencyAndMutationCountsOverTime"></span>
      </InfoComponent>
      <VariantFrequencyAndMutationsByCollectionDate />
    </div>
  </div>
</template>

<script setup>
import VariantMutationLag from "../components/VariantMutationLag.vue";
import VariantFrequencyAndMutationsByCollectionDate from "../components/VariantFrequencyAndMutationsByCollectionDate.vue";
import helpText from "../helpInfo/helpInfoText.json";
import { InfoComponent } from 'outbreakInfo';
</script>

<style scoped>

</style>