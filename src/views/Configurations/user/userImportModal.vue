<template>
  <div class="viewer-box">
    <a-modal
        v-model:visible="uploadModal"
        title="用户导入"
        style="top: 100px; width: 600px"
        :maskClosable=false
        :closable=false
        :confirm-loading="confirmLoading"
    >
      <template #footer>
        <a-button key="submit" type="primary" :disabled="uploading" class="generalBtn" @click="uploadCallback">返回</a-button>
      </template>
      <div class="download">
        <div class="title"><info-circle-outlined /><span>请您下载导入模板，按照模板要求填写信息后上传</span></div>
        <a href="/files/用户导入模板.xlsx" download><a-button block type="info" class="generalBtn">下载模板</a-button></a>
      </div>
      <div class="tips">
        填写完毕后上传：
      </div>
      <div class="uploadBox">
        <a-upload-dragger
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
          <p class="ant-upload-drag-icon">
            <icon-font type="icon-cross" />
          </p>
          <div v-if="!uploading">
            <p class="ant-upload-text">可以拖动文件到该区域进行上传</p>
          </div>
          <div v-else>
            <p class="ant-upload-text">上传中,请稍后</p>
            <a-spin :indicator="indicator" />
          </div>

        </a-upload-dragger>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { createFromIconfontCN , InfoCircleOutlined} from "@ant-design/icons-vue";
import IconFontUrl from "../../../assets/iconFont";
import { message } from 'ant-design-vue';
import {defineExpose, ref, h, defineEmits} from 'vue';
import {checkMd5, importUsers, uploadFile} from "@/api";
import {getAPIResponse} from "@/utils/apiTools/useAxiosApi";
import { LoadingOutlined } from '@ant-design/icons-vue';
import axios from "axios";
const emit = defineEmits(["initList"]);
const uploadModal = ref(false);
const confirmLoading = ref(false);
const uploading = ref(false);

const fileList = ref([])

const fileMIMETypes = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel'
]

const IconFont = createFromIconfontCN({
  scriptUrl: IconFontUrl,
});

const indicator = h(LoadingOutlined, {
  style: {
    fontSize: '36px',
  },
  spin: true,
});

const openModal = () => {
  uploadModal.value = true
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

  const isXlsx = fileMIMETypes.includes(file.type)
  if (!isXlsx) {
    message.error('只能上传Xlsx文件')
    uploading.value = false
    return false
  }
  const isLt10MB = file.size < 10 * 1024 * 1024
  if (!isLt10MB) {
    message.error('文件必须小于 10MB!')
    uploading.value = false
    return false
  }
}

const handleUpload = (file) => {
  const data = new FormData()
  data.append('uploadFile', file.file)
  importUsers(data).then(res => {
    const result = getAPIResponse(res)
    if (result) {
      console.log(result)
      message.success(result)
    }
    uploading.value = false
  })
}

const uploadCallback = (e) => {
  emit('initList')
  uploadModal.value = false;
  confirmLoading.value = false;
}
const uploadCancel = (e) => {
  console.log(e);
  uploadModal.value = false;
  confirmLoading.value = false;
}


defineExpose({
  openModal,
  uploadCallback,
  uploadCancel,
});

</script>

<style scoped lang="scss">
.download {
  display: flex;
  margin-bottom: 16px;
  .title {
    align-self: center;
    margin-right: 16px;
    font-size: 14px;
    display: flex;
    .anticon {
      align-self: center;
      font-size: 20px;
      margin-right: 8px;
    }
  }
  .generalBtn {
    border-color: #7d858a;
  }
}
.tips {
  font-size: 14px;
  margin-bottom: 14px;
}
.uploadBox {
  :deep(.ant-upload-drag) {
    background-color: #434548;
    border-color: #7D858AFF !important;
    width: 400px;
    overflow: hidden;
    margin: 0 auto;
    .ant-upload-btn {
      padding: 50px 0 10px;
    }
    &:hover {
      background-color: #646869;
      border-color: white !important;
    }
    .ant-upload-drag-icon {
      .anticon {
        color: white !important;
        font-size: 30px;
      }
    }
    .ant-upload-text, .ant-upload-hint {
      color: white !important;
      font-size: 14px !important;
    }
    .ant-spin {
      margin-top: 16px;
      color: white;
    }
  }
}
.ant-modal {
  .ant-modal-body {
    padding: 30px 64px;
  }
  .ant-modal-footer {
    padding: 24px 16px;
  }
}
.generalBtn {
  width: 100px !important;
  height: 30px !important;
  font-size: 14px;
  line-height: 14.95px;
}
</style>
