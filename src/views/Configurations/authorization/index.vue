<template>
  <div class="viewer-box">
    <breadcrumb :title="'系统授权'" />
    <div class="editBox">
        <div class="section">
          <div class="title">系统信息导出</div>
          <div class="itemPart">
              <a-button block type="info" class="submitBtn" @click="exportKey">
                <span v-if="!exporting">
                  导  出
                </span>
                <span v-else>
                  <p class="ant-upload-text">正在导出...</p>
                </span>
              </a-button>
            <div class="subTitle">
              <info-circle-outlined /><span
            >请先导出系统信息，用于生成授权文件</span
            >
            </div>
          </div>
        </div>
        <div class="section">
          <div class="title">授权文件导入</div>
          <div class="itemPart">
            <a-upload
                v-model:fileList="fileList"
                name="file"
                @change="handleChange"
                @drop="handleDrop"
                :before-upload="beforeUpload"
                :customRequest="handleUpload"
                :multiple=false
                :show-upload-list='false'
                :disabled='uploading'
            >
              <a-button class="submitBtn">
                <span v-if="!uploading">
                  上  传
                </span>
                <span v-else>
                  <p class="ant-upload-text">上传中...</p>
                </span>
              </a-button>
            </a-upload>


            <div class="subTitle">
              授权状态：<span class="status" :class="{'succeed': authorizationStatus === '已授权'}">{{authorizationStatus}}</span>
            </div>
          </div>
          <div class="itemPart item2">
            <div class="subTitle">
              <info-circle-outlined /><span
            > 请在此处上传授权文件，授权成功后请重新登录系统</span
            >
            </div>
          </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import {onMounted, reactive, ref} from "vue";
import {getCertificationStatus, getLicense, uploadAuthorization} from "@/api";
import { getAPIResponse } from "@/utils/apiTools/useAxiosApi";
import { message } from "ant-design-vue";
import breadcrumb from "../breadcrumb.vue";
import {
  createFromIconfontCN,
  InfoCircleOutlined,
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
const fileList = ref([])
const uploading = ref(false);
const exporting = ref(false);
const authorizationStatus = ref('未授权');
const fileMIMETypes = ['application/json']

onMounted(() => {
  refreshStatus();
});

const exportKey = () => {
  exporting.value = true
  getLicense().then(res => {
    const result = getAPIResponse(res)
    if (result) {
      console.log(result)
      const link = document.createElement("a");
      const content = JSON.stringify(result)
      const file = new Blob([content], { type: 'application/json' });
      link.href = URL.createObjectURL(file);
      link.download = "Application_License";
      link.click();
      URL.revokeObjectURL(link.href);
      message.success('导出成功')
    } else {
      message.success('导出失败')
    }
    exporting.value = false
  })

}

const handleChange = async (info) => {
  const status = info.file.status;

  if (status !== 'uploading') {
    console.log(info.file, info.fileList);
  }
  if (status === 'done') {
    message.success(`${info.file.name} file uploaded successfully.`);
  } else if (status === 'error') {
    message.error(`${info.file.name} file upload failed.`);
  }
};

const handleDrop = (e) => {
  console.log(e);
}

const beforeUpload = (file) => {
  uploading.value = true

  // const isJson = fileMIMETypes.includes(file.type)
  // if (!isJson) {
  //   message.error('只能上传JSON文件')
  //   uploading.value = false
  //   return false
  // }

  const isLt10KB = file.size < 100 * 1024
  if (!isLt10KB) {
    message.error('文件必须小于 100KB!')
    uploading.value = false
    return false
  }
}

const handleUpload = (file) => {
  const data = new FormData()
  data.append('uploadFile', file.file)
  uploadAuthorization(data).then(res => {
    const result = getAPIResponse(res)
    if (result) {
      console.log(result)
      message.success(result)
      refreshStatus()
    }
    uploading.value = false
  })
}

const refreshStatus = () => {
  getCertificationStatus().then(res => {
    const result = getAPIResponse(res)
    if (result) {
      console.log(result)
      authorizationStatus.value = result
    }
  })
}

</script>

<style scoped>
@import "@/assets/main.css";
</style>
<style scoped lang="scss">
.editBox {    padding: 24px;
  .section {
    background-color: rgb(44, 46, 49);
    margin-bottom: 24px;
    border-radius: 4px;

    &:last-child {
      .itemPart {
        padding: 24px 24px 0;
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
      display: flex;
      padding: 24px 24px 60px;
      &.item2 {
        padding-bottom: 60px;
      }
      .submitBtn {
        margin-right: 20px;
      }
      .subTitle {
        color: white;
        font-size: 14px;
        display: flex;
        align-items: center;
        .status {
          color: yellow;
          font-weight: 600;
        }
        .succeed {
          color: #29cb7a;
        }
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
}
.viewer-box {
  height: 100%;

  .editBox {
    display: flex;
    flex-direction: column;
    height: calc(100% - 120px);
  }
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
