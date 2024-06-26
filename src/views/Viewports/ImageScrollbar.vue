<template>
  <div className="scroll">
    <div className="scroll-holder">
      <div class="bg-hr"></div>
      <input
        className="imageSlider"
        type="range"
        min="1"
        :max="props.imageIds.length"
        step="1"
        :value="props.imageIndex + 1"
        @input="onInputCallback"
        :style="{ width: props.isVertical ? `${wh - 625}px` : `${wh - 141}px` }"
        ref="inputRangeRef"
      />
      <template v-for="(item, index) in props.imageIds.length" :key="index">
        <div
          @click="(e) => handleScrollBarClick(index)"
          v-if="nodeIndexList.includes(index)"
          :style="{ height: h + '%' }"
          className="active"
        ></div>
        <div v-else :style="{ height: h + '%' }"></div>
      </template>
    </div>
  </div>
</template>

<script setup>
import {
  defineEmits,
  defineProps,
  ref,
  computed,
  onMounted,
  onUnmounted,
} from "vue";

const props = defineProps([
  "imageIds",
  "imageIndex",
  "nodeList",
  "jumpToImageIndex",
  "isVertical",
]);

const h = ref(100 / props.imageIds.length);
const emit = defineEmits(["scrollBarClick"]);
const wh = ref(document.documentElement.clientHeight);
const inputRangeRef = ref(null);

onMounted(() => {
  onResize();
  window.addEventListener("resize", onResize);
  inputRangeRef.value.addEventListener("mousedown", () =>
    window.getSelection().removeAllRanges()
  );
});

onUnmounted(() => {
  window.removeEventListener("resize", onResize);
});

const onResize = () => {
  wh.value = document.documentElement.clientHeight;
};

const onInputCallback = (e) => {
  props.jumpToImageIndex(Number(e.target.value));
};

const nodeIndexList = computed(() =>
  Array.from(new Set([...props.nodeList.map((item) => item.centerFrame)]))
);

const handleScrollBarClick = (index) => {
  emit("scrollBarClick", index);
};
</script>

<style scoped lang="scss">
.scroll {
  height: 100%;
  padding: 0 5px;
  position: absolute;
  right: 0;
  top: 0;
  z-index: 9;

  .scroll-holder {
    width: 12px;
    height: 100%;
    position: relative;
    right: 0;
    top: 0;
    z-index: 9;

    .bg-hr {
      width: 4px;
      height: 100%;
      background: rgb(125, 133, 138);
      position: absolute;
      top: 0;
      left: calc(50% - 2px);
      z-index: 1;
    }

    & > div {
      display: flex;

      &.active {
        position: relative;
        cursor: pointer;
        z-index: 11;

        &:before {
          content: "";
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #fff;
          position: absolute;
          left: calc(50% - 7px);
          top: calc(50% - 7px);
          z-index: 2;
        }

        &:after {
          content: "";
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: 1px solid #666;
          background: transparent;
          position: absolute;
          left: calc(50% - 4px);
          top: calc(50% - 4px);
          z-index: 3;
        }
      }
    }
  }

  .imageSlider {
    height: 12px;
    left: 12px;
    padding: 0;
    position: absolute;
    top: 0;
    transform: rotate(90deg);
    transform-origin: top left;
    -webkit-appearance: none;
    background-color: rgba(0, 0, 0, 0);
    z-index: 10;

    &:focus {
      outline: none;
    }

    &::-moz-focus-outer {
      border: none;
    }

    &::-webkit-slider-runnable-track {
      background-color: rgba(0, 0, 0, 0);
      border: none;
      cursor: pointer;
      height: 5px;
      z-index: 6;
    }

    &::-moz-range-track {
      background-color: rgba(0, 0, 0, 0);
      border: none;
      cursor: pointer;
      height: 2px;
      z-index: 6;
    }

    &::-ms-track {
      animate: 0.2s;
      background: transparent;
      border: none;
      border-width: 15px 0;
      color: rgba(0, 0, 0, 0);
      cursor: pointer;
      height: 12px;
      width: 100%;
    }

    &::-ms-fill-lower {
      background: rgba(0, 0, 0, 0);
    }

    &::-ms-fill-upper {
      background: rgba(0, 0, 0, 0);
    }

    &::-webkit-slider-thumb {
      -webkit-appearance: none !important;
      background-color: #163239;
      border: none;
      border-radius: 57px;
      cursor: -webkit-grab;
      height: 12px;
      margin-top: -4px;
      width: 39px;
    }

    &::-webkit-slider-thumb:active {
      background-color: #20a5d6;
      cursor: -webkit-grabbing;
    }

    &::-moz-range-thumb {
      background-color: #163239;
      border: none;
      border-radius: 57px;
      cursor: -moz-grab;
      height: 12px;
      width: 39px;
      z-index: 7;
    }

    &::-moz-range-thumb:active {
      background-color: #20a5d6;
      cursor: -moz-grabbing;
    }

    &::-ms-thumb {
      background-color: #163239;
      border: none;
      border-radius: 57px;
      cursor: ns-resize;
      height: 12px;
      width: 39px;
    }

    &::-ms-thumb:active {
      background-color: #20a5d6;
    }

    &::-ms-tooltip {
      display: none;
    }
  }
}
</style>
