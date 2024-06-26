<template>
  <div class="viewer-box">
    <a-modal
        v-model:visible="parameterEditModal"
        :title="titleTxt"
        style="top: 100px"
        :maskClosable=false
        :closable=false
        :width="600"
        :footer="null"
        :confirm-loading="confirmLoading"
    >
      <div class="add-node-box editBox">
        <a-form ref="ruleForm" :model="formData" @finish="submit" @finishFailed="submitFailed">
          <a-form-item required name="name" label="名称" :rules="[{ required: true, message: '请输入名称' }]">
            <a-input v-model:value="formData.name" placeholder="请输入名称" type="text" />
          </a-form-item>
          <a-form-item required name="width" label="窗宽" :rules="[{ required: true, message: '请输入窗宽' }]">
            <a-input-number v-model:value="formData.width" placeholder="请输入窗宽" style="width: 100%"
                            :min="-5000" :max="5000" :precision="2" :step="0.01" string-mode
            />
          </a-form-item>
          <a-form-item required name="height" label="窗位" :rules="[{ required: true, message: '请输入窗位' }]">
            <a-input-number v-model:value="formData.height" placeholder="请输入窗位" style="width: 100%"
                            :min="-5000" :max="5000" :precision="2" :step="0.01" string-mode
            />
          </a-form-item>
          <div class="footer">
            <a-button class="generalBtn" key="submit" type="primary" @click="openModal(false)">取消</a-button>
            <a-button class="generalBtn" key="submit" type="primary" html-type="submit">确认</a-button>
          </div>
        </a-form>
      </div>

    </a-modal>
  </div>
</template>

<script setup>
import {ref, defineProps, defineExpose, defineEmits, reactive} from "vue";
import {addNodule, parametersSave, saveDept} from "@/api";
import {getAPIResponse} from "@/utils/apiTools/useAxiosApi";
import {message} from "ant-design-vue";
const parameterEditModal = ref(false);
const confirmLoading = ref(false);
let noduleData
const emit = defineEmits(["initList"]);
const props = defineProps(["noduleList"]);
let parentDepartmentText = ref('')
const formData = reactive({
  id: '',
  name: '',
  width: '',
  height: '',
});
let titleTxt = ref('')
const ruleForm = ref();

const openModal = (status, selectDepartment) => {
  parameterEditModal.value = status
  if (status) {
    if (selectDepartment) {
      formData.id = selectDepartment.id
      formData.name = selectDepartment.name
      formData.width = selectDepartment.width
      formData.height = selectDepartment.height
      titleTxt.value = '窗宽窗位编辑'
    } else {
      titleTxt.value = '新增窗宽窗位'
    }
  } else {
    resetForm()
  }
}

const submit = async (values) => {
  const res = await parametersSave(formData)
  const result = getAPIResponse(res);
  if (result) {
    emit('initList')
    resetForm()
    openModal(false)
    message.success('创建成功')
  }
}

const resetForm = () => {
  ruleForm.value.resetFields()
}

const submitFailed = (e) => {
  console.log(e,formData)
}

defineExpose({
  openModal
});
</script>
<style scoped>
@import "@/assets/main.css";
</style>
<style scoped lang="scss">
.editBox {
  .ant-form {
    border-radius: 4px;
    padding: 10px 64px;
    :deep(.ant-form-item-label) {
      label {
        color: white;
      }
    }
  }
  .ant-form-item {
    :deep(.ant-form-item-label) {
      width: 14%;
    }
    :deep(.ant-form-item-control) {
      .ant-form-item-control-input {
        width: 360px;
      }
      .ant-input-number-input-wrap {
        .ant-input-number-input {
          font-size: 14px;
          padding: 4px 11px;
        }
      }
    }
  }
  .footer {
    text-align: center;
    margin-top: 132px;
    .btn {
      &:first-child {
        margin-right: 10px;
      }
    }
  }
  .generalBtn {
    width: 100px !important;
    height: 32px !important;
    font-size: 14px;
    line-height: 14.95px;
  }
}
</style>
