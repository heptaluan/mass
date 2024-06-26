<template>
  <div class="personal-box">
    <a-modal
      v-model:visible="visible"
      title="个人设置"
      class="personal-box-modal"
      :destroyOnClose="true"
      :maskClosable="false"
      :confirm-loading="confirmLoading"
      @ok="handleOk"
      width="600px"
    >
      <div class="modal-title">账号信息</div>
      <a-form :label-col="{ span: 5 }" :wrapper-col="{ span: 13 }">
        <a-form-item label="登录账号" v-bind="validateInfos.userName">
          <a-input
            v-model:value="modelRef.userName"
            placeholder="请输入登录账号"
            disabled
          />
        </a-form-item>
        <a-form-item label="所属部门" v-bind="validateInfos.deptId">
          <a-cascader
            v-model:value="modelRef.deptId"
            change-on-select
            :allowClear="false"
            :options="departmentList"
            :field-names="{
              label: 'deptName',
              value: 'id',
            }"
            placeholder="请选择所属部门"
          />
        </a-form-item>
        <a-form-item label="用户名称" v-bind="validateInfos.nickName">
          <a-input
            v-model:value="modelRef.nickName"
            placeholder="请输入用户名称"
          />
        </a-form-item>
        <a-form-item label="职务" v-bind="validateInfos.duty">
          <a-select
            v-model:value="modelRef.duty"
            placeholder="请选择职务"
            :options="dutyOptions"
            :field-names="{
              label: 'dictLabel',
              value: 'dictValue',
            }"
          ></a-select>
        </a-form-item>
      </a-form>

      <div class="modal-title">密码</div>
      <a-button @click="changePasswordModal.showModal()">修改密码</a-button>
    </a-modal>

    <ChangePasswordModal ref="changePasswordModal" />
  </div>
</template>

<script setup>
import { defineExpose, ref, reactive, onMounted } from "vue";
import { Form } from "ant-design-vue";
import ChangePasswordModal from "./ChangePasswordModal.vue";
import { useUserStore } from "@/store/modules/user";
import {
  getDeptTree,
  getSelectionsByType,
  saveUser,
  getParentIds,
  findUserById,
} from "@/api";
import { getAPIResponse } from "@/utils/apiTools/useAxiosApi";
import { message } from "ant-design-vue";

const visible = ref(false);
const confirmLoading = ref(false);
const useForm = Form.useForm;

const changePasswordModal = ref(null);

const modelRef = ref({
  userName: "",
  deptName: undefined,
  nickName: "",
  dutyCn: undefined,
  deptId: "",
});

const rulesRef = reactive({
  userName: [
    {
      required: true,
      message: "请输入登录账号",
    },
  ],
  nickName: [
    {
      required: true,
      message: "请输入用户名称",
    },
  ],
});

const { validate, validateInfos } = useForm(modelRef, rulesRef);

const userStore = useUserStore();

const departmentList = ref([]);
const dutyOptions = ref([]);

onMounted(async () => {
  modelRef.value = Object.assign({}, userStore.getUserInfo);
  getDeptTree(null).then((res) => {
    const result = getAPIResponse(res);
    if (result) {
      departmentList.value = result;
    }
  });
  getSelectionsByType().then((res) => {
    const result = getAPIResponse(res);
    dutyOptions.value = result.sys_doctor_duty;
  });
});

const showModal = async () => {
  visible.value = true;
  const userResult = await findUserById({ id: userStore.getUserInfo.id });
  const user = getAPIResponse(userResult);
  const rawResult = await getParentIds({ id: user.deptId });
  const department = getAPIResponse(rawResult);
  modelRef.value = Object.assign({}, user);
  modelRef.value.deptId = department;
};

const handleOk = () => {
  validate()
    .then(async () => {
      confirmLoading.value = true;
      modelRef.value.deptId = modelRef.value.deptId
        ? modelRef.value.deptId[modelRef.value.deptId.length - 1]
        : "";
      const res = await saveUser(modelRef.value);
      const result = getAPIResponse(res);
      if (result) {
        visible.value = false;
        confirmLoading.value = false;
        message.success("修改成功");
        userStore.updateInfo(result);
      } else {
        confirmLoading.value = false;
      }
    })
    .catch((err) => {
      confirmLoading.value = false;
      console.log("error", err);
    });
};

defineExpose({
  showModal,
});
</script>

<style lang="scss">
.personal-box-modal {
  .ant-modal-footer {
    justify-content: flex-end;
  }

  .modal-title {
    margin-bottom: 20px;
    font-size: 14px;
  }

  .ant-form {
    padding: 0 30px;
  }

  .ant-form-item-label > label {
    color: #fff;
    min-width: 100px;
  }
}
</style>
