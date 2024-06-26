<template>
  <div class="viewport-box" :class="{ isVertical: isVertical }">
    <div class="header-box">
      <div class="user">
        <div>
          <UserOutlined :style="{ fontSize: '26px' }" />
        </div>
        <div class="user-info">
          <span
            >{{ seriesData.userName }} {{ seriesData.userSex }}
            {{ seriesData.userAge }}</span
          >
          <span>{{ seriesData.seriesDateTime }}</span>
        </div>
      </div>
      <div class="user-title">当前检查</div>
      <UserSetting />
    </div>
    <Toolbar
      ref="toolListRef"
      :voiRange="voiRange"
      @toolBarClick="toolBarClick"
      @syncWindowClick="syncWindowClick"
      @handleChangeMIP="handleChangeMIP"
    />
    <div class="title-box">
      {{ seriesData.seriesDateTime }} {{ seriesData.seriesDescription }} -
      {{ seriesData.sliceThickness }}mm
    </div>
    <div class="viewer-wrap">

<!--      <a-button class="generalBtn" type="primary" @click="open3D()">查看3D</a-button>-->


      <template v-if="showViewer">
        <Viewer
          ref="viewerRef"
          :imageIds="imageIds"
          :nodeList="nodeList"
          :seriesData="seriesData"
          :seriesInstanceUid="seriesInstanceUid"
          :voiRange="voiRange"
          :allChecked="allChecked"
          :institutionInfo="institutionInfo"
          :pcrContent="pcrContent"
          :isVertical="isVertical"
          @handleAddNewNodule="handleAddNewNodule"
          @handleScrollBarClick="handleScrollBarClick"
          @cleanVolumeLoadObject="cleanVolumeLoadObject"
          @loadingSwitch="loadingSwitch"
        />
      </template>
      <template v-else-if="showSyncViewer">
        <SyncViewer
          ref="syncViewerRef"
          :seriesData="seriesData"
          :imageIds="imageIds"
          :size="syncWindowSize"
          :voiRange="voiRange"
          :changeToolListActiveStata="changeToolListActiveStata"
          :getToolListActiveStata="getToolListActiveStata"
          :changeToolListMIPStata="changeToolListMIPStata"
          :institutionInfo="institutionInfo"
          :isVertical="isVertical"
          @cleanVolumeLoadObject="cleanVolumeLoadObject"
        />
      </template>
      <template v-else-if="showMPR">
        <three-orthogonal-view
          :noduleList="nodeList"
          :seriesInstanceUid="seriesInstanceUid"
          :imageIds="imageIds"
          :seriesData="seriesData"
          :allChecked="allChecked"
          :voiRange="voiRange"
          :pcrContent="pcrContent"
          :toolListRef="toolListRef"
          :isVertical="isVertical"
          :institutionInfo="institutionInfo"
          :isEditable="isEditable"
          @handleAddNewNodule="handleAddNewNodule"
          @cleanVolumeLoadObject="cleanVolumeLoadObject"
          ref="MPRRef"
        ></three-orthogonal-view>
      </template>

      <SideBar
        v-if="imageIds.length > 0"
        :nodeList="nodeList"
        :pcrContent="pcrContent"
        :isVertical="isVertical"
        @nodeListClick="nodeListClick"
        @nodeListDel="nodeListDel"
        @nodeListChange="nodeListChange"
      />
      <StudyList
        ref="studyListRef"
        v-show="showStudyList"
        @studyListClick="studyListClick"
        :seriesList="seriesList"
        :noduleCountMark="noduleCountMark"
      />
    </div>
    <BottomToolBar
      :fourChecked="fourChecked"
      :allChecked="allChecked"
      :setFourCheckedState="setFourCheckedState"
      :setAllCheckedState="setAllCheckedState"
      @showAllAnnotations="showAllAnnotations"
    />

    <AIComputedModal
      :nodeList="nodeList"
      :seriesInstanceUid="seriesInstanceUid"
      @upadtePCRContent="upadtePCRContent"
      ref="AIModalRef"
    />
<!--      <template v-if="show3D">-->
        <three-dimensional-view
            :noduleList="nodeList"
            :seriesInstanceUid="seriesInstanceUid"
            :imageIds="imageIds"
            :seriesData="seriesData"
            :allChecked="allChecked"
            :voiRange="voiRange"
            :pcrContent="pcrContent"
            :toolListRef="toolListRef"
            :isVertical="isVertical"
            :institutionInfo="institutionInfo"
            :isEditable="isEditable"
            @handleAddNewNodule="handleAddNewNodule"
            @cleanVolumeLoadObject="cleanVolumeLoadObject"
            ref="threeDRef"
        ></three-dimensional-view>

<!--      </template>-->

    <LoadingModal ref="loadingModal" />
  </div>
</template>

<script setup>
import { nextTick, onMounted, ref, createVNode, onUnmounted } from "vue";
import Toolbar from "./Toolbar.vue";
import Viewer from "./Viewer.vue";
import SyncViewer from "./SyncViewer.vue";
import BottomToolBar from "./BottomToolBar.vue";
import SideBar from "./SideBar.vue";
import StudyList from "./StudyList.vue";
import { message } from "ant-design-vue";
import router from "@/router";
import { UserOutlined, ExclamationCircleOutlined } from "@ant-design/icons-vue";
import { Modal } from "ant-design-vue";

import {
  queryAllByStudyUid,
  getBySeriesUid,
  deleteNodule,
  getAllCtParam,
} from "@/api";
import { getAPIResponse } from "@/utils/apiTools/useAxiosApi";

import ThreeOrthogonalView from "@/components/ThreeOrthogonalView";
import ThreeDimensionalView from "@/components/3D";
import LoadingModal from "../../components/Loading/loadingModal.vue";

import AIComputedModal from "./AIComputedModal.vue";
import UserSetting from "./UserSetting.vue";

import { cache } from "@cornerstonejs/core";

import { pointStore } from "@/store/modules/pointStore";
import { mprButtonStore } from "@/store/modules/MRPButtons";

const AIModalRef = ref(null);
const threeDRef = ref(null);
const loadingModal = ref(null);

const viewerRef = ref(null);
const MPRRef = ref(null);
const syncViewerRef = ref(null);
const toolListRef = ref(null);
const studyListRef = ref(null);

const showViewer = ref(true);
const showSyncViewer = ref(false);
const syncWindowSize = ref(1);
const showStudyList = ref(false);
const showMPR = ref(false);
const show3D = ref(false);

const seriesInstanceUid = ref();

const nodeList = ref([]);

const pcrContent = ref([]);

const imageIds = ref([]);

const seriesData = ref({});

// 系统的窗宽窗位
const voiRange = ref([]);

const thePointStore = pointStore();
const mprButton = mprButtonStore();

// 底部工具栏
const fourChecked = ref(true);
const allChecked = ref(true);

// 是否可以进行结节勾画
const isEditable = ref(null);

// 右上角商家信息
const institutionInfo = ref({});

// 是否竖屏显示器
const isVertical = ref();

/**
 * 接口请求
 */
const seriesList = ref(null);
const noduleCountMark = ref("");

onMounted(async () => {
  const uid = router.currentRoute.value.params.uid;
  await queryAllByStudyUid({ studyUid: uid }).then((res) => {
    seriesList.value = getAPIResponse(res);
    if (seriesList.value.length === 0) {
      message.error(`数据缺失，暂无序列信息，请更换数据重新查看`);
      return false;
    }
    // 判断序列当中的结节数量
    if (seriesList.value.every((item) => item.noduleCount === 0)) {
      fetchSeriesData(seriesList.value[0].seriesInstanceUid);
      seriesInstanceUid.value = seriesList.value[0].seriesInstanceUid;
    } else {
      const item = seriesList.value.find((item) => item.noduleCount > 0);
      fetchSeriesData(item.seriesInstanceUid);
      seriesInstanceUid.value = item.seriesInstanceUid;
      noduleCountMark.value = item.seriesInstanceUid;
    }
  });

  // 获取系统的窗宽窗位
  getAllSysCtParams();
  onResize();
  window.addEventListener("resize", onResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", onResize);
});

// 更新序列列表上的结节信息
const updateSeriesList = () => {
  const uid = router.currentRoute.value.params.uid;
  queryAllByStudyUid({ studyUid: uid }).then((res) => {
    const data = getAPIResponse(res);
    const item = data.find((item) => item.noduleCount > 0);
    if (item && item.seriesInstanceUid) {
      noduleCountMark.value = item.seriesInstanceUid;
    } else {
      noduleCountMark.value = "";
    }
  });
};

const onResize = () => {
  if (window.screen.width / window.screen.height <= 1) {
    isVertical.value = true;
  } else {
    isVertical.value = false;
  }
};

// should clean VolumeLoadObject before volumeLoader createAndCacheVolume
const cleanVolumeLoadObject = async (volumeId) => {
  const volumeLoadObject = await cache.getVolumeLoadObject(volumeId);
  if (volumeLoadObject) {
    cache.removeVolumeLoadObject(volumeId);
    // cache._decacheVolume(volumeId);
    cache.purgeVolumeCache();
  }
};

const fetchSeriesData = (seriesInstanceUid) => {
  getBySeriesUid({ seriesUid: seriesInstanceUid }).then((res) => {
    const seriesInfo = getAPIResponse(res);

    // 保存勾画状态（01 可勾画，02 不可勾画）
    isEditable.value = seriesInfo.isEditable;

    // 保存商家信息
    institutionInfo.value = {
      institutionName: seriesInfo.institutionName,
      modality: seriesInfo.modality,
      manufacturer: seriesInfo.manufacturer,
      accessionNumber: seriesInfo.accessionNumber,
    };

    // 更新 PCR 相关信息
    upadtePCRContent(seriesInfo.fusionTaskVO);

    setSeriesData(seriesInfo);
    thePointStore.setDicomThickness(seriesInfo.sliceThickness);

    formatNoduleVOList(seriesInfo);
    formatImageIds(seriesInfo);

    nextTick(() => {
      viewerRef.value.run();
      // loadingSwitch(true);
    });
  });
};

// 获取系统的窗宽窗位
const getAllSysCtParams = () => {
  getAllCtParam(null).then((res) => {
    const result = getAPIResponse(res);
    voiRange.value = [];
    for (let i = 0; i < result.length; i++) {
      voiRange.value.push({
        id: result[i].id,
        isDefault: result[i].isDefault === "01" ? true : false,
        voiRange: {
          voiRange: {
            lower: -Number(result[i].width),
            upper: -Number(result[i].height),
          },
        },
        name: result[i].name,
      });
    }

    if (voiRange.value.every((item) => item.isDefault === false)) {
      voiRange.value.unshift({
        id: "default",
        isDefault: true,
        voiRange: {
          voiRange: {
            lower: -1500,
            upper: 600,
          },
        },
        name: "默认",
      });
    } else {
      voiRange.value.unshift({
        id: "default",
        isDefault: false,
        voiRange: voiRange.value.find((item) => item.isDefault === true)
          .voiRange,
        name: "默认",
      });
    }
  });
};

const loadingSwitch = (status) => {
  loadingModal.value.showLoadingModal(status);
};

const setSeriesData = (seriesInfo) => {
  seriesData.value = {
    seriesNumber: seriesInfo.seriesNumber,
    sliceThickness: seriesInfo.sliceThickness,
    seriesDescription: seriesInfo.seriesDescription,
    patientId: seriesInfo.patientId,
    seriesDateTime: seriesInfo.seriesDateTime?.split(".")[0].replace("T", " "),
    userName: seriesInfo.patientName,
    userSex: seriesInfo.patientSex,
    userAge: getUserAge(seriesInfo.patientBirthdate),
    userBirthday: seriesInfo.patientBirthdate,
  };
};

const getUserAge = (birth) => {
  if (birth) {
    const year = 1000 * 60 * 60 * 24 * 365;
    const now = new Date();
    const birthday = new Date(birth);
    return parseInt((now - birthday) / year);
  }
};

const formatNoduleVOList = (seriesInfo) => {
  const noduleVOList = seriesInfo.noduleVOList || [];
  nodeList.value.length = 0;
  for (let i = 0; i < noduleVOList.length; i++) {
    nodeList.value.push({
      id: noduleVOList[i].id,
      orderNum: noduleVOList[i].orderNum,
      centerFrame: noduleVOList[i].centerFrame,
      boxVO: noduleVOList[i].boxVO,
      width: noduleVOList[i].width,
      height: noduleVOList[i].height,
      location: noduleVOList[i].location,
      featuresType: noduleVOList[i].featuresType,
      size: noduleVOList[i].size,
      checked: false,
      hu: noduleVOList[i].hu,
      // aiResult: noduleVOList[i].aiResult,
    });
  }
};

const formatImageIds = (seriesInfo) => {
  const instanceList = seriesInfo.instanceVOList;
  imageIds.value.length = 0;
  let url;
  if (process.env.NODE_ENV === "development") {
    url = "http://192.168.1.65:8080";
  } else {
    url = location.origin;
  }
  instanceList.forEach((ele) => {
    imageIds.value.push("wadouri:" + url + "/dcm" + ele.dicomUrl);
  });
};

// 侧边栏点击
const handleScrollBarClick = (index) => {
  nodeList.value.map((v) => (v.checked = false));
  const checkItem = nodeList.value.find((v) => v.centerFrame === index);
  checkItem.checked = true;
  viewerRef.value.renderMarkNodule();
  viewerRef.value.jumpToSpecialPoint(checkItem.boxVO.point1);
};

// 工具栏点击事件
const toolBarClick = (id, active) => {
  if (showViewer.value) {
    if (id === 18 && isEditable.value === "02") {
      message.warning(
        `其他序列已经存在结节，请删除序列内的结节后，在切换至本序列进行结节勾画！`
      );
      toolListRef.value.resetToolListState();
      return false;
    } else {
      viewerRef.value.toolBarClick(id, active);
    }
  }

  if (showMPR.value) {
    MPRRef.value.toolBarClick(id, active);
  }

  if (showSyncViewer.value) {
    syncViewerRef.value.toolBarClick(id, active);
  }

  // 窗口联动
  if (id === 12 && showSyncViewer.value) {
    if (active) {
      syncViewerRef.value.addSynchronizer();
    } else {
      syncViewerRef.value.removeSynchronizer();
    }
  }

  // 序列列表
  if (id === 2 && active) {
    showStudyList.value = true;
  } else if (id === 2 && !active) {
    showStudyList.value = false;
  } else if (id === 14) {
    showStudyList.value = false;
  }

  // AI 计算
  if (id === 21) {
    if (nodeList.value.length === 0) {
      message.warning(`请在新增结节后再进行AI融合计算！`);
    } else {
      AIModalRef.value.showModal(JSON.parse(JSON.stringify(pcrContent.value)));
    }
  }

  // MPR
  if (id === 14) {
    if (active) {
      viewerRef.value && viewerRef.value.stopClip();
      syncViewerRef.value && syncViewerRef.value.stopClip();
      syncWindowSize.value = Number(0);
      showMPR.value = true;
      showViewer.value = false;
      showSyncViewer.value = false;

      fourChecked.value = true;
      allChecked.value = true;

      // 针对于 MPR 工具栏状态设置
      [2, 3, 5, 6, 7, 11, 12, 15, 16, 17, 18, 19, 20, 22].forEach((item) => {
        toolListRef.value.changeToolListDisabledStata(item, true);
      });
      // const btn = {id: 1,active: true, disabled: false}
      nextTick(() => {
        toolListRef.value.changeToolListActiveStata(3, false);
        mprButton.setButtonsStatus(1, true, false);
      });
    } else {
      showMPR.value = false;
      showViewer.value = true;
      showSyncViewer.value = false;
      syncWindowSize.value = Number(1);
      toolListRef.value.resetToolListState();
      fourChecked.value = true;
      allChecked.value = true;
      nextTick(() => {
        viewerRef.value.run("notClean");
      });
    }
  }

  // 3D查看
  if (id === 23) {
    // console.log(1111);
    show3D.value = true;
    nextTick(() => {
      threeDRef.value.showModal(viewerRef.value);
    })

  }
};

// 多窗口选择
const syncWindowClick = (val) => {
  showMPR.value = false;
  fourChecked.value = true;
  allChecked.value = true;
  showStudyList.value = false;
  switch (val) {
    case "13-1":
      syncViewerRef.value && syncViewerRef.value.stopClip();
      showMPR.value = false;
      showSyncViewer.value = false;
      showViewer.value = true;

      if (syncWindowSize.value === 1) {
        return false;
      }

      syncWindowSize.value = Number(1);

      toolListRef.value.resetToolListState();
      if (!viewerRef.value) {
        nextTick(() => {
          viewerRef.value.run("notClean");
        });
      }
      break;
    case "13-2":
      viewerRef.value && viewerRef.value.stopClip();
      syncViewerRef.value && syncViewerRef.value.stopClip();
      showViewer.value = false;
      showSyncViewer.value = true;
      showMPR.value = false;

      if (syncWindowSize.value === 2) {
        return false;
      }

      syncWindowSize.value = Number(2);

      setSyncWindowToolListState();
      syncViewerRef.value && syncViewerRef.value.removeSynchronizer();
      syncViewerRef.value && syncViewerRef.value.setDefaultVoiRange();
      syncViewerRef.value && syncViewerRef.value.setDefaultCurrentWindow();
      break;
    case "13-4":
      viewerRef.value && viewerRef.value.stopClip();
      syncViewerRef.value && syncViewerRef.value.stopClip();
      showViewer.value = false;
      showSyncViewer.value = true;
      showMPR.value = false;

      if (syncWindowSize.value === 4) {
        return false;
      }

      syncWindowSize.value = Number(4);

      setSyncWindowToolListState();
      syncViewerRef.value && syncViewerRef.value.removeSynchronizer();
      syncViewerRef.value && syncViewerRef.value.setDefaultVoiRange();
      syncViewerRef.value && syncViewerRef.value.setDefaultCurrentWindow();
      break;

    default:
      break;
  }
};

// 设置多窗口工具栏状态
const setSyncWindowToolListState = () => {
  syncViewerRef.value && syncViewerRef.value.setToolBarDefaultState();
  toolListRef.value.resetToolListState();
  toolListRef.value.changeToolListDisabledStata(12, false);
  [2, 16, 17, 18, 19, 20, 22].forEach((item) => {
    toolListRef.value.changeToolListDisabledStata(item, true);
  });
};

// 修改工具栏状态
const changeToolListActiveStata = (id, state) => {
  toolListRef.value.changeToolListActiveStata(id, state);
};

// 获取工具栏状态
const getToolListActiveStata = (id) => {
  return toolListRef.value.getToolListActiveStata(id);
};

// 修改 MIP 工具栏状态
const changeToolListMIPStata = (data) => {
  toolListRef.value.changeToolListMIPStata(data);
};

// MIP 改变
const handleChangeMIP = (data) => {
  if (syncWindowSize.value === 1 && !showMPR.value) {
    viewerRef.value.changeMIP(data);
  }

  if (
    !showMPR.value &&
    (syncWindowSize.value === 2 || syncWindowSize.value === 4)
  ) {
    syncViewerRef.value.changeMIP(data);
  }
};

// 序列列表点击
const studyListClick = (item) => {
  if (seriesInstanceUid.value === item.seriesInstanceUid) {
    return false;
  }

  getBySeriesUid({ seriesUid: item.seriesInstanceUid }).then((res) => {
    const seriesInfo = getAPIResponse(res);

    if (seriesInfo.id) {
      const instanceList = seriesInfo.instanceVOList;

      if (instanceList.length <= 1) {
        message.warning(
          `当前所选影像序列数量较少，无法进行渲染，请重新选择序列进行尝试！`
        );
        return false;
      }

      // 保存勾画状态
      isEditable.value = seriesInfo.isEditable;

      // 设置四角信息及保存 Uid
      setSeriesData(seriesInfo);
      seriesInstanceUid.value = item.seriesInstanceUid;

      // 确定可以切换以后再将当前序列选中
      studyListRef.value.setStudyListActive(item.id);

      // 切换序列重置工具栏当前状态
      // toolListRef.value.resetToolListState();

      // showStudyList.value = false;

      formatNoduleVOList(seriesInfo);
      formatImageIds(seriesInfo);

      // viewerRef.value && viewerRef.value.destroyRenderingEngine();

      nextTick(() => {
        const volumeId =
          "cornerstoneStreamingImageVolume:CT_VOLUME_ID" +
          mprButton.getVolumeIndex;
        cleanVolumeLoadObject(volumeId);

        mprButton.setVolumeIndex();
        viewerRef.value.run();
      });
    } else {
      message.warning(`请求序列列表失败，请重新尝试！`);
    }
  });
};

// 全局挂载更新 PCR 列表事件
window.showUpadtePCRContentConfirm = (callback) => {
  Modal.confirm({
    title: "结节变更警告",
    class: "pcr-modal",
    icon: createVNode(ExclamationCircleOutlined),
    content: "新增、修改、删除结节将作废患者现有融合计算结果，是否继续操作？ ",
    onOk() {
      callback && callback();
    },
    onCancel() {
      //
    },
  });
};

// MPR 使用
window.showUpadtePCRContentConfirm2 = (callback) => {
  Modal.confirm({
    title: "结节变更警告",
    class: "pcr-modal",
    icon: createVNode(ExclamationCircleOutlined),
    content: "新增、修改、删除结节将作废患者现有融合计算结果，是否继续操作？ ",
    onOk() {
      callback && callback();
    },
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onCancel() {
      callback && callback("cancel");
    },
  });
};

// 清空 PCR 列表（挂载到全局）
window.clearPCRContent = () => {
  pcrContent.value = {};
};

// 更新 PCR 列表
const upadtePCRContent = (result) => {
  if (!result) {
    return false;
  }
  const pcrVO = result.pcrVO;
  pcrContent.value = {};
  pcrContent.value = {
    sampleCode: pcrVO.sampleCode,
    a: pcrVO.a,
    r: pcrVO.r,
    s: pcrVO.s,
    actb: pcrVO.actb,
    actb2: pcrVO.actb2,
    ptger4: pcrVO.ptger4,
    apc: pcrVO.apc,
    pcdhgc5: pcrVO.pcdhgc5,
    // sampleMarks: result.resultValue,
    sampleResult: result.resultType,
  };
};

/**
 * 结节列表相关事件处理
 */
// 列表点击事件
const nodeListClick = (item) => {
  if (showSyncViewer.value) {
    return false;
  }
  nodeList.value.map((v) => (v.checked = false));
  nodeList.value.find(
    (v) => v.boxVO.annotationUID === item.boxVO.annotationUID
  ).checked = true;
  if (showMPR.value) {
    if (allChecked.value) {
      MPRRef.value.readAllCube(null, item.boxVO);
    }
  } else if (showViewer.value) {
    viewerRef.value.renderMarkNodule();
    viewerRef.value.jumpToSpecialPoint(item.boxVO.point1);
  }
};

// 新增结节以后重新刷新列表
const handleAddNewNodule = () => {
  getBySeriesUid({ seriesUid: seriesInstanceUid.value }).then((res) => {
    const seriesInfo = getAPIResponse(res);
    const noduleVOList = seriesInfo.noduleVOList;
    nodeList.value.length = 0;
    const latestNodule = noduleVOList.reduce((prev, curr) =>
      prev.createTime > curr.createTime ? prev : curr
    );
    let item = null;
    for (let i = 0; i < noduleVOList.length; i++) {
      item = {
        id: noduleVOList[i].id,
        orderNum: noduleVOList[i].orderNum,
        centerFrame: noduleVOList[i].centerFrame,
        boxVO: noduleVOList[i].boxVO,
        width: noduleVOList[i].width,
        height: noduleVOList[i].height,
        location: noduleVOList[i].location,
        featuresType: noduleVOList[i].featuresType,
        size: noduleVOList[i].size,
        checked: noduleVOList[i].id === latestNodule.id,
        hu: noduleVOList[i].hu,
        // aiResult: noduleVOList[i].aiResult,
      };
      nodeList.value.push(item);
    }

    nextTick(() => {
      viewerRef.value && viewerRef.value.renderMarkNodule();
    });

    // 检测序列列表当中的结节信息
    if (nodeList.value.length === 1) {
      updateSeriesList();
    }
  });
};

// 删除事件
const nodeListDel = (item) => {
  if (pcrContent.value.sampleCode) {
    window.showUpadtePCRContentConfirm(() => {
      pcrContent.value = {};
      handleDeleteNodule(item);
    });
  } else {
    handleDeleteNodule(item);
  }
};

const handleDeleteNodule = (item) => {
  deleteNodule({ id: item.id }).then((res) => {
    const result = getAPIResponse(res);
    if (result === "删除成功") {
      const itemIndex = nodeList.value.findIndex(
        (n) => n.boxVO.annotationUID === item.boxVO.annotationUID
      );
      nodeList.value.splice(itemIndex, 1);

      if (viewerRef.value) {
        viewerRef.value.renderMarkNodule();
      }
      if (showMPR.value) {
        MPRRef.value.noduleDelete(nodeList.value, item.boxVO);
      }
      message.success(`删除结节成功`);

      // 检测序列列表当中的结节信息
      if (nodeList.value.length === 0) {
        updateSeriesList();
      }
    }
  });
};

// 结节列表修改事件
const nodeListChange = (value, id, type) => {
  const item = nodeList.value.find((item) => item.boxVO.annotationUID === id);
  item[type] = value;
};

/**
 * 底部工具栏
 */
// 底部工具栏点击
const showAllAnnotations = (check) => {
  viewerRef.value && viewerRef.value.showAllAnnotations(check);
  MPRRef.value && MPRRef.value.showAllAnnotations(check);
};

const setFourCheckedState = (check) => {
  fourChecked.value = check;
};

const setAllCheckedState = (check) => {
  allChecked.value = check;
  if (allChecked.value) {
    nextTick(() => {
      viewerRef.value && viewerRef.value.renderMarkNodule();
    });
  }
};

const open3D = () => {
  console.log(1)
  if (!show3D.value) {
    viewerRef.value && viewerRef.value.stopClip();
    syncViewerRef.value && syncViewerRef.value.stopClip();
    syncWindowSize.value = Number(0);
    show3D.value = true;
    showMPR.value = false;
    showViewer.value = false;
    showSyncViewer.value = false;

    fourChecked.value = true;
    allChecked.value = true;

    // 针对于 MPR 工具栏状态设置
    [2, 3, 5, 6, 7, 11, 12, 15, 16, 17, 18, 19, 20, 22].forEach((item) => {
      toolListRef.value.changeToolListDisabledStata(item, true);
    });
    // const btn = {id: 1,active: true, disabled: false}
    nextTick(() => {
      toolListRef.value.changeToolListActiveStata(3, false);
      mprButton.setButtonsStatus(1, true, false);
    });
  } else {
    show3D.value = false;
    showMPR.value = true;
    showViewer.value = true;
    showSyncViewer.value = true;

    fourChecked.value = false;
    allChecked.value = false;
  }


}
</script>

<style scoped lang="scss">
.viewport-box {
  width: 100%;
  height: 100%;
  background: rgb(45, 46, 54);
  color: #fff;
  overflow: hidden;
  // min-height: 900px;

  .header-box {
    width: 100%;
    height: 40px;
    padding: 0 15px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;

    .user {
      display: flex;
      align-items: center;

      .user-info {
        display: flex;
        flex-direction: column;
        margin-left: 5px;
        font-size: 16px;
        justify-content: space-between;

        span:first-child {
          margin-bottom: 3px;
        }
      }
    }

    .user-title {
      font-size: 16px;
      padding: 8px 25px;
      border-bottom: 1px solid #ffffff;
    }
  }

  .title-box {
    width: 100%;
    height: 25px;
    line-height: 25px;
    text-align: center;
    background: rgb(79, 83, 85);
    border-top: 1px solid #000;
    border-bottom: 1px solid #000;
    font-size: 14px;
  }

  .viewer-wrap {
    width: 100%;
    min-width: 840px;
    height: calc(100% - 140px);
    display: flex;
    flex-direction: row;
    position: relative;
  }
}
</style>

<style lang="scss">
.isVertical {
  .viewer-wrap {
    flex-direction: column !important;
    height: calc(100% - 625px) !important;
  }

  .side-bar-box {
    margin-top: 27px;
    flex-direction: row;
    width: 100%;
    height: 100%;
    justify-content: space-evenly;
    background: rgb(29, 31, 33);

    .node-list {
      flex: 1 !important;
      width: 33.33% !important;
      margin-right: 2px;
      min-height: 482px;
      background: rgb(36, 38, 40);

      .content {
        height: 100%;

        .table-content {
          height: 100%;
        }
      }
    }

    .pcr-list {
      flex: 1 !important;
      margin-right: 2px;
      max-height: 100% !important;
      background: rgb(36, 38, 40);

      .content {
        height: 100%;
      }
    }

    .result-list {
      flex: 1 !important;
      max-height: 100% !important;
      background: rgb(36, 38, 40);
    }
  }

  .viewport-toolbar {
    width: 100%;
  }

  // 多窗口
  .viewer-box-wrap {
    .viewer-box {
      flex-direction: column;
    }

    .top-box,
    .bottom-box {
      flex-direction: row;
    }
  }
}
</style>
