<template>
  <div class="logout-box">
    <a-modal
        v-model:visible="visible"
        class="instructions-box-modal"
        destroyOnClose
        :maskClosable="false"
    >
      <template #footer>
        <a-button @click="handleCancel">取消</a-button>
        <a-button @click="handleConfirm">确定</a-button>
      </template>

      <div class="hint">
        <div class="title"><info-circle-outlined /><span>警告</span></div>
        <div class="txt" v-if="fromPage === 'department'">操作不可恢复，请确认是否删除？</div>
        <div class="txt" v-if="fromPage === 'user'">用户状态即将被修改，请确认是否修改？</div>
        <div class="txt" v-if="fromPage === 'passwordReset'">用户密码即将被初始化，请确认是否继续？</div>
        <div class="txt" v-if="fromPage === 'parameters'">操作不可恢复，请确认是否删除？</div>
        <div class="txt" v-if="fromPage === 'setParametersDefault'">将设置此条为默认，请确认是否继续？</div>
        <div class="txt" v-if="fromPage === 'whiteList'">操作不可恢复，请确认是否删除？</div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import {defineEmits, defineExpose, ref} from "vue";
import {deleteDept, switchStatus, resetPassword, parametersDelete, setParametersDefault, deleteWhiteList} from "@/api";
import {getAPIResponse} from "@/utils/apiTools/useAxiosApi";
import { message } from 'ant-design-vue';
import {  InfoCircleOutlined   } from "@ant-design/icons-vue";
const emit = defineEmits(["selectDepartment", 'initList']);

let selectData = ref(null)
let fromPage = ref('')

const visible = ref(false);

const openModal = (status, data, page) => {
  visible.value = status;
  if (status) {
    selectData.value = data
    fromPage.value = page
  }
};

const handleConfirm = () => {
  if (fromPage.value === 'department') {
    deleteDept({id: selectData.value.id}).then(res => {
      const result = getAPIResponse(res)
      console.log(result)
      if (result) {
        message.success(result)
        emit('selectDepartment', selectData.value.parentId, true)
      }
      handleCancel()
    }, err => {
      console.log('err: ', err)
    })
  } else if (fromPage.value === 'user') {
    switchStatus({userId: selectData.value.id}).then(res => {
      const result = getAPIResponse(res)
      console.log(result)
      if (result) {
        message.success('切换成功')
      }
      handleCancel()
    }, err => {
      console.log('err: ', err)
    })
  } else if (fromPage.value === 'passwordReset') {
    resetPassword({userId: selectData.value.id}).then(res => {
      const result = getAPIResponse(res)
      console.log(result)
      if (result) {
        message.success(result)
      }
      handleCancel()
    }, err => {
      console.log('err: ', err)
    })
  } else if (fromPage.value === 'parameters') {
    parametersDelete({id: selectData.value.id}).then(res => {
      const result = getAPIResponse(res)
      console.log(result)
      if (result) {
        message.success(result)
      }
      handleCancel()
    }, err => {
      console.log('err: ', err)
    })
  } else if (fromPage.value === 'setParametersDefault') {
    setParametersDefault({id: selectData.value[0].id}).then(res => {
      const result = getAPIResponse(res)
      console.log(result)
      if (result) {
        message.success(result)
      }
      handleCancel()
    }, err => {
      console.log('err: ', err)
    })
  } else if (fromPage.value === 'whiteList') {
    deleteWhiteList({id: selectData.value.id}).then(res => {
      const result = getAPIResponse(res)
      console.log(result)
      if (result) {
        message.success(result)
      }
      handleCancel()
    }, err => {
      console.log('err: ', err)
    })
  }

};

const handleCancel = () => {
  emit('initList')
  visible.value = false;
};

defineExpose({
  openModal,
});
</script>

<style scoped lang="scss">
.hint {
  font-size: 0.8vw;
  text-align: center;
  margin: 20px auto;
  padding: 60px 100px;
  display: flex;
  justify-content: left;
  flex-wrap: wrap;
  .title {
    margin-bottom: 16px;
    font-size: 16px;
    font-weight: 600;
    display: flex;
    .anticon {
      font-size: 20px;
      display: flex;
      margin-right: 10px;
      align-self: center;

      svg {
        align-self: center;
      }
    }
  }
  .txt {
    width: 100%;
    font-size: 14px;
  }
}
</style>
