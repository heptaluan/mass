<template>
  <div class="instructions-box">
    <a-modal
      v-model:visible="visible"
      title="使用说明"
      class="instructions-box-modal"
      destroyOnClose
      :maskClosable="false"
    >
      <template #footer>
        <a-button @click="handleCancel">确定</a-button>
      </template>

      <div>使用说明</div>
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
.instructions-box-modal {
}
</style>
