<template>
  <div class="logout-box">
    <a-modal
      v-model:visible="visible"
      title="登出"
      class="instructions-box-modal"
      destroyOnClose
      :maskClosable="false"
    >
      <template #footer>
        <a-button @click="handleCancel">取消</a-button>
        <a-button @click="handleConfirm">确定</a-button>
      </template>

      <div class="logout hint">是否需要登出？</div>
    </a-modal>
  </div>
</template>

<script setup>
import { defineExpose, ref } from "vue";
import { logout } from "@/api";
import { getAPIResponse } from "@/utils/apiTools/useAxiosApi";
import { useUserStore } from "@/store/modules/user";
import { message } from "ant-design-vue";

const userStore = useUserStore();

const visible = ref(false);

const showLogoutModal = () => {
  visible.value = true;
};

const handleConfirm = () => {
  logout().then(
    (res) => {
      const result = getAPIResponse(res);
      if (result === "登出成功") {
        visible.value = false;
        userStore.logout();
      } else {
        // message.error(result)
      }
    },
    (err) => {
      console.log("err: ", err);
    }
  );
};

const handleCancel = () => {
  visible.value = false;
};

defineExpose({
  showLogoutModal,
});
</script>

<style scoped lang="scss">
.logout.hint {
  font-size: 14px;
  text-align: center !important;
}
</style>

<style lang="scss">
.instructions-box-modal {
  .ant-modal-content {
    padding: 10px;
    background: rgb(29,31,33);
  }
}
</style>
