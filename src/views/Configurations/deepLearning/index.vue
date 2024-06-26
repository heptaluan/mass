<template>
  <div class="viewer-box">
    <div class="title">深度学习服务参数</div>
    <div class="add-node-box editBox">
      <a-form ref="ruleForm" :model="formData" @finish="submit" @finishFailed="submitFailed">
        <a-form-item required name="serverIp" label="服务IP地址" :rules="[{ required: true, message: '请输入服务IP地址' }, {validator: ipCheck, trigger: 'blur', message: '请填写正确的IP地址'}]">
          <a-input v-model:value="formData.serverIp" placeholder="请输入服务IP地址" type="text" />
        </a-form-item>
        <div class="half">
          <a-form-item required name="port" label="端口号" :rules="[{ required: true, message: '请输入端口号' }, {validator: portCheck, trigger: 'blur', message: '请填写正确的端口号'}]">
            <a-input v-model:value="formData.port" placeholder="请输入端口号" type="text" />
          </a-form-item>
        </div>

        <div class="footer">
          <a-button key="submit" type="primary" class="btn generalBtn" html-type="submit">确认</a-button>
        </div>
      </a-form>
    </div>
    <LoadingModal ref="loadingModal" />
  </div>
</template>

<script setup>
import {ref, reactive, onBeforeMount} from "vue";
import {getAiServer, setAiServer} from "@/api";
import {getAPIResponse} from "@/utils/apiTools/useAxiosApi";
import {message} from "ant-design-vue";
import LoadingModal from "@/components/Loading/loadingModal.vue";

const loadingModal = ref(null);
const formData = reactive({
  serverIp: '',
  port: '',
});
const ruleForm = ref();

onBeforeMount(() =>{
  initIP()
})

const initIP = () => {
  getAiServer().then(res => {
    const result = getAPIResponse(res)
    formData.serverIp = result.serverIp
    formData.port = result.port
  })
}

const submit = async () => {
  loadingSwitch(true)
  const res = await setAiServer(formData)
  const result = getAPIResponse(res);
  loadingSwitch(false)
  initIP()
  message.success(result)
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
const portCheck = async (rule, val) => {
  const regRule = /^((6553[0-5])|(655[0-2][0-9])|(65[0-4][0-9]{2})|(6[0-4][0-9]{3})|([1-5][0-9]{4})|([0-5]{0,5})|([0-9]{1,4}))$/
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

const loadingSwitch = (status) => {
  loadingModal.value.showLoadingModal(status);
};

</script>

<style scoped>
@import "@/assets/main.css";
</style>
<style scoped lang="scss">
.viewer-box {
  width: 40vw;
  padding: 12px 24px;
  .title {
    padding: 30px 2px;
    color: white;
  }
}
.editBox {
  .ant-form {
    border-radius: 4px;
    //padding: 0.8vw;
    :deep(.ant-form-item-label) {
      label {
        color: white;
      }
    }
  }
  .half {
    width: 50%;
  }
  .ant-form-item {
    :deep(.ant-form-item-label) {
      width: 6vw;
      text-align: left;
    }
    :deep(.ant-form-item-control) {
      .ant-form-item-control-input {
        border: 1px solid #64686d !important;
        background-color: #242c2c !important;
        .ant-form-item-control-input-content {
          .ant-input {
            color: white !important;
          }
        }
      }
    }
  }
  .footer {
    display: flex;
    justify-content: center;
    margin-top: 30px;
    .btn {
      &:first-child {
        margin-right: 10px;
      }
    }
  }
}
</style>
