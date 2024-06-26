<template>
  <div class="viewer-box">
    <breadcrumb :title="'文件存储管理'" />
    <div class="editBox">
      <a-form
        ref="ruleForm"
        :model="formData"
        @finish="submit"
        @finishFailed="submitFailed"
      >
        <div class="section">
          <div class="title">DICOM目录文件存储时效设置</div>
          <div class="itemPart">
            <div class="switchItem">
              <label><span>*</span>是否启用定期清理功能：</label>
              <a-switch
                v-model:checked="formData.dicomCleanEnable"
                checkedValue="01"
                unCheckedValue="02"
                checked-children="启用"
                un-checked-children="停用"
              />
            </div>
            <a-form-item
              name="dicomCleanDays"
              label="清除本地检查数据，当入库日期早于"
            >
              <a-select
                v-model:value="formData.dicomCleanDays"
                :options="dateOptions"
              ></a-select>
            </a-form-item>
            <div class="subTitle">
              <info-circle-outlined /><span
                >DICOM文件目录是缓存历史检查数据的目录，存在于服务器上。清除只针对本地服务器，不影响PACS系统等外部系统</span
              >
            </div>
          </div>
        </div>

        <div class="section">
          <div class="title">DICOM目录监控频率</div>
          <div class="itemPart">
            <span>*</span>
            <a-form-item name="dicomAnalysisFrequency" label="监控频率（分钟）">
              <a-select
                v-model:value="formData.dicomAnalysisFrequency"
                :options="frequencyOptions"
              ></a-select>
            </a-form-item>
            <a-popover placement="right">
              <template #content>
                <p>系统会依据设置的监控频率解析上传的DICOM文件并导入患者清单</p>
              </template>
              <question-circle-outlined two-tone-color="#eb2f96" />
            </a-popover>
          </div>
        </div>

        <!--        <div class="footer">-->
        <!--          <a-button key="submit" type="primary" class="generalBtn" html-type="submit">确认</a-button>-->
        <!--        </div>-->
      </a-form>
      <div class="footer">
        <a-button
          key="submit"
          type="primary"
          class="submitBtn"
          @click="submit"
          >确认</a-button
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import { onBeforeMount, reactive, ref } from "vue";
import { getFileStorage, getSelectionsByType, setFileStorage } from "@/api";
import { getAPIResponse } from "@/utils/apiTools/useAxiosApi";
import { message } from "ant-design-vue";
import breadcrumb from "../breadcrumb.vue";
import {
  createFromIconfontCN,
  InfoCircleOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons-vue";
import IconFontUrl from "../../../assets/iconFont";

const IconFont = createFromIconfontCN({
  scriptUrl: IconFontUrl,
});
const formData = reactive({
  dicomCleanEnable: "",
  dicomCleanDays: null,
  dicomAnalysisFrequency: null,
});
const fieldNames = {
  label: "dictLabel",
  value: "dictValue",
};
const cleanEnableOptions = ref([]);
const dateOptions = [
  { label: "90天", value: 90 },
  { label: "60天", value: 60 },
  { label: "30天", value: 30 },
];
const frequencyOptions = [
  { label: "1", value: 1 },
  { label: "3", value: 3 },
  { label: "5", value: 5 },
  { label: "10", value: 10 },
];

onBeforeMount(() => {
  getSelectionsByType().then((res) => {
    const result = getAPIResponse(res);
    cleanEnableOptions.value = result.sys_enable_status;
    console.log(cleanEnableOptions);
    getFileStorage().then((innerRes) => {
      const result = getAPIResponse(innerRes);
      formData.dicomCleanEnable = result.dicomCleanEnable;
      formData.dicomCleanDays = result.dicomCleanDays;
      formData.dicomAnalysisFrequency = result.dicomAnalysisFrequency;
    });
  });
});

const submit = async () => {
  const newForm = Object.assign({}, formData);

  const res = await setFileStorage(newForm);
  const result = getAPIResponse(res);
  if (result) {
    message.success(result);
  } else {
    message.success("设置失败，请重新设置");
  }
};

const submitFailed = (e) => {
  console.log(e, formData);
};
</script>

<style scoped>
@import "@/assets/main.css";
</style>
<style scoped lang="scss">
.editBox {
  .section {
    background-color: rgb(44, 46, 49);
    margin-bottom: 24px;
    
    &:nth-child(2) {
      .itemPart {
        display: flex;
        span {
          align-self: center;
          margin-right: 4px;
          color: red;
        }
        .ant-form-item {
          margin-bottom: 0;
        }
        .anticon-question-circle {
          color: white;
          margin-left: 12px;
          font-size: 20px;
        }
      }
    }
    .title {
      color: white;
      font-size: 16px;
      padding-left: 24px;
      border-bottom: 1px solid #636363;
      height: 65px;
      line-height: 65px;
    }
    .itemPart {
      padding: 24px;
      .subTitle {
        color: white;
        font-size: 14px;
        display: flex;
        align-items: center;
        .anticon {
          color: white !important;
          font-size: 20px;
          margin-right: 12px;
        }
        span:last-child {
          line-height: initial;
        }
      }
      .switchItem {
        margin-bottom: 24px;
        label {
          color: white;
          margin-right: 6px;
          span {
            vertical-align: sub;
            margin-right: 4px;
            color: red;
          }
        }
        .ant-switch-checked {
          background-color: #11c76bb5;
        }
      }
    }
  }
  .ant-form {
    border-radius: 4px;
    padding: 24px;
    :deep(.ant-form-item-label) {
      label {
        color: white;
      }
    }
  }
  .ant-form-item {
    //width: 30%;
    :deep(.ant-form-item-label) {
      min-width: 5.4vw;
    }
    :deep(.ant-form-item-control) {
      .ant-form-item-control-input {
        width: 120px;
        background-color: #242c2d !important;
      }
    }
  }
}
.viewer-box {
  height: 100%;

  .editBox {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: calc(100% - 120px);
  }
}

.footer {
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 80px;
  min-height: 80px;
  background: rgb(44, 46, 48);
  border-top: 1px solid rgb(119, 119, 119);
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
}
</style>
