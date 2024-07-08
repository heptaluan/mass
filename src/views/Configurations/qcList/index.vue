<template>
  <div>
    <breadcrumb :title="'质控管理'" />
    <div class="area">
      <div class="tableArea">
        <div className="quality-contetn">
          <div className="left-box">
            <div className="sub-title">
              <span>低值质控</span>
              <em>存在失控数据，请检查后重新上传</em>
            </div>

            <div className="table-content">
              <div className="tible-title">
                <div>检测项目</div>
                <div>靶值</div>
                <div>实测值</div>
                <div>质控状态</div>
                <div>操作时间</div>
                <div>选择文件</div>
              </div>
              <div>
                <div v-for="item in tableOneData" :key="item.id">
                  <div className="table-list">
                    <div>{{ item.name }}</div>
                    <div class="targer-box">
                      <a-input-number
                        :value="item.targetValue"
                        style="width: 70"
                        disabled
                      />
                      mmol/L
                    </div>
                    <div class="targer-box">
                      <a-input-number
                        :value="item.actualValue"
                        style="width: 70"
                        disabled
                      />
                      mmol/L
                    </div>
                    <div>{{ item.qualityState }}</div>
                    <div className="time-box">{{ item.time }}</div>
                    <div className="upload-box">
                      <a-upload
                        name="file"
                        accept=".txt"
                        @change="handleChange"
                        :before-upload="beforeUpload"
                        :customRequest="(e) => handleUpload(e, item.id, 'L')"
                        :multiple="true"
                        :show-upload-list="false"
                      >
                        <a-button class="submitBtn">
                          <span> 上 传 </span>
                        </a-button>
                      </a-upload>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="right-box">
            <div className="sub-title">高值质控</div>

            <div className="table-content">
              <div className="tible-title">
                <div>检测项目</div>
                <div>靶值</div>
                <div>实测值</div>
                <div>质控状态</div>
                <div>操作时间</div>
                <div>选择文件</div>
              </div>
              <div>
                <div v-for="item in tableOneData" :key="item.id">
                  <div className="table-list">
                    <div>{{ item.name }}</div>
                    <div class="targer-box">
                      <a-input-number
                        :value="item.targetValue"
                        style="width: 70"
                        disabled
                      />
                      mmol/L
                    </div>
                    <div class="targer-box">
                      <a-input-number
                        :value="item.actualValue"
                        style="width: 70"
                        disabled
                      />
                      mmol/L
                    </div>
                    <div>{{ item.qualityState }}</div>
                    <div className="time-box">{{ item.time }}</div>
                    <div className="upload-box">
                      <a-upload
                        name="file"
                        accept=".txt"
                        @change="handleChange"
                        :before-upload="beforeUpload"
                        :customRequest="(e) => handleUpload(e, item.id, 'L')"
                        :multiple="true"
                        :show-upload-list="false"
                      >
                        <a-button class="submitBtn">
                          <span> 上 传 </span>
                        </a-button>
                      </a-upload>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
import { getQCList, getItemMap } from "@/api";
import ConfirmModal from "../confirmModal";
import breadcrumb from "../breadcrumb.vue";
import dayjs from "dayjs";

const IconFont = createFromIconfontCN({
  scriptUrl: IconFontUrl,
});

const tableOneData = ref([]);

const tableTwoData = ref([]);

const itemType = ref({});

onMounted(() => {
  initList();
});

const initList = (status, page) => {
  getItemMap({ type: "ms_quality_status" }).then((res) => {
    const result = getAPIResponse(res);
    if (result) {
      itemType.value = result;
      handleGetQCList();
    }
  });
};

const handleGetQCList = () => {
  getQCList().then((res) => {
    const result = getAPIResponse(res);
    if (result) {
      for (let i = 0; i < result.length; i++) {
        tableOneData.value.push({
          id: i,
          name: result[i].itemName,
          targetValue: result[i].targetValueL,
          actualValue: result[i].actualValueL,
          qualityState: itemType.value[result[i].qualityControlL],
          time: result[i].operTimeL,
        });
        tableTwoData.value.push({
          id: i,
          name: result[i].itemName,
          targetValue: result[i].targetValueH,
          actualValue: result[i].actualValueH,
          qualityState: itemType.value[result[i].qualityControlH],
          time: result[i].operTimeH,
        });
      }
    }
  });
};

// 上传
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
  // if (fileList.length !== 3) {
  //   message.error("只能同时上传三个文件");
  //   return false;
  // }

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
};

const handleUpload = (file, item) => {
  console.log(file);
  const reader = new FileReader()
  reader.readAsText(file.file)
  reader.onloadend = (e) => {
    console.log(reader.result);
  }
};

// 跳转
const jumpTo = () => {
  router.push({ name: "patientList" });
};
</script>

<style scoped>
@import "@/assets/main.css";
</style>
<style scoped lang="scss">
.area {
  .tableArea {
    width: 100%;
    position: relative;
    z-index: 2;

    .quality-contetn {
      width: 100%;
      display: flex;
      justify-content: space-around;

      .left-box,
      .right-box {
        width: 49%;
        margin: 15px;
        padding: 25px;
        color: #fff;
      }

      &::-webkit-scrollbar {
        width: 6px;
        height: 1px;
      }

      &::-webkit-scrollbar-thumb {
        border-radius: 10px;
        box-shadow: inset 0 0 5px rgb(231, 232, 233);
        background: rgb(231, 232, 233);
      }

      &::-webkit-scrollbar-track {
        box-shadow: inset 0 0 5px rgb(231, 232, 233);
        border-radius: 10px;
        background: #ededed;
      }

      .sub-title {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 15px;

        em {
          font-size: 12px;
          color: rgb(255, 153, 0);
          margin-left: 15px;
        }
      }

      .table-content {
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

          .targer-box {
            display: flex;
            align-items: center;
          }

          .time-box {
            font-weight: normal;
            font-size: 14px;
            color: rgb(103, 194, 58);
          }

          .upload-box {
            justify-content: center;
          }
        }
      }
    }
  }
}
</style>
