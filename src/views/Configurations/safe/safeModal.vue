<template>
  <div class="viewer-box">
    <a-modal
        v-model:visible="parameterEditModal"
        :title="titleTxt"
        style="top: 100px"
        :maskClosable=false
        :closable=false
        :footer="null"
        :confirm-loading="confirmLoading"
    >
      <div class="add-node-box editBox">
        <a-form ref="ruleForm" :model="formData" @finish="submit" @finishFailed="submitFailed">
          <a-form-item required name="description" label="描述" :rules="[{ required: true, message: '请输入描述' }]">
            <a-input v-model:value="formData.description" placeholder="请输入描述" type="text" />
          </a-form-item>
          <div class="half">
            <a-form-item required name="ipBegin" label="IP区间" :rules="[{ required: true, message: '请输入IP区间' }, {validator: ipCheck, trigger: 'blur', message: '请填写正确的IP地址'}]">
              <a-input v-model:value="formData.ipBegin" placeholder="请输入IP区间" type="text" />
            </a-form-item>
            <a-form-item class="noRequired" required name="ipEnd" label="~" :rules="[{ required: true, message: '请输入IP区间' }, {validator: ipCheck, trigger: 'blur', message: '请填写正确的IP地址'}]">
              <a-input v-model:value="formData.ipEnd" placeholder="请输入IP区间" type="text" />
            </a-form-item>
          </div>

          <a-form-item name="remark" label="备注">
            <a-textarea v-model:value="formData.remark" placeholder="请填写备注" />
          </a-form-item>
          <div class="footer">
            <a-button key="submit" type="primary" class="generalBtn" @click="openModal(false)">取消</a-button>
            <a-button key="submit" type="primary" class="generalBtn" html-type="submit">确认</a-button>
          </div>
        </a-form>
      </div>

    </a-modal>
  </div>
</template>

<script setup>
import {ref, defineProps, defineExpose, defineEmits, reactive} from "vue";
import {addNodule, parametersSave, saveDept, saveWhiteList} from "@/api";
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
  description: '',
  ipBegin: '',
  ipEnd: '',
  remark: '',
});
let titleTxt = ref('')
const ruleForm = ref();

const openModal = (status, selectData) => {
  parameterEditModal.value = status
  if (status) {
    if (selectData) {
      formData.id = selectData.id
      formData.description = selectData.description
      formData.ipBegin = selectData.ipBegin
      formData.ipEnd = selectData.ipEnd
      formData.remark = selectData.remark
      titleTxt.value = '用户节点信息编辑'
    } else {
      titleTxt.value = '新增用户节点信息'
    }
  } else {
    resetForm()
  }
}

const submit = async () => {
  const res = await saveWhiteList(formData)
  const result = getAPIResponse(res);
  if (result){
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

const ipCheck = async (rule, val) => {
  const regRule = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  if (val && !regRule.test(val)) {
    await callbackDetect(false, rule.message)
  }
  await callbackDetect(true)
}

const callbackDetect = (isCorrect, msg) => {
  if (isCorrect) {
    return Promise.resolve()
  } else {
    return Promise.reject(msg)
  }
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
    padding: 0.8vw;
    :deep(.ant-form-item-label) {
      label {
        color: white;
      }
    }
    .half {
      display: flex;
      .ant-form-item {
        width: 55%;
        :deep(.ant-form-item-label) {
          width: 25%;
        }
        &.noRequired {
          width: 45%;
          :deep(.ant-form-item-label) {
            width: 12%;
            text-align: center;
            .ant-form-item-required {
              &:before {
                display: none;
              }
              &:after{
                display: none;
              }
            }
          }
        }
      }
    }
  }
  .ant-form-item {
    :deep(.ant-form-item-label) {
      width: 14%;
    }
    :deep(.ant-form-item-control) {
      .ant-form-item-control-input {
        border: 1px solid #64686d !important;
        background-color: #242c2c !important;
        input, textarea {
          background-color: #242c2c !important;
        }
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
    .btn {
      &:first-child {
        margin-right: 10px;
      }
    }
  }
}
</style>
