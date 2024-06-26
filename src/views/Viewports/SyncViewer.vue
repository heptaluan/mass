<template>
  <div class="viewer-box-wrap">
    <div class="viewer-box" id="viewerBox">
      <div class="top-box">
        <div
          id="cornerstone-viewport1"
          class="list-box"
          :class="{ active: currentViewport === 0 }"
          data-index="0"
          :style="{ width: boxStyle.width, height: boxStyle.height }"
        >
          <CustomOverlay
            :seriesData="props.seriesData"
            :overlayData="overlayData1"
            :institutionInfo="institutionInfo"
          />
        </div>
        <div
          id="cornerstone-viewport2"
          class="list-box"
          :class="{ active: currentViewport === 1 }"
          data-index="1"
          :style="{ width: boxStyle.width, height: boxStyle.height }"
        >
          <CustomOverlay
            :seriesData="props.seriesData"
            :overlayData="overlayData2"
            :institutionInfo="institutionInfo"
          />
        </div>
      </div>
      <div class="bottom-box" :class="{ hide: props.size === 2 }">
        <div
          id="cornerstone-viewport3"
          class="list-box"
          :class="{ active: currentViewport === 2 }"
          data-index="2"
          :style="{ width: boxStyle.width, height: boxStyle.height }"
        >
          <CustomOverlay
            :seriesData="props.seriesData"
            :overlayData="overlayData3"
            :institutionInfo="institutionInfo"
          />
        </div>
        <div
          id="cornerstone-viewport4"
          class="list-box"
          :class="{ active: currentViewport === 3 }"
          data-index="3"
          :style="{ width: boxStyle.width, height: boxStyle.height }"
        >
          <CustomOverlay
            :seriesData="props.seriesData"
            :overlayData="overlayData4"
            :institutionInfo="institutionInfo"
          />
        </div>
      </div>
    </div>
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
  watch,
  nextTick,
  defineEmits,
} from "vue";

import {
  RenderingEngine,
  Enums,
  getRenderingEngine,
  volumeLoader,
  setVolumesForViewports,
  cache,
} from "@cornerstonejs/core";
import { initDemo } from "../../utils/helpers";
import { initElementCursor } from "@cornerstonejs/tools/dist/esm/cursors/elementCursor";

import { utilities } from "@cornerstonejs/tools";

import CustomOverlay from "./CustomOverlay.vue";
import * as cornerstoneTools from "@cornerstonejs/tools";
import MarkNoduleTool from "./Tools/MarkNoduleTool";
import { vec3 } from "gl-matrix";
import router from "@/router";
import ChangeVoiRangeModal from "./ChangeVoiRangeModal.vue";
import {mprButtonStore} from "@/store/modules/MRPButtons";

const changeVoiRangeRef = ref(null);

const { getOrientationStringLPS, invertOrientationStringLPS } =
  utilities.orientation;

const { IMAGE_RENDERED, CAMERA_MODIFIED, VOLUME_NEW_IMAGE } = Enums.Events;

const windowW = ref(document.documentElement.clientWidth);
const windowH = ref(document.documentElement.clientHeight);

const props = defineProps([
  "size",
  "imageIds",
  "seriesData",
  "voiRange",
  "changeToolListActiveStata",
  "getToolListActiveStata",
  "changeToolListMIPStata",
  "institutionInfo",
  "isVertical",
]);

const boxStyle = ref({});

watch(
  () => props.size,
  () => {
    computedBoxStyle();
    nextTick(() => {
      onResize();
    });
  }
);

const {
  StackScrollMouseWheelTool,
  LengthTool,
  // EllipticalROITool,
  // BidirectionalTool,
  ToolGroupManager,
  Enums: csToolsEnums,
  PanTool,
  // WindowLevelTool,
  ZoomTool,
  AngleTool,
  synchronizers,
  SynchronizerManager,
  utilities: csToolsUtilities,
} = cornerstoneTools;

const { createCameraPositionSynchronizer, createVOISynchronizer } =
  synchronizers;

const { MouseBindings } = csToolsEnums;

const { ViewportType } = Enums;
const mprButton = mprButtonStore();

const renderingEngineId = "myRenderingEngine";
const renderingEngine = ref("");
const toolGroupManager = ref("");

const viewportIds = [
  "CT_SAGITTAL_STACK_1",
  "CT_SAGITTAL_STACK_2",
  "CT_SAGITTAL_STACK_3",
  "CT_SAGITTAL_STACK_4",
];

const cameraSynchronizerId = "CAMERA_SYNCHRONIZER_ID2";
const voiSynchronizerId = "VOI_SYNCHRONIZER_ID2";

const SynchronizerButtonInfo = [
  { viewportLabel: "A", viewportId: viewportIds[0] },
  { viewportLabel: "B", viewportId: viewportIds[1] },
  { viewportLabel: "C", viewportId: viewportIds[2] },
  { viewportLabel: "D", viewportId: viewportIds[3] },
];

const volumeName = "CT_VOLUME_ID" + mprButton.getVolumeIndex; // Id of the volume less loader prefix
const volumeLoaderScheme = "cornerstoneStreamingImageVolume"; // Loader id which defines which volume loader to use
const volumeId = `${volumeLoaderScheme}:${volumeName}`; // VolumeId with loader id + volume id

const overlayData1 = ref({});
const overlayData2 = ref({});
const overlayData3 = ref({});
const overlayData4 = ref({});

const currentViewport = ref(0);

const emit = defineEmits(["cleanVolumeLoadObject"]);

// 添加联动
if (
  !SynchronizerManager.getSynchronizer(voiSynchronizerId) ||
  !SynchronizerManager.getSynchronizer(cameraSynchronizerId)
) {
  createCameraPositionSynchronizer(cameraSynchronizerId);
  createVOISynchronizer(voiSynchronizerId);
}

// 添加启用工具
const addToolsList = () => {
  const toolsList = cornerstoneTools.state.tools;
  const tools = [
    // WindowLevelTool,
    PanTool,
    ZoomTool,
    // AngleTool,
    StackScrollMouseWheelTool,
    // LengthTool,
    // EllipticalROITool,
    // BidirectionalTool,
    MarkNoduleTool,
    AngleTool,
  ];
  for (let i = 0; i < tools.length; i++) {
    if (!toolsList[tools[i].toolName]) {
      cornerstoneTools.addTool(tools[i]);
    }
  }
};

// 四个视窗添加点击事件
const addViewportClickEventListener = () => {
  const viewerBox = document.getElementById("viewerBox");
  if (
    navigator.userAgent.match(
      /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
    )
  ) {
    viewerBox.addEventListener(
      "click",
      (event) => {
        const currentElement = event.target.parentElement.parentElement;
        const index = Number(currentElement.dataset.index);
        currentViewport.value = index;
        setToolbarFlipState();
        setToolbarAutoPlayState(index);
        setToolbarMIPState();
      },
      false
    );
  } else {
    viewerBox.addEventListener(
      "mousedown",
      (event) => {
        const currentElement = event.target.parentElement.parentElement;
        const index = Number(currentElement.dataset.index);
        currentViewport.value = index;
        setToolbarFlipState();
        setToolbarAutoPlayState(index);
        setToolbarMIPState();
      },
      false
    );
  }
};

// 设置顶部菜单栏翻转状态
const setToolbarFlipState = () => {
  const viewport = renderingEngine.value.getViewport(
    viewportIds[currentViewport.value]
  );
  const { flipHorizontal } = viewport.getCamera();
  const { flipVertical } = viewport.getCamera();
  props.changeToolListActiveStata(5, flipHorizontal);
  props.changeToolListActiveStata(6, flipVertical);
};

// 设置顶部菜单栏自动播放状态
const setToolbarAutoPlayState = (index) => {
  const element = document.getElementById(`cornerstone-viewport${index + 1}`);
  const state = csToolsUtilities.cine.getToolState(element);
  if (state && state.intervalId) {
    props.changeToolListActiveStata(11, true);
  } else {
    props.changeToolListActiveStata(11, false);
  }
};

// 记录视窗状态
const viewportState = ref([
  {
    mipRadioVal: "MaxIP",
    mipSliderVal: 0,
  },
  {
    mipRadioVal: "MaxIP",
    mipSliderVal: 0,
  },
  {
    mipRadioVal: "MaxIP",
    mipSliderVal: 0,
  },
  {
    mipRadioVal: "MaxIP",
    mipSliderVal: 0,
  },
]);

// 设置顶部菜单栏 MIP 状态
const setToolbarMIPState = () => {
  props.changeToolListMIPStata(viewportState.value[currentViewport.value]);
};

// MIP 调整
const changeMIP = (data = {}) => {
  const linkageState = props.getToolListActiveStata(12);

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

  if (linkageState) {
    [0, 1, 2, 3].forEach((index) => {
      viewportState.value[index].mipRadioVal = mipRadioVal;
      viewportState.value[index].mipSliderVal = mipSliderVal;
      const viewport = renderingEngine.value.getViewport(viewportIds[index]);
      viewport.setBlendMode(blendMode);
      viewport.setSlabThickness(valueAsNumber);
      viewport.render();
    });
  } else {
    const viewport = renderingEngine.value.getViewport(
      viewportIds[currentViewport.value]
    );
    viewportState.value[currentViewport.value].mipRadioVal = mipRadioVal;
    viewportState.value[currentViewport.value].mipSliderVal = mipSliderVal;
    viewport.setBlendMode(blendMode);
    viewport.setSlabThickness(valueAsNumber);
    viewport.render();
  }
};

// 取消自动播放
const stopClip = () => {
  [1, 2, 3, 4].forEach((index) => {
    const element = document.getElementById(`cornerstone-viewport${index}`);
    csToolsUtilities.cine.stopClip(element);
  });
};

// 顶部工具栏点击事件
const toolBarClick = async (id, active) => {
  const viewport = renderingEngine.value.getViewport(
    viewportIds[currentViewport.value]
  );
  const element = document.getElementById(
    `cornerstone-viewport${currentViewport.value + 1}`
  );
  const { flipHorizontal } = viewport.getCamera();
  const { flipVertical } = viewport.getCamera();

  switch (id) {
    // 返回
    case 1:
      await emit("cleanVolumeLoadObject", volumeId);
      router.push({ name: "studyList" });
      return false;
    // 默认左键配置
    case 3:
      setToolBarDefaultState();
      initElementCursor(element);
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
      viewport.render();
      break;
    // 竖直翻转
    case 6:
      viewport.setCamera({ flipVertical: !flipVertical });
      viewport.render();
      break;
    // 旋转
    case 7:
      // 暂时剔除
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
      keepMIPStatusSync();
      csToolsUtilities.cine.playClip(element, { framesPerSecond: 12 });
      break;
    case "11-2":
      keepMIPStatusSync();
      csToolsUtilities.cine.playClip(element, { framesPerSecond: 24 });
      break;
    case "11-3":
      keepMIPStatusSync();
      csToolsUtilities.cine.playClip(element, { framesPerSecond: 48 });
      break;

    // 联动
    case 12:
      if (active) {
        keepMIPStatusSync();
      }
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

// 窗口联动状态下同步各个视窗的状态（暂时只用处理 MIP 和窗宽窗位）
const keepMIPStatusSync = () => {
  const linkageState = props.getToolListActiveStata(12);
  const viewport = renderingEngine.value.getViewport(
    viewportIds[currentViewport.value]
  );
  let blendMode = Enums.BlendModes.MAXIMUM_INTENSITY_BLEND;
  const { mipRadioVal, mipSliderVal } =
    viewportState.value[currentViewport.value];
  if (linkageState) {
    const currentVoiRange = viewport.getProperties().voiRange;
    const currentFlipHorizontal = viewport.flipHorizontal;
    const currentFlipVertical = viewport.flipVertical;
    const currentPosition = viewport.getCamera().position;
    const currentFocalPoint = viewport.getCamera().focalPoint;
    const currentZoom = viewport.getZoom().toFixed(2);

    [0, 1, 2, 3].forEach((index) => {
      const viewport = renderingEngine.value.getViewport(viewportIds[index]);

      // 窗宽窗位处理
      viewport.setProperties({
        voiRange: currentVoiRange,
      });

      // 水平翻转与垂直翻转
      viewport.setCamera({ flipHorizontal: currentFlipHorizontal });
      viewport.setCamera({ flipVertical: currentFlipVertical });

      // 移动
      viewport.setCamera({
        position: currentPosition,
        focalPoint: currentFocalPoint,
      });

      // 缩放
      viewport.setZoom(currentZoom);

      // MIP 处理
      viewportState.value[index].mipRadioVal = mipRadioVal;
      viewportState.value[index].mipSliderVal = mipSliderVal;
      if (mipRadioVal === "MaxIP") {
        blendMode = Enums.BlendModes.MAXIMUM_INTENSITY_BLEND;
      } else if (mipRadioVal === "MinIP") {
        blendMode = Enums.BlendModes.MINIMUM_INTENSITY_BLEND;
      }

      let valueAsNumber = mipSliderVal;
      if (valueAsNumber < 1) {
        valueAsNumber = 0.1;
        blendMode = Enums.BlendModes.COMPOSITE;
      }

      viewport.setBlendMode(blendMode);
      viewport.setSlabThickness(valueAsNumber);
      viewport.render();
    });
  }
};

// 设置自定义窗宽窗位
const setVoiRange = (e) => {
  const linkageState = props.getToolListActiveStata(12);
  if (linkageState) {
    [0, 1, 2, 3].forEach((index) => {
      const viewport = renderingEngine.value.getViewport(viewportIds[index]);
      viewport.setProperties({
        voiRange: {
          lower: -e.width,
          upper: -e.level,
        },
      });
      viewport.render();
    });
  } else {
    const viewport = renderingEngine.value.getViewport(
      viewportIds[currentViewport.value]
    );
    viewport.setProperties({
      voiRange: {
        lower: -e.width,
        upper: -e.level,
      },
    });
    viewport.render();
  }
};

// 设置工具栏默认左键状态（重置）
const setToolBarDefaultState = () => {
  const element = document.getElementById(
    `cornerstone-viewport${currentViewport.value + 1}`
  );
  setAllToolPassive();
  initElementCursor(element);
  // toolGroupManager.value.setToolActive(WindowLevelTool.toolName, {
  //   bindings: [
  //     {
  //       mouseButton: MouseBindings.Primary, // Left Click
  //     },
  //   ],
  // });
};

// 取消其他工具
const setAllToolPassive = () => {
  // toolGroupManager.value.setToolPassive(WindowLevelTool.toolName);
  toolGroupManager.value.setToolPassive(PanTool.toolName);
  toolGroupManager.value.setToolPassive(ZoomTool.toolName);
  // toolGroupManager.value.setToolPassive(AngleTool.toolName);

  // toolGroupManager.value.setToolPassive(LengthTool.toolName);

  // toolGroupManager.value.setToolPassive(EllipticalROITool.toolName);
  // toolGroupManager.value.setToolPassive(BidirectionalTool.toolName);
};

const run = async function () {
  // Init Cornerstone and related libraries
  await initDemo();

  // 先清除联动
  // removeSynchronizer()

  const element1 = document.getElementById("cornerstone-viewport1");
  const element2 = document.getElementById("cornerstone-viewport2");
  const element3 = document.getElementById("cornerstone-viewport3");
  const element4 = document.getElementById("cornerstone-viewport4");

  element1.oncontextmenu = (e) => e.preventDefault();
  element2.oncontextmenu = (e) => e.preventDefault();
  element3.oncontextmenu = (e) => e.preventDefault();
  element4.oncontextmenu = (e) => e.preventDefault();

  // 每次重新渲染先移除四个视窗的事件监听，然后重新绑定事件监听
  removeAllEventListener(element1, element2, element3, element4);
  addAllEventListener(element1, element2, element3, element4);

  // 添加切换事件
  addViewportClickEventListener();

  // cornerstoneTools.addTool(StackScrollMouseWheelTool);

  // 批量添加工具
  addToolsList();

  const toolGroupId = "TOOL_GROUP_ID2";

  // Define a tool group, which defines how mouse events map to tool commands for
  // Any viewport using the group

  if (ToolGroupManager.getToolGroup(toolGroupId)) {
    toolGroupManager.value = ToolGroupManager.getToolGroup(toolGroupId);
  } else {
    toolGroupManager.value = ToolGroupManager.createToolGroup(toolGroupId);

    toolGroupManager.value.addTool(StackScrollMouseWheelTool.toolName);

    // toolGroupManager.value.addTool(WindowLevelTool.toolName);
    toolGroupManager.value.addTool(PanTool.toolName);
    toolGroupManager.value.addTool(ZoomTool.toolName);
  }

  // Create synchronizers

  toolGroupManager.value.setToolActive(StackScrollMouseWheelTool.toolName);

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

  // Get Cornerstone imageIds and fetch metadata into RAM
  const imageIds = props.imageIds;

  overlayData1.value.total = imageIds.length;
  overlayData2.value.total = imageIds.length;
  overlayData3.value.total = imageIds.length;
  overlayData4.value.total = imageIds.length;

  // Instantiate a rendering engine
  renderingEngine.value = getRenderingEngine(renderingEngineId)
    ? getRenderingEngine(renderingEngineId)
    : new RenderingEngine(renderingEngineId);

  // Create the viewports
  const viewportInputArray = [
    {
      viewportId: viewportIds[0],
      type: ViewportType.ORTHOGRAPHIC,
      element: element1,
      defaultOptions: {
        orientation: Enums.OrientationAxis.AXIAL,
        background: [0, 0, 0],
      },
    },
    {
      viewportId: viewportIds[1],
      type: ViewportType.ORTHOGRAPHIC,
      element: element2,
      defaultOptions: {
        orientation: Enums.OrientationAxis.AXIAL,
        background: [0, 0, 0],
      },
    },
    {
      viewportId: viewportIds[2],
      type: ViewportType.ORTHOGRAPHIC,
      element: element3,
      defaultOptions: {
        orientation: Enums.OrientationAxis.AXIAL,
        background: [0, 0, 0],
      },
    },
    {
      viewportId: viewportIds[3],
      type: ViewportType.ORTHOGRAPHIC,
      element: element4,
      defaultOptions: {
        orientation: Enums.OrientationAxis.AXIAL,
        background: [0, 0, 0],
      },
    },
  ];

  renderingEngine.value.setViewports(viewportInputArray);

  // Set the tool group on the viewports
  viewportIds.forEach((viewportId) =>
    toolGroupManager.value.addViewport(viewportId, renderingEngineId)
  );

  // await emit("cleanVolumeLoadObject", volumeId);

  const volumeLoadObject = await cache.getVolumeLoadObject(volumeId);

  if (volumeLoadObject) {
    await volumeLoader.loadVolume(volumeId);
  } else {
    // Define a volume in memory
    const volume = await volumeLoader.createAndCacheVolume(volumeId, {
      imageIds,
    });
    // Set the volume to load
    volume.load();
  }

  await setVolumesForViewports(
    renderingEngine.value,
    [{ volumeId }],
    viewportIds
  );

  // 设置默认窗宽窗位
  setDefaultVoiRange();

  // Render the image
  renderingEngine.value.renderViewports(viewportIds);
};

// 设置默认窗宽窗位
const setDefaultVoiRange = () => {
  viewportIds.forEach((viewportId) => {
    renderingEngine.value
      .getViewport(viewportId)
      .setProperties(
        props.voiRange.find((item) => item.isDefault === true).voiRange
      );
    renderingEngine.value.getViewport(viewportId).setZoom(1.4);
  });
};

// 设置默认选中窗口
const setDefaultCurrentWindow = () => {
  currentViewport.value = 0;
};

// 添加联动
const addSynchronizer = () => {
  const windowLevelSynchronizer =
    SynchronizerManager.getSynchronizer(voiSynchronizerId);
  const mouseWheelSynchronizer =
    SynchronizerManager.getSynchronizer(cameraSynchronizerId);

  if (!windowLevelSynchronizer || !mouseWheelSynchronizer) {
    return;
  }

  SynchronizerButtonInfo.forEach(({ viewportId }) => {
    windowLevelSynchronizer.add({
      renderingEngineId: renderingEngineId,
      viewportId: viewportId,
    });
    mouseWheelSynchronizer.add({
      renderingEngineId: renderingEngineId,
      viewportId: viewportId,
    });
  });
};

// 移除联动
const removeSynchronizer = () => {
  const windowLevelSynchronizer =
    SynchronizerManager.getSynchronizer(voiSynchronizerId);
  const mouseWheelSynchronizer =
    SynchronizerManager.getSynchronizer(cameraSynchronizerId);

  if (!windowLevelSynchronizer || !mouseWheelSynchronizer) {
    return;
  }

  SynchronizerButtonInfo.forEach(({ viewportId }) => {
    windowLevelSynchronizer.remove({
      renderingEngineId: renderingEngineId,
      viewportId: viewportId,
    });
    mouseWheelSynchronizer.remove({
      renderingEngineId: renderingEngineId,
      viewportId: viewportId,
    });
  });
};

// 计算盒子的样式
const computedBoxStyle = () => {
  if (Number(props.size) === 2) {
    if (props.isVertical) {
      boxStyle.value = {
        width: windowW.value / 2 + "px",
        height: windowH.value - 625 + "px",
      };
    } else {
      boxStyle.value = {
        width: windowW.value - 450 + "px",
        height: (windowH.value - 141) / 2 + "px",
      };
    }
  } else if (Number(props.size) === 4) {
    if (props.isVertical) {
      boxStyle.value = {
        width: windowW.value / 2 + "px",
        height: (windowH.value - 625) / 2 + "px",
      };
    } else {
      boxStyle.value = {
        width: (windowW.value - 450) / 2 + "px",
        height: (windowH.value - 141) / 2 + "px",
      };
    }
  }
};

onMounted(() => {
  window.addEventListener("resize", onResize);
  computedBoxStyle();
  run();
});

onUnmounted(() => {
  window.removeEventListener("resize", onResize);
  // cornerstoneTools.destroy();
});

const onResize = () => {
  windowW.value = document.documentElement.clientWidth;
  windowH.value = document.documentElement.clientHeight;
  computedBoxStyle();
  nextTick(() => {
    renderingEngine.value && renderingEngine.value.resize(true, false);
    viewportIds.forEach((viewportId) => {
      renderingEngine.value.getViewport(viewportId).setZoom(1.4);
    });
  });
};

/**
 * 监听四个视图对应变化
 */
// 视窗一
const imageRendered1 = (evt) => {
  const viewport = renderingEngine.value.getViewport(viewportIds[0]);
  const imageData = viewport.getImageData();

  overlayData1.value.row = imageData?.dimensions[0];
  overlayData1.value.col = imageData?.dimensions[1];
  overlayData1.value.lower = viewport.getProperties().voiRange?.lower;
  overlayData1.value.upper = viewport.getProperties().voiRange?.upper;

  overlayData1.value.zoom = viewport.getZoom().toFixed(2);

  overlayData1.value.currentImageId = viewport.getCurrentImageId();
  overlayData1.value.imageIndex =
    props.imageIds.length - viewport.getCurrentImageIdIndex() - 1;
};

const cameraModified1 = (evt) => {
  const viewport = renderingEngine.value.getViewport(viewportIds[0]);
  overlayData1.value.position = evt.detail.camera.position[2].toFixed(2);
  // 计算方向
  if (viewport) {
    computedMarkers(viewport, overlayData1.value);
  }
};

const volumeNewImage1 = (evt) => {
  // overlayData1.value.imageIndex = evt.detail.imageIndex;
};

// 视窗二
const imageRendered2 = (evt) => {
  const viewport = renderingEngine.value.getViewport(viewportIds[1]);
  const imageData = viewport.getImageData();

  overlayData2.value.row = imageData?.dimensions[0];
  overlayData2.value.col = imageData?.dimensions[1];
  overlayData2.value.lower = viewport.getProperties().voiRange?.lower;
  overlayData2.value.upper = viewport.getProperties().voiRange?.upper;

  overlayData2.value.zoom = viewport.getZoom().toFixed(2);

  overlayData2.value.currentImageId = viewport.getCurrentImageId();
  overlayData2.value.imageIndex =
    props.imageIds.length - viewport.getCurrentImageIdIndex() - 1;
};

const cameraModified2 = (evt) => {
  const viewport = renderingEngine.value.getViewport(viewportIds[1]);
  overlayData2.value.position = evt.detail.camera.position[2].toFixed(2);
  // 计算方向
  if (viewport) {
    computedMarkers(viewport, overlayData2.value);
  }
};

const volumeNewImage2 = (evt) => {
  // overlayData2.value.imageIndex = evt.detail.imageIndex;
};

// 视窗三
const imageRendered3 = (evt) => {
  const viewport = renderingEngine.value.getViewport(viewportIds[2]);
  const imageData = viewport.getImageData();

  overlayData3.value.row = imageData?.dimensions[0];
  overlayData3.value.col = imageData?.dimensions[1];
  overlayData3.value.lower = viewport.getProperties().voiRange?.lower;
  overlayData3.value.upper = viewport.getProperties().voiRange?.upper;

  overlayData3.value.zoom = viewport.getZoom().toFixed(2);

  overlayData3.value.currentImageId = viewport.getCurrentImageId();
  overlayData3.value.imageIndex =
    props.imageIds.length - viewport.getCurrentImageIdIndex() - 1;
};

const cameraModified3 = (evt) => {
  const viewport = renderingEngine.value.getViewport(viewportIds[2]);
  overlayData3.value.position = evt.detail.camera.position[2].toFixed(2);
  // 计算方向
  if (viewport) {
    computedMarkers(viewport, overlayData3.value);
  }
};

const volumeNewImage3 = (evt) => {
  // overlayData3.value.imageIndex = evt.detail.imageIndex;
};

// 视窗四
const imageRendered4 = (evt) => {
  const viewport = renderingEngine.value.getViewport(viewportIds[3]);
  const imageData = viewport.getImageData();

  overlayData4.value.row = imageData?.dimensions[0];
  overlayData4.value.col = imageData?.dimensions[1];
  overlayData4.value.lower = viewport.getProperties().voiRange?.lower;
  overlayData4.value.upper = viewport.getProperties().voiRange?.upper;

  overlayData4.value.zoom = viewport.getZoom().toFixed(2);

  overlayData4.value.currentImageId = viewport.getCurrentImageId();
  overlayData4.value.imageIndex =
    props.imageIds.length - viewport.getCurrentImageIdIndex() - 1;
};

const cameraModified4 = (evt) => {
  const viewport = renderingEngine.value.getViewport(viewportIds[3]);
  overlayData4.value.position = evt.detail.camera.position[2].toFixed(2);
  // 计算方向
  if (viewport) {
    computedMarkers(viewport, overlayData4.value);
  }
};

const volumeNewImage4 = (evt) => {
  // overlayData4.value.imageIndex = evt.detail.imageIndex;
};

// 计算方向
const computedMarkers = (viewport, overlayData) => {
  const { viewUp, viewPlaneNormal } = viewport.getCamera();
  const viewRight = vec3.create();
  vec3.cross(viewRight, viewUp, viewPlaneNormal);

  const columnCosines = [-viewUp[0], -viewUp[1], -viewUp[2]];
  const rowCosines = viewRight;

  const markers = _getOrientationMarkers(rowCosines, columnCosines);

  overlayData.top = markers.top;
  overlayData.left = markers.left;
  overlayData.right = markers.right;
  overlayData.bottom = markers.bottom;
};

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

// 批量添加与清除事件
const addAllEventListener = (element1, element2, element3, element4) => {
  element1.addEventListener(IMAGE_RENDERED, imageRendered1, false);
  element1.addEventListener(CAMERA_MODIFIED, cameraModified1, false);
  element1.addEventListener(VOLUME_NEW_IMAGE, volumeNewImage1, false);

  element2.addEventListener(IMAGE_RENDERED, imageRendered2, false);
  element2.addEventListener(CAMERA_MODIFIED, cameraModified2, false);
  element2.addEventListener(VOLUME_NEW_IMAGE, volumeNewImage2, false);

  element3.addEventListener(IMAGE_RENDERED, imageRendered3, false);
  element3.addEventListener(CAMERA_MODIFIED, cameraModified3, false);
  element3.addEventListener(VOLUME_NEW_IMAGE, volumeNewImage3, false);

  element4.addEventListener(IMAGE_RENDERED, imageRendered4, false);
  element4.addEventListener(CAMERA_MODIFIED, cameraModified4, false);
  element4.addEventListener(VOLUME_NEW_IMAGE, volumeNewImage4, false);
};

const removeAllEventListener = (element1, element2, element3, element4) => {
  element1.removeEventListener(IMAGE_RENDERED, imageRendered1, false);
  element1.removeEventListener(CAMERA_MODIFIED, cameraModified1, false);
  element1.removeEventListener(VOLUME_NEW_IMAGE, volumeNewImage1, false);

  element2.removeEventListener(IMAGE_RENDERED, imageRendered2, false);
  element2.removeEventListener(CAMERA_MODIFIED, cameraModified2, false);
  element2.removeEventListener(VOLUME_NEW_IMAGE, volumeNewImage2, false);

  element3.removeEventListener(IMAGE_RENDERED, imageRendered3, false);
  element3.removeEventListener(CAMERA_MODIFIED, cameraModified3, false);
  element3.removeEventListener(VOLUME_NEW_IMAGE, volumeNewImage3, false);

  element4.removeEventListener(IMAGE_RENDERED, imageRendered4, false);
  element4.removeEventListener(CAMERA_MODIFIED, cameraModified4, false);
  element4.removeEventListener(VOLUME_NEW_IMAGE, volumeNewImage4, false);
};

defineExpose({
  addSynchronizer,
  removeSynchronizer,
  setDefaultVoiRange,
  setDefaultCurrentWindow,
  toolBarClick,
  changeMIP,
  stopClip,
  setToolBarDefaultState,
});
</script>

<style scoped lang="scss">
.viewer-box-wrap {
  width: 100%;
  position: relative;
  background: rgb(29, 31, 33);
  user-select: none;
  display: flex;
  flex-direction: column;

  .custom-overlay {
    width: 100%;
  }

  .viewer-box {
    display: flex;
    flex-direction: row;

    .list-box.active {
      border: 4px solid #96b7e7 !important;
    }
  }

  .top-box,
  .bottom-box {
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  .bottom-box.hide {
    position: absolute;
    z-index: -9;
  }

  #cornerstone-viewport1,
  #cornerstone-viewport2,
  #cornerstone-viewport3,
  #cornerstone-viewport4 {
    position: relative;
    width: 100%;
    border: 1px solid rgb(79, 83, 85);
  }
}
</style>
