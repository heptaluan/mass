<template>
  <div>
    <breadcrumb :title="'用户管理'" />
    <div class="area">
      <div class="tableArea">
        <div class="functionArea">
          <div class="searchArea">
            <div class="searchBox">
              <label style="width: 115px">账号或用户名称：</label>
              <a-input
                style="width: 340px"
                ref="searchInput"
                v-model:value="searchForm.name"
                @change="changeClear(searchForm.name)"
                placeholder="请输入账号或用户名称"
                allow-clear
              />
            </div>
            <div class="searchBox">
              <label >所属部门：</label>
              <a-cascader
                style="width: 340px"
                v-model:value="searchForm.deptId"
                change-on-select
                :options="departmentList"
                @change="changeClear(searchForm.deptId)"
                :field-names="fieldNames"
                placeholder="请选择所属部门"
              />
            </div>
          </div>
          <div class="btnArea">
            <a-button block type="info" class="generalBtn" @click="search">
              查询
            </a-button>
            <a-button
              block
              type="info"
              class="generalBtn"
              @click="(e) => addUser(null)"
            >
              新增
            </a-button>
            <a-button block type="info" class="generalBtn" @click="userImport">
              批量导入
            </a-button>
          </div>
        </div>
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
                <span class="icon" @click="editItem(record)"
                  ><icon-font type="icon-bianji"
                /></span>
                <span class="icon" @click="resetPassword(record)"
                  ><icon-font type="icon-refresh"
                /></span>
              </template>
              <template v-if="column.key === 'status'">
                <a-switch
                  v-model:checked="record.status"
                  @change="statusChange(record)"
                  checkedValue="01"
                  unCheckedValue="02"
                  checked-children="启用"
                  un-checked-children="停用"
                />
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
import ImportModal from "./userImportModal";
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
    title: "登录账号",
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
  {
    title: "状态",
    dataIndex: "status",
    key: "status",
    align: "center",
  },
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
const userImport = (status) => {
  importModal.value.openModal();
};

const editItem = (record) => {
  userModal.value.openModal(true, record);
};
const statusChange = (record) => {
  console.log(record);
  confirmModal.value.openModal(true, record, "user");
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

          &:first-child {
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
