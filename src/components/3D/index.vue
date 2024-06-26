<template>
  <div class="t3d">
    <a-modal
        v-model:visible="visible"
        title="3D重建"
        width="900px"
        class="threeD-modal"
        destroyOnClose
        :maskClosable="false"
        :keyboard="false"
        :closable="false"
    >
      <div id="t3d-content">
        <div class="loadingHolder">
          <a-spin :indicator="indicator" size="large"/>
        </div>
      </div>
      <div id="demo-toolbar">
        <a-button class="generalBtn" type="primary" @click="larger">放大</a-button>

      </div>
      <template #footer>
        <div class="footer-box" >
          <a-button type="primary" @click="handleCancel">关闭</a-button>
        </div>
      </template>
    </a-modal>


  </div>

</template>

<script setup>
import {defineExpose, ref, defineProps, defineEmits, h} from 'vue'
import {
  RenderingEngine,
  Enums,
  setVolumesForViewports,
  volumeLoader,
  getRenderingEngine,
  utilities,
  geometryLoader,
  CONSTANTS,
} from '@cornerstonejs/core';
import resultData from './result.json'
import * as cornerstoneTools from '@cornerstonejs/tools';
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkSphereSource from '@kitware/vtk.js/Filters/Sources/SphereSource';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import {
  initDemo,
  addDropdownToToolbar,
  addButtonToToolbar,
} from '@/utils/helpers';
import {
  toolActiveHandler,
  changeMPRTool,
  getCenterPoint,
  // showAll,
  noduleDelete,
  readAllCube,
  drawFinishSwitch,
  removeUnSavedCube,
  displayAnnotationsHandler,
  setAllToolPassive
} from '@/utils/toolHandler'
import {onMounted, onUnmounted} from 'vue'

import {createFromIconfontCN, InfoCircleOutlined, LoadingOutlined} from "@ant-design/icons-vue";
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
  ZoomTool,
  TrackballRotateTool,
  segmentation,
  SegmentationDisplayTool,
  Enums: csToolsEnums,
} = cornerstoneTools;
const { ViewportType, GeometryType } = Enums;
const {IMAGE_RENDERED, CAMERA_MODIFIED} = Enums.Events;
const { MouseBindings } = csToolsEnums;

// ======== Set up page ======== //
let renderingEngine;
const volumeName = 'CT_VOLUME_ID'; // Id of the volume less loader prefix
const volumeLoaderScheme = 'cornerstoneStreamingImageVolume'; // Loader id which defines which volume loader to use
const volumeId = `${volumeLoaderScheme}:${volumeName}`; // VolumeId with loader id + volume id
const segmentationId = 'MY_SEGMENTATION_ID';
const renderingEngineId = 'myRenderingEngine';
const viewportId = '3D_VIEWPORT';
const toolGroupId = 'TOOL_GROUP_ID';
let element1
let list = []
let toolGroup
let viewportBox = []
// ~~~~~~~~~~~~~~~~~~~~~~~
const viewportGrid = document.createElement('div');

const boxStyle = ref({});

const visible = ref(false);
const outViewer = ref(null)

const indicator = h(LoadingOutlined, {
  style: {
    fontSize: "24px",
  },
  spin: true,
});
const showModal = (outer) => {
  visible.value = true;
  outViewer.value = outer
  setTimeout(() => {
    initDOM()

    addDropdownToToolbar({
      options: {
        values: CONSTANTS.VIEWPORT_PRESETS.map((preset) => preset.name),
        defaultValue: 'CT-Lung',
      },
      onSelectedValueChange: (presetName) => {
        const volumeActor = renderingEngine
            .getViewport(viewportId)
            .getDefaultActor().actor;

        utilities.applyPreset(
            volumeActor,
            CONSTANTS.VIEWPORT_PRESETS.find((preset) => preset.name === presetName)
        );

        renderingEngine.render();
      },
    });

    initSeriesList()
    computedBoxStyle()
  },500)

};

const handleCancel = (e) => {
  visible.value = false;
  destroy3D()
  outViewer.value.run("notClean");
};

// 计算定位
const computedBoxStyle = () => {
  const target = document.getElementById('target').getBoundingClientRect()
  const { x, y } = target
  boxStyle.value = {
    left: x + "px",
    top: y + "px",
  };
};

onUnmounted(() => {
  window.removeEventListener("resize", computedBoxStyle);
});

const destroy3D = async () => {
  const elements = document.getElementsByClassName('viewport-element')
  elements[1].parentElement.removeEventListener(IMAGE_RENDERED, imageRendered, false);
  elements[1].parentElement.removeEventListener(CAMERA_MODIFIED, cameraModified, false);


  removeUnSavedCube('all')
  drawFinishSwitch(false)
  element1.remove()
  viewportGrid.remove()
  const elementBox = document.getElementsByClassName('t3d')[0]
  if (elementBox) {
    elementBox.remove()
  }
  ToolGroupManager.destroyToolGroup(toolGroupId)

  cornerstoneTools.destroy()
  renderingEngine.disableElement(viewportId)
}


const initSeriesList = () => {
  toolList.value = mprButton.getButtonsStatus('all')
  cleanBtn.value = toolList.value[2]
  list = props.imageIds
  overlayData.value.total = list.length;
  run()
}

const initDOM = () => {
  const size = '100%';
  // const instructions = document.createElement('p');
  // instructions.innerText = 'Click the image to rotate it. right click to zoom';
  const content = document.getElementById('t3d-content');
  viewportGrid.classList.add('canvasBox')
  viewportGrid.style.display = 'flex';
  viewportGrid.style.display = 'flex';
  viewportGrid.style.flexDirection = 'row';

  element1 = document.createElement('div');
  element1.oncontextmenu = () => false;

  element1.style.width = size;
  element1.style.height = size;
  // content.append(instructions);

  viewportGrid.appendChild(element1);

  content.appendChild(viewportGrid);
}

/**
 * Runs the demo
 */
const run = async () => {
  // Init Cornerstone and related libraries
  await initDemo();
  // Add tools to Cornerstone3D
  // Add tools to Cornerstone3D
  cornerstoneTools.addTool(TrackballRotateTool);
  // cornerstoneTools.addTool(ZoomTool);
  cornerstoneTools.addTool(SegmentationDisplayTool);

  // Define a tool group, which defines how mouse events map to tool commands for
  // Any viewport using the group
  const toolGroup = ToolGroupManager.createToolGroup(toolGroupId);
  // const toolGroup3d = ToolGroupManager.createToolGroup(toolGroupId3d);

  // Add the tools to the tool group and specify which volume they are pointing at
  toolGroup.addTool(TrackballRotateTool.toolName, {
    configuration: { volumeId },
  });
  toolGroup.addTool(ZoomTool.toolName);
  toolGroup.addTool(SegmentationDisplayTool.toolName);

  // Set the initial state of the tools, here we set one tool active on left click.
  // This means left click will draw that tool.
  toolGroup.setToolActive(TrackballRotateTool.toolName, {
    bindings: [
      {
        mouseButton: MouseBindings.Primary, // Left Click
      },
    ],
  });
  toolGroup.setToolActive(ZoomTool.toolName, {
    bindings: [
      {
        mouseButton: MouseBindings.Secondary, // Right Click
      },
    ],
  });

  toolGroup.setToolEnabled(SegmentationDisplayTool.toolName)

  // Instantiate a rendering engine
  const renderingEngineId = 'myRenderingEngine';
  renderingEngine = getRenderingEngine(renderingEngineId)
      ? getRenderingEngine(renderingEngineId)
      : new RenderingEngine(renderingEngineId);

  const viewportInputArray = [
    {
      viewportId: viewportId,
      type: ViewportType.VOLUME_3D,
      element: element1,
      defaultOptions: {
        orientation: Enums.OrientationAxis.SAGITTAL,
        background: [0.2, 0, 0.2],
      },
    },
  ];

  renderingEngine.setViewports(viewportInputArray);

  // Set the tool group on the viewports
  toolGroup.addViewport(viewportId, renderingEngineId);

  // Define a volume in memory
  const volume = await volumeLoader.createAndCacheVolume(volumeId, {
    imageIds: props.imageIds,
  });

  const viewport = renderingEngine.getViewport(viewportId);

  // Set the volume to load
  // volume.load();
  contourDataLoader(resultData, viewport)

  volume.load();

  setVolumesForViewports(renderingEngine, [{ volumeId }], [viewportId]).then(
      () => {
        const volumeActor = renderingEngine
            .getViewport(viewportId)
            .getDefaultActor().actor;
        console.log(volumeActor)
        utilities.applyPreset(
            volumeActor,
            CONSTANTS.VIEWPORT_PRESETS.find((preset) => preset.name === 'CT-Lung')
        );
        const renderer = viewport.getRenderer()
        renderer.getActiveCamera().azimuth(-80)
        // renderer.getActiveCamera().zoom(10)
        setTimeout(()=> {
          larger(viewport, null)
        }, 100)
        sphereActorBuilder(viewport)
        viewport.render();
        console.log(2)
      }
  );

  // // Add the segmentation representation to the toolgroup
  await segmentation.addSegmentationRepresentations(toolGroupId, [
    {
      segmentationId,
      type: csToolsEnums.SegmentationRepresentations.Contour,
    },
  ]);

  renderingEngine.render();
  // addMouseListener(toolGroup,toolGroupId)
  segmentation.config.setToolGroupSpecificConfig(toolGroupId, {
    renderInactiveSegmentations: true,
    representations: {
      CONTOUR: {
        outlineWidthActive: Number(5),
        renderFill: true
      },
    },
  });
}

const larger = (viewport, renderer) => {
  let camera
  if (!viewport || !renderer) {
    viewport = renderingEngine.getViewport(viewportId);
    camera = viewport.getRenderer().getActiveCamera()
  } else {
    camera = renderer.getActiveCamera()
  }
  camera.zoom(2)
  viewport.render();
}

const contourDataHandler = (raw) => {
  const lineList = []
  raw.data.forEach(ele => {
    const tempArr = []
    ele.nodulesList.forEach(innerEle => {
      const tempNode = {}
      tempNode.id = innerEle.index
      tempNode.type = "CLOSED_PLANAR"
      tempNode.points = innerEle.bbox.contour_coords
      tempArr.push(tempNode)
    })
    tempArr.sort((a, b) => a.id - b.id);

    const firstZ = -400
    tempArr.forEach((ele, index) => {
      ele.points.map(point => {
        point[0] -= 120
        point[1] -= 220
        point[2] = firstZ + (0.5 * index)
      })
    })

    lineList.push({
      "data": tempArr,
      "id": "contour" + tempArr[0].id,
      "color": getRandomColor()
    })
  })

  let contourStructure = {
    contourSets: lineList
  }
  console.log(lineList)
  // console.log(contourStructure)
  return contourStructure
}

const contourDataLoader = async (resultData, viewport) => {
  const contour = contourDataHandler(resultData, viewport)
  // load the contour data
  const geometryIds = [];
  const promises = contour.contourSets.map((contourSet) => {
    const geometryId = contourSet.id;
    geometryIds.push(geometryId);
    return geometryLoader.createAndCacheGeometry(geometryId, {
      type: GeometryType.CONTOUR,
      geometryData: contourSet,
    });
  });

  await Promise.all(promises);

  // Add the segmentations to state
  segmentation.addSegmentations([
    {
      segmentationId,
      representation: {
        // The type of segmentation
        type: csToolsEnums.SegmentationRepresentations.Contour,
        // The actual segmentation data, in the case of contour geometry
        // this is a reference to the geometry data
        data: {
          geometryIds,
        },
      },
    },
  ]);
}

const sphereActorBuilder = (viewport) => {
  console.log(props.noduleList)
  props.noduleList.forEach((ele, index) => {
    const center = getCenterPoint(ele.boxVO)

    const direction = [
      ele.boxVO.point1[0] - center[0],
      ele.boxVO.point1[1] - center[1],
      ele.boxVO.point1[2] - center[2]
    ];
    const distance = Math.abs(Math.sqrt(direction[0] * direction[0] + direction[1] * direction[1] + direction[2] * direction[2]));

    const actor = getSphereActor({
      center: center,
      radius: distance,
      phiResolution: 20,
      thetaResolution: 20,
      opacity: 1,
      edgeVisibility: false,
    });
    viewport.addActors([{ uid: 'spherePolyData' + index, actor }]);
  })
}
const getSphereActor = ({
                          center,
                          radius,
                          phiResolution,
                          thetaResolution,
                          opacity,
                          edgeVisibility,
                        }) => {
  const sphereSource = vtkSphereSource.newInstance({
    center,
    radius,
    phiResolution,
    thetaResolution,
  });
  const actor = vtkActor.newInstance();
  const mapper = vtkMapper.newInstance();

  actor.getProperty().setEdgeVisibility(edgeVisibility);
  actor.getProperty().setOpacity(opacity)
  const color = getRandomColor(true)
  actor.getProperty().setColor(color[0],color[1],color[2] )
  actor.getProperty().setAmbient(0.3)
  actor.getProperty().setDiffuse(0.5)
  actor.getProperty().setSpecular(0.2)

  mapper.setInputConnection(sphereSource.getOutputPort());
  actor.setMapper(mapper);

  return actor;
}

const getRandomColor = (isLess1) => {
  if (isLess1) {
    return [Math.random(), Math.random(), Math.random()]
  } else {
    return [Math.floor(Math.random() * 250), Math.floor(Math.random() * 250), Math.floor(Math.random() * 250)]
  }
}

const cameraClose = (camera) => {

// Get the current position of the camera and the focal point
  const cameraPosition = camera.getPosition();
  const focalPoint = camera.getFocalPoint();
// Calculate the direction vector from the camera to the focal point
  const direction = camera.getDirectionOfProjection()

// Calculate the distance between the camera and the focal point
  const distance = camera.getDistance();

// Zoom in by reducing the distance between the camera and the focal point
  const newDistance = distance * 0.5; // You can adjust the zoom factor as needed

// Calculate the new camera position by moving it along the direction vector
  const newCameraPosition = [
    focalPoint[0] - direction[0] * newDistance,
    focalPoint[1] - direction[1] * newDistance,
    focalPoint[2] - direction[2] * newDistance
  ];

// Set the new camera position
  camera.setPosition(newCameraPosition[0], newCameraPosition[1], newCameraPosition[2]);

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
  handleListClicked,
  showModal
});
</script>

<style lang="scss">
.threeD-modal {
  top: 40px;
  .ant-modal-body {
    padding: 0 0 20px;
    #t3d-content {
      width: 100%;
      height: 100%;
      min-height: 480px;
      display: flex;
      justify-content: center;
      margin-bottom: 12px;
      .loadingHolder {
        position: absolute;
        height: 500px;
        display: flex;
        align-items: center;
        .ant-spin {
          text-align: center;
          .anticon-loading {
            font-size: 40px !important;
            color: white;
          }
        }
      }
      .canvasBox {
        width: 100%;
        height: 74vh;
        align-items: center;
        overflow: hidden;
      }
    }
    #demo-toolbar {
      display: flex;
      justify-content: center;
    }
  }
}


</style>
