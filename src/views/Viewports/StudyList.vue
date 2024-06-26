<template>
  <div className="study-list-box">
    <div class="header">序列列表</div>
    <div class="box-list">
      <div
        class="box"
        v-for="item in studyList"
        :key="item.id"
        :class="{
          active: item.active,
        }"
        @click="(e) => handleStudyListClicked(item)"
      >
        <canvas :ref="setCoverRef" class="cover"></canvas>
        <div class="over-info">
          <div class="title">{{ item.title }}</div>
          <div class="bottom-box">
            <div>{{ item.time }}</div>
            <div>{{ item.total }}</div>
          </div>
        </div>
        <div v-if="item.mark" class="mark-tips">
          <span class="icon"><icon-font type="icon-a-ziyuan480" /></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  defineEmits,
  onMounted,
  ref,
  defineProps,
  defineExpose,
  watch,
  nextTick,
} from "vue";
import { loadImage } from "@cornerstonejs/core/dist/esm/loaders/imageLoader";
import { renderToCanvasCPU } from "@cornerstonejs/core/src/utilities";
import { createFromIconfontCN } from "@ant-design/icons-vue";
import IconFontUrl from "../../assets/iconFont";

const IconFont = createFromIconfontCN({
  scriptUrl: IconFontUrl,
});

const props = defineProps(["seriesList", "noduleCountMark"]);
const emit = defineEmits(["studyListClick"]);

const coverRef = ref([]);
const studyList = ref([]);

watch(
  () => props.seriesList,
  (newVList) => {
    if (newVList && newVList.length > 0) {
      let url;
      if (process.env.NODE_ENV === "development") {
        url = "http://192.168.1.65:8080";
      } else {
        url = location.origin;
      }
      for (let i = 0; i < newVList.length; i++) {
        studyList.value.push({
          id: newVList[i].id,
          time: newVList[i].seriesDateTime?.split(".")[0].replace("T", " "),
          total: newVList[i].instanceCount,
          title: `Series Nb: ${newVList[i].seriesNumber}`,
          dicom:
            "wadouri:" + url + "/dcm" + newVList[i].firstInstanceVO.dicomUrl,
          seriesInstanceUid: newVList[i].seriesInstanceUid,
          noduleCount: newVList[i].noduleCount,
          active: false,
          mark: newVList[i].noduleCount > 0 ? true : false,
        });
      }
      if (studyList.value.every((item) => item.noduleCount === 0)) {
        studyList.value[0].active = true;
      } else {
        const item = studyList.value.find((item) => item.noduleCount > 0);
        item.active = true;
      }
    }
  }
);

watch(
  () => props.noduleCountMark,
  (newUid) => {
    if (newUid && studyList.value.length > 0) {
      studyList.value.map((item) => (item.mark = false));
      studyList.value.find(
        (item) => item.seriesInstanceUid === newUid
      ).mark = true;
    } else {
      studyList.value.map((item) => (item.mark = false));
    }
  }
);

const setCoverRef = (el) => {
  if (el) {
    coverRef.value.push(el);
  }
};

const initStudyList = async () => {
  for (let i = 0; i < studyList.value.length; i++) {
    nextTick(() => {
      loadImage(studyList.value[i].dicom).then(function (image) {
        renderToCanvasCPU(coverRef.value[i], image);
      });
    });
  }
};

onMounted(() => {
  setTimeout(() => {
    initStudyList();
  }, 2000);
});

const handleStudyListClicked = (item) => {
  emit("studyListClick", item);
};

const setStudyListActive = (id) => {
  studyList.value.map((v) => (v.active = false));
  studyList.value.find((n) => n.id === id).active = true;
};

defineExpose({
  setStudyListActive,
});
</script>

<style scoped lang="scss">
.study-list-box {
  position: absolute;
  left: 0;
  top: 0;
  width: 250px;
  height: calc(100% - 2px);
  background: rgb(29, 31, 33);
  border: 1px solid rgb(105, 105, 105);
  z-index: 10;

  .header {
    height: 25px;
    line-height: 25px;
    background: rgb(79, 83, 85);
    text-align: center;
    font-size: 16px;
  }

  .box-list {
    padding: 10px 10px 30px 10px;
    height: 100%;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 10px;
      height: 1px;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 10px;
      box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
      background: rgb(79, 83, 85);
    }

    &::-webkit-scrollbar-track {
      box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
      border-radius: 10px;
      background: #ededed;
    }

    .box {
      border: 4px solid transparent;
      border-radius: 2px;
      width: 100%;
      height: 160px;
      position: relative;
      font-size: 14px;
      margin-bottom: 10px;
      cursor: pointer;

      &.active {
        border-color: rgb(228, 228, 228);
        border-radius: 2px;
      }

      .cover {
        width: 100%;
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
      }

      .over-info {
        width: 100%;
        height: 100%;
        padding: 5px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        position: absolute;

        .bottom-box {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
        }
      }

      .mark-tips {
        width: 20px;
        height: 20px;
        position: absolute;
        right: 5px;
        top: 3px;
      }
    }
  }

  :deep(.anticon) {
    font-size: 22px;
  }
}
</style>
