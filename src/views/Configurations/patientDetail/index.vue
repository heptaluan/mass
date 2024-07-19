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
                v-model:value="form.name"
                @change="changeClear(form.name)"
                placeholder="请输入姓名"
              />
            </div>

            <div class="searchBox">
              <label>样本编号：</label>
              <a-input
                style="width: 150px"
                ref="searchInput"
                v-model:value="form.sampleCode"
                @change="changeClear(form.name)"
                placeholder="请输入样本编号"
              />
            </div>

            <div class="searchBox">
              <label>检测日期：</label>
              <a-date-picker
                :locale="locale"
                valueFormat="YYYY-MM-DD HH:mm:ss"
                v-model:value="form.checkDate"
                style="width: 150px"
                placeholder="请选择检测日期"
              />
            </div>

            <div class="searchBox">
              <label>年龄：</label>
              <a-input-number
                style="width: 150px"
                ref="searchInput"
                v-model:value="form.age"
                @change="changeClear(form.name)"
                placeholder="请输入年龄"
              />
            </div>

            <div class="searchBox">
              <label>性别：</label>
              <a-select
                style="width: 150px"
                v-model:value="form.sex"
                placeholder="请选择性别"
              >
                <a-select-option value="1">男</a-select-option>
                <a-select-option value="0">女</a-select-option>
              </a-select>
            </div>

            <div class="searchBox">
              <label>样本状态：</label>
              <a-select
                style="width: 150px"
                v-model:value="form.sampleStatus"
                placeholder="请选择样本状态"
              >
                <template v-for="item in itemType" :key="item.id">
                  <a-select-option :value="item.value">{{
                    item.name
                  }}</a-select-option>
                </template>
              </a-select>
            </div>

            <div class="searchBox">
              <label>备注：</label>
              <a-input
                style="width: 150px"
                ref="searchInput"
                v-model:value="form.remark"
                @change="changeClear(form.name)"
                placeholder="请输入备注"
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
            <div v-for="item in form.patientQualityVOList" :key="item.id">
              <div className="table-list">
                <div>{{ item.itemName }}</div>
                <div>
                  <a-input-number
                    :value="item.analytes"
                    disabled
                    style="width: 140px"
                    placeholder="待测物质荷比"
                  />
                </div>
                <div>
                  <a-input-number
                    :value="item.internalStandard"
                    disabled
                    style="width: 140px"
                    placeholder="内标质荷比"
                  />
                </div>
                <div>
                  <a-input-number
                    :value="item.qualityAccuracy"
                    style="width: 140px"
                    placeholder="待测物质荷比"
                    @change="(e) => handleChangePPM(e, item.id)"
                  />
                </div>
                <div>
                  <a-input-number
                    :value="item.internalConcentration"
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
            <span>{{ form.scores }}</span>
          </div>

          <div className="btn-group">
            <a-button
              style="margin-right: 10px"
              type="primary"
              @click="handleUpdatePatient"
            >
              保存
            </a-button>
            <a-button
              @click="(e) => showUploadModal(null)"
              style="margin-right: 10px"
              type="primary"
            >
              浓度计算
            </a-button>
            <a-button
              style="margin-right: 10px"
              type="primary"
              @click="handleScoresCalculation"
            >
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

      <UploadModal ref="userModal" @initList="initList" />
    </div>
  </div>
</template>

<script setup>
import router from "@/router";
import { message } from "ant-design-vue";
import { createFromIconfontCN } from "@ant-design/icons-vue";
import IconFontUrl from "../../../assets/iconFont";
import locale from "ant-design-vue/es/date-picker/locale/zh_CN";
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
import UploadModal from "./uploadModal";
import breadcrumb from "../breadcrumb.vue";

import {
  getPatientDetail,
  getItemMap,
  scoresCalculation,
  updatePatient,
} from "@/api";

let userModal = ref(null);
let form = ref({});

const showUploadModal = (id) => {
  userModal.value.openModal(true, id);
};

const IconFont = createFromIconfontCN({
  scriptUrl: IconFontUrl,
});

const tableData = ref([]);

onMounted(() => {
  initList();
  initItemList();
});

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
  getPatientDetail({ id: router.currentRoute.value.params.id }).then((res) => {
    const result = getAPIResponse(res);
    if (result) {
      form.value = Object.assign({}, result);
    }
  });
};

const search = () => {
  initList("search", 1);
};

const changeClear = (value) => {
  if (!value || value === "") {
    initList();
  }
};

// ppm 修改
const handleChangePPM = (val, id) => {
  form.value.patientQualityVOList.find(
    (item) => item.id === id
  ).qualityAccuracy = val;
};

// 更新患者信息
const handleUpdatePatient = () => {
  const params = {
    age: form.value.age,
    checkDate: form.value.checkDate.substring(0, 10),
    id: router.currentRoute.value.params.id,
    name: form.value.name,
    remark: form.value.remark,
    sampleCode: form.value.sampleCode,
    sampleStatus: form.value.sampleStatus,
    sex: form.value.sex,
    patientQualityDTOList: form.value.patientQualityVOList,
  };

  updatePatient(params).then((res) => {
    const result = getAPIResponse(res);
    if (result) {
      form.value = Object.assign({}, result);
      message.success(`保存成功`);
    }
  });
};

// 评分计算
const handleScoresCalculation = () => {
  scoresCalculation({ id: router.currentRoute.value.params.id }).then((res) => {
    const result = getAPIResponse(res);
    if (result) {
      form.value.scores = result;
      message.success(`计算成功`);
    }
  });
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

  // 禁用状态
  .table-content {
    :deep(.ant-input-number-input[disabled]) {
      color: #999 !important;
      background-color: #4d4d4d !important;
      border-color: #64686d !important;
    }
  }
}
</style>
