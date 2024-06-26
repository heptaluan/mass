<template>
  <div class="container">
    <div class="header">
      <div class="title">{{ currentTime }}</div>
      <div class="title main">患者检查列表</div>
      <div class="system user-setting" v-if="user">
        <UserSetting />
      </div>
    </div>
    <div class="fileBox">
      <a-button block type="info" class="generalBtn" @click="refreshForm">
        <span class="icon"><icon-font type="icon-refresh" /></span>
        刷新
      </a-button>
      <a-button block type="info" class="generalBtn" @click="importModalShow">
        <span class="icon"><icon-font type="icon-fenxiang" /></span>
        系统获取
      </a-button>
      <a-button block type="info" class="generalBtn" @click="uploadModalShow">
        <span class="icon"><icon-font type="icon-xiazai" /></span>
        文件导入
      </a-button>
    </div>
    <div class="studyBox">
      <a-table
        :data-source="patientList"
        :columns="columns"
        :pagination="pagination"
        :customRow="customClick"
      >
        <template #headerCell="{ column }">
          <span>{{ column.title }}</span>
          <template v-if="!specialSearch.includes(column.key)">
            <div class="searchBox">
              <template v-if="column.key !== 'patientAge'">
                <a-input
                  ref="searchInput"
                  v-model:value="searchForm[column.key]"
                  allow-clear
                  style="display: block"
                  @change="(e) => cleanInput(e, column.key)"
                  @pressEnter="handleSearch(searchForm[column.key])"
                />
              </template>
              <template v-else>
                <a-input-number
                  :min="0"
                  :max="150"
                  v-model:value="searchForm[column.key]"
                  :controls="false"
                  @change="(e) => cleanInput(e, column.key)"
                  @pressEnter="handleSearch(searchForm[column.key])"
                >
                </a-input-number>
              </template>
            </div>
          </template>
          <template v-else-if="column.key !== 'studyDateTime'">
            <div class="searchBox" style="padding: 8px">
              <a-select
                v-model:value="searchForm[column.key]"
                style="min: 90px"
                :options="optionSwitch(column.key)"
                @change="handleSearch(searchForm[column.key])"
              ></a-select>
            </div>
          </template>
          <template v-else>
            <div class="searchBox" style="padding: 8px; min-width: 200px">
              <a-range-picker
                v-model:value="searchForm[column.key]"
                @change="(e) => dateSelector(e)"
              />
            </div>
          </template>
        </template>

        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'patientSex'">
            {{ record.patientSexCN }}
          </template>
          <template v-if="column.key === 'imageStatus'">
            {{ record.imageStatusCN }}
          </template>
          <template v-if="column.key === 'calculateStatus'">
            {{ record.calculateStatusCN }}
          </template>
          <template v-if="column.key === 'operateStatus'">
            {{ record.operateStatusCN }}
          </template>
        </template>
      </a-table>
    </div>
    <UploadModal ref="uploadModal" @initList="initList" />
    <ImportModal ref="importModal" @initList="initList" />
    <RefreshModal ref="refreshModal" @initList="initList" />
  </div>
</template>

<script setup>
import router from "@/router";
import { createFromIconfontCN } from "@ant-design/icons-vue";
import IconFontUrl from "../../assets/iconFont";
import {
  nextTick,
  onBeforeMount,
  onMounted,
  onUnmounted,
  reactive,
  ref,
} from "vue";
import { useUserStore } from "@/store/modules/user";
import { getSelectionsByType, patientCheckList } from "@/api";
import { getAPIResponse } from "@/utils/apiTools/useAxiosApi";
import UploadModal from "./uploadModal";
import RefreshModal from "./refreshModal";
import UserSetting from "../Viewports/UserSetting.vue";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/zh-cn";
import locale from "ant-design-vue/es/date-picker/locale/zh_CN";
import { message } from "ant-design-vue";
import ImportModal from "@/views/StudyList/importModal";
dayjs.locale("zh-cn");

const initialState = {
  patientName: "",
  patientSex: null,
  patientAge: null,
  patientId: "",
  accessionNumber: "",
  beginTime: "",
  endTime: "",
  studyDescription: "",
  imageStatus: null,
  calculateStatus: null,
  operateStatus: null,
};

let searchForm = reactive({ ...initialState });
const userStore = useUserStore();
let currentTime = ref(new Date().toLocaleString());
let patientList = ref([]);
let timeCounter = ref(null);
let user = ref(null);
let uploadModal = ref(null);
let importModal = ref(null);
let refreshModal = ref(null);
let defaultSize = ref(20);

const specialSearch = [
  "patientSex",
  "studyDateTime",
  "imageStatus",
  "calculateStatus",
  "operateStatus",
];
const IconFont = createFromIconfontCN({
  scriptUrl: IconFontUrl,
});
const options = reactive({
  patientSex: [],
  imageStatus: [],
  calculateStatus: [],
  operateStatus: [],
});

const customClick = (record) => {
  return {
    onClick: () => {
      // window.console.log('click record:', record);
    },
    onDblclick: () => {
      // window.console.log('doubleclick record:', record);
      if (record.imageStatus === "03") {
        refreshModal.value.openModal(true, record);
      } else if (record.imageStatus === "02") {
        refreshModal.value.openModal(true, record);
      } else {
        localStorage.setItem("currentPage", pagination.current);
        localStorage.setItem("pageSize", pagination.pageSize);
        localStorage.setItem("searchInfo", JSON.stringify(searchForm));
        router.push({
          name: "viewports",
          params: {
            uid: record.studyInstanceUid,
          },
        });
      }
    },
  };
};

const handleChangePage = (page, size) => {
  console.log(page, size);
  pagination.pageSize = size;
  pagination.current = page;
  initList();
};

let pagination = reactive({
  current: 1,
  showSizeChanger: true,
  showQuickJumper: true,
  onChange: handleChangePage,
});

const optionSwitch = (key) => {
  return options[key];
};

const columns = [
  {
    title: "姓名",
    dataIndex: "patientName",
    key: "patientName",
    align: "center",
    width: 300,
  },
  {
    title: "性别",
    dataIndex: "patientSex",
    key: "patientSex",
    align: "center",
  },
  {
    title: "年龄",
    dataIndex: "patientAge",
    key: "patientAge",
    align: "center",
    width: 160,
  },
  {
    title: "患者编号",
    dataIndex: "patientId",
    key: "patientId",
    align: "center",
  },
  {
    title: "检查编号",
    dataIndex: "accessionNumber",
    key: "accessionNumber",
    align: "center",
  },
  {
    title: "检查日期",
    dataIndex: "studyDateTime",
    key: "studyDateTime",
    align: "center",
  },
  {
    title: "检查描述",
    dataIndex: "studyDescription",
    key: "studyDescription",
    align: "center",
  },
  {
    title: "影像状态",
    dataIndex: "imageStatus",
    key: "imageStatus",
    align: "center",
  },
  {
    title: "计算状态",
    dataIndex: "calculateStatus",
    key: "calculateStatus",
    align: "center",
  },
  {
    title: "操作状态",
    dataIndex: "operateStatus",
    key: "operateStatus",
    align: "center",
  },
];

onBeforeMount(() => {
  if (
    router.currentRoute.value.query &&
    router.currentRoute.value.query["status"] === "refresh"
  ) {
    location.replace("studyList");
  }

  getSelectionsByType().then((res) => {
    const result = getAPIResponse(res);
    options.imageStatus = optionsFormat(result.sys_image_status);
    options.calculateStatus = optionsFormat(result.sys_calculate_status);
    options.operateStatus = optionsFormat(result.sys_operate_status);
    options.patientSex = optionsFormat(result.sys_user_sex);
  });
});

const optionsFormat = (data) => {
  const arr = [];
  data.forEach((ele) => {
    arr.push({ value: ele.dictValue, label: ele.dictLabel });
  });
  arr.push({ value: null, label: "全部" });
  return arr;
};

onMounted(() => {
  if (localStorage.getItem("currentPage")) {
    pagination.current = Number(localStorage.getItem("currentPage"));
    pagination.pageSize = Number(localStorage.getItem("pageSize"));
    if (localStorage.getItem("searchInfo")) {
      searchForm = reactive({
        ...JSON.parse(localStorage.getItem("searchInfo")),
      });
      // Object.assign({}, JSON.parse(localStorage.getItem('searchInfo')))
      if (searchForm.studyDateTime) {
        searchForm.studyDateTime = [
          dayjs(searchForm.studyDateTime[0], "YYYY-MM-DD"),
          dayjs(searchForm.studyDateTime[1], "YYYY-MM-DD"),
        ];
      }
    }
    handleChangePage(pagination.current, pagination.pageSize);
  } else {
    handleChangePage(1, defaultSize.value);
  }

  timeHandler();
});

onUnmounted(() => {
  clearInterval(timeCounter.value);
});

const timeHandler = () => {
  user.value = userStore.getUserInfo;
  // console.log(user.value)
  timeCounter.value = setInterval(() => {
    currentTime.value = new Date().toLocaleString();
  }, 1000);
};

const initList = (pageIndex) => {
  if (pageIndex) {
    pagination.current = pageIndex;
  }
  const searchInfo = {
    accessionNumber: "",
    calculateStatus: "",
    list: [],
    operateStatus: "",
    page: pagination.current,
    patientAge: "",
    patientId: "",
    patientName: "",
    patientSex: "",
    size: pagination.pageSize ? pagination.pageSize : defaultSize.value,
    beginTime: "",
    endTime: "",
    studyDescription: "",
  };
  let newForm = searchInfo;

  if (searchForm) {
    newForm = Object.assign(searchInfo, searchForm);
  }
  patientCheckList(newForm).then((res) => {
    const result = getAPIResponse(res);
    nextTick(() => {
      patientList.value = result.list;
      pagination.total = result.total;

      if (localStorage.getItem("currentPage")) {
        localStorage.removeItem("currentPage");
        localStorage.removeItem("pageSize");
        localStorage.removeItem("searchInfo");
      }
    });
  });
};

const handleSearch = (value) => {
  console.log(value, searchForm);
  initList(1);
};
const cleanInput = (event, key) => {
  if (
    !event ||
    (!event.data && event.type === "click" && event.target.value === "")
  ) {
    console.log(searchForm[key]);
    initList();
  }
};

const formReset = () => {
  console.log(2);
  Object.assign(searchForm, initialState);
  searchForm["studyDateTime"] = null;
};

const dateSelector = (event) => {
  if (event) {
    const fromDate = new Date(event[0]);
    const toDate = new Date(event[1]);
    searchForm["beginTime"] = fromDate.toLocaleDateString();
    searchForm["endTime"] = toDate.toLocaleDateString();
    console.log(searchForm);
    initList(1);
  } else {
    searchForm["beginTime"] = null;
    searchForm["endTime"] = null;
    initList();
  }
};

const refreshForm = () => {
  formReset();
  initList();
};

const uploadModalShow = () => {
  uploadModal.value.openModal();
};

const importModalShow = () => {
  importModal.value.openModal();
};
</script>

<style scoped>
@import "@/assets/main.css";
</style>
<style lang="scss" scoped>
.highlight {
  background-color: rgb(255, 192, 105);
  padding: 0px;
}
.container {
  height: 100vh;
  background: rgb(45, 46, 54);
  .header {
    display: flex;
    justify-content: space-between;
    padding: 10px;
    color: white;
    .title {
      &.main {
        padding-top: 12px;
      }
    }
    .system {
      &:hover {
        color: #1890ff;
        cursor: pointer;
      }
      .anticon {
        margin-left: 16px;
      }
    }
  }
  .fileBox {
    display: flex;
    justify-content: left;
    padding: 20px 10px 10px;
  }
}
.studyBox {
  .searchBox {
    padding: 8px;
    .ant-input-affix-wrapper {
      display: flex !important;
      justify-content: space-between;
      background-color: #242c2c;
      border: 1px solid #64686d;
      color: white;
      :deep(.ant-input, .ant-select-selector) {
        background-color: #242c2c;
        color: white;
      }

      :deep(.ant-input-suffix) {
        .anticon-close-circle {
          color: white;
        }
      }
      &:before {
        content: none;
      }
    }
    :deep(.ant-select-selector) {
      border: 1px solid #64686d !important;
    }
    .ant-input-number {
      background-color: #242c2c;
      color: white;
      width: 100% !important;
      :deep(.ant-input-number-input-wrap) {
        .ant-input-number-input {
          border: 1px solid #64686d !important;
          padding: 4px 11px !important;
          height: 31px;
          border-radius: 2px !important;
        }
      }
      &:hover {
        :deep(.ant-input-number-input-wrap) {
          .ant-input-number-input {
            border-color: #40a9ff !important;
            border-right-width: 1px !important;
          }
        }
      }
    }
    :deep(.ant-select-selector) {
      background-color: #242c2c;
      color: white;
    }
    :deep(.ant-select-arrow) {
      background-color: #242c2c;
      color: white;
    }
    :deep(.ant-picker) {
      background-color: #242c2c;
      color: white;
      border: 1px solid #64686d;
      input {
        color: white;
      }
      .ant-picker-suffix,
      .ant-picker-separator {
        color: white;
      }
    }
  }
  :deep(.ant-table) {
    //height: 84vh !important;
    background-color: #2c2e30;
    color: white;
    padding: 0 10px;
    table {
      border-collapse: collapse;
    }
    .ant-table-thead > tr > th {
      color: white;
      background-color: #1d1f21;
      border: none;
      &:not(.ant-table-selection-column) {
        padding: 16px 0;
      }
      .ant-checkbox {
        top: 36px;
      }
    }
    .ant-table-tbody > tr.ant-table-placeholder:hover > td {
      background: #515e5e;
      color: white;
    }
    .ant-table-tbody > tr.ant-table-row-selected {
      border: 1px solid white;
      td {
        background-color: #3d4646;
      }
    }
    .ant-table-tbody {
      .ant-table-placeholder {
        .ant-empty {
          .ant-empty-description {
            color: white;
          }
        }
      }
    }
    .ant-table-row {
      td {
        border-bottom: 1px solid #484848;
      }
      .ant-table-cell-row-hover {
        background-color: #515e5e;
      }
      &:hover {
        td {
          background-color: #515e5e;
        }
      }
    }
    .ant-table-cell.ant-table-selection-column {
      padding-left: 24px;
    }

    .ant-table-content > table > tbody > tr > td {
          max-width: 100px;
        }
  }
  :deep(.ant-pagination) {
    background-color: #2d2e37;
    margin: 0;
    padding: 16px 0;
    .ant-pagination-item-link {
      background-color: #2c2e30;
      color: white;
    }
    .ant-pagination-item {
      background-color: #2c2e30;
      color: white;
      a {
        color: white;
      }
    }
    .ant-pagination-options {
      .ant-select-selector {
        background-color: #2c2e30;
        color: white;
      }
      .ant-select-arrow {
        background-color: #242c2c;
        color: white;
      }
      .ant-pagination-options-quick-jumper {
        color: white;
        input {
          background-color: #485454;
          color: white;
        }
      }
    }
  }
}
.ii {
  color: white;
}
</style>
