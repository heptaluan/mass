<template>
  <div class="viewer-box-wrap">
    <breadcrumb :title="'网络安全管理'" />
    <div class="edit-box-wrap">
      <div class="viewerBox">
        <div class="editBox">
          <a-form
            ref="ruleForm"
            :model="formData"
            @finish="submit"
            @finishFailed="submitFailed"
          >
            <div class="section">
              <div class="title">用户密码设置</div>
              <div class="itemPart" style="padding-bottom: 0">
                <div class="withIcon">
                  <a-form-item
                    required
                    name="defaultPassword"
                    label="初始密码"
                    :rules="[
                      { required: true, message: '请输入初始密码' },
                      {
                        validator: passwordCheck,
                        trigger: 'blur',
                        message: '请填写正确的初始密码',
                      },
                    ]"
                  >
                    <a-input
                      style="width: 356px"
                      v-model:value="formData.defaultPassword"
                      placeholder="请输入初始密码"
                      type="text"
                    />
                  </a-form-item>
                  <a-popover placement="right">
                    <template #content>
                      <p>密码必须为数字和英文字母组合，长度为6~16位字符</p>
                    </template>
                    <question-circle-outlined two-tone-color="#eb2f96" />
                  </a-popover>
                </div>
              </div>
              <div class="itemPart">
                <div class="withIcon">
                  <a-form-item
                    required
                    name="passwordValidity"
                    label="密码有效期"
                  >
                    <a-select
                      style="width: 356px"
                      v-model:value="formData.passwordValidity"
                      :options="dateOptions"
                      :field-names="dateFieldNames"
                    ></a-select>
                  </a-form-item>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="title">用户登录错误和禁用时间</div>
              <div class="itemPart" style="padding-bottom: 0">
                <div class="withIcon">
                  <a-form-item
                    required
                    name="loginErrorTimes"
                    label="错误次数（次)"
                    :rules="[
                      { required: true, message: '请输入错误次数(整数)' },
                    ]"
                  >
                    <a-input-number
                      v-model:value="formData.loginErrorTimes"
                      placeholder="请输入错误次数(整数)"
                      style="width: 356px"
                      :min="3"
                      :max="10"
                      :precision="0"
                      :step="1"
                      string-mode
                    />
                  </a-form-item>
                  <a-popover placement="right">
                    <template #content>
                      <p>
                        当用户输入错误密码达到次数上限后，按照禁用时间禁止账号登录
                      </p>
                    </template>
                    <question-circle-outlined two-tone-color="#eb2f96" />
                  </a-popover>
                </div>
              </div>
              <div class="itemPart">
                <a-form-item
                  required
                  name="loginErrorPunish"
                  label="禁用时间（分钟）"
                  :rules="[{ required: true, message: '请输入禁用时间(整数)' }]"
                >
                  <a-input-number
                    v-model:value="formData.loginErrorPunish"
                    placeholder="请输入禁用时间(整数)"
                    style="width: 356px"
                    :min="5"
                    :max="300"
                    :precision="0"
                    :step="1"
                    string-mode
                  />
                </a-form-item>
              </div>
            </div>

            <div class="section">
              <div class="title">用户登录有效性</div>
              <div class="itemPart">
                <div class="withIcon">
                  <a-form-item
                    required
                    name="tokenValidity"
                    label="闲置时间（分钟）"
                    :rules="[
                      { required: true, message: '请输入闲置时间(整数)' },
                    ]"
                  >
                    <a-input-number
                      style="width: 356px"
                      v-model:value="formData.tokenValidity"
                      placeholder="请输入闲置时间(整数)"
                      :min="10"
                      :max="1440"
                      :precision="0"
                      :step="1"
                      string-mode
                    />
                  </a-form-item>
                  <a-popover placement="right">
                    <template #content>
                      <p>当启用后，用户空闲达到闲置时间后系统自动登出</p>
                    </template>
                    <question-circle-outlined two-tone-color="#eb2f96" />
                  </a-popover>
                </div>
                <!-- <div class="subTitle">注意：建议闲置时间设置不小于5分钟</div> -->
              </div>
            </div>

            <div class="section">
              <div class="title">用户节点IP白名单</div>
              <div class="itemPart">
                <div class="area">
                  <div class="tableArea">
                    <div class="functionArea">
                      <div class="btnArea">
                        <a-button
                          block
                          type="info"
                          class="submitBtn"
                          @click="(e) => addDepartment(null)"
                        >
                          新增
                        </a-button>
                        <a-popover placement="right">
                          <template #content>
                            <p>管理员用户不受白名单管控</p>
                          </template>
                          <question-circle-outlined two-tone-color="#eb2f96" />
                        </a-popover>
                      </div>
                    </div>
                    <div class="tableBox">
                      <a-table
                        :data-source="ipList"
                        :columns="columns"
                        :row-key="(record) => record.id"
                        :pagination="false"
                        :childrenColumnName="'kids'"
                        bordered
                      >
                        <template #bodyCell="{ column, record, index }">
                          <template v-if="column.key === 'orderNum'">
                            {{ index + 1 }}
                          </template>
                          <template v-if="column.key === 'ipRange'">
                            {{ record.ipBegin }} ~ {{ record.ipEnd }}
                          </template>
                          <template v-if="column.key === 'operation'">
                            <span class="icon" @click="editItem(record)"
                              ><icon-font type="icon-mokuai-bianji"
                            /></span>
                            <span class="icon" @click="deleteItem(record)"
                              ><DeleteOutlined
                            /></span>
                          </template>
                        </template>
                      </a-table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </a-form>
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
    </div>
    <EditModal ref="editModal" @initList="initList" />
    <ConfirmModal ref="confirmModal" @initList="initList"></ConfirmModal>
  </div>
</template>

<script setup>
import {
  createFromIconfontCN,
  DeleteOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons-vue";
import IconFontUrl from "../../../assets/iconFont";
import { onBeforeMount, onMounted, reactive, ref } from "vue";
import {
  getFileStorage,
  getNetworkSecurity,
  getSelectionsByType,
  setFileStorage,
  setNetworkSecurity,
} from "@/api";
import { getAPIResponse } from "@/utils/apiTools/useAxiosApi";
import { message } from "ant-design-vue";
import EditModal from "./safeModal";
import ConfirmModal from "../confirmModal";
import breadcrumb from "../breadcrumb.vue";

const formData = reactive({
  defaultPassword: "",
  loginErrorPunish: "",
  loginErrorTimes: "",
  passwordValidity: "",
  tokenValidity: "",
});

const ipList = ref([]);
let editModal = ref(null);
let confirmModal = ref(null);
const IconFont = createFromIconfontCN({
  scriptUrl: IconFontUrl,
});

const dateOptions = ref([]);
const dateFieldNames = {
  label: "dictLabel",
  value: "dictValue",
};
const columns = [
  {
    title: "序号",
    dataIndex: "orderNum",
    key: "orderNum",
    align: "center",
    // width: 300
  },
  {
    title: "描述",
    dataIndex: "description",
    key: "description",
    align: "center",
  },
  {
    title: "IP区间",
    dataIndex: "ipRange",
    key: "ipRange",
    align: "center",
  },
  {
    title: "备注",
    dataIndex: "remark",
    key: "remark",
    align: "center",
  },
  {
    title: "操作",
    dataIndex: "operation",
    key: "operation",
    align: "center",
  },
];

onBeforeMount(() => {
  console.log();
});

onMounted(async () => {
  await getDateType();
  initList();
});

const getDateType = async () => {
  const res = await getSelectionsByType();
  dateOptions.value = getAPIResponse(res)["sys_password_validity"];
};

const initList = () => {
  getNetworkSecurity().then((innerRes) => {
    const result = getAPIResponse(innerRes);
    formData.defaultPassword = result.defaultPassword;
    formData.loginErrorPunish = result.loginErrorPunish;
    formData.loginErrorTimes = result.loginErrorTimes;
    formData.passwordValidity = result.passwordValidity;
    formData.tokenValidity = result.tokenValidity;
    ipList.value = result.whiteListVOList;
  });
};

const submit = async () => {
  const newForm = Object.assign({}, formData);

  const res = await setNetworkSecurity(newForm);
  const result = getAPIResponse(res);
  if (result) {
    message.success(result);
  } else {
    message.success("设置失败，请重新设置");
  }
};

const submitFailed = (e) => {
  console.log(e, formData);
};

const addDepartment = (record) => {
  editModal.value.openModal(true, record);
};

const editItem = (record) => {
  console.log(record);
  addDepartment(record);
};
const deleteItem = (record) => {
  console.log(record);
  confirmModal.value.openModal(true, record, "whiteList");
};

const passwordCheck = async (rule, val) => {
  const regRule = /^(?=.*[0-9])(?=.*[a-zA-Z])[a-zA-Z0-9]+$/;
  if (val && !(regRule.test(val) && val.length >= 6 && val.length <= 16)) {
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
</script>

<style scoped>
@import "@/assets/main.css";
</style>
<style scoped lang="scss">
.viewer-box-wrap {
  height: 100%;
  .edit-box-wrap {
    height: calc(100% - 120px);
  }
  .viewerBox {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
}

.editBox {
  background: rgb(29, 31, 33);
  .section {
    margin-bottom: 24px;
    background: rgb(44, 46, 48);

    .title {
      color: white;
      font-size: 16px;
      height: 65px;
      line-height: 65px;
      padding: 0 24px;
      border-bottom: 1px solid rgb(119, 119, 119);
    }

    .itemPart {
      padding: 24px 30px;
      .subTitle {
        color: white;
        font-size: 14px;
        margin-bottom: 12px;
      }
      .withIcon {
        display: flex;
        align-items: center;
        .anticon {
          color: white;
          margin-left: 15px;
          font-size: 18px;
        }
      }
    }
  }
  .ant-form {
    border-radius: 4px;
    padding: 24px;
    :deep(.ant-form-item-label) {
      label {
        color: white;
      }
    }
    :deep(.ant-form-item-control-input) {
      width: 358px;
      .ant-form-item-control-input-content {
        max-width: 100%;
        .ant-input {
          color: white !important;
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
  .ant-form-item {
    margin: 0;
    :deep(.ant-form-item-label) {
      width: 140px;
    }
  }
}
.area {
  padding: 0;
  margin: 0;
  display: flex;
  justify-content: space-between;
  height: 100%;
  .functionArea {
    margin-bottom: 0;
    .btnArea {
      display: flex;
      align-items: center;
      margin-bottom: 24px;
      .anticon {
        color: white;
        margin-left: 12px;
        font-size: 18px;
      }
    }
  }
  .tableArea {
    width: 100vw;
    padding: 0;
    .title {
      padding: 10px 2px;
      color: white;
    }
    .functionArea {
      width: 100%;
      .btn {
        width: 120px;
      }
    }
    .tableBox {
      width: 100%;
      :deep(.ant-table) {
        .ant-table-row {
          border: 1px solid #f0f0f0;
        }
        .ant-table-row-selected {
          border: 1px solid #f0f0f0;
          td {
            border-color: #f0f0f0;
          }
        }
        .ant-table-cell {
          color: white;
          background-color: #444648;
          .icon {
            &:hover {
              color: #b1e5f8;
              cursor: pointer;
            }
            &:first-child {
              margin-right: 10px;
            }
            .anticon {
              font-size: 20px;
            }
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
