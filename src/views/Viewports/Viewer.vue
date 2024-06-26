<template>
  <div class="viewer-box">
    <!-- 四角信息 -->
    <CustomOverlay
      :seriesData="props.seriesData"
      :overlayData="overlayData"
      :institutionInfo="institutionInfo"
    />

    <!-- 画布窗口 -->
    <div
      id="cornerstone-viewport"
      :style="{ height: props.isVertical ? `${wh - 625}px` : `${wh - 141}px` }"
    ></div>

    <!-- 滚动条菜单 -->
    <ImageScrollbar
      v-if="props.imageIds.length > 0"
      :nodeList="props.nodeList"
      :imageIds="props.imageIds"
      :imageIndex="overlayData.imageIndex"
      :jumpToImageIndex="jumpToImageIndex"
      :isVertical="props.isVertical"
      @scrollBarClick="scrollBarClick"
    />

    <!-- 新增结节弹窗 -->
    <AddNodeModal
      ref="addNodeModalRef"
      :seriesInstanceUid="props.seriesInstanceUid"
      :handleAddNewNoduleCallback="handleAddNewNoduleCallback"
      :renderingEngine="renderingEngine"
      :imageIndex="overlayData.imageIndex"
      :pcrContent="props.pcrContent"
    />
  </div>

  <!-- 自定义窗宽窗位弹窗 -->
  <ChangeVoiRangeModal ref="changeVoiRangeRef" @setVoiRange="setVoiRange" />
</template>

<script setup>
import {
  onMounted,
  onUnmounted,
  defineProps,
  ref,
  defineExpose,
  defineEmits,
  nextTick,
} from "vue";
import CustomOverlay from "./CustomOverlay.vue";
import AddNodeModal from "./AddNodeModal.vue";
import ImageScrollbar from "./ImageScrollbar.vue";
import {
  RenderingEngine,
  Enums,
  getRenderingEngine,
  volumeLoader,
  imageLoadPoolManager,
} from "@cornerstonejs/core";
import { mprButtonStore } from "@/store/modules/MRPButtons";

import { utilities } from "@cornerstonejs/tools";

import {
  initDemo,
  setCtTransferFunctionForVolumeActor,
} from "../../utils/helpers";

import { initElementCursor } from "@cornerstonejs/tools/dist/esm/cursors/elementCursor";

import * as cornerstoneTools from "@cornerstonejs/tools";
import { removeAnnotation } from "@cornerstonejs/tools/dist/esm/stateManagement";
import {
  jumpToWorld,
  jumpToSlice,
} from "@cornerstonejs/tools/src/utilities/viewport";

import MarkNoduleTool from "./Tools/MarkNoduleTool";
import AddMarkNoduleTool from "./Tools/AddMarkNoduleTool";
import ScaleOverlayTool from "./Tools/ScaleOverlayTool";
import EraserTool from "./Tools/EraserTool";
import EllipticalROITool from "./Tools/EllipticalROITool";
import LengthTool from "./Tools/LengthTool";
import BidirectionalTool from "./Tools/BidirectionalTool";
import AngleTool from "./Tools/AngleTool";

import { vec3 } from "gl-matrix";
import router from "@/router";
import { message } from "ant-design-vue";
import ChangeVoiRangeModal from "./ChangeVoiRangeModal.vue";

const { getOrientationStringLPS, invertOrientationStringLPS } =
  utilities.orientation;

const wh = ref(document.documentElement.clientHeight);

const addNodeModalRef = ref(null);

// Add tools to Cornerstone3D
const {
  StackScrollMouseWheelTool,
  ToolGroupManager,
  Enums: csToolsEnums,
  PanTool,
  // WindowLevelTool,
  ZoomTool,
  annotation,
  utilities: csToolsUtilities,
  PlanarRotateTool,
} = cornerstoneTools;

const { ViewportType } = Enums;
const { MouseBindings } = csToolsEnums;
const { visibility } = annotation;

const { IMAGE_RENDERED, CAMERA_MODIFIED, VOLUME_NEW_IMAGE } = Enums.Events;

const renderingEngineId = "myRenderingEngine";
const mprButton = mprButtonStore();

const viewportId = "CT_STACK";
const toolGroupId = "STACK_TOOL_GROUP_ID";

const renderingEngine = ref("");
const toolGroupManager = ref("");
const overlayData = ref({});
const changeVoiRangeRef = ref(null);

const volumeIdCache = ref();
let generalVolume = {};

const props = defineProps([
  "nodeList",
  "imageIds",
  "seriesInstanceUid",
  "seriesData",
  "voiRange",
  "allChecked",
  "institutionInfo",
  "pcrContent",
  "isVertical",
]);

const emit = defineEmits([
  "handleAddNewNodule",
  "handleScrollBarClick",
  "cleanVolumeLoadObject",
  "loadingSwitch",
]);

onMounted(() => {
  onResize();
  window.addEventListener("resize", onResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", onResize);
});

// 顶部工具栏点击事件
const toolBarClick = async (id, active) => {
  const viewport =
    renderingEngine.value && renderingEngine.value.getViewport(viewportId);
  const element = document.getElementById("cornerstone-viewport");
  const { flipHorizontal } = viewport && viewport.getCamera();
  const { flipVertical } = viewport && viewport.getCamera();
  switch (id) {
    // 返回
    case 1:
      await emit("cleanVolumeLoadObject", volumeIdCache.value);
      router.push({ name: "studyList" });
      return false;
    // 默认左键配置
    case 3:
      setAllToolPassive();
      initElementCursor(element);
      // toolGroupManager.value.setToolActive(WindowLevelTool.toolName, {
      //   bindings: [
      //     {
      //       mouseButton: MouseBindings.Primary, // Left Click
      //     },
      //   ],
      // });
      break;
    // 重置窗口
    case 4:
      changeMIP({
        mipRadioVal: "MaxIP",
        mipSliderVal: 0,
      });
      viewport.setCamera({
        viewUp: [-0, -1, -0],
        flipHorizontal: false,
        flipVertical: false,
      });
      viewport.resetCamera();
      viewport.setProperties(
        props.voiRange.find((item) => item.isDefault === true).voiRange
      );
      viewport.render();
      viewport.setZoom(1.4);
      setAllToolPassive();
      initElementCursor(element);
      // toolGroupManager.value.setToolActive(WindowLevelTool.toolName, {
      //   bindings: [
      //     {
      //       mouseButton: MouseBindings.Primary, // Left Click
      //     },
      //   ],
      // });
      break;
    // 水平翻转
    case 5:
      viewport.setCamera({ flipHorizontal: !flipHorizontal });
      // viewport.render();
      break;
    // 竖直翻转
    case 6:
      viewport.setCamera({ flipVertical: !flipVertical });
      // viewport.render();
      break;
    // 旋转
    case 7:
      setAllToolPassive();
      toolGroupManager.value.setToolActive(PlanarRotateTool.toolName, {
        bindings: [
          {
            mouseButton: MouseBindings.Primary, // Left Click
          },
        ],
      });
      break;
    // 移动
    case 8:
      setAllToolPassive();
      toolGroupManager.value.setToolActive(PanTool.toolName, {
        bindings: [
          {
            mouseButton: MouseBindings.Primary, // Left Click
          },
        ],
      });
      break;
    // 缩放
    case 9:
      setAllToolPassive();
      toolGroupManager.value.setToolActive(ZoomTool.toolName, {
        bindings: [
          {
            mouseButton: MouseBindings.Primary, // Left Click
          },
        ],
      });
      break;
    // 自动播放
    case 11:
      if (!active) {
        csToolsUtilities.cine.stopClip(element);
      }
      break;
    case "11-1":
      csToolsUtilities.cine.playClip(element, { framesPerSecond: 12 });
      break;
    case "11-2":
      csToolsUtilities.cine.playClip(element, { framesPerSecond: 24 });
      break;
    case "11-3":
      csToolsUtilities.cine.playClip(element, { framesPerSecond: 48 });
      break;
    // 直线
    case 16:
      setAllToolPassive();
      toolGroupManager.value.setToolActive(LengthTool.toolName, {
        bindings: [
          {
            mouseButton: MouseBindings.Primary, // Left Click
          },
        ],
      });
      break;
    // 椭圆
    case 17:
      setAllToolPassive();
      toolGroupManager.value.setToolActive(EllipticalROITool.toolName, {
        bindings: [
          {
            mouseButton: MouseBindings.Primary, // Left Click
          },
        ],
      });
      break;
    // 结节标记
    case 18:
      setAllToolPassive();
      toolGroupManager.value.setToolActive(AddMarkNoduleTool.toolName, {
        bindings: [
          {
            mouseButton: MouseBindings.Primary, // Left Click
          },
        ],
      });
      break;
    // 双向测量
    case 19:
      setAllToolPassive();
      toolGroupManager.value.setToolActive(BidirectionalTool.toolName, {
        bindings: [
          {
            mouseButton: MouseBindings.Primary, // Left Click
          },
        ],
      });
      break;
    // 角度
    case 22:
      setAllToolPassive();
      toolGroupManager.value.setToolActive(AngleTool.toolName, {
        bindings: [
          {
            mouseButton: MouseBindings.Primary, // Left Click
          },
        ],
      });
      break;
    // 清除标记
    case 20:
      setAllToolPassive();
      toolGroupManager.value.setToolActive(EraserTool.toolName, {
        bindings: [
          {
            mouseButton: MouseBindings.Primary, // Left Click
          },
        ],
      });
      break;
    default:
      break;
  }

  // 窗宽窗位单独处理
  const target = id.toString().split("-");
  if (target[0] === "10" && target.length === 2) {
    viewport.setProperties(props.voiRange[target[1]].voiRange);
    viewport.render();
  }

  if (id === "000") {
    changeVoiRangeRef.value.showModal();
  }
};

// 设置自定义窗宽窗位
const setVoiRange = (e) => {
  const viewport =
    renderingEngine.value && renderingEngine.value.getViewport(viewportId);
  viewport.setProperties({
    voiRange: {
      lower: -e.width,
      upper: -e.level,
    },
  });
  viewport.render();
};

// 取消自动播放
const stopClip = () => {
  const element = document.getElementById("cornerstone-viewport");
  csToolsUtilities.cine.stopClip(element);
};

// MIP 调整
const changeMIP = (data = {}) => {
  const viewport = renderingEngine.value.getViewport(viewportId);
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
  viewport.setBlendMode(blendMode);
  viewport.setSlabThickness(valueAsNumber);
  viewport.render();
};

// 侧边滚动条点击事件
const scrollBarClick = (index) => {
  emit("handleScrollBarClick", index);
};

// 取消其他工具
const setAllToolPassive = () => {
  // toolGroupManager.value.setToolPassive(WindowLevelTool.toolName);
  toolGroupManager.value.setToolPassive(PanTool.toolName);
  toolGroupManager.value.setToolPassive(ZoomTool.toolName);
  toolGroupManager.value.setToolPassive(AngleTool.toolName);
  toolGroupManager.value.setToolPassive(EraserTool.toolName);
  toolGroupManager.value.setToolPassive(PlanarRotateTool.toolName);

  toolGroupManager.value.setToolPassive(LengthTool.toolName);
  toolGroupManager.value.setToolPassive(EllipticalROITool.toolName);
  toolGroupManager.value.setToolPassive(BidirectionalTool.toolName);
  toolGroupManager.value.setToolPassive(AddMarkNoduleTool.toolName);
};

// 添加启用工具
const addToolsList = () => {
  const toolsList = cornerstoneTools.state.tools;
  const tools = [
    // WindowLevelTool,
    PanTool,
    PlanarRotateTool,
    ZoomTool,
    AngleTool,
    StackScrollMouseWheelTool,
    LengthTool,
    EllipticalROITool,
    BidirectionalTool,
    MarkNoduleTool,
    AddMarkNoduleTool,
    ScaleOverlayTool,
    EraserTool,
  ];
  for (let i = 0; i < tools.length; i++) {
    if (!toolsList[tools[i].toolName]) {
      cornerstoneTools.addTool(tools[i]);
    }
  }
};

// 监听视图变化 - IMAGE_RENDERED
const imageRendered = (evt) => {
  // console.log(evt);
  const viewport = renderingEngine.value.getViewport(viewportId);
  const imageData = viewport.getImageData();
  if (!viewport) return;

  overlayData.value.row = imageData?.dimensions[0];
  overlayData.value.col = imageData?.dimensions[1];
  overlayData.value.lower = viewport.getProperties().voiRange?.lower;
  overlayData.value.upper = viewport.getProperties().voiRange?.upper;

  overlayData.value.zoom = viewport.getZoom().toFixed(2);

  overlayData.value.currentImageId = imageData && viewport.getCurrentImageId();
  overlayData.value.imageIndex =
    props.imageIds.length - viewport.getCurrentImageIdIndex() - 1;
};

// 监听视图变化 - CAMERA_MODIFIED
const cameraModified = (evt) => {
  const viewport = renderingEngine.value.getViewport(viewportId);
  overlayData.value.position = Number(
    viewport.getCamera().focalPoint[2].toFixed(2)
  );
  renderMarkNodule(Number(viewport.getCamera().focalPoint[2].toFixed(2)));

  // 计算方向
  computedMarkers();
};

// 监听视图变化 - VOLUME_NEW_IMAGE
const volumeNewImage = (evt) => {
  // 监听每次滚动，并且重新绘制结节（针对于结节穿梭帧的问题）
  const viewport = renderingEngine.value.getViewport(viewportId);
  renderMarkNodule(Number(viewport.getCamera().focalPoint[2].toFixed(2)));
};

// 计算视图方向（A-L-P-R）
const computedMarkers = () => {
  const viewport = renderingEngine.value.getViewport(viewportId);
  const { viewUp, viewPlaneNormal } = viewport.getCamera();
  const viewRight = vec3.create();
  vec3.cross(viewRight, viewUp, viewPlaneNormal);

  const columnCosines = [-viewUp[0], -viewUp[1], -viewUp[2]];
  const rowCosines = viewRight;

  const markers = _getOrientationMarkers(rowCosines, columnCosines);

  overlayData.value.top = markers.top;
  overlayData.value.left = markers.left;
  overlayData.value.right = markers.right;
  overlayData.value.bottom = markers.bottom;
};

// 计算视图方向（赋值）
const _getOrientationMarkers = (rowCosines, columnCosines) => {
  const rowString = getOrientationStringLPS(rowCosines);
  const columnString = getOrientationStringLPS(columnCosines);
  const oppositeRowString = invertOrientationStringLPS(rowString);
  const oppositeColumnString = invertOrientationStringLPS(columnString);

  const markers = {
    top: oppositeColumnString,
    left: oppositeRowString,
    right: rowString,
    bottom: columnString,
  };

  return markers;
};

// 初始化
const run = async function (isClean) {
  await initDemo();

  const element = document.getElementById("cornerstone-viewport");

  element.removeEventListener(IMAGE_RENDERED, imageRendered, false);
  element.removeEventListener(CAMERA_MODIFIED, cameraModified, false);
  element.removeEventListener(VOLUME_NEW_IMAGE, volumeNewImage, false);

  element.addEventListener(IMAGE_RENDERED, imageRendered, false);
  element.addEventListener(CAMERA_MODIFIED, cameraModified, false);
  element.addEventListener(VOLUME_NEW_IMAGE, volumeNewImage, false);

  element.oncontextmenu = (e) => e.preventDefault();

  // 批量添加工具
  addToolsList();

  // Add the tools to the tool group
  if (ToolGroupManager.getToolGroup(toolGroupId)) {
    toolGroupManager.value = ToolGroupManager.getToolGroup(toolGroupId);
  } else {
    toolGroupManager.value = ToolGroupManager.createToolGroup(toolGroupId);

    // toolGroupManager.value.addTool(WindowLevelTool.toolName);
    toolGroupManager.value.addTool(PanTool.toolName);
    toolGroupManager.value.addTool(ZoomTool.toolName);

    toolGroupManager.value.addTool(StackScrollMouseWheelTool.toolName);
    toolGroupManager.value.addTool(LengthTool.toolName);
    toolGroupManager.value.addTool(EllipticalROITool.toolName);
    toolGroupManager.value.addTool(BidirectionalTool.toolName);
    toolGroupManager.value.addTool(AngleTool.toolName);
    toolGroupManager.value.addTool(EraserTool.toolName);

    toolGroupManager.value.addTool(PlanarRotateTool.toolName);

    toolGroupManager.value.addTool(MarkNoduleTool.toolName);
    toolGroupManager.value.addTool(AddMarkNoduleTool.toolName);

    toolGroupManager.value.addTool(ScaleOverlayTool.toolName);
  }

  // =================================

  toolGroupManager.value.setToolPassive(AddMarkNoduleTool.toolName);
  toolGroupManager.value.setToolPassive(MarkNoduleTool.toolName);

  // toolGroupManager.value.setToolActive(WindowLevelTool.toolName, {
  //   bindings: [
  //     {
  //       mouseButton: MouseBindings.Primary, // Left Click
  //     },
  //   ],
  // });
  toolGroupManager.value.setToolActive(PanTool.toolName, {
    bindings: [
      {
        mouseButton: MouseBindings.Auxiliary, // Middle Click
      },
    ],
  });
  toolGroupManager.value.setToolActive(ZoomTool.toolName, {
    bindings: [
      {
        mouseButton: MouseBindings.Secondary, // Right Click
      },
    ],
  });
  toolGroupManager.value.setToolActive(StackScrollMouseWheelTool.toolName);
  // toolGroupManager.value.setToolEnabled(ScaleOverlayTool.toolName);

  // Instantiate a rendering engine
  renderingEngine.value = getRenderingEngine(renderingEngineId)
    ? getRenderingEngine(renderingEngineId)
    : new RenderingEngine(renderingEngineId);

  // Create a stack viewport
  const viewportInput = {
    viewportId,
    type: ViewportType.ORTHOGRAPHIC,
    element,
    defaultOptions: {
      background: [0, 0, 0],
    },
  };

  renderingEngine.value.enableElement(viewportInput);

  // Set the tool group on the viewport
  toolGroupManager.value.addViewport(viewportId, renderingEngineId);

  // =========================================

  // // Define a stack containing a single image
  // const stack = [imageIds[0]];

  // // Set the stack on the viewport
  // await viewport.setStack(stack);

  // // Set the VOI of the stack
  // viewport.setProperties({ voiRange: ctVoiRange });

  // // Render the image
  // viewport.render();

  // =========================================

  if (props.imageIds.length <= 1) {
    message.error(
      `当前影像序列数量较少，无法进行渲染，请重新选择序列进行尝试！`
    );
    return false;
  }

  // 绘制画布
  renderViewport(props.imageIds, isClean);
};

const imageLoading = () => {
  const interval = setInterval(() => {
    console.log(generalVolume.loadStatus);
    if (generalVolume.loadStatus.loaded) {
      emit("loadingSwitch", false);
      console.log("finished");
      clearInterval(interval);
    }
  }, 500);
};

const generateRequests = async (customOrderedRequests, maxFrames) => {
  const requestType = "prefetch";
  const priority = 0;
  const requestsBox = [];
  for (let i = 0; i < customOrderedRequests.length; i += maxFrames) {
    const chunk = customOrderedRequests.slice(i, i + maxFrames);
    // do whatever
    requestsBox.push(chunk);
  }

  for (let i = 0; i < customOrderedRequests.length; i++) {
    const { imageId } = customOrderedRequests[i];
    const additionalDetails = { volumeId: "" };

    for (let j = 0; j < requestsBox.length; j++) {
      const imageRequest = requestsBox[j].filter(
        (req) => req.imageId === imageId
      );

      // if ct request
      if (imageRequest.length) {
        additionalDetails.volumeId = viewportId;
        const { callLoadImage, imageId, imageIdIndex, options } =
          imageRequest[0];
        await slowLoadImages(
          callLoadImage,
          imageId,
          imageIdIndex,
          options,
          requestType,
          additionalDetails,
          priority
        );
        // console.log(imageIdIndex);
      }
    }
  }
};

const slowLoadImages = async (
  callLoadImage,
  imageId,
  imageIdIndex,
  options,
  requestType,
  additionalDetails,
  priority
) => {
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        imageLoadPoolManager.addRequest(
          callLoadImage.bind(this, imageId, imageIdIndex, options),
          requestType,
          additionalDetails,
          priority
        )
      );
    }, 2);
  });
};

// 渲染窗口
const renderViewport = async (imageIds, isClean) => {
  const volumeName = "CT_VOLUME_ID" + mprButton.getVolumeIndex; // Id of the volume less loader prefix
  const volumeLoaderScheme = "cornerstoneStreamingImageVolume"; // Loader id which defines which volume loader to use
  const volumeId = `${volumeLoaderScheme}:${volumeName}`; // VolumeId with loader id + volume id
  volumeIdCache.value = volumeId;
  const viewport = renderingEngine.value.getViewport(viewportId);
  const maxFrames = 50;

  overlayData.value.total = imageIds.length;

  if (isClean === "notClean") {
    generalVolume = await volumeLoader.loadVolume(volumeId);
  } else {
    generalVolume = await volumeLoader.createAndCacheVolume(volumeId, {
      imageIds,
    });
    const generalRequests = generalVolume.getImageLoadRequests();
    await generateRequests(generalRequests, maxFrames);
    imageLoading();
  }

  // Set the volume on the viewport
  await viewport.setVolumes([
    { volumeId, callback: setCtTransferFunctionForVolumeActor },
  ]);

  // console.log(cache.getVolumeLoadObject(volumeId));

  // 设置默认窗宽窗位
  viewport.setProperties(
    props.voiRange.find((item) => item.isDefault === true).voiRange
  );
  viewport.setZoom(1.4);

  renderingEngine.value.render();

  // 调整默认 MIP
  changeMIP({
    mipRadioVal: "MaxIP",
    mipSliderVal: 0,
  });

  // 绘制结节
  renderMarkNodule();
};

const onResize = () => {
  wh.value = document.documentElement.clientHeight;
  nextTick(() => {
    const viewport =
      renderingEngine.value && renderingEngine.value.getViewport(viewportId);
    renderingEngine.value && renderingEngine.value.resize(true, false);
    viewport && viewport.setZoom(1.4);
  });
};

// 新增结节回调
const handleAddNewNoduleCallback = (data) => {
  emit("handleAddNewNodule", data);
};

// 绘制结节
const renderMarkNodule = (focalPoint) => {
  if (!props.allChecked) {
    return false;
  }

  const viewport = renderingEngine.value.getViewport(viewportId);

  if (!focalPoint) {
    focalPoint = Number(viewport.getCamera().focalPoint[2].toFixed(2));
  }

  const element = document.getElementById("cornerstone-viewport");
  const checkItem = props.nodeList.find((v) => v.checked === true);

  // 先清空在重新绘制
  removeAllMarkNodule();

  for (let i = 0; i < props.nodeList.length; i++) {
    const points = props.nodeList[i].boxVO;
    if (checkItem && points.annotationUID === checkItem.boxVO.annotationUID) {
      const range = [points.point1[2], points.point8[2]];

      const data = {
        invalidated: false,
        highlighted: false,
        metadata: {
          toolName: "MarkNodule",
          viewPlaneNormal: [-0, -0, -1],
          viewUp: [-0, -1, 0],
          FrameOfReferenceUID: checkItem.boxVO.annotationUID,
          referencedImageId: "",
        },
        data: {
          color: "#FFFCDE",
          orderNum: props.nodeList[i].orderNum,
          handles: {
            points: [
              [points.point1[0], points.point1[1], focalPoint],
              [points.point2[0], points.point2[1], focalPoint],
              [points.point3[0], points.point3[1], focalPoint],
              [points.point4[0], points.point4[1], focalPoint],
            ],
            textBox: {},
            activeHandleIndex: null,
          },
          cachedStats: {},
        },
        isLocked: true,
        isVisible: true,
      };

      if (inRange(focalPoint, range[0], range[1])) {
        cornerstoneTools.annotation.state.addAnnotation(data, element);
      }
    } else {
      const range = [points.point1[2], points.point8[2]];

      const data = {
        invalidated: false,
        highlighted: false,
        metadata: {
          toolName: "MarkNodule",
          viewPlaneNormal: [-0, -0, -1],
          viewUp: [-0, -1, 0],
          FrameOfReferenceUID: points.annotationUID,
          referencedImageId: "",
        },
        data: {
          color: "white",
          orderNum: props.nodeList[i].orderNum,
          handles: {
            points: [
              [points.point1[0], points.point1[1], focalPoint],
              [points.point2[0], points.point2[1], focalPoint],
              [points.point3[0], points.point3[1], focalPoint],
              [points.point4[0], points.point4[1], focalPoint],
            ],
            textBox: {},
            activeHandleIndex: null,
          },
          cachedStats: {},
        },
        isLocked: true,
        isVisible: true,
      };

      if (inRange(focalPoint, range[0], range[1])) {
        cornerstoneTools.annotation.state.addAnnotation(data, element);
      }
    }
  }
};

// 判断区间
const inRange = (number, start, end) => {
  if (end === undefined) {
    end = start;
    start = 0;
  }
  if (start > end) {
    [start, end] = [end, start];
  }
  if (number >= start && number <= end) {
    return true;
  }
  return false;
};

// 删除所有绘制的结节
const removeAllMarkNodule = () => {
  const element = document.getElementById("cornerstone-viewport");
  let allMarkNode = cornerstoneTools.annotation.state.getAnnotations(
    MarkNoduleTool.toolName,
    element
  );
  allMarkNode = allMarkNode ? [...allMarkNode] : [];
  for (let i = 0; i < allMarkNode.length; i++) {
    removeAnnotation(allMarkNode[i].annotationUID);
  }
  renderingEngine.value.render();
};

// 跳转到指定帧（通过坐标）
const jumpToSpecialPoint = (thePoint) => {
  const viewport = renderingEngine.value.getViewport(viewportId);
  jumpToWorld(viewport, thePoint);
};

// 跳转到指定帧（通过帧）
const jumpToImageIndex = async (index) => {
  const element = document.getElementById("cornerstone-viewport");
  await jumpToSlice(element, {
    imageIndex: index - 1,
  });
};

// 隐藏所有标注
const showAllAnnotations = (check) => {
  const element = document.getElementById("cornerstone-viewport");
  const toolNameList = [
    LengthTool.toolName,
    EllipticalROITool.toolName,
    BidirectionalTool.toolName,
    MarkNoduleTool.toolName,
    AngleTool.toolName,
    EraserTool.toolName,
  ];
  const allToolsList = [];
  toolNameList.map((item) => {
    allToolsList.push(
      cornerstoneTools.annotation.state.getAnnotations(item, element)
    );
  });
  const filterList = allToolsList.flat(Infinity).filter((n) => n);
  if (!check) {
    filterList.map((item) => {
      visibility.setAnnotationVisibility(item.annotationUID, false);
    });
    renderingEngine.value.render();
  } else {
    visibility.showAllAnnotations();
    renderingEngine.value.render();
  }
};

defineExpose({
  run,
  stopClip,
  changeMIP,
  toolBarClick,
  scrollBarClick,
  renderMarkNodule,
  jumpToSpecialPoint,
  showAllAnnotations,
});
</script>

<style scoped lang="scss">
.viewer-box {
  width: 100%;
  position: relative;
  background: rgb(29, 31, 33);
  // user-select: none;

  #cornerstone-viewport {
    width: calc(100% - 20px);
    border: 1px solid rgb(79, 83, 85);
  }
}
</style>
