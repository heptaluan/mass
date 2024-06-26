<template>
  <div class="login">
    <div class="logo">
      <img src="../../assets/logo.png" />
    </div>

    <div class="title">肺结节CT影像辅助诊断软件</div>

    <a-form :model="formData" @finish="submit" @finishFailed="submitFailed">
      <a-form-item
        required
        name="username"
        label=""
        :rules="[
          { required: true, message: '请输入用户名' },
          { validator: userNameCheck, message: '请填写正确的用户名' },
        ]"
      >
        <a-input
          autoComplete="new-password"
          v-model:value="formData.username"
          placeholder="请输入用户名"
        >
          <template #prefix>
            <UserOutlined class="site-form-item-icon" />
          </template>
        </a-input>
      </a-form-item>
      <a-form-item
        required
        name="password"
        label=""
        :rules="[{ required: true, message: '请填写密码' }]"
      >
        <a-input-password
          autoComplete="new-password"
          v-model:value="formData.password"
          placeholder="请输入密码"
        >
          <template #prefix>
            <LockOutlined class="site-form-item-icon" />
          </template>
        </a-input-password>
      </a-form-item>
      <a-button block type="info" class="submit" html-type="submit">
        登录
      </a-button>
    </a-form>
  </div>
  <LoadingModal ref="loadingModal" />
</template>

<script setup lang="ts">
import router from "@/router";
import { onMounted, reactive, ref } from "vue";
import { useUserStore } from "@/store/modules/user";
import { getVaildateImage } from "@/api";
import { getAPIResponse } from "@/utils/apiTools/useAxiosApi";
import LoadingModal from "@/components/Loading/loadingModal.vue";
import { message } from "ant-design-vue";
import { UserOutlined, LockOutlined } from "@ant-design/icons-vue";

const userStore = useUserStore();
const formData = reactive({
  username: "",
  password: "",
  captcha: "1",
});
let requestCodeSuccess = ref(false);
let randCodeImage = ref("");
let checkKey = ref(0);
const loadingModal = ref(null);

onMounted(() => {
  handleChangeCheckCode();
});

const submit = async (values: any) => {
  loadingSwitch(true);
  const userInfo = {
    ...values,
    checkKey: checkKey.value,
  };
  await userStore.login(userInfo).then((res: object) => {
    console.log(res);
    loadingSwitch(false);

    if (res && res["token"]) {
      router.push({ name: "patientList" });
      if (res["certificationStatus"] !== "02") {
        message.warning({
          content: () => "平台未授权，部分功能将禁用",
          style: {
            marginTop: "40vh",
          },
        });
      }
    } else {
      message.error(res.toString());
    }
  });
};

const submitFailed = (ele: any) => {
  console.log("submit failed: ", ele);
};

const loadingSwitch = (status) => {
  loadingModal.value.showLoadingModal(status);
};

const userNameCheck = async (rule: any, val: any) => {
  if (val && val.length < 4) {
    await callbackDetect(false, rule.message);
  }
  await callbackDetect(true);
};

const handleChangeCheckCode = () => {
  checkKey.value = new Date().getTime();
  getVaildateImage(checkKey.value).then((res) => {
    randCodeImage.value = getAPIResponse(res);
    // console.log(randCodeImage)
    requestCodeSuccess.value = true;
  });
};

const callbackDetect = (isCorrect: boolean, msg?: any) => {
  if (isCorrect) {
    return Promise.resolve();
  } else {
    return Promise.reject(msg);
  }
};
</script>

<style scoped lang="scss">
.login {
  width: 330px;
  box-shadow: rgba(255, 255, 255, 0) 0px 0px 1px;
  background: rgb(255, 254, 251);
  filter: drop-shadow(rgb(125, 133, 138) 0px 3px 6px);
  border-radius: 7.5px;
  padding: 35px 20px;

  h2 {
    text-align: center;
    letter-spacing: 10px;
    margin-bottom: 30px;
    font-size: 1.4vw;
    color: white;
  }

  .logo {
    margin-bottom: 20px;
    display: flex;
    justify-content: center;

    img {
      max-width: 90px;
    }
  }

  .title {
    font-size: 22px;
    text-align: center;
    font-weight: bold;
    margin-bottom: 25px;
  }

  .ant-form {
    :deep(.ant-form-item-label) {
      .ant-form-item-required {
        color: rgb(44, 46, 48);
      }
    }
    :deep(.ant-input) {
      line-height: initial;
    }
  }

  .nut-form-item {
    background: #f2f3f5;
    border-radius: 20px;
    margin-bottom: 20px;

    input {
      background: transparent;
    }
  }
  .validateCode {
    display: flex;
    justify-content: space-between;
    .ant-form-item {
      width: 70%;
    }
  }

  .submit {
    height: 32px;
    background-color: rgb(79, 83, 85);
    border-radius: 4.5px;
    color: white;
    box-shadow: rgba(255, 255, 255, 0) 0px 0px 1px;
    line-height: initial;
    padding: 0;
  }
}
</style>
