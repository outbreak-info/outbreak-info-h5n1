<template>
  <div class="container mt-3">
    <div class="row">
      <div class="col-md-6">
        <DMSHostLevel />
      </div>
      <div class="col-md-6">
        <DMSPopulationLevel />
      </div>
    </div>
  </div>
</template>

<script setup>
import DMSHostLevel from "../components/DMSHostLevel.vue";
import DMSPopulationLevel from "../components/DMSPopulationLevel.vue";
</script>

<style scoped>

</style>