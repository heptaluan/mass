<template>
  <div class="c3d">
    <div id="c3d-content">
      <h1 id="demo-title"></h1>
    </div>
    <ul class="tool-list-box" :style="{ left: boxStyle.left, top: boxStyle.top }">
      <li
          v-for="(item, index) in toolList"
          :key="item.id"
          @click="(e) => handleListClicked(e, item)"
          class="colBtn"
          :class="{active: item.active, disabled: item.disabled || !props.allChecked}"
      >
        <template v-if="index < 2">
          <a-popover placement="bottom" v-if="!props.allChecked">
            <template #content>
              <info-circle-outlined/>
              <p>请开启“所有图元”选项后再用此功能</p>
            </template>
            <span class="icon"><icon-font :type="item.icon"/></span>
            <span class="label">{{ item.text }}</span>
          </a-popover>
          <span v-else>
            <span class="icon"><icon-font :type="item.icon"/></span>
            <span class="label">{{ item.text }}</span>
          </span>
        </template>
      </li>
      <li @click="saveNoduleInfo" class="colBtn" :class="{disabled: !props.allChecked}">
        <a-popover placement="bottom" v-if="!props.allChecked">
          <template #content>
            <info-circle-outlined/>
            <p>请开启“所有图元”选项后再用此功能</p>
          </template>
          <span class="icon"><icon-font type="icon-baocun"/></span>
          <span class="label">保存结节</span>
        </a-popover>
        <span v-else>
          <span class="icon"><icon-font type="icon-baocun"/></span>
          <span class="label">保存结节</span>
        </span>
      </li>
      <li class="colBtn disabled">
        <span>
          <span class="icon"><icon-font type="icon-jiaodu"/></span>
          <span class="label">角度测量</span>
        </span>
      </li>
      <li class="colBtn disabled">
        <span>
          <span class="icon"><icon-font type="icon-juxing"/></span>
          <span class="label">结节标记</span>
        </span>
      </li>
      <li @click="removeUnSavedCube('manual')" class="colBtn" :class="{active: cleanBtn.active, disabled: cleanBtn.disabled || !props.allChecked}">
        <span>
          <span class="icon"><icon-font type="icon-qingchu"/></span>
          <span class="label">清除标记</span>
        </span>
      </li>
    </ul>
    <div id="demo-toolbar"></div>
    <div id="content" :class="{vertical: isVertical}">
      <corner-info v-if="props.allChecked" :seriesData="props.seriesData" :overlayData="overlayData" :institutionInfo="props.institutionInfo" :isVertical="isVertical"></corner-info>
    </div>

    <modal ref="saveModal" :pcrContent="props.pcrContent" :noduleList="props.noduleList" @refreshNodelist="refreshNodelist"></modal>
  </div>

</template>

<script setup>
import {defineExpose, ref, defineProps, defineEmits, onBeforeUnmount} from 'vue'
import {
  RenderingEngine,
  Enums,
  setVolumesForViewports,
  volumeLoader,
  getRenderingEngine
} from '@cornerstonejs/core';
import * as cornerstoneTools from '@cornerstonejs/tools';

import {
  initDemo,
  setCtTransferFunctionForVolumeActor,
} from '@/utils/helpers';
import {
  viewportId1,
  viewportId2,
  viewportId3,
  addToolsToGroup,
  toolActiveHandler,
  changeMPRTool,
  getMouseUpData,
  getMouseDownData,
  // showAll,
  noduleDelete,
  toolsCornerstoneAddHandler,
  spaceMovementDetector,
  saveCube,
  setToolGroupId,
  readAllCube,
  drawFinishSwitch,
  removeUnSavedCube,
  displayAnnotationsHandler,
  setAllToolPassive
} from '@/utils/toolHandler'
import {onMounted, onUnmounted} from 'vue'
import Modal from "@/components/ThreeOrthogonalView/modal";

import {createFromIconfontCN, InfoCircleOutlined} from "@ant-design/icons-vue";
import IconFontUrl from "../../assets/iconFont";

const props = defineProps(["noduleList", "imageIds", 'voiRange', "pcrContent", 'seriesData',
  "seriesInstanceUid", 'allChecked','toolListRef', "institutionInfo", "isVertical", "isEditable"]);
const emit = defineEmits(["handleAddNewNodule", "cleanVolumeLoadObject"]);
import {message} from "ant-design-vue";
import {mprButtonStore} from "@/store/modules/MRPButtons";
import CornerInfo from "@/components/ThreeOrthogonalView/cornerInfo";
import router from "@/router";

let mprButton = mprButtonStore()
const IconFont = createFromIconfontCN({
  scriptUrl: IconFontUrl,
});
const toolList = ref([])
const cleanBtn = ref({})
const overlayData = ref({});

const {
  ToolGroupManager,
    annotation,
  Enums: csToolsEnums,
  // segmentation,
} = cornerstoneTools;
const {ViewportType} = Enums;
const {IMAGE_RENDERED, CAMERA_MODIFIED} = Enums.Events;

// // Define a unique id for the volume
let volumeId = null;
// const segmentationId = 'ss';
const toolGroupId = 'tt';
// ======== Set up page ======== //
const size = '500px';
const viewportGrid = document.createElement('div');
viewportGrid.style.display = 'flex';
viewportGrid.style.display = 'flex';
viewportGrid.style.flexDirection = 'row';
const saveModal = ref(null);
const element1 = document.createElement('div');
const element2 = document.createElement('div');
const element3 = document.createElement('div');
element1.classList.add('viewport1')
element2.classList.add('viewport2')
element3.classList.add('viewport3')
element1.style.width = size;
element1.style.height = size;
element2.style.width = size;
element2.style.height = size;
element3.style.width = size;
element3.style.height = size;
let renderingEngine
// Disable right click context menu so we can have right click tools
element1.oncontextmenu = (e) => e.preventDefault();
element2.oncontextmenu = (e) => e.preventDefault();
element3.oncontextmenu = (e) => e.preventDefault();

viewportGrid.appendChild(element1);
viewportGrid.appendChild(element2);
viewportGrid.appendChild(element3);
let list = []
let toolGroup
let viewportBox = []
// ~~~~~~~~~~~~~~~~~~~~~~~

const boxStyle = ref({});

// 计算定位
const computedBoxStyle = () => {
  const target = document.getElementById('target').getBoundingClientRect()
  const { x, y } = target
  boxStyle.value = {
    left: x + "px",
    top: y + "px",
  };
};

onMounted(() => {
  initDOM()
  initSeriesList()
  computedBoxStyle()
  window.addEventListener("resize", computedBoxStyle);
  // Draw
})

onUnmounted(() => {
  window.removeEventListener("resize", computedBoxStyle);
});

onBeforeUnmount(async () => {
  const elements = document.getElementsByClassName('viewport-element')
  elements[0].parentElement.removeEventListener(IMAGE_RENDERED, imageRendered, false);
  elements[0].parentElement.removeEventListener(CAMERA_MODIFIED, cameraModified, false);

  for (let item of elements) {
    // item.removeEventListener('mousedown', getMouseDownData)
    // item.removeEventListener('mouseup', getMouseUpData)

    item.parentElement.removeEventListener(CAMERA_MODIFIED, beforeSpaceMovementDetector)
  }

  removeUnSavedCube('all')
  drawFinishSwitch(false)
  element1.remove()
  element2.remove()
  element3.remove()
  viewportGrid.remove()
  const elementBox = document.getElementsByClassName('c3d')[0]
  elementBox.remove()
  ToolGroupManager.destroyToolGroup(toolGroupId)

  cornerstoneTools.destroy()
  renderingEngine.disableElement(viewportId1)
  renderingEngine.disableElement(viewportId2)
  renderingEngine.disableElement(viewportId3)
})


const initSeriesList = () => {
  toolList.value = mprButton.getButtonsStatus('all')
  cleanBtn.value = toolList.value[2]
  list = props.imageIds
  overlayData.value.total = list.length;
  run()
}

const initDOM = () => {
  const content = document.getElementById('content');
  content.appendChild(viewportGrid);
}

/**
 * Runs the demo
 */
const run = async () => {
  // Init Cornerstone and related libraries
  await initDemo();
  // Add tools to Cornerstone3D
  toolsCornerstoneAddHandler()

  // Define tool groups to add the segmentation display tool to
  if (ToolGroupManager.getToolGroup(toolGroupId)) {
    toolGroup = ToolGroupManager.getToolGroup(toolGroupId);
  } else {
    toolGroup = ToolGroupManager.createToolGroup(toolGroupId);
  }

  // const imageIds = await simpleImageIds(list)

  // Instantiate a rendering engine
  const renderingEngineId = 'myRenderingEngine';
  renderingEngine = getRenderingEngine(renderingEngineId)
      ? getRenderingEngine(renderingEngineId)
      : new RenderingEngine(renderingEngineId);

  // Create the viewports
  const viewportInputArray = [
    {
      viewportId: viewportId1,
      type: ViewportType.ORTHOGRAPHIC,
      element: element1,
      defaultOptions: {
        orientation: Enums.OrientationAxis.AXIAL,
        background: [0, 0, 0],
      },
    },
    {
      viewportId: viewportId2,
      type: ViewportType.ORTHOGRAPHIC,
      element: element2,
      defaultOptions: {
        orientation: Enums.OrientationAxis.SAGITTAL,
        background: [0, 0, 0],
      },
    },
    {
      viewportId: viewportId3,
      type: ViewportType.ORTHOGRAPHIC,
      element: element3,
      defaultOptions: {
        orientation: Enums.OrientationAxis.CORONAL,
        background: [0, 0, 0],
      },
    },
  ];

  // Define a volume in memory
  // Define a unique id for the volume
  const volumeName ="CT_VOLUME_ID" + mprButton.getVolumeIndex; // Id of the volume less loader prefix

  const volumeLoaderScheme = 'cornerstoneStreamingImageVolume'; // Loader id which defines which volume loader to use
  volumeId = `${volumeLoaderScheme}:${volumeName}`; // VolumeId with loader id + volume id

  await volumeLoader.loadVolume(volumeId)
  // await emit("cleanVolumeLoadObject", volumeId);
  // const volume = await volumeLoader.createAndCacheVolume(volumeId, {
  //   imageIds: list,
  // });

  renderingEngine.setViewports(viewportInputArray);

  // Set the volume to load
  // volume.load();

  // Set volumes on the viewports
  await setVolumesForViewports(
      renderingEngine,
      [
        {
          volumeId,
          callback: setCtTransferFunctionForVolumeActor,
        },
      ],
      [viewportId1, viewportId2, viewportId3]
  );
  // // Add the segmentation representation to the toolgroup
  // await segmentation.addSegmentationRepresentations(toolGroupId, [
  //   {
  //     segmentationId,
  //     type: csToolsEnums.SegmentationRepresentations.Labelmap,
  //   },
  // ]);
  // For the crosshairs to operate, the viewports must currently be
  // added ahead of setting the tool active. This will be improved in the future.
  toolGroup.addViewport(viewportId1, renderingEngineId);
  toolGroup.addViewport(viewportId2, renderingEngineId);
  toolGroup.addViewport(viewportId3, renderingEngineId);

  const viewport1 = renderingEngine.getViewport(viewportId1);
  const viewport2 = renderingEngine.getViewport(viewportId2);
  const viewport3 = renderingEngine.getViewport(viewportId3);


  const newStyles = {
    global: {
      color: 'rgb(255,255,255)',
      textBoxColor: 'rgb(255,255,255)',
      colorHighlighted: 'rgb(255,252,222)',
      textBoxColorHighlighted: 'rgb(255,252,222)',
    }
  };
  annotation.config.style.setToolGroupToolStyles(toolGroupId, newStyles);
  annotation.config.style.setToolGroupToolStyles(toolGroupId, newStyles);
  annotation.config.style.setToolGroupToolStyles(toolGroupId, newStyles);

  viewport1.setZoom(1.4)
  viewport2.setZoom(1.1)
  viewport3.setZoom(1.1)
  viewport1.setProperties(
      props.voiRange.find((item) => item.isDefault === true).voiRange
  );
  viewport2.setProperties(
      props.voiRange.find((item) => item.isDefault === true).voiRange
  );
  viewport3.setProperties(
      props.voiRange.find((item) => item.isDefault === true).voiRange
  );
  viewportBox.push(viewport1, viewport2, viewport3)
  // changeMIP({
  //   mipRadioVal: "MaxIP",
  //   mipSliderVal: 0,
  // });
  addToolsToGroup(toolGroup)


  toolActiveHandler(toolGroup)

  // Render the image
  renderingEngine.renderViewports([viewportId1, viewportId2, viewportId3]);
  addMouseListener()
}

// added the mouse
const addMouseListener = () => {
  const elements = document.getElementsByClassName('viewport-element')
  elements[0].parentElement.addEventListener(IMAGE_RENDERED, imageRendered, false);
  elements[0].parentElement.addEventListener(CAMERA_MODIFIED, cameraModified, false);

  for (let item of elements) {
    item.addEventListener('mousedown', e => getMouseDownData(e, toolGroupId, volumeId, toolGroup))
    item.addEventListener('mouseup', e => getMouseUpData(e, toolGroupId))
    item.parentElement.addEventListener(CAMERA_MODIFIED, beforeSpaceMovementDetector)

    // item.parentElement.addEventListener(CAMERA_MODIFIED, e => spaceMovementDetector(e, 'scrollWheel', null, props.allChecked))
  }
  setTimeout(() => {
    if (props.noduleList.length > 0 && props.allChecked) {
      setToolGroupId(toolGroupId)
      readAllCube(props.noduleList, null)
    } else if (!props.allChecked) {
      showAllAnnotations(props.allChecked)
    }
  }, 10)
}

const beforeSpaceMovementDetector = (e) => {
  spaceMovementDetector(e, 'scrollWheel', null, props.allChecked)
}

const saveNoduleInfo = () => {
  if (!props.allChecked) {
    return
  }
  const eightPoints = saveCube(volumeId, props.seriesInstanceUid)
  console.log(eightPoints)
  if (eightPoints) {
    saveModal.value.openModal(renderingEngine, volumeId, props.seriesInstanceUid, eightPoints);
  } else if (eightPoints === false) {
    message.warning('非有效的结节！')
    drawFinishSwitch(false)
  } else {
    message.warn('没有可以保存的结节')
  }
}

const refreshNodelist = (node) => {
  emit('handleAddNewNodule')
  const nodeData = node.boxDTO ? node.boxDTO : node.boxVO
  readAllCube(null, nodeData, 'savedNew');
  drawFinishSwitch(false)
}

const handleListClicked = (e, item) => {
  if (!props.allChecked) {
    return
  }
  if (item.disabled) {
    return
  }
  if (item.id === 2) {
    if (props.isEditable === '02') {
      message.warning(
          `其他序列已经存在结节，请删除序列内的结节后，在切换至本序列进行结节勾画！`
      );
      return false
    }
  }

  setAllToolPassive(toolGroupId, props.allChecked)
  props.toolListRef.resetToolListStateMPR()
  toolList.value.forEach(ele => {
    ele.active = false
  })
  toolList.value.find((n) => n.id === item.id).active =
      !toolList.value.find((n) => n.id === item.id).active;
  switch (item.id) {
    case 1:
      changeMPRTool('Crosshairs', toolGroupId)
      break;
    case 2:
      if (!item.disabled) {
        changeMPRTool('RectangleROI', toolGroupId)
      }
      break;
    default:
      break;
  }

  if (!item.disabled) {
    emit("toolBarClick", item.id, item.active);
  }
};

const imageRendered = (evt) => {
  // console.log('render: ', evt);
  const viewport = renderingEngine._viewports.get(evt.detail.viewportId);
  const imageData = viewport.getImageData();

  overlayData.value.row = imageData?.dimensions[0];
  overlayData.value.col = imageData?.dimensions[1];
  overlayData.value.lower = viewport.getProperties().voiRange?.lower;
  overlayData.value.upper = viewport.getProperties().voiRange?.upper;

  overlayData.value.thickness = viewport.getSlabThickness();
  overlayData.value.zoom = viewport.getZoom().toFixed(2);
  overlayData.value.imageIndex = viewport.getCurrentImageIdIndex()
  overlayData.value.currentImageId = viewport.getCurrentImageId()
  if (!overlayData.value.position) {
    overlayData.value.position = viewport.fitToCanvasCamera.focalPoint[2].toFixed(2)
  }
};

const cameraModified = (evt) => {
  overlayData.value.position = evt.detail.camera.focalPoint[2].toFixed(2);
};

const toolBarClick = async (id) => {
  // console.log(toolList)
  toolList.value.forEach(ele => {
    ele.active = false
  })
  switch (id) {
      // 返回
    case 1:
      await emit("cleanVolumeLoadObject", volumeId);
      router.push({name: "studyList"});
      return false;
      // 默认左键配置
    // case 3:
    //   setAllToolPassive(toolGroupId);
    //   toolActiveHandler(toolGroup, 'WindowLevel')
    //   break;
      // 重置窗口
    case 4:
      changeMIP({
        mipRadioVal: "MaxIP",
        mipSliderVal: 0,
      });
      viewportBox.forEach((ele, index) => {
        // console.log(ele)
        ele.setCamera({
          viewUp: ele.initialCamera.viewUp,
          flipHorizontal: false,
          flipVertical: false,
        });
        ele.resetCamera();
        ele.setProperties(
            props.voiRange.find((item) => item.isDefault === true).voiRange
        );
        ele.render();
        ele.setZoom(index === 0 ? 1.4: 1.1);
      })

      setAllToolPassive(toolGroupId);
      toolActiveHandler(toolGroup, 'WindowLevel')
      break;
      // 移动
    case 8:
      setAllToolPassive(toolGroupId);
      toolActiveHandler(toolGroup, 'Pan')

      break;
      // 缩放
    case 9:
      setAllToolPassive(toolGroupId);
      toolActiveHandler(toolGroup, 'Zoom')
      break;
  }

  // 窗宽窗位单独处理
  const target = id.toString().split("-");
  if (target[0] === "10" && target.length === 2) {
    viewportBox.forEach((ele, index) => {
      ele.setProperties(props.voiRange[target[1]].voiRange);
      ele.render();
    })
  }
}

// 隐藏所有标注
const showAllAnnotations = (check) => {
  displayAnnotationsHandler(check, toolGroupId)
};

const mipStatus = ref({
  mipRadioVal: "MaxIP",
  mipSliderVal: 0,
})

// MIP 调整
const changeMIP = (data = {}) => {

  const { mipRadioVal, mipSliderVal } = data;

  let valueAsNumber = mipSliderVal;

  let blendMode = Enums.BlendModes.MAXIMUM_INTENSITY_BLEND;

  if (mipRadioVal === "MaxIP") {
    blendMode = Enums.BlendModes.MAXIMUM_INTENSITY_BLEND;
  } else if (mipRadioVal === "MinIP") {
    blendMode = Enums.BlendModes.MINIMUM_INTENSITY_BLEND;
  }

  if (valueAsNumber < 1) {
    valueAsNumber = 0.1;
    blendMode = Enums.BlendModes.COMPOSITE;
  }

  viewportBox.forEach(ele => {
    ele.setBlendMode(blendMode);
    ele.setSlabThickness(valueAsNumber);
    ele.render();
  })
};

defineExpose({
  readAllCube,
  noduleDelete,
  toolBarClick,
  showAllAnnotations,
  handleListClicked
});
</script>

<style scoped lang="scss">
.c3d {
  width: 100vw;
  height: 100%;
  display: flex;
  flex-direction: column;

  #content {
    height: 100%;

    & > :deep(div) {
      width: 100%;
      display: block;
      position: relative;


      .viewport1 {
        background-color: #4d4d4d;
        width: 64% !important;
        height: 88.9vh!important;
        position: absolute;
        left: 36%;
        border: 1px solid #898989;
      }

      .viewport2 {
        background-color: #4d4d4d;
        width: 36% !important;
        height: 46vh !important;
        position: absolute;
        border: 1px solid #898989;
      }

      .viewport3 {
        background-color: #4d4d4d;
        width: 36% !important;
        height: 44vh !important;
        position: absolute;
        top: 44.9vh;
        border: 1px solid #898989;
      }

      .activeLine {
        border-color: #ffffff;
      }
    }

    &.vertical {
      height: calc(100vh - 626px) !important;
      :deep(div) {
        .viewport1 {
          height: calc(100vh - 626px) !important;
        }

        .viewport2 {
          height:  calc((100vh - 626px) /2 ) !important;
        }

        .viewport3 {
          height: calc((100vh - 626px) /2 ) !important;
          top: calc((100vh - 626px) /2 ) !important;
        }
      }

    }

    :deep(.viewport-element) {

      .cornerstone-canvas, .svg-layer {
        left: 0;
      }
    }
  }


}

.colorBox {
  align-self: center;
  margin-top: 20px;
  display: flex;
  justify-content: space-around;

  .btn {
    margin-right: 8px;
    width: 60px;
    min-width: 60px;
    height: 45px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
    cursor: pointer;
    user-select: none;
    color: #fff;

    .icon {
      font-size: 22px;
      color: #fff;
    }

    .label {
      font-size: 12px;
    }

    &.blue {
      //background-color: rgb(48,173,246);
      border-color: rgb(48, 173, 246);
    }

    &.purple {
      //background-color: rgb(120 47 255);
      border-color: rgb(120 47 255);
    }

    &.yellow {
      //background-color: rgb(246,209,48);
      border-color: rgb(246, 209, 48);
    }

    &.green {
      background-color: #30f69b;
      border-color: #30f69b;
    }

    &.silver {
      //background-color: #d2e7d6;
      border-color: #d2e7d6;
    }
  }
}

.tool-list-box {
  height: 45px;
  background: rgb(45, 46, 54);
  display: flex;
  align-self: center;
  font-size: 12px;
  position: fixed;

  .colBtn {
    cursor: pointer;
    user-select: none;
    color: #fff;
    width: 70px;
    min-width: 70px;
    height: 45px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
    cursor: pointer;
    //-webkit-user-select: none;
    //-moz-user-select: none;
    user-select: none;

    &:nth-child(3) {
      display: none;
    }

    &:last-child {
      padding-right: 6px;
      margin-right: 3px;
      border-right: 1px solid rgb(225, 225, 226);
    }
    :deep(span:not(.icon, .anticon, .label)) {
      width: 60px;
      min-width: 60px;
      height: 45px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-around;
    }

    .icon {
      font-size: 18px;
    }

    .label {
      font-size: 14px;
    }

    &.active {
      //color: #1890ff;
      color: #FFFFFF;
      border: 1px solid #FFFFFF;
      background-color: #4F5355;
    }

    &.disabled {
      color: #666;
    }
  }
}
</style>
