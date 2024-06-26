<template>
  <div class="area-box">
    <breadcrumb :title="'系统日志管理'" />
    <div class="area">
      <div class="tableArea">
        <div class="functionArea">
          <div class="searchArea">
            <div class="searchBox">
              <label>日志类型：</label>
              <a-select
                style="width: 340px"
                v-model:value="searchForm.logType"
                :options="logTypeOptions"
                :field-names="logFieldNames"
                @change="changeClear(searchForm.logType)"
                placeholder="请选择日志类型"
                allow-clear
              ></a-select>
            </div>
            <div class="searchBox">
              <label>日志日期：</label>
              <a-range-picker
                style="width: 340px"
                v-model:value="searchForm.logTime"
                @change="(e) => dateSelector(e)"
              />
            </div>
            <div class="searchBox">
              <label>日志描述：</label>
              <a-input
                style="width: 340px"
                ref="searchInput"
                v-model:value="searchForm.logContent"
                @change="changeClear(searchForm.logContent)"
                placeholder="请输入日志描述内容"
                allow-clear
              />
            </div>
            <div class="btnArea">
              <a-button block type="info" class="submitBtn" @click="search">
                查询
              </a-button>
              <a-button block type="info" class="submitBtn" @click="exportLog">
                导出
              </a-button>
            </div>
          </div>
        </div>
        <div class="tableBox">
          <a-table
            :data-source="logList"
            :columns="columns"
            :row-key="(record) => record.id"
            :pagination="pagination"
            bordered
          >
            <template #bodyCell="{ column, record, index }">
              <template v-if="column.key === 'deptId'">
                {{ record.deptName }}
              </template>
              <template v-if="column.key === 'orderNum'">
                {{ index + 1 }}
              </template>
            </template>
          </a-table>
        </div>
      </div>
      <ConfirmModal ref="confirmModal" @initList="initList"></ConfirmModal>
    </div>
  </div>
</template>

<script setup>
import { createFromIconfontCN } from "@ant-design/icons-vue";
import IconFontUrl from "../../../assets/iconFont";
import { defineExpose, ref, onMounted, reactive } from "vue";
import { getAPIResponse } from "@/utils/apiTools/useAxiosApi";
import { logSearch, getSelectionsByType } from "@/api";
import ConfirmModal from "../confirmModal";
import { export_json_to_excel } from "@/utils/tools/excelHandler";
import breadcrumb from "../breadcrumb.vue";

const IconFont = createFromIconfontCN({
  scriptUrl: IconFontUrl,
});
let logList = ref([]);
let logTypeOptions = ref([]);
const columns = [
  {
    title: "序号",
    dataIndex: "orderNum",
    key: "orderNum",
    align: "center",
    // width: 300
  },
  {
    title: "日志类型",
    dataIndex: "logTypeCn",
    key: "logTypeCn",
    align: "center",
  },
  {
    title: "日志描述",
    dataIndex: "logContent",
    key: "logContent",
    align: "center",
  },
  {
    title: "操作用户",
    dataIndex: "userName",
    key: "userName",
    align: "center",
  },
  {
    title: "内容",
    dataIndex: "requestParam",
    key: "requestParam",
    align: "center",
  },
  {
    title: "日志时间",
    dataIndex: "logTime",
    key: "logTime",
    align: "center",
  },
  {
    title: "操作耗时（秒）",
    dataIndex: "costSecondTime",
    key: "costSecondTime",
    align: "center",
  },
];
const initialState = {
  logTimeBegin: "",
  logTimeEnd: "",
  logTime: "",
  logContent: "",
  logType: undefined
};
let userModal = ref(null);
let confirmModal = ref(null);
let importModal = ref(null);
const searchForm = reactive({ ...initialState });

const logFieldNames = {
  label: "dictLabel",
  value: "dictValue",
};
onMounted(() => {
  initList();
  getLogType();
});

const getLogType = async () => {
  const res = await getSelectionsByType();
  logTypeOptions.value = getAPIResponse(res)["sys_log_type"];
};

const initList = (status, page) => {
  if (page) {
    pagination.current = 1;
  }
  const searchInfo = {
    logTimeBegin: "",
    logTimeEnd: "",
    logTime: "",
    logContent: "",
    logType: "",
    page: pagination.current,
    size: pagination.size,
  };
  let newForm = searchInfo;
  if (status === "search") {
    newForm = Object.assign(searchInfo, searchForm);
  }

  logSearch(newForm).then((res) => {
    const result = getAPIResponse(res);
    if (result) {
      console.log(result);
      logList.value = result.list;
      pagination.total = result.total;
    }
  });
};

const search = () => {
  initList("search", 1);
};

const dateSelector = (event) => {
  if (event) {
    const fromDate = new Date(event[0]);
    const toDate = new Date(event[1]);
    searchForm["logTimeBegin"] = fromDate.toLocaleDateString();
    searchForm["logTimeEnd"] = toDate.toLocaleDateString();
    console.log(searchForm);
  } else {
    searchForm["logTimeBegin"] = null;
    searchForm["logTimeEnd"] = null;
    initList();
  }
};
const changeClear = (value) => {
  console.log(value);
  if (!value || value === "") {
    initList();
  }
};

const handleChangePage = (page, size) => {
  pagination.current = page;
  pagination.size = size.toString();
  initList("search");
};

const exportLog = () => {
  console.log(logList.value);
  const exportData = JSON.parse(JSON.stringify(logList.value));
  exportData.forEach((ele) => {
    delete ele.costTime;
    delete ele.ip;
    delete ele.logType;
  });
  const key = [
    "logTypeCn",
    "logContent",
    "userName",
    "requestParam",
    "logTime",
    "costSecondTime",
  ];
  const title = {
    logTypeCn: "日志类型",
    logContent: "日志描述",
    userName: "操作用户",
    requestParam: "内容",
    logTime: "日志时间",
    costSecondTime: "操作耗时（秒）",
  };
  export_json_to_excel({
    data: exportData,
    key: key,
    title: title,
    filename: "操作日志",
    autoWidth: true,
  });
};

const pagination = reactive({
  current: 1,
  size: "10",
  showSizeChanger: true,
  onChange: handleChangePage,
});

defineExpose({});
</script>

<style scoped>
@import "@/assets/main.css";
</style>
<style scoped lang="scss">
.area-box {
  background: rgb(29, 31, 33);
}
.area {
  padding: 24px;
  margin: 24px;
  height: calc(100% - 120px);

  .tableArea {
    width: 100%;
    background: rgb(44, 46, 48);

    .functionArea {
      display: flex;
      margin-bottom: 14px;
      .searchArea {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;

        .searchBox {
          display: flex;
          align-self: center;
          padding: 8px 0;
          margin-right: 24px;

          label {
            align-self: center;
            color: white;
            width: 88px;
            font-size: 14px;
          }
          .ant-select {
            min-width: 120px;
            // border: 1px solid #64686d !important;
            background-color: #242c2c !important;
            border-radius: 2px;
          }
          .ant-picker {
            background-color: #242c2c;
            border: 1px solid #64686d;
            color: white;
            input {
              color: white;
            }
            .ant-picker-separator {
              color: white;
            }
            .ant-picker-suffix {
              color: white;
            }
          }
          .ant-input-affix-wrapper {
            display: flex !important;
            height: 32px;
            border: 1px solid #64686d !important;
            background-color: #242c2c !important;
            .ant-input-suffix {
              .anticon.ant-input-clear-icon-has-suffix {
                color: white !important;
              }
            }
          }
          .ant-cascader {
            width: 100%;
            .ant-select-selector {
              border: 1px solid #64686d !important;
            }
          }
        }
      }
      .btnArea {
        display: flex;
        align-items: center;
        .generalBtn {
          align-self: center;
        }
      }
    }
    .tableBox {
      width: 100%;
      :deep(.ant-table) {
        .ant-table-row {
          border: 1px solid #f0f0f0;
        }
        .ant-table-row-selected {
          border: 1px solid #f0f0f0;
          td {
            border-color: #f0f0f0;
          }
        }

        .ant-table-content > table > tbody > tr > td {
          max-width: 400px;
        }

        .ant-table-cell {
          color: white;
          background-color: #444648;
          .icon {
            &:hover {
              color: #b1e5f8;
              cursor: pointer;
            }
            &:first-child {
              margin-right: 10px;
            }
            .anticon {
              font-size: 20px;
            }
          }
        }
      }
    }
  }
}

:deep(.ant-pagination-item-ellipsis) {
  color: #fff !important;
}

.submitBtn {
  width: 100px;
  height: 32px;
  line-height: 32px;
  background-color: #4e5255;
  border-color: #7d858a;
  border-radius: 4.5px;
  letter-spacing: 3px;
  color: #fff;
  padding: 0;
  margin: 0;
  &:first-child {
    margin-right: 10px;
  }
}

:deep(.ant-pagination) {
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
</style>
<style lang="scss">
.ant-table-content {
  &::-webkit-scrollbar {
    width: 100%;
    height: 8px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 10px;
    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    background: #aaaaaa;
  }

  &::-webkit-scrollbar-track {
    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    background: #fff;
  }
}
</style>