<template>
  <div class="viewport-toolbar">
    <a-checkbox
      :checked="props.fourChecked"
      @change="(e) => handleFourChange(e.target.checked)"
      >四角信息</a-checkbox
    >
    <a-checkbox
      :checked="props.allChecked"
      @change="(e) => handleAllChange(e.target.checked)"
      >所有图元</a-checkbox
    >
  </div>
</template>

<script setup>
import { defineEmits, defineProps } from "vue";

const props = defineProps([
  "fourChecked",
  "allChecked",
  "setFourCheckedState",
  "setAllCheckedState",
]);

const emit = defineEmits(["showAllAnnotations"]);

const handleFourChange = (check) => {
  props.setFourCheckedState(check);
  changeCustomOverlayState(check);
};

const handleAllChange = (val) => {
  props.setAllCheckedState(val);
  changeCustomOverlayState(val);
  emit("showAllAnnotations", val);
};

const changeCustomOverlayState = (check) => {
  const customOverlayList = document.querySelectorAll(".custom-overlay");
  let cornerInfoOverlayList = [];
  cornerInfoOverlayList = document.querySelectorAll(".cornerInfo");
  if (!check) {
    customOverlayList.forEach((item) => {
      item.style.display = "none";
    });
    if (cornerInfoOverlayList.length > 0) {
      cornerInfoOverlayList.forEach((item) => {
        item.style.display = "none";
      });
    }
  } else {
    customOverlayList.forEach((item) => {
      item.style.display = "flex";
    });
    if (cornerInfoOverlayList.length > 0) {
      cornerInfoOverlayList.forEach((item) => {
        item.style.display = "block";
      });
    }
  }
};
</script>

<style scoped lang="scss">
.viewport-toolbar {
  width: calc(100% - 450px);
  min-width: 420px;
  height: 25px;
  background: rgb(79, 83, 85);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 11;
}
</style>

<style lang="scss">
.viewport-toolbar {
  .ant-checkbox-wrapper {
    color: #fff !important;
  }
}
</style>
