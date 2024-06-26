<template>
  <div class="side-bar-box">
    <div class="node-list">
      <div class="header">结节列表</div>
      <div class="content">
        <div class="table-title">
          <div class="check-box">
            <!-- <a-checkbox disabled style="color: #fff">全选</a-checkbox> -->
          </div>
          <div class="search-box">
            <div class="icon-box">
              <MenuFoldOutlined />
            </div>
            <a-select
              style="width: 85px"
              :size="'small'"
              placeholder="请选择排序条件"
              :value="sortVal"
              @change="handleSortValChange"
            >
              <a-select-option value="序号">序号</a-select-option>
              <a-select-option value="IM">IM</a-select-option>
              <a-select-option value="大小">大小</a-select-option>
              <a-select-option value="左右">左右</a-select-option>
              <a-select-option value="密度">密度</a-select-option>
            </a-select>
            <div class="icon-box">
              <FunnelPlotOutlined />
            </div>
            <a-select
              style="width: 90px"
              :size="'small'"
              placeholder="请选择类型"
              :value="typeFilterVal"
              @change="handleTypeFilterValChange"
            >
              <a-select-option value="全部">全部</a-select-option>
              <a-select-option value="实性">实性</a-select-option>
              <a-select-option value="部分实性">部分实性</a-select-option>
              <a-select-option value="磨玻璃">磨玻璃</a-select-option>
            </a-select>
            <a-select
              :style="{ width: '70px', 'margin-left': '5px' }"
              :size="'small'"
              placeholder="请选择大小"
              :value="sizeFilterVal"
              @change="handleSizeFilterValChange"
            >
              <a-select-option value="≥1mm">≥1mm</a-select-option>
              <a-select-option value="≥2mm">≥2mm</a-select-option>
              <a-select-option value="≥3mm">≥3mm</a-select-option>
              <a-select-option value="≥4mm">≥4mm</a-select-option>
              <a-select-option value="≥5mm">≥5mm</a-select-option>
              <a-select-option value="≥6mm">≥6mm</a-select-option>
            </a-select>
          </div>
        </div>
        <ul
          class="table-content"
          :style="{
            maxHeight: props.isVertical ? '432px' : `${(wh - 150) / 2}px`,
          }"
        >
          <li
            v-for="(item, index) in newNodeList.value"
            :key="index"
            :class="{ active: item.checked }"
          >
            <template v-if="item.checked === true">
              <div class="li-wrap" @click="(e) => handleNodeListClick(e, item)">
                <div class="check-box">
                  <span class="list-index">{{ item.orderNum }}</span>
                  <!-- <a-checkbox :checked="item.checked" style="color: #fff">{{
                    index + 1
                  }}</a-checkbox> -->
                </div>
                <div class="image-index-box">
                  <span class="index">IM{{ item.centerFrame }}</span>
                  <span class="node-size">{{ item.size }}mm³</span>
                </div>
                <div class="size-box">
                  <template v-if="Number(item.width) > Number(item.height)">
                    <div class="size-content">
                      <a-input-number
                        :min="minWindow"
                        :max="maxWindow"
                        :size="'small'"
                        :step="0.01"
                        :style="{ width: '50px' }"
                        :value="item.width"
                        :controls="false"
                        :keyboard="true"
                        @pressEnter="pressFunc"
                        @blur="
                          (e) => editNode(e, item.boxVO.annotationUID, 'width')
                        "
                      />
                      x
                      <a-input-number
                        :min="minWindow"
                        :max="maxWindow"
                        :size="'small'"
                        :step="0.01"
                        :style="{ width: '50px' }"
                        :value="item.height"
                        :controls="false"
                        :keyboard="true"
                        @pressEnter="pressFunc"
                        @blur="
                          (e) => editNode(e, item.boxVO.annotationUID, 'height')
                        "
                      />
                      mm
                    </div>
                  </template>
                  <template v-else>
                    <div class="size-content">
                      <a-input-number
                        :min="minWindow"
                        :max="maxWindow"
                        :size="'small'"
                        :step="0.01"
                        :style="{ width: '50px' }"
                        :value="item.height"
                        :controls="false"
                        :keyboard="true"
                        @pressEnter="pressFunc"
                        @blur="
                          (e) => editNode(e, item.boxVO.annotationUID, 'height')
                        "
                      />
                      x
                      <a-input-number
                        :min="minWindow"
                        :max="maxWindow"
                        :size="'small'"
                        :step="0.01"
                        :style="{ width: '50px' }"
                        :value="item.width"
                        :controls="false"
                        :keyboard="true"
                        @pressEnter="pressFunc"
                        @blur="
                          (e) => editNode(e, item.boxVO.annotationUID, 'width')
                        "
                      />
                      mm
                    </div>
                  </template>
                  <div class="lung-content">
                    <a-select
                      :value="item.location"
                      :style="{ width: '145px' }"
                      :size="'small'"
                      @change="
                        (val) =>
                          handleNodeListChange(
                            val,
                            item.boxVO.annotationUID,
                            'location'
                          )
                      "
                    >
                      <a-select-option value="右肺上叶（RUL）"
                        >右肺上叶（RUL）</a-select-option
                      >
                      <a-select-option value="右肺中叶（RML）"
                        >右肺中叶（RML）</a-select-option
                      >
                      <a-select-option value="右肺下叶（RLL）"
                        >右肺下叶（RLL）</a-select-option
                      >
                      <a-select-option value="左肺上叶（LUL）"
                        >左肺上叶（LUL）</a-select-option
                      >
                      <a-select-option value="左肺下叶（LLL）"
                        >左肺下叶（LLL）</a-select-option
                      >
                    </a-select>
                  </div>
                </div>
                <div class="type-box">
                  <span class="hu-content">{{ item.hu }}HU</span>
                  <a-select
                    :value="item.featuresType"
                    :style="{ width: '90px' }"
                    :size="'small'"
                    @change="
                      (val) =>
                        handleNodeListChange(
                          val,
                          item.boxVO.annotationUID,
                          'featuresType'
                        )
                    "
                  >
                    <a-select-option value="实性">实性</a-select-option>
                    <a-select-option value="部分实性">部分实性</a-select-option>
                    <a-select-option value="磨玻璃">磨玻璃</a-select-option>
                  </a-select>
                </div>
              </div>
              <div class="del-box">
                <!-- <div
                  class="risk-box"
                  :class="{
                    high: Number(item.aiResult) >= 50,
                    low: Number(item.aiResult) < 50,
                  }"
                >
                  {{ computedAiResult(item.aiResult) }}
                </div> -->
                <div class="icon-box">
                  <a-popconfirm
                    title="是否确定删除该结节？"
                    ok-text="确定"
                    cancel-text="取消"
                    @confirm="(e) => handleNodeListDel(e, item)"
                    placement="topRight"
                  >
                    <DeleteOutlined :style="{ fontSize: '20px' }" />
                  </a-popconfirm>
                </div>
              </div>
            </template>

            <template v-else>
              <div class="li-wrap" @click="(e) => handleNodeListClick(e, item)">
                <div class="check-box">
                  <span class="list-index">{{ item.orderNum }}</span>
                  <!-- <a-checkbox style="color: #fff">{{ index + 1 }}</a-checkbox> -->
                </div>
                <div class="image-index-box">
                  <span class="index">IM{{ item.centerFrame }}</span>
                  <span class="node-size">{{ item.size }}mm³</span>
                </div>
                <div class="size-box">
                  <template v-if="Number(item.width) > Number(item.height)">
                    <div class="size-content">
                      <span>{{ Number(item.width).toFixed(2) }}</span>
                      x
                      <span>{{ Number(item.height).toFixed(2) }}</span>
                      mm
                    </div>
                  </template>
                  <template v-else>
                    <div class="size-content">
                      <span>{{ Number(item.height).toFixed(2) }}</span>
                      x
                      <span>{{ Number(item.width).toFixed(2) }}</span>
                      mm
                    </div>
                  </template>
                  <div class="lung-content">
                    <span>{{ item.location }}</span>
                  </div>
                </div>
                <div class="type-box">
                  <span class="hu-content">{{ item.hu }}HU</span>
                  <span>{{ item.featuresType }}</span>
                </div>
              </div>
              <div class="del-box">
                <!-- <div
                  class="risk-box"
                  :class="{
                    high: Number(item.aiResult) >= 50,
                    low: Number(item.aiResult) < 50,
                  }"
                >
                  {{ computedAiResult(item.aiResult) }}
                </div> -->
                <div class="icon-box">
                  <a-popconfirm
                    title="是否确定删除该结节？"
                    ok-text="确定"
                    cancel-text="取消"
                    @confirm="(e) => handleNodeListDel(e, item)"
                    placement="topRight"
                  >
                    <DeleteOutlined :style="{ fontSize: '20px' }" />
                  </a-popconfirm>
                </div>
              </div>
            </template>
          </li>
        </ul>
      </div>
    </div>
    <div class="pcr-list">
      <div class="header">PCR信息</div>
      <div
        class="content"
        :style="{
          maxHeight: props.isVertical ? '100%' : `${(wh - 150) / 4}px`,
        }"
      >
        <template v-if="pcrContent.sampleCode">
          <div class="pcr-content">
            <div><span>样本名称：</span>{{ pcrContent.sampleCode }}</div>
            <div class="pcr-wrap">
              <div><span>ARL9：</span>{{ pcrContent.a }}</div>
              <div>
                <div><span>PTGER4：</span>{{ pcrContent.ptger4 }}</div>
              </div>
            </div>
            <div class="pcr-wrap">
              <div><span>RASSF1A：</span>{{ pcrContent.r }}</div>
              <div><span>APC：</span>{{ pcrContent.apc }}</div>
            </div>
            <div class="pcr-wrap">
              <div><span>SHOX2：</span>{{ pcrContent.s }}</div>
              <div><span>PCDHGC5：</span>{{ pcrContent.pcdhgc5 }}</div>
            </div>
            <div class="pcr-wrap">
              <div><span>ACTB：</span>{{ pcrContent.actb }}</div>
              <div><span>ACTB2：</span>{{ pcrContent.actb2 }}</div>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="tips">暂无 PCR 信息</div>
        </template>
      </div>
    </div>
    <div class="result-list">
      <div class="header">融合结果</div>
      <div
        class="content"
        :style="{
          maxHeight: props.isVertical ? '100%' : `${(wh - 150) / 4}px`,
        }"
      >
        <template v-if="props.pcrContent?.sampleResult">
          <div class="result-title">
            <div>
              检测结果：<span style="color: #ff4d4f">{{
                Number(props.pcrContent.sampleResult) === 0 ? "阴性" : "阳性"
              }}</span>
              <!-- ，综合分值：<span style="color: #ff4d4f"
                >{{
                  Number(props.pcrContent.sampleMarks * 100).toFixed(1)
                }}
                %</span -->
            </div>
            <div>AI结果仅供参考，诊断需结合医生结论</div>
          </div>
        </template>
        <template v-else>
          <div class="tips">暂无融合结果信息</div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  computed,
  defineProps,
  defineEmits,
  ref,
  onMounted,
  watch,
  onUnmounted,
} from "vue";
import { updateNodule } from "@/api";
import { getAPIResponse } from "@/utils/apiTools/useAxiosApi";
import { message } from "ant-design-vue";
import {
  MenuFoldOutlined,
  FunnelPlotOutlined,
  DeleteOutlined,
} from "@ant-design/icons-vue";

const props = defineProps(["nodeList", "pcrContent", "isVertical"]);
const emit = defineEmits(["nodeListClick", "nodeListDel", "nodeListChange"]);

// 视窗高度
const wh = ref(document.documentElement.clientHeight);

// 筛选与过滤
const sortVal = ref("大小");
const typeFilterVal = ref("全部");
const sizeFilterVal = ref("≥1mm");
const newNodeList = ref([]);
const maxWindow = 999;
const minWindow = 1;

watch(
  () => props.nodeList,
  () => {
    if (props.nodeList.length > 0) {
      handleSortValChange(sortVal.value);
    }
  },
  { deep: true }
);

onMounted(() => {
  onResize();
  window.addEventListener("resize", onResize);
  if (props.nodeList.length > 0) {
    handleSortValChange("大小");
  }
});

onUnmounted(() => {
  window.removeEventListener("resize", onResize);
});

const onResize = () => {
  wh.value = document.documentElement.clientHeight;
};

// 计算风险
const computedAiResult = (val) => {
  if (Number(val) >= 50) {
    return "高风险";
  } else if (Number(val) < 50) {
    return "低风险";
  }
};

const handleSortValChange = (val) => {
  sortVal.value = val;
  newNodeList.value = computed(() => {
    if (typeFilterVal.value === "全部") {
      return [...props.nodeList]
        .filter(
          (v) =>
            Math.max(
              ...[Math.abs(Number(v.width)), Math.abs(Number(v.height))]
            ) >= Number(sizeFilterVal.value.replace(/[^\d]/g, ""))
        )
        .sort(compare(val));
    } else {
      return [...props.nodeList]
        .filter((v) => v.featuresType === typeFilterVal.value)
        .sort(compare(val));
    }
  });
};

const handleTypeFilterValChange = (val) => {
  typeFilterVal.value = val;
};

const handleSizeFilterValChange = (val) => {
  sizeFilterVal.value = val;
};

// 排序
const compare = (val) => {
  switch (val) {
    case "序号":
      return function (obj1, obj2) {
        const val1 = Number(obj1["orderNum"]);
        const val2 = Number(obj2["orderNum"]);
        if (val1 < val2) {
          return -1;
        } else if (val1 > val2) {
          return 1;
        } else {
          return 0;
        }
      };
    case "IM":
      return function (obj1, obj2) {
        const val1 = Number(obj1["centerFrame"]);
        const val2 = Number(obj2["centerFrame"]);
        if (val1 < val2) {
          return 1;
        } else if (val1 > val2) {
          return -1;
        } else {
          return 0;
        }
      };
    case "大小":
      return function (obj1, obj2) {
        const val1 = Math.max(...[obj1["width"], obj1["height"]]);
        const val2 = Math.max(...[obj2["width"], obj2["height"]]);
        if (val1 < val2) {
          return 1;
        } else if (val1 > val2) {
          return -1;
        } else {
          return 0;
        }
      };
    case "左右":
      return function (obj1, obj2) {
        const val1 = obj1["location"];
        const val2 = obj2["location"];
        if (val1 < val2) {
          return 1;
        } else if (val1 > val2) {
          return -1;
        } else {
          return 0;
        }
      };
    case "密度":
      return function (obj1, obj2) {
        const val1 = obj1["hu"];
        const val2 = obj2["hu"];
        if (val1 < val2) {
          return 1;
        } else if (val1 > val2) {
          return -1;
        } else {
          return 0;
        }
      };

    default:
      break;
  }
};

// 通知父组件
const handleNodeListClick = (e, item) => {
  emit("nodeListClick", item);
};

// 删除结节
const handleNodeListDel = (e, item) => {
  emit("nodeListDel", item);
};

// 结节属性修改
const handleNodeListChange = (value, id, type) => {
  if (props.pcrContent.sampleCode) {
    window.showUpadtePCRContentConfirm(() => {
      window.clearPCRContent();
      emit("nodeListChange", value, id, type);
      editNode(value, id, type);
    });
  } else {
    emit("nodeListChange", value, id, type);
    editNode(value, id, type);
  }
};

const pressFunc = (e) => {
  e.target.blur();
};

const editNode = (value, id, type) => {
  if (type === "width" || type === "height") {
    const inputValue = Number(value.target.value);
    if (inputValue >= minWindow && inputValue <= maxWindow) {
      let fixedNumber = inputValue >= 1 ? inputValue.toFixed(2) : 1;
      if (fixedNumber < 1) {
        fixedNumber = 1;
      }
      emit("nodeListChange", fixedNumber, id, type);
    } else {
      return;
    }
  }
  const item = props.nodeList.find((item) => item.boxVO.annotationUID === id);
  updateNodule(item).then((res) => {
    const result = getAPIResponse(res);
    if (result.id) {
      message.success("修改成功");
    } else {
      message.warning("修改失败，请重新尝试");
    }
  });
};
</script>

<style scoped lang="scss">
.side-bar-box {
  width: 450px;
  min-width: 450px;
  display: flex;
  flex-direction: column;
  font-size: 16px;

  .node-list,
  .pcr-list {
    width: 100%;
    height: auto;
    border-bottom: 2px solid #000;
  }

  .pcr-list {
    max-height: 200px;
  }

  .result-list {
    width: 100%;
    height: 100%;
    max-height: 200px;

    .content {
      padding: 0 10px;
      height: 100%;
      min-height: 120px;
      display: flex;
      align-items: center;
      justify-content: center;

      .result-title {
        height: 120px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        div {
          height: 35px;

          &:first-child {
            font-size: 18px;
          }

          &:last-child {
            font-size: 14px;
          }
        }
      }

      .result-explain {
        margin-bottom: 10px;
      }

      ul > li {
        margin-bottom: 5px;
      }
    }
  }

  .node-list {
    flex: 4;
  }
  .pcr-list {
    flex: 2;
  }

  .result-list {
    flex: 2;
  }

  .header {
    height: 25px;
    line-height: 25px;
    background: rgb(79, 83, 85);
    text-align: center;
  }

  // ===============================================
  .table-title {
    color: #fff;
    display: flex;
    justify-content: space-between;
    padding: 2px 5px;
    margin: 1px 0;
    font-size: 14px;
    background: rgb(79, 83, 85);

    .search-box {
      display: flex;
      flex-direction: row;
      align-items: center;

      .icon-box {
        margin: 0 5px;
      }
    }
  }

  .table-content {
    overflow-y: auto;
    // max-height: 300px;
    // min-height: 300px;

    li {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      padding: 3px 5px;
      border-bottom: 1px solid rgb(61, 64, 69);
      cursor: pointer;
      font-size: 14px;

      &.active {
        border: 1px solid rgb(208, 209, 210);
        background: rgb(79, 83, 85);
      }
    }

    .li-wrap {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      width: 100%;
    }

    .check-box {
      display: flex;
      align-items: center;
      min-width: 25px;

      .list-index {
        width: 25px;
        text-align: center;
      }
    }

    .image-index-box {
      display: flex;
      flex-direction: column;
      text-align: center;
      justify-content: space-evenly;
      min-width: 85px;

      .index,
      .node-size {
        height: 25px;
        line-height: 25px;
      }
    }

    .size-box {
      display: flex;
      flex-direction: column;
      justify-content: space-evenly;
      min-width: 145px;

      .size-content {
        margin-bottom: 2px;
        .ant-input {
          &:focus {
            color: white !important;
          }
        }
      }
    }

    .type-box {
      display: flex;
      flex-direction: column;
      justify-content: space-evenly;
      min-width: 95px;

      .hu-content {
        height: 25px;
        line-height: 25px;
      }
    }

    .del-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-width: 55px;
      padding-top: 6px;
      cursor: default;

      .risk-box {
        padding: 3px 4px;
        margin-bottom: 5px;

        &.low {
          color: #52c41a;
          background: #f6ffed;
          border: 1px solid #b7eb8f;
          border-radius: 2px;
        }

        &.high {
          color: #f5222d;
          background: #fff1f0;
          border: 1px solid #ffa39e;
          border-radius: 2px;
        }
      }
    }
  }

  .pcr-title {
    color: #fff;
    display: flex;
    justify-content: flex-end;
    padding: 2px 5px;
    margin: 3px 0;
  }

  .pcr-header {
    background: rgb(79, 83, 85);
    height: 25px;
    line-height: 25px;
  }

  .pcr-list {
    .content {
      height: calc(100% - 25px);
      min-height: 150px;
      display: flex;
      align-items: center;
      justify-content: center;

      .pcr-content {
        font-size: 14px;
        width: 265px;

        .pcr-wrap {
          display: flex;
          justify-content: space-between;
          margin: 3px 0;
        }

        span {
          min-width: 75px;
          display: inline-block;
          text-align: right;
          margin: 6px 0;
        }
      }
    }
  }

  .tips {
    font-size: 16px;
  }
}

.side-bar-box .icon-box :deep(.anticon) {
  font-size: 16px;
  cursor: pointer;
}

.table-content {
  &::-webkit-scrollbar {
    width: 10px;
    height: 1px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 10px;
    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    background: rgb(79, 83, 85);
  }

  &::-webkit-scrollbar-track {
    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    background: #ededed;
  }
}
</style>
<style lang="scss">
.side-bar-box {
  .ant-select-selector {
    font-size: 14px;
    height: 20px !important;
    padding: 0 3px !important;

    .ant-select-selection-search-input {
      height: 18px !important;
    }

    .ant-select-selection-item,
    .ant-select-selection-placeholder {
      font-size: 14px !important;
      line-height: 18px !important;
    }

    .ant-select-arrow {
      right: 5px !important;
    }
  }

  .ant-input {
    font-size: 14px;
    padding: 0px 5px !important;
  }

  .ant-checkbox-disabled + span {
    color: #ccc;
    font-size: 14px;
  }
}

.ant-select-item {
  font-size: 14px !important;
}
</style>
