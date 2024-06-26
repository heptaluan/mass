<template>
  <div class="about-box">
    <a-modal
      v-model:visible="visible"
      title="关于"
      class="about-box-modal"
      width="620px"
      destroyOnClose
    >
      <template #footer>
        <a-button @click="handleCancel">确定</a-button>
      </template>

      <div class="content-box">
        <div class="top-box">
          <div class="list">
            <span>产品名称</span>
            <span>肺结节CT影像辅助诊断软件</span>
          </div>
          <div class="list">
            <span>型号规格</span>
            <span>AIVD-lung</span>
          </div>
          <div class="list">
            <span>发布版本</span>
            <span>{{ version && version.split(".")[0] }}</span>
          </div>
          <div class="list">
            <span>完整版本</span>
            <span>{{ version }}</span>
          </div>
          <div class="list">
            <span>注册人/生产企业</span>
            <span>成都泰莱生物科技有限公司</span>
          </div>
          <div class="list">
            <span>住所/生产地址</span>
            <span>成都天府国际生物城（双流区岐黄一路1000号12栋1单元401号）</span>
          </div>
        </div>
        <div class="bottom-box">
          Copyright 2023 TILIGH Biosciences. All Right Reserved.
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { defineExpose, ref } from "vue";

const visible = ref(false);
const version = ref("");

const showModal = (data) => {
  version.value = data;
  visible.value = true;
};

const handleCancel = () => {
  visible.value = false;
};

defineExpose({
  showModal,
});
</script>

<style lang="scss">
.content-box {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-size: 14px;

  .top-box {
    display: flex;
    flex-direction: column;
    width: 480px;
    margin: 0 auto;

    .list {
      margin-bottom: 5px;
      display: flex;
      justify-content: space-evenly;

      span {
        display: inline-block;

        &:first-child {
          width: 130px;
        }

        &:last-child {
          word-break: break-all;
          width: 280px;
        }
      }
    }
  }

  .bottom-box {
    margin-top: 20px;
    text-align: center;
  }
}
</style>
