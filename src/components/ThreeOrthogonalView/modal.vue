<template>
  <div class="viewer-box">
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
  </div>
</template>

<script setup>
import {ref, defineProps, defineExpose, defineEmits} from "vue";
import {addNodule} from "@/api";
import {getAPIResponse} from "@/utils/apiTools/useAxiosApi";
import {message} from "ant-design-vue";
import {getAnnotations} from "@cornerstonejs/tools/dist/esm/stateManagement";
import {pointStore} from "@/store/modules/pointStore";
import {cubeFormatBuilder} from '@/utils/toolHandler'

const addNodeModal = ref(false);
const lungLocation = ref("右肺上叶（RUL）");
const featuresType = ref("实性");
const confirmLoading = ref(false);
let renderingEngine
let viewportId
let seriesId
let noduleData
let eightPoints
let originalEightPoints = pointStore()

const emit = defineEmits(["handleAddNewNodule", "refreshNodelist"]);
const props = defineProps(["noduleList", 'pcrContent']);

const openModal = (engine, id, resSeriesId, data) => {
  addNodeModal.value = true
  lungLocation.value = "右肺上叶（RUL）";
  featuresType.value = "实性";
  renderingEngine = engine
  viewportId = id
  seriesId = resSeriesId
  eightPoints = data
}

// 新增结节
const handleAddModalCallback = async () => {
  confirmLoading.value = true
  noduleData = changeCubeStatus()
  noduleData.location = lungLocation.value
  noduleData.featuresType = featuresType.value
  noduleData.width = Math.abs(noduleData.width)
  noduleData.height = Math.abs(noduleData.height)
  // get2DCoordinators(noduleData.boxDTO)

  if (props.pcrContent.sampleName) {
    window.showUpadtePCRContentConfirm2((status) => {
      if (status !== 'cancel') {
        window.clearPCRContent();
        addNewNodule();
      } else {
        confirmLoading.value = false
      }
    });
  } else {
   await addNewNodule();
  }
  // console.log(noduleData)

};

const addNewNodule = async () => {
  const res = await addNodule(noduleData)
  const result = getAPIResponse(res);
  if (result === "保存成功" || result.includes('ai运算异常')) {
    // 新增以后清除标记
    message.success(result);
    addNodeModal.value = false;
    confirmLoading.value = false;
    emit('refreshNodelist', noduleData)
  } else {
    confirmLoading.value = false;
  }
}

const changeCubeStatus = () => {
  const element1 = document.getElementsByClassName('viewport1')[0]
  const allRectangles = getAnnotations('RectangleROI', element1)


  const newRectangles = []
  if (allRectangles && allRectangles.length > 0) {
    console.log(allRectangles)

    allRectangles.forEach(ele => {
      if (!ele.isLocked) {
        ele.isLocked = true
        ele.lineColor = 'rgb(231,233,251)'
        ele.eightPoints = eightPoints
        newRectangles.push(ele)
      }
    })

    originalEightPoints.setCube(eightPoints)
    const formattedNewCube = cubeFormatBuilder(newRectangles, viewportId, seriesId)
    return formattedNewCube
  }
}

const get2DCoordinators = (points) => {
  const viewport = renderingEngine._viewports.get('CT_AXIAL')
  const p1 = viewport.worldToCanvas(points.point1)
  const p2 = viewport.worldToCanvas(points.point2)
  const p3 = viewport.worldToCanvas(points.point3)
  const p4 = viewport.worldToCanvas(points.point4)
  const p5 = viewport.worldToCanvas(points.point5)
  const p6 = viewport.worldToCanvas(points.point6)
  const p7 = viewport.worldToCanvas(points.point7)
  const p8 = viewport.worldToCanvas(points.point8)
  console.log({p1,p2,p3,p4,p5,p6,p7,p8})
}

const handleAddModalCancel = () => {
  confirmLoading.value = false
  // removeAnnotation(UID.value);
  // renderingEngine.value.render();
};



defineExpose({
  openModal,
  handleAddModalCallback,
  handleAddModalCancel,
});
</script>

<style scoped>

</style>
