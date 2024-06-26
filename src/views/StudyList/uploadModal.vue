<template>
  <div class="viewer-box">
    <a-modal
        v-model:visible="uploadModal"
        title="上传DICOM压缩包"
        style="top: 100px"
        :maskClosable=false
        :width="800"
        :closable=false
        :confirm-loading="confirmLoading"
    >
      <template #footer>
        <a-button class="generalBtn" key="submit2" type="primary" :disabled="uploading" @click="uploadCallback" v-if="pageStatus === 'list'">取消</a-button>
        <a-button class="generalBtn" key="submit" type="primary" :disabled="uploading" @click="switchHandler('upload')" v-if="pageStatus === 'list'">上传</a-button>
        <a-button class="generalBtn" key="submit1" type="primary" :disabled="uploading" @click="switchHandler('list')" v-else>返回</a-button>
      </template>
      <div class="list" v-if="pageStatus === 'list'">
        <div class="tableBox">
          <a-table :data-source="uploadList" :pagination="pagination" class="uploadTable"
                   :columns="columns" :row-key="record => record.id" table-layout="fixed"
                   :childrenColumnName="'kids'" >
            <template #bodyCell="{column, record, index}">
              <template v-if="column.key === 'orderNum'">
                {{Number(index) + 1}}
              </template>
              <template v-if="column.key === 'createTime'">
                {{(new Date(record.createTime)).toLocaleString()}}
              </template>
              <template v-if="column.key === 'statusCn'">
                <div class="statusBox">
                  <div class="txt" :class="{tinyGap: record.status=== '04'}">{{record.statusCn}}</div>
                  <template v-if="record.status === '02' || record.status === '04'">
                    <span class="icon" v-if="record.analysisStatus" @click="getStatusInfo(record.id)"><check-circle-outlined style="color: #CCFFCC"/></span>
                    <span class="icon" v-else @click="getStatusInfo(record.id)"><exclamation-circle-outlined style="color: #FFCCCC"/></span>
                  </template>
                </div>
              </template>
            </template>
          </a-table>
        </div>
      </div>
      <div class="uploadArea" v-if="pageStatus === 'upload'">
        <div class="uploadBox">
          <p class="ant-upload-hint">
            <info-circle-outlined style="color: #FFCCCC" />仅支持单个小于1GB的ZIP压缩包文件上传
          </p>
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
              <inbox-outlined></inbox-outlined>
            </p>
            <div v-if="!uploading">
              <p class="ant-upload-text">点击或拖拽压缩包至此区域进行上传</p>
            </div>
            <div v-else>
              <p class="ant-upload-text">上传中,请稍后</p>
              <a-spin :indicator="indicator" />
            </div>
            <a-progress class="uploadProcess" v-if="uploading" :percent="uploadPercent" />
          </a-upload-dragger>
        </div>
      </div>
      <div class="analysisArea" v-if="pageStatus === 'analysis'">
        <div class="analysisBox" v-if="analysisInfo">
          <div class="title">
            <exclamation-circle-outlined v-if="analysisInfo['errorInfoList']" style="color: #FFCCCC"/>
            <check-circle-outlined v-else style="color: #CCFFCC"/>
            <div class="info">
              上传文件：<span class="strong">{{analysisInfo['fileName']}}</span>，上传时间 ：<span class="strong">{{analysisInfo['createTime']}}</span> 解析完成，结果如下：
            </div>
          </div>
          <div class="info data">
            导入成功患者信息 ：<span class="strong">{{analysisInfo['patientNum']}}</span> 个， 序列信息 ：<span class="strong">{{ analysisInfo['seriesNum'] }}</span> 组。
          </div>
          <div class="description" v-if="analysisInfo['errorInfoList']">
            <div class="subTitle">解析异常信息：</div>
            <div class="info strong" v-for="item in analysisInfo['errorInfoList']" :key="item.id">
              {{item}}
            </div>
          </div>

        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { InboxOutlined, InfoCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import {defineExpose, ref, h, defineEmits, reactive} from 'vue';
import {
  checkMd5,
  getAnalysisResult,
  getTaskInfo,
  getUploadFileList,
  initTask,
  mergeFile,
  preSignUploadUrl,
  uploadFile
} from "@/api";
import {getAPIResponse} from "@/utils/apiTools/useAxiosApi";
import { LoadingOutlined } from '@ant-design/icons-vue';
import SparkMD5 from "spark-md5"
import axios from "axios";
import Queue from 'promise-queue-plus';
import md5 from '@/utils/tools/md5'


const emit = defineEmits(["initList"]);
const uploadModal = ref(false);
const confirmLoading = ref(false);
const uploading = ref(false);
let pageStatus = ref('list');
let uploadList = ref([])
const fileList = ref([])
const analysisInfo = ref(null)
const uploadPercent = ref(0)
const fileUploadChunkQueue = ref({}).value

const fileMIMETypes = [
  'application/zip',
  'application/octet-stream',
  'application/x-zip-compressed',
  'multipart/x-zip'
]

const columns = [
  {
    title: '序号',
    dataIndex: 'orderNum',
    key: 'orderNum',
    align: 'center',
    width: 60
  },
  {
    title: '上传时间',
    dataIndex: 'createTime',
    key: 'createTime',
    align: 'center',
    width: 160
  },
  {
    title: '文件名称',
    dataIndex: 'fileName',
    key: 'fileName',
    align: 'center',
    width: 300
  },
  {
    title: '文件大小(MB)',
    dataIndex: 'fileSizeStr',
    key: 'fileSizeStr',
    align: 'center',
    width: 100
  },
  {
    title: '传输状态',
    dataIndex: 'statusCn',
    key: 'statusCn',
    align: 'center',
    width: 100
  }
]

const indicator = h(LoadingOutlined, {
  style: {
    fontSize: '36px',
  },
  spin: true,
});

const openModal = () => {
  uploadModal.value = true
  initList()
}

const initList = () => {
  const searchInfo = {
    "page": pagination.current,
    "size": pagination.size,
  }
  getUploadFileList(searchInfo).then(res => {
    const result = getAPIResponse(res)
    console.log(result)
    if (result) {
      uploadList.value = result.list
      pagination.total = result.total
    }
  })
}

const getFileMD5 = async (file) => {
  const reader = new FileReader();

  // Wrap the FileReader in a Promise
  const promise = new Promise((resolve, reject) => {
    reader.onload = function(event) {
      // The file buffer is stored in the 'result' property of the event
      const fileBuffer = event.target.result;

      // Calculate the MD5 hash of the file buffer
      const md5 = SparkMD5.ArrayBuffer.hash(fileBuffer);

      resolve(md5);
    };

    reader.onerror = function(error) {
      reject(error);
    };
  });

  // Read the file data as an ArrayBuffer
  reader.readAsArrayBuffer(file);

  // Wait for the promise to resolve (i.e. the file has been read and the MD5 hash calculated)
  const md5 = await promise;

  return md5;
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

  const isZip = fileMIMETypes.includes(file.type)
  if (!isZip) {
    message.error('只能上传ZIP压缩包!')
    uploading.value = false
    return false
  }
  const isLt1GB = file.size < 1024 * 1024 * 1024
  if (!isLt1GB) {
    message.error('ZIP压缩包必须小于 1GB!')
    uploading.value = false
    return false
  }
}

const handleUpload = async (options) => {
  const identifier = await md5(options.file)
  getTaskInfo({md5: identifier}).then(res => {
    const result = getAPIResponse(res)
    console.log(result)
    if (result['whetherExists']) {
      message.warning('该文件已存在!!!')
      uploading.value = false
    } else {
      // uploadFileToServe(file.file, md5)
      const initTaskData = {
        md5: identifier,
        fileName: options.file.name,
        fileSize: options.file.size,
        chunkSize: 5 * 1024 * 1024
      }
      initSliceUpload(initTaskData, options.file, options)
    }
  })
}

const initSliceUpload = async (initTaskData, file, options) => {
  const taskRes = await initTask(initTaskData)
  const taskResult = getAPIResponse(taskRes)
  console.log(taskResult)
  if (taskResult) {
    const { finished, fileUrl, md5 } = taskResult
    if (finished) {
      return fileUrl
    } else {
      const errorList = await sliceHandleUpload(file, taskResult, options)
      if (errorList.length > 0) {
        message.warning('部分分片上次失败，请尝试重新上传文件')
        return;
      }
      const res = await mergeFile({md5})
      if (res.response.value.code === 200) {
        message.success('已上传成功');
        uploadPercent.value = 0
        uploading.value = false
      } else {
        message.warning('上传过程中出现错误')
        uploading.value = false
      }
    }
  }
}

const sliceHandleUpload = (file, task, options) => {
  let lastUploadedSize = 0; // 上次断点续传时上传的总大小
  let uploadedSize = 0 // 已上传的大小
  const totalSize = file.size || 0 // 文件总大小
  let startMs = new Date().getTime(); // 开始上传的时间
  const { exitPartList, chunkSize, chunkNum, md5 } = task

  // 获取从开始上传到现在的平均速度（byte/s）
  const getSpeed = () => {
    // 已上传的总大小 - 上次上传的总大小（断点续传）= 本次上传的总大小（byte）
    const intervalSize = uploadedSize - lastUploadedSize
    const nowMs = new Date().getTime()
    // 时间间隔（s）
    const intervalTime = (nowMs - startMs) / 1000
    return intervalSize / intervalTime
  }

  const uploadNext = async (partNumber) => {
    const start = new Number(chunkSize) * (partNumber - 1)
    const end = start + new Number(chunkSize)
    const blob = file.slice(start, end)
    const res = await preSignUploadUrl({ md5, partNumber: partNumber} )
    const result = getAPIResponse(res)

    if (result) {
      await axios.request({
        url: result,
        method: 'PUT',
        data: blob,
        headers: {'Content-Type': 'application/octet-stream'}
      })
      return Promise.resolve({ partNumber: partNumber, uploadedSize: blob.size })
    }
    return Promise.reject(`分片${partNumber}， 获取上传地址失败`)
  }

  /**
   * 更新上传进度
   * @param increment 为已上传的进度增加的字节量
   */
  const updateProcess = (increment) => {
    increment = new Number(increment)
    const { onProgress } = options
    let factor = 1000; // 每次增加1000 byte
    let from = 0;
    // 通过循环一点一点的增加进度
    while (from <= increment) {
      from += factor
      uploadedSize += factor
      const percent = Math.round(uploadedSize / totalSize * 100).toFixed(2);
      onProgress({percent: percent})
      uploadPercent.value = Number(percent)
    }

    const speed = getSpeed();
    const remainingTime = speed != 0 ? Math.ceil((totalSize - uploadedSize) / speed) + 's' : '未知'
    console.log('剩余大小：', (totalSize - uploadedSize) / 1024 / 1024, 'mb');
    console.log('当前速度：', (speed / 1024 / 1024).toFixed(2), 'mbps');
    console.log('预计完成：', remainingTime);
  }

  return new Promise(resolve => {
    const failArr = [];
    const queue = Queue(5, {
      "retry": 3,               //Number of retries
      "retryIsJump": false,     //retry now?
      "workReject": function(reason,queue){
        failArr.push(reason)
      },
      "queueEnd": function(queue){
        resolve(failArr);
      }
    })
    fileUploadChunkQueue[file.uid] = queue
    for (let partNumber = 1; partNumber <= chunkNum; partNumber++) {
      const exitPart = (exitPartList || []).find(exitPart => exitPart.partNumber == partNumber)
      if (exitPart) {
        // 分片已上传完成，累计到上传完成的总额中,同时记录一下上次断点上传的大小，用于计算上传速度
        lastUploadedSize += new Number(exitPart.size)
        updateProcess(exitPart.size)
      } else {
        queue.push(() => uploadNext(partNumber).then(res => {
          // 单片文件上传完成再更新上传进度
          updateProcess(res.uploadedSize)
        }))
      }
    }
    console.log(queue)
    if (queue.getLength() == 0) {
      // 所有分片都上传完，但未合并，直接return出去，进行合并操作
      console.log(failArr)
      resolve(failArr);
      return;
    }
    queue.start()
  })
}

const uploadFileToServe = (file, md5) => {
  const data = new FormData()
  data.append('file', file)
  data.append('md5', md5)
  uploadFile(data).then(res => {
    const result = getAPIResponse(res)
    console.log(result)
    message.success(result)
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

const handleChangePage = (page, size) => {
  pageStatus.value = 'list'
  pagination.current = page
  pagination.size = size.toString()
  initList()
}

const pagination = reactive( {
  current: 1,
  size: '10',
  showSizeChanger: true,
  showQuickJumper: true,
  onChange: handleChangePage
})

const getStatusInfo = (id) => {
  switchHandler('analysis')
  getAnalysisResult({archiveTaskId: id}).then(res => {
    const result = getAPIResponse(res)
    console.log(result)
    analysisInfo.value = result
  })
}

const switchHandler = (status) => {
  analysisInfo.value = null
  pageStatus.value = status
  if (status === 'list') {
    initList()
  }
}


defineExpose({
  openModal,
  uploadCallback,
  uploadCancel,
});

</script>

<style scoped>
@import "@/assets/main.css";
</style>
<style lang="scss">
.uploadBox {
  .ant-upload-hint {
    font-size: 18px;
    text-align: center;
    margin-bottom: 20px;
    .anticon {
      margin-right: 4px;
    }
  }


  .ant-upload {
    background-color: #444648;
    border-color: #7c7c7c !important;
    .ant-upload-btn {
      padding: 48px 0;
    }
    &:hover {
      background-color: #646869;
      border-color: white !important;
    }
    .ant-upload-drag-icon {
      .anticon {
        color: white !important;
      }
    }
    .ant-upload-text {
      color: white !important;
    }
    .ant-spin {
      margin-top: 16px;
      color: white;
    }
  }
  .uploadProcess {
    width: 80% !important;
    .ant-progress-text {
      color: white;
    }
  }
}

.uploadTable {
  .ant-table {
    //height: 84vh !important;
    background-color: #2c2e30;
    color: white;
    padding: 4px;
    table {
      border-collapse: collapse;
    }
    .ant-table-thead > tr > th {
      color: white;
      background-color: #1d1f21;
      //border: none;
      &:not(.ant-table-selection-column) {
        padding: 16px 0;
        border-bottom: none;
      }
      .ant-checkbox {
        top: 36px;
      }
    }
    .ant-table-tbody {
      .statusBox {
        display: flex;
        .icon {
          &:hover {
            box-shadow: white;
          }
          cursor: pointer;
        }
        .txt {
          margin-right: 4px;
          &.tinyGap {
            margin-right: 2px;

          }
        }
      }
    }
    .ant-table-tbody > tr:hover > td {
      background: #515e5e;
      color: white;
    }
    .ant-table-tbody > tr {
      border: 1px solid #484848;
      td {
        background-color: #2c2e30;
      }
    }
    .ant-table-row {
      td {
        border: none;
      }
      .ant-table-cell-row-hover {
        background-color: #515e5e;
      }
      &:hover {
        td {
          background-color: #515e5e;
        }
      }
    }
    .ant-table-cell.ant-table-selection-column {
      padding-left: 24px;
    }
  }
  .ant-pagination {
    .ant-pagination-item-link {
      background-color: #2c2e30;
      color: white;
      .ant-pagination-item-ellipsis {
        color: white;

      }
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
        background-color: #2c2e30 !important;
        border: 1px solid #64686d !important;
        color: white;
      }
      .ant-select-arrow {
        background-color: #242c2c;
        color: white;
      }
      .ant-pagination-options-quick-jumper {
        color: white;
        input {
          background-color: #2c2e30;
          color: white;
        }
      }
    }
  }
}
.analysisArea {
  min-height: 500px;
  .analysisBox {
    border: 1px solid #7c7c7c;
    padding: 12px;
    height: 500px;
    overflow-y: scroll;
    .title {
      font-size: 16px;
      display: flex;
      margin-bottom: 12px;
      .anticon {
        padding-top: 2px;
        font-size: 18px;
        margin-right: 4px;
      }
    }
    .strong {
      color: yellow;
      font-weight: bold;
    }
    .info {
      font-size: 15px;
    }
    .data {
      margin-bottom: 12px;
      padding-left: 21px;
    }
    .description {
      padding-left: 21px;
      .subTitle {
        font-size: 15px;
      }
      .info {
        margin-bottom: 6px;
      }
    }
  }
}
</style>
