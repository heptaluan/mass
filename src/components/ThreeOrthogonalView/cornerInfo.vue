<template>
  <div class="cornerInfo" :class="{vertical: isVertical}">
    <div class="topLeft">
      <span>{{ props.seriesData.userName }}</span>
      <span>{{ props.seriesData.patientId }}</span>
      <span
      >{{ props.seriesData.userBirthday }} {{ props.seriesData.userSex }}
          {{ props.seriesData.userAge }}Y</span
      >
      <span>{{ props.seriesData.seriesDateTime }}</span>
      <span>Series Nb：{{ props.seriesData.seriesNumber }}</span>
      <span>IM: {{ Number(props.overlayData.total) - Number(props.overlayData.imageIndex) }}/{{Number(props.overlayData.total) }}</span>
    </div>
    <div class="topCenter">
      <span>A</span>
      <span>当前(C) {{ currentTime }}</span>
    </div>
    <div class="topRight">
      <span>{{ props.institutionInfo.institutionName }}</span>
      <span>{{ props.institutionInfo.modality }}</span>
      <span>{{ props.institutionInfo.manufacturer }}</span>
      <span>{{ props.institutionInfo.accessionNumber }}</span>
    </div>
    <div class="bottomLeft">
      <span>Location：{{ props.overlayData.position }}</span>
      <span>Thickness: {{ pointStore().getDicomThickness / 2 }} mm</span>
      <span>Col:{{ props.overlayData.col }} Row:{{ props.overlayData.row }}</span>
    </div>
    <div class="bottomRight">
      <span>Zoom: {{ props.overlayData.zoom }}</span>
      <span>WW:{{ toFixed(-Number(props.overlayData.lower), 2) }} WL:
          {{ toFixed(-Number(props.overlayData.upper), 2) }}</span>
    </div>
  </div>
</template>

<script setup>
import { defineProps, onMounted, ref, watch } from "vue";
import { loadImage } from "@cornerstonejs/core/dist/esm/loaders/imageLoader";
import { pointStore } from "@/store/modules/pointStore";
const props = defineProps(["overlayData", "seriesData", 'institutionInfo', "isVertical"]);

const currentTime = ref(null);
const institutionInfo = ref({});

const getCurrentTime = () => {
  const yy = new Date().getFullYear();
  const mm = new Date().getMonth() + 1;
  const dd = new Date().getDate();
  currentTime.value = yy + "/" + mm + "/" + dd;
};

watch(
    () => props.overlayData,
    () => {
      if (props.overlayData.currentImageId) {
        if (institutionInfo.value.institutionName) {
          return;
        } else {
          loadImage(props.overlayData.currentImageId).then(function (image) {
            institutionInfo.value = {
              institutionName: image.data?.string("x00080080") || undefined,
              modality: image.data?.string("x00080060") || undefined,
              manufacturer: image.data?.string("x00080070") || undefined,
              accessionNumber: image.data?.string("x00080050") || undefined,
              thickness: image.data?.string("x00180050")
            };
          });
        }
      }
    },
    { deep: true }
);

onMounted(() => {
  getCurrentTime();
});

const toFixed = (num, point) => {
  var endNum = parseInt(num * Math.pow(10, point + 1)) % 10;
  if (endNum <= 4) {
    return parseInt(num * Math.pow(10, point)) / Math.pow(10, point);
  } else {
    return (parseInt(num * Math.pow(10, point)) + 1) / Math.pow(10, point);
  }
};
</script>

<style scoped lang="scss">
.cornerInfo {
  position: relative;
  height: 1px;
  z-index: 30;
  font-size: 13px;
  span {
    margin-bottom: 4px;
  }
  .topLeft, .bottomLeft {
    position: absolute;
    left: 38%;;
    display: flex;
    flex-direction: column;
  }
  .topLeft {
    top: 1.2vw;
  }
  .bottomLeft {
    top: 82.5vh;
  }
  .topCenter {
    position: absolute;
    top: 1.2vw;
    left: 67%;;
    display: flex;
    flex-direction: column;
    text-align: center;
  }
  .topRight, .bottomRight {
    position: absolute;
    text-align: right;
    right: 1.2vw;
    display: flex;
    flex-direction: column;
  }
  .topRight {
    top: 1.2vw;

  }
  .bottomRight {
    top: 82.5vh;
  }
  &.vertical {
    .bottomLeft {
      top: calc(100vh - 690px  ) !important;
    }
    .bottomRight {
      top: calc(100vh - 690px ) !important;
    }
  }
}

</style>
