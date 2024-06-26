<template>
  <template>
    <a-modal
      v-model:visible="addNodeModal"
      title="新增结节"
      style="top: 100px"
      @ok="handleAddModalCallback"
      @cancel="handleAddModalCancel"
      okText="确定"
      cancelText="取消"
      :confirm-loading="confirmLoading"
    >
      <div class="add-node-box">
        <div className="list" style="margin-bottom: 15px">
          <span className="list-title">结节位置：</span>
          <a-select style="width: 160px" v-model:value="lungLocation">
            <a-select-option value="右肺上叶（RUL）"
              >右肺上叶（RUL）</a-select-option
            >
            <a-select-option value="右肺中叶（RML）"
              >右肺中叶（RML）</a-select-option
            >
            <a-select-option value="右肺下叶（RLL）"
              >右肺下叶（RLL）</a-select-option
            >
            <a-select-option value="左肺上叶（LUL）"
              >左肺上叶（LUL）</a-select-option
            >
            <a-select-option value="左肺下叶（LLL）"
              >左肺下叶（LLL）</a-select-option
            >
          </a-select>
        </div>
        <div className="list">
          <span className="list-title">结节类型：</span>
          <a-select style="width: 160px" v-model:value="featuresType">
            <a-select-option value="实性">实性</a-select-option>
            <a-select-option value="部分实性">部分实性</a-select-option>
            <a-select-option value="磨玻璃">磨玻璃</a-select-option>
          </a-select>
        </div>
      </div>
    </a-modal>
  </template>
</template>

<script setup>
import { ref, defineProps } from "vue";
import { message } from "ant-design-vue";

import { pointStore } from "@/store/modules/pointStore";
import { v4 as uuidv4 } from "uuid";

import { addNodule } from "@/api";
import { getAPIResponse } from "@/utils/apiTools/useAxiosApi";

import { removeAnnotation } from "@cornerstonejs/tools/dist/esm/stateManagement";

const addNodeModal = ref(false);
const handles = ref([]);
const cachedStats = ref({});
const UID = ref("");
const lungLocation = ref("右肺上叶（RUL）");
const featuresType = ref("实性");
const confirmLoading = ref(false);

const props = defineProps([
  "seriesInstanceUid",
  "handleAddNewNoduleCallback",
  "renderingEngine",
  "imageIndex",
  "pcrContent",
]);

// 挂载到全局
window.openAddNodeModal = (data, cachedVolumeStats, annotationUID) => {
  handles.value = data;
  cachedStats.value = cachedVolumeStats;
  UID.value = annotationUID;
  lungLocation.value = "右肺上叶（RUL）";
  featuresType.value = "实性";

  if (cachedStats.value && !cachedStats.value.area) {
    message.warning(`请在图像内部进行结节勾画！`);
    handleAddModalCancel();
    addNodeModal.value = false;
    confirmLoading.value = false;
    return false;
  }

  addNodeModal.value = true;
};

// 新增结节
const handleAddModalCallback = () => {
  if (props.pcrContent.sampleCode) {
    window.showUpadtePCRContentConfirm(() => {
      window.clearPCRContent();
      addNewNodule();
    });
  } else {
    addNewNodule();
  }
};

const addNewNodule = () => {
  confirmLoading.value = true;
  const thickness = pointStore().getDicomThickness;
  const addData = {
    centerFrame: props.imageIndex + 1,
    boxDTO: {
      annotationUID: uuidv4(),
      point1: handles.value.handles.points[0].map((item) => item.toFixed(2)),
      point2: handles.value.handles.points[1].map((item) => item.toFixed(2)),
      point3: handles.value.handles.points[2].map((item) => item.toFixed(2)),
      point4: handles.value.handles.points[3].map((item) => item.toFixed(2)),
      point5: [
        handles.value.handles.points[2][0],
        handles.value.handles.points[2][1],
        handles.value.handles.points[2][2] + thickness / 2,
      ].map((item) => item.toFixed(2)),
      point6: [
        handles.value.handles.points[0][0],
        handles.value.handles.points[0][1],
        handles.value.handles.points[0][2] + thickness / 2,
      ].map((item) => item.toFixed(2)),
      point7: [
        handles.value.handles.points[1][0],
        handles.value.handles.points[1][1],
        handles.value.handles.points[1][2] + thickness / 2,
      ].map((item) => item.toFixed(2)),
      point8: [
        handles.value.handles.points[3][0],
        handles.value.handles.points[3][1],
        handles.value.handles.points[3][2] + thickness / 2,
      ].map((item) => item.toFixed(2)),
    },
    width: cachedStats.value.w.toFixed(2),
    height: cachedStats.value.h.toFixed(2),
    location: lungLocation.value,
    featuresType: featuresType.value,
    size: (
      Math.pow(Math.sqrt(Math.abs(cachedStats.value.area)) / 2, 3) * Math.PI
    ).toFixed(2),
    hu: cachedStats.value.mean.toFixed(2),
    seriesInstanceUid: props.seriesInstanceUid,
  };

  addNodule(addData).then((res) => {
    const result = getAPIResponse(res);
    console.log(result);
    if (result === "保存成功" || result.includes("ai运算异常")) {
      props.handleAddNewNoduleCallback(addData);

      // 新增以后清除标记
      removeAnnotation(UID.value);
      props.renderingEngine.render();

      message.success(result);
      addNodeModal.value = false;
      confirmLoading.value = false;
    } else {
      message.error(result);
      confirmLoading.value = false;
    }
  });
};

// 取消弹窗（清除当前的标记）
const handleAddModalCancel = () => {
  removeAnnotation(UID.value);
  props.renderingEngine.render();
};
</script>

<style scoped lang="scss"></style>
