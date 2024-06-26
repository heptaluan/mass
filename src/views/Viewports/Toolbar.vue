<template>
  <ul class="tool-list-box">
    <li
      v-for="item in toolList"
      :key="item.id"
      @click="(e) => handleListClicked(e, item)"
      :class="{
        active: item.active,
        disabled: item.disabled,
        clear: item.id === 20 && item.active,
      }"
      :id="item.id === 16 ? 'target' : null"
    >
      <template v-if="item.id === 10">
        <!-- 窗宽窗位 -->
        <a-dropdown :trigger="['click']" :disabled="item.disabled">
          <a @click.prevent>
            <span class="list-item"><icon-font :type="item.icon" /></span>
            <span class="list-item">{{ item.text }}</span>
          </a>
          <template #overlay>
            <a-menu @click="handleChangeVoiRange">
              <a-menu-item :key="'000'">自定义</a-menu-item>
              <div v-for="(item, index) in props.voiRange" :key="item.id">
                <a-menu-item :key="index">{{ item.name }}</a-menu-item>
              </div>
            </a-menu>
          </template>
        </a-dropdown>
      </template>

      <template v-else-if="item.id === 11">
        <!-- 自动播放 -->
        <a-dropdown
          :trigger="['click']"
          :class="{ active: item.active, disabled: item.disabled }"
          :disabled="item.disabled"
        >
          <a @click.prevent>
            <template v-if="!item.active">
              <span class="list-item"><icon-font :type="item.icon" /></span>
              <span class="list-item">{{ item.text }}</span>
            </template>
            <template v-else>
              <span class="list-item"><icon-font :type="item.iconStop" /></span>
              <span class="list-item">{{ item.textStop }}</span>
            </template>
          </a>
          <template #overlay>
            <a-menu @click="(e) => handleChangeAutoPlay(e, item)">
              <a-menu-item key="11-1">1X速</a-menu-item>
              <a-menu-item key="11-2">2X速</a-menu-item>
              <a-menu-item key="11-3">3X速</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </template>

      <template v-else-if="item.id === 13">
        <!-- 窗口选择 -->
        <a-dropdown :trigger="['click']" :disabled="item.disabled">
          <a @click.prevent>
            <span class="list-item"><icon-font :type="item.icon" /></span>
            <span class="list-item">{{ item.text }}</span>
          </a>
          <template #overlay>
            <a-menu @click="handleChangeMultiWindow">
              <a-menu-item key="13-1">1 X 1</a-menu-item>
              <a-menu-item key="13-2">1 X 2</a-menu-item>
              <a-menu-item key="13-4">2 X 2</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </template>

      <template v-else-if="item.id === 15">
        <!-- MIP -->
        <template v-if="item.disabled">
          <span class="list-item"><icon-font :type="item.icon" /></span>
          <span class="list-item">{{ item.text }}</span>
        </template>
        <template v-else>
          <a-popover trigger="click">
            <div class="ant-dropdown-trigger">
              <span class="list-item"><icon-font :type="item.icon" /></span>
              <span class="list-item">{{ item.text }}</span>
            </div>
            <template #content>
              <div class="mip-radio-box">
                <a-radio-group
                  v-model:value="mipRadioVal"
                  @change="(e) => handleMIPRadioChange(e.target.value)"
                >
                  <a-radio :value="'MaxIP'">MaxIP</a-radio>
                  <a-radio :value="'MinIP'">MinIP</a-radio>
                </a-radio-group>
              </div>
              <div class="mip-slider-box">
                <div style="margin-right: 5px">0</div>
                <a-slider
                  v-model:value="mipSliderVal"
                  :min="0"
                  :max="10"
                  @change="(e) => handleMIPSliderChange(e)"
                />
                <div style="margin-left: 5px">10</div>
              </div>
            </template>
          </a-popover>
        </template>
      </template>

      <template v-else>
        <span><icon-font :type="item.icon" /></span>
        <span>{{ item.text }}</span>
      </template>
    </li>
  </ul>
</template>

<script setup>
import { defineEmits, ref, defineExpose, defineProps } from "vue";
import { createFromIconfontCN } from "@ant-design/icons-vue";
import IconFontUrl from "../../assets/iconFont";

const mipRadioVal = ref("MaxIP");
const mipSliderVal = ref(0);

const IconFont = createFromIconfontCN({
  scriptUrl: IconFontUrl,
});

const props = defineProps(["voiRange"]);

const emit = defineEmits([
  "toolBarClick",
  "syncWindowClick",
  "handleChangeMIP",
  "setVoiRange",
]);

// 工具栏
const toolList = ref([
  {
    id: 1,
    icon: "icon-back01",
    text: "返回",
    active: false,
    disabled: false,
  },
  {
    id: 2,
    icon: "icon-liebiao",
    text: "序列列表",
    active: false,
    disabled: false,
  },
  {
    id: 3,
    icon: "icon-xuanze",
    text: "选择",
    active: true,
    disabled: false,
  },
  {
    id: 4,
    icon: "icon-zhongzhi",
    text: "重置位置",
    active: false,
    disabled: false,
  },
  {
    id: 5,
    icon: "icon-zuoyoufanzhuan_huaban1",
    text: "水平翻转",
    active: false,
    disabled: false,
  },
  {
    id: 6,
    icon: "icon-chuizhifanzhuan_huaban1",
    text: "垂直翻转",
    active: false,
    disabled: false,
  },
  {
    id: 7,
    icon: "icon-xuanzhuan-01",
    text: "旋转",
    active: false,
    disabled: false,
  },
  {
    id: 8,
    icon: "icon-move",
    text: "移动",
    active: false,
    disabled: false,
  },
  {
    id: 9,
    icon: "icon-155",
    text: "缩放",
    active: false,
    disabled: false,
  },
  {
    id: 10,
    icon: "icon-chuangkuanchuangwei",
    text: "窗宽窗位",
    active: false,
    disabled: false,
  },
  {
    id: 11,
    icon: "icon-zidongbofang",
    text: "自动播放",
    iconStop: "icon-tingzhibofang",
    textStop: "停止播放",
    active: false,
    disabled: false,
  },
  {
    id: 12,
    icon: "icon-liandong",
    text: "窗口联动",
    active: false,
    disabled: true,
  },
  {
    id: 13,
    icon: "icon-duochuangkou",
    text: "窗口选择",
    active: false,
    disabled: false,
  },
  {
    id: 14,
    icon: "icon-MPR",
    text: "MPR",
    active: false,
    disabled: false,
  },
  {
    id: 15,
    icon: "icon-mip1",
    text: "MIP",
    active: false,
    disabled: false,
  },
  {
    id: 16,
    icon: "icon-noun__cc",
    text: "直线",
    active: false,
    disabled: false,
  },
  {
    id: 17,
    icon: "icon-tuoyuanxing",
    text: "椭圆",
    active: false,
    disabled: false,
  },
  {
    id: 19,
    icon: "icon-icon_Bi-Directional",
    text: "双向测量",
    active: false,
    disabled: false,
  },
  {
    id: 22,
    icon: "icon-jiaodu",
    text: "角度测量",
    active: false,
    disabled: false,
  },
  {
    id: 18,
    icon: "icon-juxing",
    text: "结节标记",
    active: false,
    disabled: false,
  },
  {
    id: 20,
    icon: "icon-qingchu",
    text: "清除标记",
    active: false,
    disabled: false,
  },
  {
    id: 21,
    icon: "icon-wuguan",
    text: "AI计算",
    active: false,
    disabled: false,
  },
  // {
  //   id: 23,
  //   icon: "icon-cpu",
  //   text: "3D查看",
  //   active: false,
  //   disabled: false,
  // },
]);

// 列表点击事件
const handleListClicked = (e, item) => {
  switch (item.id) {
    case 2:
    case 5:
    case 6:
    case 12:
    case 14:
      if (!toolList.value.find((n) => n.id === item.id).disabled) {
        toolList.value.find((n) => n.id === item.id).active =
          !toolList.value.find((n) => n.id === item.id).active;
      }
      break;

    case 3:
      [3, 4, 7, 8, 9, 16, 17, 18, 19, 20, 22].forEach((v) => {
        toolList.value.find((n) => n.id === v).active = false;
      });
      if (!toolList.value.find((n) => n.id === 14).active) {
        toolList.value.find((n) => n.id === item.id).active = true;
      }
      break;

    case 7:
    case 8:
    case 9:
    case 16:
    case 17:
    case 18:
    case 19:
    case 20:
    case 22:
      [3, 4, 7, 8, 9, 16, 17, 18, 19, 20, 22].forEach((v) => {
        toolList.value.find((n) => n.id === v).active = false;
      });
      toolList.value.find((n) => n.id === item.id).active = true;
      break;

    // 重置
    case 4:
      [5, 6, 7, 8, 9, 16, 17, 18, 19, 20, 22].forEach((v) => {
        toolList.value.find((n) => n.id === v).active = false;
      });
      mipRadioVal.value = "MaxIP";
      mipSliderVal.value = 0;
      break;

    // 处理自动播放
    case 11:
      if (toolList.value.find((n) => n.id === 11).active) {
        toolList.value.find((n) => n.id === 11).active = false;
      }
      break;

    default:
      break;
  }

  if (!item.disabled) {
    emit("toolBarClick", item.id, item.active);
  }
};

// 调整工具栏状态
const changeToolListDisabledStata = (id, state) => {
  toolList.value.find((n) => n.id === id).disabled = state;
};

const changeToolListActiveStata = (id, state) => {
  toolList.value.find((n) => n.id === id).active = state;
};

const getToolListActiveStata = (id) => {
  return toolList.value.find((n) => n.id === id).active;
};

const changeToolListMIPStata = (data) => {
  mipRadioVal.value = data.mipRadioVal;
  mipSliderVal.value = data.mipSliderVal;
};

const resetToolListState = () => {
  toolList.value.forEach((v) => (v.active = false));
  toolList.value.forEach((v) => (v.disabled = false));
  toolList.value.find((n) => n.id === 12).disabled = true;
  toolList.value.find((n) => n.id === 3).active = true;
};

const resetToolListStateMPR = () => {
  const btns = [1, 3, 4, 8, 9, 10];
  toolList.value.forEach((v) => (v.active = false));
  toolList.value.forEach((v) => {
    if (!btns.includes(v.id)) {
      v.disabled = true;
    } else {
      v.disabled = false;
    }
  });
  toolList.value.find((n) => n.id === 14).disabled = false;
  toolList.value.find((n) => n.id === 14).active = true;
};

// 窗宽窗位调整
const handleChangeVoiRange = (e) => {
  if (e.key === "000") {
    emit("toolBarClick", `000`);
  } else {
    emit("toolBarClick", `10-${e.key}`);
  }
};

// 自动播放调整
const handleChangeAutoPlay = (e, item) => {
  toolList.value.find((v) => v.id === 11).active = true;
  emit("toolBarClick", e.key, item.active);
};

// 多窗口调整
const handleChangeMultiWindow = (e) => {
  emit("syncWindowClick", e.key);
};

// MIP 调节
const handleMIPRadioChange = (e) => {
  mipRadioVal.value = e;
  emit("handleChangeMIP", {
    mipRadioVal: mipRadioVal.value,
    mipSliderVal: mipSliderVal.value,
  });
};

const handleMIPSliderChange = (e) => {
  mipSliderVal.value = e;
  emit("handleChangeMIP", {
    mipRadioVal: mipRadioVal.value,
    mipSliderVal: mipSliderVal.value,
  });
};

defineExpose({
  changeToolListDisabledStata,
  changeToolListActiveStata,
  getToolListActiveStata,
  changeToolListMIPStata,
  resetToolListState,
  resetToolListStateMPR,
});
</script>

<style scoped lang="scss">
.tool-list-box {
  width: 100%;
  height: 50px;
  background: rgb(45, 46, 54);
  display: flex;
  align-items: center;
  overflow-x: auto;
  overflow-y: hidden;
  font-size: 14px;

  &::-webkit-scrollbar {
    width: 100%;
    height: 5px;
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

  li {
    width: 70px;
    min-width: 70px;
    height: 45px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
    cursor: pointer;
    user-select: none;
    color: #fff;

    &.active {
      color: #fff;
      background-color: #4f5355;
      border: 1px solid #fff;
    }

    &.disabled {
      color: #666;

      .list-item {
        color: #666;
      }
    }

    .ant-dropdown-trigger {
      width: 60px;
      min-width: 60px;
      height: 45px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-around;
      cursor: pointer;
      color: #fff;
    }

    &:nth-child(2),
    &:nth-child(12),
    &:nth-child(15),
    &:nth-child(21) {
      padding: 0 5px;
      margin-right: 5px;
      border-right: 1px solid rgb(225, 225, 226);
    }

    &:nth-child(7) {
      display: none;
    }
  }
}

.tool-list-box :deep(.anticon) {
  font-size: 22px;
}
</style>

<style lang="scss">
.mip-slider-box {
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .ant-slider {
    width: 100%;
  }
}
</style>
