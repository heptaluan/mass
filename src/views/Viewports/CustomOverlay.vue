<template>
  <div class="custom-overlay">
    <div class="top-box">
      <div class="top-left">
        <span>{{ props.seriesData.userName }}</span>
        <span>{{ props.seriesData.patientId }}</span>
        <span
          >{{ props.seriesData.userBirthday }} {{ props.seriesData.userSex }}
          {{ props.seriesData.userAge }}Y</span
        >
        <span>{{ props.seriesData.seriesDateTime }}</span>
        <span>Series Nb：{{ props.seriesData.seriesNumber }}</span>
        <span
          >IM: {{ props.overlayData.imageIndex + 1 }}/{{
            props.overlayData.total
          }}</span
        >
      </div>
      <div class="top-right">
        <span>{{ props.institutionInfo.institutionName }}</span>
        <span>{{ props.institutionInfo.modality }}</span>
        <span>{{ props.institutionInfo.manufacturer }}</span>
        <span>{{ props.institutionInfo.accessionNumber }}</span>
      </div>
    </div>
    <div class="bottom-box">
      <div class="bottom-left">
        <span>Location：{{ props.overlayData.position }}</span>
        <span>Thicknes: {{ pointStore().getDicomThickness / 2 }} mm</span>
        <span
          >Col:{{ props.overlayData.col }} Row:{{ props.overlayData.row }}</span
        >
      </div>
      <div class="bottom-right">
        <span>Zoom: {{ props.overlayData.zoom }}</span>
        <span
          >WW:{{ (-Number(props.overlayData.lower)).toFixed(2) }} WL:
          {{ (-Number(props.overlayData.upper)).toFixed(2) }}</span
        >
      </div>
    </div>

    <div class="marks">
      <div class="top">
        <span>{{ props.overlayData.top }}</span>
        <span>当前(C) {{ currentTime }}</span>
      </div>
      <div class="left">
        <span>{{ props.overlayData.left }}</span>
      </div>
      <div class="right">
        <span>{{ props.overlayData.right }}</span>
      </div>
      <div class="bottom">
        {{ props.overlayData.bottom }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, onMounted, ref } from "vue";
import { pointStore } from "@/store/modules/pointStore";

const props = defineProps(["overlayData", "seriesData", "institutionInfo"]);

const currentTime = ref(null);

const getCurrentTime = () => {
  const yy = new Date().getFullYear();
  const mm = new Date().getMonth() + 1;
  const dd = new Date().getDate();
  currentTime.value = yy + "/" + mm + "/" + dd;
};

const toFixed = (num, point) => {
  var endNum = parseInt(num * Math.pow(10, point + 1)) % 10;
  if (endNum <= 4) {
    return parseInt(num * Math.pow(10, point)) / Math.pow(10, point);
  } else {
    return (parseInt(num * Math.pow(10, point)) + 1) / Math.pow(10, point);
  }
};

onMounted(() => {
  getCurrentTime();
});
</script>

<style scoped lang="scss">
.custom-overlay {
  position: absolute;
  left: 0;
  top: 0;
  width: calc(100% - 20px);
  height: 100%;
  z-index: 9;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px;
  font-size: 14px;

  .top-box,
  .bottom-box {
    display: flex;
    align-content: center;
    justify-content: space-between;

    span {
      display: block;
      margin-bottom: 5px;
    }
  }

  .top-right,
  .bottom-right {
    text-align: right;
  }

  .bottom-right {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }

  .marks {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    font-size: 16px;

    .top,
    .bottom {
      text-align: center;
      position: absolute;
      display: flex;
      width: 100%;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    .top {
      left: 0;
      top: 10px;

      span:first-child {
        margin-bottom: 5px;
      }

      span:last-child {
        font-size: 14px;
      }
    }

    .bottom {
      left: 0;
      bottom: 10px;
    }

    .left,
    .right {
      text-align: center;
      position: absolute;
      display: flex;
      height: 100%;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    .left {
      left: 10px;
      top: 0;
    }

    .right {
      right: 10px;
      top: 0;
    }
  }
}
</style>
