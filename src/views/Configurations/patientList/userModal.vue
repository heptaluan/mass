<template>
  <div class="viewer-box">
    <a-modal
      v-model:visible="userModal"
      :title="titleTxt"
      style="top: 100px"
      :maskClosable="false"
      :closable="false"
      :width="600"
      :footer="null"
      :confirm-loading="confirmLoading"
    >
      <div class="add-node-box editBox">
        <a-form
          ref="ruleForm"
          :model="formData"
          @finish="submit"
          @finishFailed="submitFailed"
        >
          <div class="itemBox">
            <a-form-item
              required
              name="userName"
              label="姓名"
              :rules="[{ required: true, message: '请输入姓名' }]"
            >
              <a-input
                v-model:value="formData.userName"
                placeholder="请输入姓名"
                type="text"
              />
            </a-form-item>
          </div>

          <div class="itemBox">
            <a-form-item
              name="deptId"
              label="样本编号"
              :rules="[{ required: true, message: '请输入样本编号' }]"
            >
              <a-input
                v-model:value="formData.deptId"
                placeholder="请输入样本编号"
                type="text"
              />
            </a-form-item>
          </div>

          <div class="itemBox">
            <a-form-item name="age" label="年龄">
              <a-input-number
                style="width: 100%"
                v-model:value="formData.age"
                placeholder="请输入年龄"
                type="text"
              />
            </a-form-item>
          </div>

          <div class="itemBox">
            <a-form-item
              name="sex"
              label="性别"
              :rules="[{ required: true, message: '请选择性别' }]"
            >
              <a-select v-model:value="formData.sex" placeholder="请选择性别">
                <a-select-option value="0">男</a-select-option>
                <a-select-option value="1">女</a-select-option>
              </a-select>
            </a-form-item>
          </div>

          <div class="itemBox">
            <a-form-item
              name="date"
              label="检测日期"
            >
              <a-date-picker style="width: 100%" />
            </a-form-item>
          </div>

          <div class="footer">
            <a-button
              key="submit"
              type="primary"
              class="generalBtn"
              @click="openModal(false)"
              >取消</a-button
            >
            <a-button
              key="submit"
              type="primary"
              class="generalBtn"
              html-type="submit"
              >确认</a-button
            >
          </div>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import {
  ref,
  defineProps,
  defineExpose,
  defineEmits,
  reactive,
  onBeforeMount,
} from "vue";
import {
  addNodule,
  getSelectionsByType,
  getRoleList,
  saveUser,
  getParentIds,
  findUserById,
} from "@/api";
import { QuestionCircleOutlined } from "@ant-design/icons-vue";
import { getAPIResponse } from "@/utils/apiTools/useAxiosApi";
import { message } from "ant-design-vue";
import { useCookies } from "@vueuse/integrations/useCookies";
import { useUserStore } from "@/store/modules/user";

const userStore = useUserStore();
const userModal = ref(false);
const confirmLoading = ref(false);
let noduleData;
const emit = defineEmits(["initList"]);
const props = defineProps(["departmentList"]);
const rawForm = {
  userName: "",
  nickName: "",
  deptId: "",
  duty: "",
  roleIdList: [],
};
const formData = reactive({ ...rawForm });
const fieldNames = {
  label: "deptName",
  value: "id",
};
const dutyFieldNames = {
  label: "dictLabel",
  value: "dictValue",
};
const roleFieldNames = {
  label: "roleName",
  value: "id",
};
let titleTxt = ref("");
let dutyOptions = ref([]);
let roleOptions = ref([]);
const ruleForm = ref();
let selectedUser = ref(null);

onBeforeMount(() => {
  getRoleList().then((res) => {
    const result = getAPIResponse(res);
    console.log(result);
    roleOptions.value = result;
  });
  getSelectionsByType().then((res) => {
    const result = getAPIResponse(res);
    dutyOptions.value = result.sys_doctor_duty;
  });
});

const openModal = async (status, selectUser) => {
  userModal.value = status;
  if (status) {
    if (selectUser) {
      selectedUser.value = selectUser;
      const rawResult = await getParentIds({ id: selectUser.deptId });
      const department = getAPIResponse(rawResult);
      formData.id = selectUser.id;
      formData.userName = selectUser.userName;
      formData.nickName = selectUser.nickName;
      formData.deptId = department;
      formData.duty = selectUser.duty;
      formData.roleIdList = selectUser.roleIdList;
      titleTxt.value = "修改用户信息";
    } else {
      titleTxt.value = "新增检测信息";
    }
  } else {
    resetForm();
  }
};

const submit = async (values) => {
  const newForm = Object.assign({}, formData);
  newForm.deptId = newForm.deptId
    ? newForm.deptId[newForm.deptId.length - 1]
    : "";

  const res = await saveUser(newForm);
  const result = getAPIResponse(res);
  if (result) {
    const currentUser = useCookies().get("info");
    if (newForm.id === currentUser.id) {
      const resInner = await findUserById({ id: newForm.id });
      const resultInner = getAPIResponse(resInner);

      userStore.updateInfo(resultInner);

      console.log(userStore.getUserInfo);
    }

    emit("initList");
    resetForm();
    openModal(false);
    message.success("创建成功");
  }
};

const resetForm = () => {
  ruleForm.value.resetFields();
};

const submitFailed = (e) => {
  console.log(e, formData);
};

const userNameCheck = async (rule, val) => {
  const regRule = /^[a-zA-Z0-9]+$/;
  if (val && (!regRule.test(val) || !(val.length >= 3 && val.length <= 20))) {
    await callbackDetect(false, rule.message);
  }
  await callbackDetect(true);
};
const nickNameCheck = async (rule, val) => {
  const regRule = /^[\u4E00-\u9FA5a-zA-Z]+$/;
  if (val && !(regRule.test(val) && val.length >= 1 && val.length <= 20)) {
    await callbackDetect(false, rule.message);
  }
  await callbackDetect(true);
};

const callbackDetect = (isCorrect, msg) => {
  if (isCorrect) {
    return Promise.resolve();
  } else {
    return Promise.reject(msg);
  }
};

defineExpose({
  openModal,
});
</script>

<style scoped>
@import "@/assets/main.css";
</style>
<style scoped lang="scss">
.editBox {
  .ant-form {
    border-radius: 4px;
    text-align: -webkit-center;
    .itemBox {
      display: flex;
      justify-content: space-between;
      width: 86%;
      .ant-form-item {
        width: 80%;
        :deep(.ant-form-item-control-input) {
          width: 360px;
        }
        :deep(.ant-form-item-label) {
          width: 26%;
          label {
            color: white;
          }
        }
      }
      :deep(.anticon-question-circle) {
        svg {
          color: white;
          margin-top: 10px;
        }
      }
    }
  }
  .generalBtn {
    width: 100px !important;
    height: 32px !important;
    font-size: 14px;
    line-height: 14.95px;
  }
  .ant-form-item {
    :deep(.ant-form-item-label) {
      width: 18%;
    }

    .ant-select-multiple {
      :deep(.ant-select-selection-item) {
        color: #2c2e30;
      }
    }

    :deep(.ant-input-number-input) {
      padding-left: 10px;
    }

    :deep(.ant-select-selector) {
      text-align: left;
    }

    :deep(.ant-form-item-explain-error) {
      text-align: left;
    }
  }

  :deep(.ant-cascader) {
    &:hover {
      .ant-select-clear {
        top: 20%;
        background-color: transparent;
      }
    }
  }

  .footer {
    text-align: center;

    .btn {
      &:first-child {
        margin-right: 10px;
      }
    }
  }
}
</style>
