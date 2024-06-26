<template>
  <div class="breadcrumb-box">
    <a-breadcrumb>
      <a-breadcrumb-item>系统设置</a-breadcrumb-item>
      <a-breadcrumb-item>{{ props.title }}</a-breadcrumb-item>
    </a-breadcrumb>
    <div class="page-title">
      {{ props.title }}
    </div>
  </div>
</template>

<script setup>
import { defineProps } from "vue";

const props = defineProps(["title"]);
</script>

<style scoped lang="scss">
.breadcrumb-box {
  width: 100%;
  height: 120px;
  background: rgb(44, 46, 48);
  padding: 0 15px;
  font-size: 14px;

  .ant-breadcrumb {
    height: 40px;
    line-height: 40px;
  }

  .page-title {
    height: 40px;
    line-height: 40px;
    font-size: 20px;
    color: #fff;
    font-weight: bold;
  }
}
</style>

<style lang="scss">
.ant-breadcrumb {
  color: #fff;
  & > span:last-child,
  .ant-breadcrumb-separator {
    color: #fff !important;
  }
}
</style>
