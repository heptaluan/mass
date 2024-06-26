<template>
  <div>
    <breadcrumb :title="'患者检测详情'" />
    <div class="area">
      <div class="tableArea">
        <!-- 患者信息 -->
        <div class="sub-title">患者信息</div>
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
                allow-clear
              />
            </div>

            <div class="searchBox">
              <label>样本编号：</label>
              <a-input
                style="width: 150px"
                ref="searchInput"
                v-model:value="searchForm.name"
                @change="changeClear(searchForm.name)"
                placeholder="请输入样本编号"
                allow-clear
              />
            </div>

            <div class="searchBox">
              <label>检测日期：</label>
              <a-date-picker
                style="width: 150px"
                placeholder="请选择检测日期"
                allow-clear
              />
            </div>

            <div class="searchBox">
              <label>年龄：</label>
              <a-input-number
                style="width: 150px"
                ref="searchInput"
                v-model:value="searchForm.name"
                @change="changeClear(searchForm.name)"
                placeholder="请输入年龄"
                allow-clear
              />
            </div>

            <div class="searchBox">
              <label>性别：</label>
              <a-select
                style="width: 150px"
                v-model:value="searchForm.name"
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
                v-model:value="searchForm.name"
                placeholder="请选择样本状态"
              >
                <a-select-option value="0">待检测</a-select-option>
                <a-select-option value="1">已检测</a-select-option>
              </a-select>
            </div>

            <div class="searchBox">
              <label>备注：</label>
              <a-input
                style="width: 150px"
                ref="searchInput"
                v-model:value="searchForm.name"
                @change="changeClear(searchForm.name)"
                placeholder="请输入备注"
                allow-clear
              />
            </div>
          </div>
        </div>

        <!-- 检测信息 -->
        <div className="sub-title">检测信息</div>

        <div className="table-content">
          <div className="tible-title">
            <div>检测项目</div>
            <div>待测物质荷比</div>
            <div>内标质荷比</div>
            <div>质量精度(ppm)</div>
            <div>浓度</div>
          </div>
          <div>
            <div v-for="item in tableData" :key="item.id">
              <div className="table-list">
                <div>{{ item.name }}</div>
                <div>
                  <a-input-number
                    disabled
                    style="width: 140px"
                    placeholder="待测物质荷比"
                  />
                </div>
                <div>
                  <a-input-number
                    disabled
                    style="width: 140px"
                    placeholder="内标质荷比"
                  />
                </div>
                <div>
                  <a-input-number
                    :value="item.value"
                    style="width: 140px"
                    placeholder="待测物质荷比"
                  />
                </div>
                <div>
                  <a-input-number
                    disabled
                    style="width: 140px"
                    placeholder="浓度"
                  />
                  μmol/L
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 结果按钮组 -->
        <div className="table-result">
          <div className="score-box">
            <span>评分</span>
            <span>87.42</span>
          </div>

          <div className="btn-group">
            <a-button style="margin-right: 10px" type="primary">
              保存
            </a-button>
            <a-button style="margin-right: 10px" type="primary">
              浓度计算
            </a-button>
            <a-button style="margin-right: 10px" type="primary">
              评分计算
            </a-button>
            <a-button
              @click="jumpTo('report')"
              style="margin-right: 10px"
              type="primary"
            >
              查看报告
            </a-button>
            <a-button
              @click="jumpTo('back')"
              style="margin-right: 10px"
              type="primary"
            >
              返回
            </a-button>
          </div>
        </div>
      </div>

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
import ConfirmModal from "../confirmModal";

import breadcrumb from "../breadcrumb.vue";

const IconFont = createFromIconfontCN({
  scriptUrl: IconFontUrl,
});

const tableData = ref([
  {
    id: 1,
    name: "尿酸",
    value: 2000,
  },
  {
    id: 2,
    name: "肌酐",
    value: 2000,
  },
  {
    id: 3,
    name: "苯丙氨酸",
    value: 2000,
  },
  {
    id: 4,
    name: "亮氨酸",
    value: 2000,
  },
  {
    id: 5,
    name: "精氨酸",
    value: 2000,
  },
]);

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

// 跳转
const jumpTo = (target) => {
  if (target === "report") {
    router.push({ name: "reportList" });
  } else if (target === "back") {
    router.push({ name: "patientList" });
  }
};
</script>

<style scoped>
@import "@/assets/main.css";
</style>
<style scoped lang="scss">
.area {
  .tableArea {
    width: 100%;
  }

  .sub-title {
    color: #fff;
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 15px;
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
      flex-wrap: wrap;

      .searchBox {
        display: flex;
        align-self: center;
        font-size: 14px;
        margin-right: 16px;
        margin-bottom: 10px;

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

  // 表格部分
  .table-content {
    color: #fff;

    .tible-title {
      width: 100%;
      height: 55px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      text-align: center;
      border-bottom: 1px solid rgb(235, 238, 245);

      & > div {
        width: 140px;
        font-size: 14px;
        font-weight: bold;
      }
    }

    .table-list {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 55px;
      border-bottom: 1px solid rgb(235, 238, 245);

      &:nth-child(even) {
        background-color: rgb(250, 250, 250);
      }

      & > div {
        width: 140px;
        text-align: center;
        font-size: 14px;
        font-weight: bold;
      }

      & > div:last-child {
        display: flex;
        align-items: center;
      }
    }
  }

  // 底部按钮组
  .table-result {
    width: 100%;
    margin-top: 45px;
    display: flex;
    align-items: center;
    justify-content: center;

    .score-box {
      color: #fff;

      span:first-child {
        font-size: 18px;
        font-weight: bold;
        margin-right: 15px;
      }

      span:last-child {
        font-size: 18px;
        color: red;
      }
    }

    .btn-group {
      margin: 0 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      user-select: none;
    }
  }
}
</style>
