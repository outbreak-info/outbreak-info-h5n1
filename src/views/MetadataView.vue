<template>
  <div class="container mt-5">
    <div class="row mt-4">
      <div class="col-md-6">
        <h5>Lag between release and collection date</h5>
        <InfoComponent :embedded="true">
          <span v-html="helpText.metadata.collectionReleaseLag"></span>
        </InfoComponent>

        <CollectionReleaseLag />
      </div>
      <div class="col-md-6">
        <h5>Sample release date</h5>
        <InfoComponent :embedded="true">
          <span v-html="helpText.metadata.releaseDate"></span>
        </InfoComponent>

        <SampleReleaseDate />
      </div>
    </div>
  </div>
</template>

<script setup>
import SampleReleaseDate from "../components/SampleReleaseDate.vue";
import CollectionReleaseLag from "../components/CollectionReleaseLag.vue";
import helpText from "../helpInfo/helpInfoText.json";
import { InfoComponent } from 'outbreakInfo';
</script>


<style>

</style>