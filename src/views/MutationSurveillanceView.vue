<template>
  <div class="container mt-3">
    <div class="row">
      <div class="col-md-12">
        <CountsByPhenotypeScore dataField="variants" title="Host-level" />
      </div>
      <div class="col-md-12">
        <CountsByPhenotypeScore dataField="mutations" title="Population-level" />
      </div>
    </div>
  </div>
</template>

<script setup>
import CountsByPhenotypeScore from "../components/CountsByPhenotypeScore.vue";
</script>

<style scoped>

</style>