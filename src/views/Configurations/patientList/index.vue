<template>
  <div>
    <breadcrumb :title="'患者检测列表'" />
    <div class="area">
      <div class="tableArea">
        <div class="functionArea">
          <div class="searchArea">
            <div class="searchBox">
              <label style="width: 100px">姓名：</label>
              <a-input
                style="width: 150px"
                ref="searchInput"
                v-model:value="searchForm.name"
                @change="changeClear(searchForm.name)"
                placeholder="请输入姓名"
                allow-clear
              />
            </div>
            <div class="searchBox">
              <label style="width: 100px">样本编号：</label>
              <a-input
                style="width: 150px"
                ref="searchInput"
                v-model:value="searchForm.name"
                @change="changeClear(searchForm.name)"
                placeholder="请输入样本编号"
                allow-clear
              />
            </div>
          </div>
          <div class="btnArea">
            <a-button block type="info" class="generalBtn" @click="search">
              查询
            </a-button>
            <a-button block type="info" class="generalBtn" @click="search">
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
            :data-source="userList"
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
              <template v-if="column.key === 'operation'">
                <span class="icon" @click="jumpTo('detail')">查看检测信息</span>
                <span class="icon" @click="jumpTo('report')">查看报告</span>
                <span class="icon">删除</span>
                <!-- <span class="icon" @click="editItem(record)"
                  ><icon-font type="icon-bianji"
                /></span>
                <span class="icon" @click="resetPassword(record)"
                  ><icon-font type="icon-refresh"
                /></span> -->
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
      <ConfirmModal ref="confirmModal" @initList="initList"></ConfirmModal>
      <ImportModal ref="importModal" @initList="initList"></ImportModal>
    </div>
  </div>
</template>

<script setup>
import router from "@/router";
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
import { getUserList, getDeptTree } from "@/api";
import UserModal from "./userModal";
import ConfirmModal from "../confirmModal";

import breadcrumb from "../breadcrumb.vue";

const IconFont = createFromIconfontCN({
  scriptUrl: IconFontUrl,
});

let userList = ref([]);

const columns = [
  {
    title: "序号",
    dataIndex: "orderNum",
    key: "orderNum",
    align: "center",
    // width: 300
  },
  {
    title: "姓名",
    dataIndex: "userName",
    key: "userName",
    align: "center",
  },
  {
    title: "所属部门",
    dataIndex: "deptId",
    key: "deptId",
    align: "center",
  },
  {
    title: "用户名称",
    dataIndex: "nickName",
    key: "nickName",
    align: "center",
  },
  {
    title: "职务",
    dataIndex: "dutyCn",
    key: "dutyCn",
    align: "center",
  },
  {
    title: "操作",
    dataIndex: "operation",
    key: "operation",
    align: "center",
  },
  // {
  //   title: "状态",
  //   dataIndex: "status",
  //   key: "status",
  //   align: "center",
  // },
];

const initialState = {
  name: "",
  deptId: undefined,
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
});

const initList = (status, page) => {
  if (page) {
    pagination.current = 1;
  }
  const searchInfo = {
    name: "",
    deptId: "",
    page: pagination.current,
    size: pagination.size,
  };
  let newForm = searchInfo;
  if (status === "search") {
    newForm = Object.assign(searchInfo, searchForm);

    newForm.deptId = newForm.deptId
      ? newForm.deptId[newForm.deptId.length - 1]
      : "";
  }
  getDeptTree(null).then((res) => {
    const result = getAPIResponse(res);
    if (result) {
      console.log(result);
      departmentList.value = result;
    }
  });

  getUserList(newForm).then((res) => {
    const result = getAPIResponse(res);
    if (result) {
      console.log(result);
      userList.value = result.list;
      pagination.total = result.total;
    }
  });
};

const search = () => {
  initList("search", 1);
};
const addUser = (id) => {
  userModal.value.openModal(true, id);
};

// 跳转
const jumpTo = (target) => {
  if (target === "detail") {
    router.push({ name: "patientDetail" });
  } else if (target === "report") {
    router.push({ name: "reportList" });
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
