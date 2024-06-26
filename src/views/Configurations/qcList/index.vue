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
                      <a-button type="primary">文件上传</a-button>
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
                <div>待测物质荷比</div>
                <div>内标质荷比</div>
                <div>质量精度(ppm)</div>
                <div>浓度</div>
                <em style="width: 30%"></em>
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
                      <a-button type="primary">文件上传</a-button>
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
import { getUserList, getDeptTree } from "@/api";
import ConfirmModal from "../confirmModal";

import breadcrumb from "../breadcrumb.vue";

const IconFont = createFromIconfontCN({
  scriptUrl: IconFontUrl,
});

const tableOneData = ref([
  {
    id: 1,
    name: "尿酸",
    targetValue: 114,
    actualValue: 5.55,
    qualityState: "是",
    time: "2024/05/16 14:45",
  },
  {
    id: 2,
    name: "肌酐",
    targetValue: 224,
    actualValue: 5.55,
    qualityState: "是",
    time: "2024/05/16 14:45",
  },
  {
    id: 3,
    name: "苯丙氨酸",
    targetValue: 334,
    actualValue: 5.55,
    qualityState: "是",
    time: "2024/05/16 14:45",
  },
  {
    id: 4,
    name: "肌酐",
    targetValue: 224,
    actualValue: 5.55,
    qualityState: "是",
    time: "2024/05/16 14:45",
  },
  {
    id: 5,
    name: "苯丙氨酸",
    targetValue: 334,
    actualValue: 5.55,
    qualityState: "是",
    time: "2024/05/16 14:45",
  },
]);

const tableTwoData = ref([
  {
    id: 1,
    name: "尿酸",
    targetValue: 114,
    actualValue: 5.55,
    qualityState: "是",
    time: "2024/05/16 14:45",
  },
  {
    id: 2,
    name: "肌酐",
    targetValue: 224,
    actualValue: 5.55,
    qualityState: "是",
    time: "2024/05/16 14:45",
  },
  {
    id: 3,
    name: "苯丙氨酸",
    targetValue: 334,
    actualValue: 5.55,
    qualityState: "是",
    time: "2024/05/16 14:45",
  },
  {
    id: 4,
    name: "苯丙氨酸",
    targetValue: 334,
    actualValue: 5.55,
    qualityState: "是",
    time: "2024/05/16 14:45",
  },
  {
    id: 5,
    name: "苯丙氨酸",
    targetValue: 334,
    actualValue: 5.55,
    qualityState: "是",
    time: "2024/05/16 14:45",
  },
]);

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
