<template>
  <div class="loading-container">
    <a-modal
      v-model:visible="visible"
      class="loading-box-modal"
      destroyOnClose
      :width="90"
      :centered="true"
      :mask="true"
      :closable="false"
      :maskClosable="false"
      :footer="null"
    >
      <div class="loadingBox">
        <a-spin :indicator="indicator" />
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { LoadingOutlined } from "@ant-design/icons-vue";
import { defineExpose, h, ref } from "vue";

const visible = ref(false);

const indicator = h(LoadingOutlined, {
  style: {
    fontSize: "24px",
  },
  spin: true,
});

const showLoadingModal = (status) => {
  visible.value = status;
};

defineExpose({
  showLoadingModal,
});
</script>

<style scoped lang="scss">
.loadingBox {
  :deep(.ant-spin) {
    text-align: center;
    .anticon-loading {
      font-size: 40px !important;
      color: white;
    }
  }
}
</style>
