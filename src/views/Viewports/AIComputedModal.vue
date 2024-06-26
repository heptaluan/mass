<template>
  <div class="ai-box">
    <a-modal
      v-model:visible="visible"
      title="AI 融合分析"
      width="900px"
      class="ai-box-modal"
      destroyOnClose
      :maskClosable="false"
      :keyboard="false"
      :closable="false"
    >
      <template #footer>
        <div class="footer-box" :class="{ showLoading: showLoading }">
          <a-button :disabled="!btnDisable" type="primary" @click="onFinish"
            >融合计算</a-button
          >
          <a-button @click="handleCancel">取消</a-button>
        </div>
      </template>

      <div class="header">一、PCR信息</div>

      <a-form
        class="step-one"
        ref="formRef"
        name="dynamic_form_nest_item"
        :model="formData"
      >
        <div class="list">
          <a-form-item
            name="sampleCode"
            label="样本名称"
            :rules="[{ required: true, message: '请输入样本名称' }]"
            class="title-item"
          >
            <a-input
              style="width: 150px"
              v-model:value="formData.sampleCode"
              placeholder="请输入样本名称"
            />
          </a-form-item>
          <a-form-item
            name="actb"
            label="ACTB1"
            :rules="[{ required: true, message: '请输入数值' }]"
            class="title-item"
          >
            <a-input-number
              style="width: 150px"
              v-model:value="formData.actb"
              placeholder="请输入数值"
              :step="0.01"
              :max="99.99"
              :min="0.01"
            />
          </a-form-item>
          <a-form-item
            name="actb2"
            label="ACTB2"
            :rules="[{ required: true, message: '请输入数值' }]"
            class="title-item"
          >
            <a-input-number
              style="width: 150px"
              v-model:value="formData.actb2"
              placeholder="请输入数值"
              :step="0.01"
              :max="99.99"
              :min="0.01"
            />
          </a-form-item>
        </div>

        <div class="list">
          <a-form-item
            name="s"
            label="SHOX2"
            :rules="[{ required: true, message: '请输入数值' }]"
            class="title-item"
          >
            <a-input-number
              style="width: 150px"
              v-model:value="formData.s"
              placeholder="请输入数值"
              :step="0.01"
              :max="99.99"
              :min="0.01"
            />
          </a-form-item>

          <a-form-item
            name="r"
            label="RASSF1A"
            :rules="[{ required: true, message: '请输入数值' }]"
            class="title-item"
          >
            <a-input-number
              style="width: 150px"
              v-model:value="formData.r"
              placeholder="请输入数值"
              :step="0.01"
              :max="99.99"
              :min="0.01"
            />
          </a-form-item>

          <a-form-item
            name="ptger4"
            label="PTGER4"
            :rules="[{ required: true, message: '请输入数值' }]"
            class="title-item"
          >
            <a-input-number
              style="width: 150px"
              v-model:value="formData.ptger4"
              placeholder="请输入数值"
              :step="0.01"
              :max="99.99"
              :min="0.01"
            />
          </a-form-item>
        </div>

        <div class="list">
          <a-form-item
            name="pcdhgc5"
            label="PCDHGC5"
            :rules="[{ required: true, message: '请输入数值' }]"
            class="title-item"
          >
            <a-input-number
              style="width: 150px"
              v-model:value="formData.pcdhgc5"
              placeholder="请输入数值"
              :step="0.01"
              :max="99.99"
              :min="0.01"
            />
          </a-form-item>

          <a-form-item
            name="apc"
            label="APC"
            :rules="[{ required: true, message: '请输入数值' }]"
            class="title-item"
          >
            <a-input-number
              style="width: 150px"
              v-model:value="formData.apc"
              placeholder="请输入数值"
              :step="0.01"
              :max="99.99"
              :min="0.01"
            />
          </a-form-item>

          <a-form-item
            name="a"
            label="ARL9"
            :rules="[{ required: true, message: '请输入数值' }]"
            class="title-item"
          >
            <a-input-number
              style="width: 150px"
              v-model:value="formData.a"
              placeholder="请输入数值"
              :step="0.01"
              :max="99.99"
              :min="0.01"
            />
          </a-form-item>
        </div>
      </a-form>

      <div class="header">二、结节信息</div>

      <div class="step-two">
        <div class="list-title">
          <div style="width: 80px">序号</div>
          <div style="width: 80px">中心帧</div>
          <div style="width: 120px">大小(mm)</div>
          <div style="width: 120px">平均密度(HU)</div>
          <div style="width: 120px">位置</div>
          <div style="width: 120px">类型</div>
        </div>

        <div
          class="list-content"
          v-for="(item, index) in props.nodeList"
          :key="item.id"
          style="display: flex"
        >
          <div style="width: 80px">{{ index + 1 }}</div>
          <div style="width: 80px">{{ item.centerFrame }}</div>
          <div style="width: 120px">
            {{ Number(item.width).toFixed(2) }}*{{
              Number(item.height).toFixed(2)
            }}
          </div>
          <div style="width: 120px">{{ item.hu }}</div>
          <div style="width: 120px">{{ item.location }}</div>
          <div style="width: 120px">{{ item.featuresType }}</div>
        </div>
      </div>

      <div class="header">三、融合分析结果</div>

      <div class="step-three">
        <template v-if="formData.sampleResult">
          <div class="title">
            <span style="color: #52c41a">融合计算成功</span>，分析结果如下：
          </div>
          <div class="content">
            <div class="title">
              <div>
                检测结果：<span style="color: #ff4d4f">{{
                  Number(formData.sampleResult) === 0 ? "阴性" : "阳性"
                }}</span>
                <!-- ，综合分值：<span style="color: #ff4d4f">
                  {{ (Number(formData.sampleMarks * 100)).toFixed(1) }} %
                </span> -->
              </div>
              <div>AI结果仅供参考，诊断需结合医生结论</div>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="tips">暂无分析结果</div>
        </template>
      </div>

      <div class="loading" v-if="showLoading">
        <div>
          <div class="title">AI融合计算中，请稍后……</div>
          <img style="margin-top: 2px" src="../../assets/ai.gif" />
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { defineProps, defineExpose, ref, defineEmits, reactive } from "vue";
import { calculate } from "@/api";
import { message } from "ant-design-vue";
import { getAPIResponse } from "@/utils/apiTools/useAxiosApi";
import { useUserStore } from "@/store/modules/user";

const showLoading = ref(false);
const userStore = useUserStore();

const props = defineProps(["seriesInstanceUid", "nodeList"]);
const emit = defineEmits(["upadtePCRContent"]);

const formRef = ref();

const formData = ref({});

const onFinish = () => {
  formRef.value
    .validateFields()
    .then(() => {
      showLoading.value = true;

      const postData = {
        pcrDTO: {
          sampleCode: formData.value.sampleCode,
          a: formData.value.a,
          r: formData.value.r,
          s: formData.value.s,
          actb: formData.value.actb,
          actb2: formData.value.actb2,
          ptger4: formData.value.ptger4,
          apc: formData.value.apc,
          pcdhgc5: formData.value.pcdhgc5,
        },
        seriesInstanceUid: props.seriesInstanceUid,
      };

      calculate(postData).then((res) => {
        const result = getAPIResponse(res);
        // resultType 0 是阴性，1 是阳性
        if (result.id) {
          showLoading.value = false;
          formData.value.sampleResult = result.resultType;
          // formData.value.sampleMarks = result.resultValue;
          emit("upadtePCRContent", result);
          message.success(`融合计计算成功！`);
        } else {
          showLoading.value = false;
          // message.warning(`融合计算失败，请重新尝试！`);
        }
      });
    })
    .catch((info) => {
      console.log("Validate Failed:", info);
    });
};

const btnDisable = ref(false);

const visible = ref(false);

const showModal = (pcrContent) => {
  formData.value = pcrContent;
  visible.value = true;

  if (userStore.getUserInfo.certificationStatus === "02") {
    btnDisable.value = true;
  } else {
    btnDisable.value = false;
  }
};

const handleCancel = (e) => {
  visible.value = false;
};

defineExpose({
  showModal,
});
</script>

<style lang="scss">
.ai-box-modal {
  .ant-modal-body {
    position: relative;
    padding: 25px 0;
  }

  .header {
    margin-bottom: 10px;
    font-size: 16px;
    background: rgb(68, 70, 72);
    width: 100%;
    padding: 0 10px;
  }

  .ant-form {
    font-size: 14px;

    .ant-form-item {
      color: #fff;
    }

    .ant-form-item-label > label {
      color: #fff;
    }
  }

  // PCR信息
  .step-one {
    padding: 20px 30px;

    .list {
      width: 100%;
      display: flex;
      justify-content: space-between;

      .ant-form-item-label {
        width: 83px;
      }

      .title-item {
        width: fit-content;
        margin-bottom: 0;
        margin-right: 30px;
      }
    }

    .list:nth-child(2) {
      margin: 15px 0;
    }

    .ant-input-number-input {
      color: #fff !important;
      background-color: #242c2d !important;
      padding: 0 10px !important;
    }
  }

  // 结节信息
  .step-two {
    padding: 20px 30px;

    .list-title {
      color: #fff;
      display: flex;
      text-align: center;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 5px;
      margin-bottom: 10px;
      border-bottom: 1px solid #ccc;
      font-size: 14px;
    }

    .list-content {
      color: #fff;
      display: flex;
      text-align: center;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 5px;
      margin-bottom: 10px;
    }
  }

  // 融合分析结果
  .step-three {
    width: 100%;
    height: 100%;
    padding: 20px 30px;
    font-size: 14px;
    line-height: 1.5715;
    word-wrap: break-word;
    background: rgb(29, 31, 33);

    .content {
      height: calc(100% - 65px);
      display: flex;
      align-items: center;
      justify-content: center;

      .title {
        height: 120px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        div {
          height: 40px;
          line-height: 40px;

          &:first-child {
            font-size: 18px;
          }
        }
      }
    }

    .tips {
      font-size: 16px;
      text-align: center;
    }
  }

  .loading {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    background: rgb(0 0 14);
    padding: 25px 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 3;

    .title {
      font-size: 16px;
      text-align: center;
      margin: -60px 0 30px 0;
    }

    img {
      max-width: 350px;
    }
  }

  .footer-box {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    padding: 10px 12px;
    z-index: 9;

    &.showLoading {
      background: rgb(0 0 14);

      button {
        color: #a9a9a9;
        border-color: #555;
        background: #555;
      }
    }

    button[disabled] {
      color: #666;
      background: transparent;
      border: 1px solid #666;
    }
  }
}
</style>
