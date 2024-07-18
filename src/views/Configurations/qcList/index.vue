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
                    <div>{{ item.itemName }}</div>
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
                      <div class="upload-box">
                        <input
                          type="file"
                          name="upload"
                          id="upload"
                          accept=".txt"
                          @change="(e) => handleUpload(e, item.id, 'L')"
                          multiple
                        />
                        <label or="upload">上传</label>
                      </div>
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
                    <div>{{ item.itemName }}</div>
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
                      <div class="upload-box">
                        <input
                          type="file"
                          name="upload"
                          id="upload"
                          accept=".txt"
                          @change="(e) => handleUpload(e, item.id, 'H')"
                          multiple
                        />
                        <label for="upload">上传</label>
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
import { getQCList, getItemMap, updateQCList } from "@/api";
import ConfirmModal from "../confirmModal";
import breadcrumb from "../breadcrumb.vue";
import dayjs from "dayjs";
import { divide, mean, std, abs, multiply, round } from "mathjs";

const IconFont = createFromIconfontCN({
  scriptUrl: IconFontUrl,
});

const tableList = ref([]);
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
      tableOneData.value = [];
      tableTwoData.value = [];
      for (let i = 0; i < result.length; i++) {
        tableList.value = result;
        tableOneData.value.push({
          id: result[i].id,
          itemName: result[i].itemName,
          targetValue: result[i].targetValueL,
          actualValue: result[i].actualValueL,
          qualityState: itemType.value[result[i].qualityControlL],
          time: result[i].operTimeL,
        });
        tableTwoData.value.push({
          id: result[i].id,
          itemName: result[i].itemName,
          targetValue: result[i].targetValueH,
          actualValue: result[i].actualValueH,
          qualityState: itemType.value[result[i].qualityControlH],
          time: result[i].operTimeH,
        });
      }
    }
  });
};

const ppm = 2000;

const searchIntensity = (da, dataList) => {
  let range = multiply(divide(ppm, 1000000), da);
  let intensity = 0;
  for (let item of dataList) {
    let targetDa = parseFloat(item[0]);
    let targetIntensity = parseFloat(item[1]);
    if (abs(targetDa - da) <= range && intensity <= targetIntensity) {
      intensity = targetIntensity;
    }
  }
  return round(intensity, 2);
};

const fileList = ref([]);

// 是否失控状态
let status = ref();

// 系数
let coefficient = 1;

const handleUpload = async (event, id, target) => {
  const files = event.target.files;

  for (let i = 0; i < files.length; i++) {
    if (files[i].type !== "text/plain") {
      message.error("只能上传Txt文件");
      event.target.value = null;
      return false;
    }

    if (files[i].size > 5 * 1024 * 1024) {
      message.error("文件必须小于 5M!");
      event.target.value = null;
      return false;
    }
  }

  const uploadList = [];

  const readFileAsync = (file) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = (evt) =>
        resolve(
          evt.target.result.split(/\r\n/).map((item) => item.split(/\s+/))
        );
    });

  for (let i = 0; i < files.length; i++) {
    const list = await readFileAsync(files[i]);
    for (let i = 0; i < list.length; i++) {
      uploadList.push(list[i]);
    }
  }

  event.target.value = null;

  // 当前所选项
  const targetItem = tableList.value.find((val) => val.id === id);

  // 待测物（相对强度1）
  const da1 = targetItem.analytes;
  // 内标物（相对强度2）
  const da2 = targetItem.internalStandard;

  let da1Intensity = searchIntensity(da1, uploadList);
  let da2Intensity = searchIntensity(da2, uploadList);

  // =====================================================
  // =====================================================

  // 内标浓度
  const internalConcentration = targetItem.internalConcentration;

  // 实测值
  let actualValue = internalConcentration * (da1Intensity / da2Intensity);

  // 当前靶值（L 低值，H 高值）
  let targetValue = "";
  if (target === "L") {
    targetValue = targetItem.targetValueL;
  } else if (target === "H") {
    targetValue = targetItem.targetValueH;
  }

  // 计算相对偏差
  // 计算实测值（真实）与靶值的相对偏差，判断相对偏差是否在±20%，如果相对偏差在±20%（含20%）以内，则不进行系数矫正，实测值（真实）=实测值；
  // 当相对偏差在±20~50%（不含50%）时需进行系数校准，系数与实测值均保留2位小数。
  const relativeDeviation = (targetValue - actualValue) / actualValue;

  if (abs(relativeDeviation) <= 0.2) {
    // 状态-否（实测值不作处理）
    status.value = "02";

    // 系数取 1
    coefficient = 1;
  } else if (abs(relativeDeviation) > 0.2 && abs(relativeDeviation) < 0.5) {
    // 计算系数
    coefficient = targetValue / actualValue;

    // 系数校准
    actualValue = actualValue * coefficient;

    // 状态-是
    status.value = "01";
  } else if (abs(relativeDeviation) >= 0.5) {
    // 舍弃
    actualValue = 0;

    // 状态-失控
    status.value = "03";

    // 系数不传
    coefficient = 0;
  }

  // 提交数据
  const params = {
    actualValue: round(actualValue, 2),
    coefficient: round(coefficient, 2),
    id: id,
    lowOrHigh: target,
    qualityControl: status.value,
  };

  updateQCList(params).then((res) => {
    const result = getAPIResponse(res);
    if (result) {
      message.success(result);
      // 刷新列表
      handleGetQCList();
    }
  });
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

    // 上传按钮
    .upload-box {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;

      input {
        opacity: 0;
        position: absolute;
        width: 100%;
        height: 100%;
        cursor: pointer;
      }

      label {
        width: 90px;
        height: 30px;
        line-height: 30px;
        font-size: 14px;
        background-color: rgb(24, 144, 255);
        border-radius: 4px;
      }
    }
  }
}
</style>
