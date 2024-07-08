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
              name="name"
              label="姓名"
              :rules="[{ required: true, message: '请输入姓名' }]"
            >
              <a-input
                v-model:value="formData.name"
                placeholder="请输入姓名"
                type="text"
              />
            </a-form-item>
          </div>

          <div class="itemBox">
            <a-form-item
              name="sampleCode"
              label="样本编号"
              :rules="[{ required: true, message: '请输入样本编号' }]"
            >
              <a-input
                v-model:value="formData.sampleCode"
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
                <a-select-option value="1">男</a-select-option>
                <a-select-option value="0">女</a-select-option>
              </a-select>
            </a-form-item>
          </div>

          <div class="itemBox">
            <a-form-item name="checkDate" label="检测日期">
              <a-date-picker
                :locale="locale"
                v-model:value="formData.checkDate"
                placeholder="请选择检测日期"
                valueFormat="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
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
import { addPatientList } from "@/api";
import { QuestionCircleOutlined } from "@ant-design/icons-vue";
import { getAPIResponse } from "@/utils/apiTools/useAxiosApi";
import { message } from "ant-design-vue";
import { useCookies } from "@vueuse/integrations/useCookies";
import { useUserStore } from "@/store/modules/user";
import locale from "ant-design-vue/es/date-picker/locale/zh_CN";
import dayjs from "dayjs";

const userStore = useUserStore();
const userModal = ref(false);
const confirmLoading = ref(false);
let noduleData;
const emit = defineEmits(["initList"]);
const props = defineProps(["departmentList"]);

const formData = reactive({});

let titleTxt = ref("");
let dutyOptions = ref([]);
let roleOptions = ref([]);
const ruleForm = ref();
let selectedUser = ref(null);

const openModal = async (status, selectUser) => {
  userModal.value = status;
  if (status) {
    if (selectUser) {
      // selectedUser.value = selectUser;
      // const rawResult = await getParentIds({ id: selectUser.deptId });
      // const department = getAPIResponse(rawResult);
      // formData.id = selectUser.id;
      // formData.userName = selectUser.userName;
      // formData.nickName = selectUser.nickName;
      // formData.deptId = department;
      // formData.duty = selectUser.duty;
      // formData.roleIdList = selectUser.roleIdList;
      // titleTxt.value = "修改用户信息";
    } else {
      titleTxt.value = "新增检测信息";
    }
  } else {
    resetForm();
  }
};

const submit = async (values) => {
  const newForm = Object.assign({}, formData);
  newForm.checkDate = dayjs(newForm.checkDate).format("YYYY-MM-DD HH:mm:ss");

  const res = await addPatientList(newForm);
  const result = getAPIResponse(res);
  if (result) {
    emit("initList");
    resetForm();
    openModal(false);
    message.success("新增成功");
  }
};

const resetForm = () => {
  ruleForm.value.resetFields();
};

const submitFailed = (e) => {
  console.log(e, formData);
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
