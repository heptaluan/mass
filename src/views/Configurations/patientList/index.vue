<template>
  <div>
    <breadcrumb :title="'患者检测列表'" />
    <div class="area">
      <div class="tableArea">
        <div class="functionArea">
          <div class="searchArea">
            <div class="searchBox">
              <label>姓名：</label>
              <a-input
                style="width: 150px"
                ref="searchInput"
                v-model:value="searchForm.name"
                @change="changeClear(searchForm.name)"
                placeholder="请输入姓名"
              />
            </div>

            <div class="searchBox">
              <label>样本编号：</label>
              <a-input
                style="width: 150px"
                ref="searchInput"
                v-model:value="searchForm.sampleCode"
                @change="changeClear(searchForm.sampleCode)"
                placeholder="请输入样本编号"
              />
            </div>

            <div class="searchBox">
              <label>检测日期：</label>
              <a-date-picker
                :locale="locale"
                v-model:value="searchForm.checkDate"
                style="width: 150px"
                placeholder="请选择检测日期"
              />
            </div>

            <div class="searchBox">
              <label>年龄：</label>
              <a-input-number
                style="width: 150px"
                ref="searchInput"
                v-model:value="searchForm.age"
                @change="changeClear(searchForm.age)"
                placeholder="请输入年龄"
              />
            </div>

            <div class="searchBox">
              <label>性别：</label>
              <a-select
                style="width: 150px"
                v-model:value="searchForm.sex"
                placeholder="请选择性别"
              >
                <a-select-option value="0">男</a-select-option>
                <a-select-option value="1">女</a-select-option>
              </a-select>
            </div>

            <div class="searchBox">
              <label>样本状态：</label>
              <a-select
                style="width: 150px"
                v-model:value="searchForm.sampleStatus"
                placeholder="请选择样本状态"
              >
                <template v-for="item in itemType" :key="item.id">
                  <a-select-option :value="item.value">{{
                    item.name
                  }}</a-select-option>
                </template>
              </a-select>
            </div>
          </div>
          <div class="btnArea">
            <a-button
              block
              type="info"
              class="generalBtn"
              @click="handleSearch"
            >
              查询
            </a-button>
            <a-button
              block
              type="info"
              class="generalBtn"
              @click="handleInitSearch"
            >
              重置
            </a-button>
          </div>
        </div>

        <a-button
          style="margin-bottom: 25px"
          block
          type="info"
          class="generalBtn"
          @click="(e) => addUser(null)"
        >
          新增
        </a-button>

        <div class="tableBox">
          <a-table
            :data-source="patientList"
            :columns="columns"
            :row-key="(record) => record.id"
            :pagination="pagination"
            bordered
          >
            <template #bodyCell="{ column, record, index }">
              <template v-if="column.key === 'checkDate'">
                {{ record.checkDate.substring(0, 10) }}
              </template>
              <template v-if="column.key === 'orderNum'">
                {{ index + 1 }}
              </template>
              <template v-if="column.key === 'operation'">
                <span class="icon" @click="jumpTo('detail', record)"
                  >查看检测信息</span
                >
                <span class="icon" @click="jumpTo('report', record)"
                  >查看报告</span
                >
                <a-popconfirm
                  title="是否确认删除患者？"
                  ok-text="确定"
                  cancel-text="取消"
                  @confirm="handleDelete"
                >
                  <span class="icon">删除</span>
                </a-popconfirm>
              </template>
              <template v-if="column.key === 'sampleStatus'">
                <span>{{ itemList[record.sampleStatus] }}</span>
              </template>
            </template>
          </a-table>
        </div>
      </div>
      <UserModal
        ref="userModal"
        :departmentList="departmentList"
        @initList="initList"
      />
      <!-- <ConfirmModal ref="confirmModal" @initList="initList"></ConfirmModal>
      <ImportModal ref="importModal" @initList="initList"></ImportModal> -->
    </div>
  </div>
</template>

<script setup>
import router from "@/router";
import locale from "ant-design-vue/es/date-picker/locale/zh_CN";
import { message } from "ant-design-vue";
import { createFromIconfontCN } from "@ant-design/icons-vue";
import IconFontUrl from "../../../assets/iconFont";
import {
  defineExpose,
  ref,
  h,
  defineEmits,
  onMounted,
  reactive,
  nextTick,
} from "vue";
import { getAPIResponse } from "@/utils/apiTools/useAxiosApi";
import UserModal from "./userModal";
import ConfirmModal from "../confirmModal";
import breadcrumb from "../breadcrumb.vue";

import { getPatientList, getItemMap } from "@/api";

const IconFont = createFromIconfontCN({
  scriptUrl: IconFontUrl,
});

let patientList = ref([]);

const columns = [
  {
    title: "序号",
    dataIndex: "createBy",
    key: "createBy",
    align: "center",
  },
  {
    title: "姓名",
    dataIndex: "name",
    key: "name",
    align: "center",
  },
  {
    title: "性别",
    dataIndex: "sex",
    key: "sex",
    align: "center",
  },
  {
    title: "年龄",
    dataIndex: "age",
    key: "age",
    align: "center",
  },
  {
    title: "样本编号",
    dataIndex: "sampleCode",
    key: "sampleCode",
    align: "center",
  },
  {
    title: "检测日期",
    dataIndex: "checkDate",
    key: "checkDate",
    align: "center",
  },
  {
    title: "样本状态",
    dataIndex: "sampleStatus",
    key: "sampleStatus",
    align: "center",
  },
  {
    title: "备注",
    dataIndex: "remark",
    key: "remark",
    align: "center",
  },
  {
    title: "操作",
    dataIndex: "operation",
    key: "operation",
    align: "center",
  },
];

const initialState = {
  name: "",
  sampleCode: undefined,
  checkDate: undefined,
  age: undefined,
  sex: undefined,
  sampleStatus: undefined,
};

let userModal = ref(null);
let confirmModal = ref(null);
let importModal = ref(null);
const searchForm = reactive({ ...initialState });
const departmentList = ref([]);
const fieldNames = {
  label: "deptName",
  value: "id",
};

onMounted(() => {
  initList();
  initItemList();
});

// 删除事件
const handleDelete = () => {
  console.log(1111111111111);
};

// 初始化样本状态
const itemList = ref([]);
const itemType = ref([]);

const initItemList = (status, page) => {
  getItemMap({ type: "ms_quality_status" }).then((res) => {
    const result = getAPIResponse(res);
    itemList.value = result;
    if (result) {
      for (const item in result) {
        itemType.value.push({
          id: item,
          name: result[item],
          value: item,
        });
      }
    }
  });
};

const initList = (status, page) => {
  if (page) {
    pagination.current = 1;
  }
  const searchInfo = {
    page: pagination.current,
    size: pagination.size,
  };
  let newForm = searchInfo;
  if (status === "search") {
    newForm = Object.assign(searchInfo, searchForm);
  }

  if (status === "init") {
    newForm = {
      page: 1,
      size: 10,
    };
    searchForm.name = "";
    searchForm.sampleCode = undefined;
    searchForm.checkDate = undefined;
    searchForm.age = undefined;
    searchForm.sex = undefined;
    searchForm.sampleStatus = undefined;
  }

  getPatientList(newForm).then((res) => {
    const result = getAPIResponse(res);
    if (result) {
      patientList.value = result.list;
      pagination.total = result.total;
    }
  });
};

const handleSearch = () => {
  initList("search", 1);
};

const handleInitSearch = () => {
  initList("init");
};

const addUser = (id) => {
  userModal.value.openModal(true, id);
};

// 跳转
const jumpTo = (target, record) => {
  if (target === "detail") {
    router.push({
      name: "patientDetail",
      params: {
        id: record.id,
      },
    });
  } else if (target === "report") {
    router.push({
      name: "reportList",
      params: {
        id: record.id,
      },
    });
  }
};

const resetPassword = (record) => {
  console.log(record);
  confirmModal.value.openModal(true, record, "passwordReset");
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
.area {
  .tableArea {
    width: 100%;
  }
  .generalBtn {
    width: 100px !important;
    height: 32px !important;
    font-size: 14px;
    line-height: initial;
    :deep(span) {
      vertical-align: middle;
    }
  }
  .functionArea {
    display: flex;
    margin-bottom: 14px;
    flex-wrap: wrap;

    .searchArea {
      display: flex;
      flex-wrap: nowrap;
      margin-bottom: 10px;
      .searchBox {
        display: flex;
        align-self: center;
        font-size: 14px;
        width: 50%;
        margin-right: 16px;

        label {
          align-self: center;
          color: white;
          width: max-content;
        }
        .ant-input-affix-wrapper {
          display: flex !important;
          width: 340px;
          height: 32px;

          background-color: #242c2d !important;
          border: 1px solid #64686d !important;
          :deep(.ant-input-suffix) {
            .anticon-close-circle {
              color: white;
            }
          }
        }
        .ant-cascader {
          width: 356px;
          :deep(.ant-select-selector) {
            background-color: #242c2d !important;
            border: 1px solid #64686d !important;
          }
        }
      }
    }
    .btnArea {
      display: flex;
      margin-bottom: 10px;

      .generalBtn {
        align-self: center;
      }
    }
  }
  .tableBox {
    :deep(.ant-table) {
      .ant-table-cell {
        color: white;
        background-color: #444648 !important;
        .ant-switch-checked {
          background-color: #11c76bb5;
        }
        .icon {
          &:hover {
            color: #b1e5f8;
            cursor: pointer;
          }

          &:nth-child(1),
          &:nth-child(2) {
            margin-right: 20px;
          }

          .anticon {
            font-size: 20px;
            svg {
              color: white;
            }
          }
        }
      }
    }
  }
}
</style>
