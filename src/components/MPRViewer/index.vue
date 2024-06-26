<template>
  <div class="study-list-container">
    <h1 id="demo-title">
      CornerstoneJS mmm
    </h1>
    <div id="c3d-container">
      <three-orthogonal-view :seriesList="seriesList"></three-orthogonal-view>
    </div>
  </div>
</template>

<script setup>
  import ThreeOrthogonalView from '../ThreeOrthogonalView'
  import {onBeforeMount, onMounted, ref} from "vue";
  import router from "@/router";
  import {queryAllByStudyUid} from "@/api";
  import {getAPIResponse} from "@/utils/apiTools/useAxiosApi";

  const seriesList = ref(null)
  onBeforeMount(() => {
    const uid = router.currentRoute.value.params.uid
    queryAllByStudyUid({studyUid: uid}).then(res => {
      seriesList.value = getAPIResponse(res)
      console.log(seriesList.value)
    })
  })
</script>

<style scoped>

</style>
