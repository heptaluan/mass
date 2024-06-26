<template>
  <div class="change-voiRange-box">
    <a-modal
      v-model:visible="visible"
      title="自定义窗宽窗位"
      class="change-voiRange-box-modal"
      destroyOnClose
      :maskClosable="false"
      @ok="handleOk"
      @cancel="handleOkCancel"
      style="top: 120px"
      width="600px"
    >
      <a-form :label-col="{ span: 5 }" :wrapper-col="{ span: 13 }">
        <a-form-item label="窗宽（WW）" v-bind="validateInfos.width">
          <a-input-number
            v-model:value="modelRef.width"
            style="width: 200px"
            placeholder="请输入窗宽（WW）"
            :min="-5000"
            :max="5000"
            :precision="2"
            :step="0.01"
            string-mode
          />
        </a-form-item>

        <a-form-item label="窗位（WL）" v-bind="validateInfos.level">
          <a-input-number
            v-model:value="modelRef.level"
            style="width: 200px"
            placeholder="请输入窗位（WL）"
            :min="-5000"
            :max="5000"
            :precision="2"
            :step="0.01"
            string-mode
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { defineExpose, ref, reactive, defineEmits } from "vue";
import { Form } from "ant-design-vue";

const visible = ref(false);
const useForm = Form.useForm;

const modelRef = ref({
  width: "",
  level: "",
});

const rulesRef = reactive({
  width: [
    {
      required: true,
      message: "请输入窗宽（WW）",
    },
  ],
  level: [
    {
      required: true,
      message: "请输入窗位（WL）",
    },
  ],
});

const { validate, validateInfos, resetFields } = useForm(modelRef, rulesRef);

const showModal = () => {
  resetFields();
  modelRef.value.width = "";
  modelRef.value.level = "";
  visible.value = true;
};

const emit = defineEmits(["setVoiRange"]);

const handleOkCancel = () => {
  resetFields();
  visible.value = false;
};

const handleOk = () => {
  validate()
    .then(async () => {
      emit("setVoiRange", modelRef.value);
      visible.value = false;
    })
    .catch((err) => {
      console.log("error", err);
    });
};

defineExpose({
  showModal,
});
</script>

<style lang="scss">
.change-voiRange-box-modal {
  .ant-modal-footer {
    justify-content: flex-end;
  }

  .ant-form {
    padding: 20px 30px;
  }

  .ant-form-item-label > label {
    color: #fff;
    min-width: 100px;
  }

  .ant-form-item-label {
    margin-right: 10px;
  }

  .ant-input-number .ant-input-number-input {
    padding: 0 10px !important;
  }
}
</style>
