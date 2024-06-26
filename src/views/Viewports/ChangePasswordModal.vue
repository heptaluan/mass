<template>
  <div class="change-password-box">
    <a-modal
      v-model:visible="visible"
      title="修改密码"
      class="change-password-box-modal"
      destroyOnClose
      :maskClosable="false"
      :confirm-loading="confirmLoading"
      @ok="handleOk"
      @cancel="handleOkCancel"
      style="top: 120px"
      width="600px"
    >
      <a-form :label-col="{ span: 5 }" :wrapper-col="{ span: 13 }">
        <a-form-item label="原密码" v-bind="validateInfos.oldPassword">
          <a-input-password
            autocomplete="new-password"
            v-model:value="modelRef.oldPassword"
            placeholder="请输入原密码"
          />
        </a-form-item>

        <a-form-item label="新密码" v-bind="validateInfos.newPassword">
          <a-input-password
            autocomplete="new-password"
            v-model:value="modelRef.newPassword"
            placeholder="请输入新密码"
          />
        </a-form-item>

        <a-form-item label="新密码确认" v-bind="validateInfos.confirmPassword">
          <a-input-password
            autocomplete="new-password"
            v-model:value="modelRef.confirmPassword"
            placeholder="请再次输入新密码"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { defineExpose, ref, reactive } from "vue";
import { Form } from "ant-design-vue";
import { changePassword, logout } from "@/api";
import { getAPIResponse } from "@/utils/apiTools/useAxiosApi";
import { message } from "ant-design-vue";
import { useUserStore } from "@/store/modules/user";

const visible = ref(false);
const confirmLoading = ref(false);
const useForm = Form.useForm;

const userStore = useUserStore();

const modelRef = ref({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const rulesRef = reactive({
  oldPassword: [
    {
      required: true,
      message: "请输入原密码",
    },
  ],
  newPassword: [
    {
      required: true,
      validator: (rule, value) => {
        if (value === "") {
          return Promise.reject("请输入新密码");
        } else if (
          !/^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,16}$/.test(
            modelRef.value.newPassword
          )
        ) {
          return Promise.reject(
            "密码必须为数字和英文字母组合，长度为6~16位字符"
          );
        } else {
          if (modelRef.value.newPassword === modelRef.value.confirmPassword) {
            clearValidate();
          }
          return Promise.resolve();
        }
      },
    },
  ],
  confirmPassword: [
    {
      required: true,
      validator: (rule, value) => {
        if (value === "") {
          return Promise.reject("请再次输入新密码");
        } else if (
          modelRef.value.newPassword !== modelRef.value.confirmPassword
        ) {
          return Promise.reject("请输入一致的新密码");
        } else {
          return Promise.resolve();
        }
      },
    },
  ],
});

const { validate, validateInfos, resetFields, clearValidate } = useForm(
  modelRef,
  rulesRef
);

const showModal = () => {
  modelRef.value.oldPassword = "";
  modelRef.value.newPassword = "";
  modelRef.value.confirmPassword = "";
  visible.value = true;
};

const handleOkCancel = () => {
  resetFields();
  visible.value = false;
};

const handleOk = () => {
  validate()
    .then(async () => {
      confirmLoading.value = true;
      const res = await changePassword(modelRef.value);
      const result = getAPIResponse(res);
      if (result) {
        visible.value = false;
        confirmLoading.value = false;
        message.success("修改成功");
        userStore.logout();
        // logout().then((res) => {
        //   const result = getAPIResponse(res);
        //   if (result === "请重新登录") {
        //     visible.value = false;
        //     userStore.logout();
        //   } else {
        //     message.error(result);
        //   }
        // });
      } else {
        confirmLoading.value = false;
      }
    })
    .catch((err) => {
      console.log("error", err);
    });
};

defineExpose({
  showModal,
});
</script>

<style lang="scss">
.change-password-box-modal {
  .ant-modal-footer {
    justify-content: flex-end;
  }

  .ant-form {
    padding: 20px 30px;
  }

  .ant-form-item-label > label {
    color: #fff;
    min-width: 100px;
  }
}
</style>
