<template>
  <div class="viewer-box">
    <a-modal
      v-model:visible="userModal"
      :title="''"
      style="top: 100px"
      :maskClosable="false"
      :closable="false"
      :width="600"
      :footer="null"
      :confirm-loading="confirmLoading"
    >
      <div class="add-node-box editBox">
        <div style="display: flex">
          <a-upload
            name="file"
            accept=".txt"
            @change="handleChange"
            :before-upload="beforeUpload"
            :customRequest="handleUpload"
            :multiple="true"
            :show-upload-list="false"
            :disabled="uploading"
          >
            <a-button class="submitBtn">
              <span v-if="!uploading"> 上 传 </span>
              <span v-else>
                <p class="ant-upload-text">上传中...</p>
              </span>
            </a-button>
          </a-upload>
          <span className="upload-tips"
            ><icon-font
              type="icon-jinggao"
              style="font-size: 16px; margin-right: 5px"
            />
            支持批量上传，只能上传txt格式的文件且单个文件大小不超过5MB</span
          >
        </div>

        <div className="upload-content">
          <div className="table-list-title">
            <div>文件名</div>
            <div>大小</div>
            <div>状态</div>
          </div>
          <div className="table-list-box">
            <template v-if="fileList.length === 0">
              <div className="no-data-tips">暂无数据</div>
            </template>
            <div v-for="item in fileList" :key="item.id">
              <div className="table-list">
                <div>{{ item.name }}</div>
                <div>{{ item.size }}K</div>
                <div>
                  {{ item.state === 1 ? "上传成功" : "上传失败" }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="footer">
          <a-button
            key="submit"
            type="primary"
            class="generalBtn"
            @click="openModal(false)"
            >关闭</a-button
          >
          <a-button
            key="submit"
            type="primary"
            class="generalBtn"
            @click="handleComputed()"
            >计算</a-button
          >
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import router from "@/router";
import {
  ref,
  defineProps,
  defineExpose,
  defineEmits,
  reactive,
  onBeforeMount,
} from "vue";
import { QuestionCircleOutlined } from "@ant-design/icons-vue";
import { getAPIResponse } from "@/utils/apiTools/useAxiosApi";
import { message } from "ant-design-vue";
import { useCookies } from "@vueuse/integrations/useCookies";
import { useUserStore } from "@/store/modules/user";
import {
  queryAppendixList,
  removeAppendixList,
  uploadAppendixList,
  concentrationCalculation,
} from "@/api";
import { createFromIconfontCN } from "@ant-design/icons-vue";
import IconFontUrl from "../../../assets/iconFont";

const IconFont = createFromIconfontCN({
  scriptUrl: IconFontUrl,
});

const userStore = useUserStore();
const userModal = ref(false);
const confirmLoading = ref(false);
const emit = defineEmits(["initList"]);

const uploading = ref(false);

const fileList = ref([]);

// 浓度计算
const handleComputed = () => {
  if (fileList.value.length === 0) {
    message.error(`请先上传文件！`)
    return false;
  }
  concentrationCalculation({
    id: router.currentRoute.value.params.id,
  }).then((res) => {
    const result = getAPIResponse(res);
    if (result) {
      message.success(result);
    }
  });
};

const openModal = async (status, selectUser) => {
  userModal.value = status;
  getFileList();
};

const getFileList = () => {
  queryAppendixList({
    refTable: "ms_patient",
    refTableId: router.currentRoute.value.params.id,
  }).then((res) => {
    const result = getAPIResponse(res);
    fileList.value = [];
    for (let i = 0; i < result.length; i++) {
      fileList.value.push({
        id: i,
        name: result[i].fileName,
        size: result[i].fileSize,
        state: 1,
      });
    }
  });
};

const handleChange = async (info) => {
  const status = info.file.status;

  if (status !== "uploading") {
    console.log(info.file, info.fileList);
  }
  if (status === "done") {
    message.success(`${info.file.name} file uploaded successfully.`);
  } else if (status === "error") {
    message.error(`${info.file.name} file upload failed.`);
  }
};

const beforeUpload = (file, fileList) => {
  if (fileList.length !== 3) {
    message.error("只能同时上传三个文件");
    return false;
  }

  const isTxt = ["text/plain"].includes(file.type);
  if (!isTxt) {
    message.error("只能上传Txt文件");
    return false;
  }

  const isLt10KB = file.size < 5 * 1024 * 1024;
  if (!isLt10KB) {
    message.error("文件必须小于 5M!");
    return false;
  }

  removeAppendixList({
    refTable: "ms_patient",
    refTableId: router.currentRoute.value.params.id,
  }).then((res) => {
    const result = getAPIResponse(res);
    console.log(result);
  });
};

let fileTarget = 1;

const handleUpload = (file) => {
  uploading.value = true;
  setTimeout(() => {
    upload(file);
  }, 1000);
};

const upload = (file) => {
  const data = new FormData();
  data.append("file", file.file);
  data.append("refTable", "ms_patient");
  data.append("refTableId", router.currentRoute.value.params.id);
  data.append("remark", "A0" + fileTarget);
  fileTarget++;
  uploadAppendixList(data).then((res) => {
    const result = getAPIResponse(res);
    if (result) {
      console.log(result);
      message.success(`上传成功`);
      getFileList();
    }
    uploading.value = false;
  });
};

defineExpose({
  openModal,
});
</script>

<style scoped>
@import "@/assets/main.css";
</style>

<style scoped lang="scss">
.editBox {
  .ant-form {
    border-radius: 4px;
    text-align: -webkit-center;
  }

  .footer {
    text-align: center;

    .btn {
      &:first-child {
        margin-right: 10px;
      }
    }
  }

  .upload-tips {
    font-size: 12px;
    color: #ff9900;
    margin-left: 10px;
    display: flex;
    align-items: center;
  }

  .upload-content {
    padding: 10px;

    .table-list-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 14px;
      color: #fff;
      height: 45px;
      line-height: 45px;

      div:nth-child(1) {
        width: 220px;
        padding-left: 15px;
      }

      div:nth-child(2) {
        width: 150px;
      }

      div:nth-child(3) {
        width: 150px;
      }
    }

    .table-list-box {
      border: 1px dashed rgb(220, 220, 220);
      font-size: 14px;
      margin-bottom: 20px;

      .no-data-tips {
        font-size: 14px;
        text-align: center;
        height: 80px;
        line-height: 80px;
        color: rgb(173, 173, 173);
      }

      .table-list {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 45px;
        line-height: 45px;
        border-bottom: 1px solid rgb(235, 238, 245);

        &:last-child {
          border-bottom: none;
        }

        div:nth-child(1) {
          width: 220px;
          padding-left: 15px;
        }

        div:nth-child(2) {
          width: 150px;
        }

        div:nth-child(3) {
          width: 150px;
        }
      }
    }
  }
}
</style>
