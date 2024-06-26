<template>
  <div class="logout-box">
    <a-modal
        v-model:visible="visible"
        class="instructions-box-modal"
        destroyOnClose
        :maskClosable="false"
    >
      <template #footer>
        <a-button class="generalBtn" @click="handleCancel">{{ selectData.imageStatus === '03' ? '取消' : '确定' }}</a-button>
        <a-button class="generalBtn" @click="handleConfirm" v-if="selectData.imageStatus === '03'">确定</a-button>
      </template>

      <div class="hint">
        <div class="title"><info-circle-outlined /><span>提示</span></div>
        <div class="txt" v-if="selectData.imageStatus === '03'">影像数据缺失，是否需要重新加载影像？</div>
        <div class="txt" v-if="selectData.imageStatus === '02'">影像数据正在加载中，请稍后查看加载结果。</div>
      </div>
    </a-modal>
    <LoadingModal ref="loadingModal" />
  </div>
</template>

<script setup>
import {defineEmits, defineExpose, ref} from "vue";
import {restoreDicomByStudyUid} from "@/api";
import {getAPIResponse} from "@/utils/apiTools/useAxiosApi";
import { message } from 'ant-design-vue';
import {  InfoCircleOutlined   } from "@ant-design/icons-vue";
import LoadingModal from "@/components/Loading/loadingModal";
const emit = defineEmits(["selectDepartment", 'initList']);

let selectData = ref(null)
let loadingModal = ref(null)

const visible = ref(false);
const loading = ref(false);

const openModal = (status, data, page) => {
  visible.value = status;
  if (status) {
    selectData.value = data

  }
};

const handleConfirm = () => {
  loadingSwitch(true)
  restoreDicomByStudyUid({studyUid: selectData.value.studyInstanceUid}).then(res => {
    const result = getAPIResponse(res)
    console.log(result)
    if (result) {
      message.success(result)
    }
    loading.value = false
    loadingSwitch(false)
    message.success('正在恢复该影像数据，请稍后。')

    handleCancel()
  }, err => {
    loadingSwitch(false)

    console.log('err: ', err)
  })
};

const handleCancel = () => {
  emit('initList')
  visible.value = false;
};

const loadingSwitch = (status) => {
  loadingModal.value.showLoadingModal(status);
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
  padding: 60px 70px;
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
