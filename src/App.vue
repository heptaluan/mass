<template>
  <router-view />
</template>

<style lang="scss">
#app,
html,
body {
  width: 100%;
  height: 100%;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  background: rgb(44, 46, 48);

  &::-webkit-scrollbar {
    width: 10px;
    height: 1px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 10px;
    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    background: rgb(79, 83, 85);
  }

  &::-webkit-scrollbar-track {
    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    background: #ededed;
  }
}

// 覆盖全局 ANTD 样式
.ant-modal {
  .ant-modal-header {
    padding: 5px 24px;

    .ant-modal-title {
      font-size: 16px;
    }
  }

  .ant-modal-confirm-title,
  .ant-modal-confirm-content {
    color: #fff !important;
  }

  .ant-modal-close-x {
    width: 33px;
    height: 33px;
    line-height: 33px;
    color: #fff;
  }

  .ant-modal-body,
  .ant-modal-footer {
    background: rgb(29, 31, 33);
    color: #fff;
    border-top: none;
    font-size: 14px;
  }

  .ant-btn {
    background: rgb(68, 70, 72);
    border: 1px solid rgb(68, 70, 72);
    color: #fff;

    &:hover,
    &:focus,
    &:active {
      background: rgb(68, 70, 72);
      color: #fff;
      border: 1px solid rgb(68, 70, 72);
    }
  }

  .ant-input,
  .ant-input-password,
  .ant-select .ant-select-selector {
    color: #fff !important;
    background-color: #242c2d !important;
    border: 1px solid #64686d;
  }

  .anticon-close-circle {
    color: #fff;
    margin-top: 10px;
  }
}

.ant-select {
  &.ant-select-disabled {
    .ant-select-selector {
      color: #999 !important;
    }
  }

  .ant-select-selector {
    background-color: rgb(36, 44, 44) !important;
    border: 1px solid #64686d !important;
    color: #fff;
  }

  .ant-select-arrow {
    color: #93989d;
  }
}

.ant-input,
.ant-input[disabled] {
  color: #999 !important;
  background-color: rgb(36, 44, 44) !important;
  border-color: #64686d !important;
}

.login {
  .ant-input,
  .ant-input[disabled] {
    color: #999 !important;
    background-color: #fff !important;
    border-color: rgb(79, 83, 85) !important;
  }
}

.ant-input-number {
  border: none !important;
  border-radius: 0 !important;
  line-height: inherit !important;

  .ant-input-number-input {
    background-color: rgb(36, 44, 44) !important;
    border: 1px solid #64686d !important;
    border-radius: 0 !important;
    color: #fff;
    font-size: 14px;
    padding: 0 2px;
  }
}

.ant-dropdown {
  .ant-dropdown-menu {
    background-color: rgb(36, 44, 44) !important;
    border: 1px solid rgb(89, 89, 93) !important;

    .menu-border-top {
      border-top: 1px dashed rgb(89, 89, 93);
      // margin-top: 3px !important;
    }

    .menu-border-bottom {
      border-bottom: 1px dashed rgb(89, 89, 93);
    }

    .ant-dropdown-menu-item {
      font-size: 14px !important;
      color: #fff !important;
      padding: 2px 18px !important;

      &:hover {
        background-color: #3c4444 !important;
      }
    }
  }
}

.ant-picker {
  color: #999 !important;
  background-color: rgb(36, 44, 44) !important;
  border-color: #64686d !important;
}
</style>
