<template>
  <div class="viewer-box">
    <a-modal
        v-model:visible="departmentEditModal"
        :title="titleTxt"
        style="top: 100px"
        :maskClosable=false
        :closable=false
        :footer="null"
        :width="600"
        :confirm-loading="confirmLoading"
    >
      <div class="add-node-box editBox">
        <a-form ref="ruleForm" :model="formData" @finish="submit" @finishFailed="submitFailed">
          <a-form-item name="parentDepartment" label="父部门">
            <a-input v-model:value="parentDepartmentText" placeholder="请输入用户名" type="text" disabled />
          </a-form-item>
          <a-form-item required name="deptCode" label="部门编号" :rules="[{ required: true, message: '请输入部门编号' }]">
            <a-input v-model:value="formData.deptCode" placeholder="请输入部门编号" type="text" />
          </a-form-item>
          <a-form-item required name="deptName" label="部门名称" :rules="[{ required: true, message: '请输入部门名称' }]">
            <a-input v-model:value="formData.deptName" placeholder="请输入部门编号" type="text" />
          </a-form-item>
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
import {addNodule, saveDept} from "@/api";
import {getAPIResponse} from "@/utils/apiTools/useAxiosApi";
import {message} from "ant-design-vue";
const departmentEditModal = ref(false);
const confirmLoading = ref(false);
let noduleData
const emit = defineEmits(["selectDepartment"]);
const props = defineProps(["noduleList"]);
let parentDepartmentText = ref('')
const formData = reactive({
  parentId: '',
  id: '',
  deptCode: '',
  deptName: '',
  remark: '',
});
let titleTxt = ref('')
const ruleForm = ref();

const openModal = (status, department, selectDepartment) => {
  departmentEditModal.value = status
  if (status) {
    parentDepartmentText.value = department.deptName
    formData.parentId = department.id
    if (selectDepartment) {
      formData.id = selectDepartment.id
      formData.deptCode = selectDepartment.deptCode
      formData.deptName = selectDepartment.deptName
      formData.remark = selectDepartment.remark
      titleTxt.value = '部门信息编辑'
    } else {
      titleTxt.value = '新增部门'
    }
    console.log(department)
  } else {
    resetForm()
  }
}

const submit = async (values) => {
  const res = await saveDept(formData)
  const result = getAPIResponse(res);
  emit('selectDepartment', result.parentId, true)
  resetForm()
  openModal(false)
  message.success('创建成功')
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
    padding: 0 36px;
    :deep(.ant-form-item-label) {
      label {
        color: white;
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
      margin-right: 20px;
      width: 20%;
    }
    :deep(.ant-form-item-control) {
      .ant-form-item-control-input {
        width: 360px;
        input, textarea {
          &#form_item_remark {
            height: 120px;
          }
        }
      }
    }
    &:first-child {
      :deep(.ant-form-item-control-input) {
        border: transparent !important;
        border-radius: 2.5px;
      }
      :deep(.ant-form-item-control-input-content) {
        .ant-input-disabled {
          background-color: #7b8288 !important;
          color: white !important;
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
