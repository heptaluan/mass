<template>
  <div class="pacs-box">
    <breadcrumb :title="'PACS服务管理'" />
    <div class="box-wrap">
      <div class="viewer-box-wrap">
        <div class="viewer-box">
          <div class="title">PACS系统设置</div>
          <div class="add-node-box editBox">
            <a-form
              ref="ruleForm"
              :model="formData"
              @finish="submit"
              @finishFailed="submitFailed"
            >
              <a-form-item
                style="margin-bottom: 24px"
                required
                name="host"
                label="PACS系统IP地址"
                :rules="[
                  { required: true, message: '请输入服务IP地址' },
                  {
                    validator: ipCheck,
                    trigger: 'blur',
                    message: '请填写正确的IP地址',
                  },
                ]"
              >
                <a-input
                  style="width: 356px"
                  v-model:value="formData.host"
                  placeholder="请输入服务IP地址"
                  type="text"
                />
              </a-form-item>
              <div>
                <a-form-item
                  required
                  name="port"
                  label="端口号"
                  :rules="[
                    { required: true, message: '请输入端口号' },
                    {
                      validator: portCheck,
                      trigger: 'blur',
                      message: '请填写正确的端口号',
                    },
                  ]"
                >
                  <a-input
                    style="width: 356px"
                    v-model:value="formData.port"
                    placeholder="请输入端口号"
                    type="text"
                  />
                </a-form-item>
              </div>
              <div class="half">
                <!-- <a-form-item required name="tokenValidity" label="获取文件频率（分钟）" :rules="[{ required: true, message: '请输入有效时间(整数)' }]">
              <a-input-number v-model:value="formData.tokenValidity" placeholder="请输入有效时间(整数)" style="width: 100%" :min="10" :max="1440" :precision="0" :step="1" string-mode />
            </a-form-item> -->
              </div>
            </a-form>
          </div>
        </div>
      </div>
      <div class="footer">
        <a-button
          key="submit"
          type="primary"
          class="submitBtn"
          html-type="submit"
          @click="submit"
          >确认</a-button
        >
      </div>
    </div>
    <LoadingModal ref="loadingModal" />
  </div>
</template>

<script setup>
import { ref, reactive, onBeforeMount } from "vue";
import { getPACSServer, setPACSServer } from "@/api";
import { getAPIResponse } from "@/utils/apiTools/useAxiosApi";
import { message } from "ant-design-vue";
import LoadingModal from "@/components/Loading/loadingModal.vue";
import breadcrumb from "../breadcrumb.vue";

const loadingModal = ref(null);
const formData = reactive({
  host: "",
  port: "",
});
const ruleForm = ref();

onBeforeMount(() => {
  initIP();
});

const initIP = () => {
  getPACSServer().then((res) => {
    const result = getAPIResponse(res);
    formData.host = result.host;
    formData.port = result.port;
  });
};

const submit = async () => {
  loadingSwitch(true);
  formData.port = Number(formData.port);
  const res = await setPACSServer(formData);
  const result = getAPIResponse(res);
  loadingSwitch(false);
  initIP();
  message.success(result);
};

const resetForm = () => {
  ruleForm.value.resetFields();
};

const submitFailed = (e) => {
  console.log(e, formData);
};

const ipCheck = async (rule, val) => {
  const regRule =
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  if (val && !regRule.test(val)) {
    await callbackDetect(false, rule.message);
  }
  await callbackDetect(true);
};
const portCheck = async (rule, val) => {
  const regRule =
    /^((6553[0-5])|(655[0-2][0-9])|(65[0-4][0-9]{2})|(6[0-4][0-9]{3})|([1-5][0-9]{4})|([0-5]{0,5})|([0-9]{1,4}))$/;
  if (val && !regRule.test(val)) {
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

const loadingSwitch = (status) => {
  loadingModal.value.showLoadingModal(status);
};
</script>

<style scoped>
@import "@/assets/main.css";
</style>
<style scoped lang="scss">
.pacs-box {
  height: 100%;

  .box-wrap {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: calc(100% - 120px);
  }
}

.viewer-box-wrap {
  width: 100%;
  padding: 24px;
  background: rgb(29, 31, 33);

  .viewer-box {
    background: rgb(44, 46, 48);
  }

  .title {
    color: white;
    font-size: 16px;
    height: 65px;
    line-height: 65px;
    padding: 0 24px;
    border-bottom: 1px solid rgb(119, 119, 119);
  }
}
.editBox {
  padding: 24px;
  .ant-form {
    border-radius: 4px;
    //padding: 0.8vw;
    :deep(.ant-form-item-label) {
      label {
        color: white;
      }
    }
  }

  .ant-form-item {
    margin-bottom: 0;

    :deep(.ant-form-item-control-input) {
      width: 359px;
    }
    :deep(.ant-form-item-label) {
      width: 140px;
      text-align: right;
    }
    :deep(.ant-form-item-control) {
      .ant-form-item-control-input {
        background-color: #242c2c !important;
        .ant-form-item-control-input-content {
          .ant-input {
            color: white !important;
          }
        }
      }
    }
  }
}

.footer {
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 80px;
  min-height: 80px;
  background: rgb(44, 46, 48);
  border-top: 1px solid rgb(119, 119, 119);
}

.submitBtn {
  width: 100px;
  height: 32px;
  line-height: 32px;
  background-color: #4e5255;
  border-color: #7d858a;
  border-radius: 4.5px;
  letter-spacing: 3px;
  color: #fff;
  padding: 0;
  margin: 0;
}
</style>
