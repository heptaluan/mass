<template>
  <div class="settings-box">
    <a-modal
      v-model:visible="visible"
      title="关于"
      class="settings-box-modal"
      destroyOnClose
      :maskClosable="false"
    >
      <template #footer>
        <a-button @click="handleCancel">确定</a-button>
      </template>

      <div>用户配置</div>
    </a-modal>
  </div>
</template>

<script setup>
import { defineExpose, ref } from "vue";

const visible = ref(false);

const showModal = () => {
  visible.value = true;
};

const handleCancel = () => {
  visible.value = false;
};

defineExpose({
  showModal,
});
</script>

<style lang="scss">
.settings-box-modal {
}
</style>
