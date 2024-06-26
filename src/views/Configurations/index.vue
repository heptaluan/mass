<template>
  <div class="container">
    <div class="sideMenu">
      <div class="logo-box">
        <!-- <img src="../../assets/logo.png" /> -->
        <span>肺结节CT影像辅助诊断软件</span>
      </div>
      <div class="page-title">
        <span>系统设置</span>
      </div>
      <a-menu
        id="menu"
        v-model:openKeys="state.openKeys"
        v-model:selectedKeys="state.selectedKeys"
        style="width: 256px"
        mode="inline"
        theme="dark"
      >
        <a-menu-item v-for="item of menu" :key="item.key">
          <icon-font :type="item.icon" />
          <router-link :to="item.url">
            <span>{{ item.label }}</span>
          </router-link>
        </a-menu-item>
      </a-menu>
    </div>
    <div class="panel-wrap">
      <div class="header">
        <div class="back" @click="backHandler">
          <span class="icon"><icon-font type="icon-back01" /></span>
          <span>返回</span>
        </div>
        <!-- <div class="title main">系统设置</div> -->
        <div class="system user-setting" v-if="user">
          <UserSetting />
        </div>
      </div>
      <div class="panel">
        <div class="main">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import router from "@/router";
import { createFromIconfontCN } from "@ant-design/icons-vue";
import IconFontUrl from "../../assets/iconFont";
import { onMounted, onUnmounted, watch, ref, reactive } from "vue";
import { useUserStore } from "@/store/modules/user";
import UserSetting from "../Viewports/UserSetting.vue";

const userStore = useUserStore();
let currentTime = ref(new Date().toLocaleString());
let timeCounter = ref(null);
let user = ref(null);

const state = reactive({
  collapsed: false,
  selectedKeys: ["1"],
  openKeys: ["1"],
  preOpenKeys: ["1"],
});

const menu = ref([
  // {
  //   label: "部门管理",
  //   key: "1",
  //   url: "/configurations/department",
  //   icon: "icon-bumenguanli",
  // },
  // {
  //   label: "参数管理",
  //   key: "3",
  //   url: "/configurations/parameter",
  //   icon: "icon-weibiaoti11",
  // },
  // {
  //   label: "文件存储管理",
  //   key: "5",
  //   url: "/configurations/fileStore",
  //   icon: "icon-yingpan",
  // },
  // {
  //   label: "PACS服务管理",
  //   key: "6",
  //   url: "/configurations/pacs",
  //   icon: "icon-fenxiang01",
  // },
  // {
  //   label: "网络安全管理",
  //   key: "7",
  //   url: "/configurations/safe",
  //   icon: "icon-wangluoanquan",
  // },
  // {
  //   label: "系统日志管理",
  //   key: "8",
  //   url: "/configurations/log",
  //   icon: "icon-diannao",
  // },
  // {
  //   label: "系统授权",
  //   key: "9",
  //   url: "/configurations/authorization",
  //   icon: "icon-denglushouquan",
  // },
  {
    label: "患者检测与报告",
    key: "1",
    url: "/configurations/patientList",
    icon: "icon-denglushouquan",
  },
  {
    label: "质控管理",
    key: "2",
    url: "/configurations/qcList",
    icon: "icon-diannao",
  },
  {
    label: "用户管理",
    key: "3",
    url: "/configurations/user",
    icon: "icon-denglu-copy",
  },
]);

const IconFont = createFromIconfontCN({
  scriptUrl: IconFontUrl,
});

onMounted(() => {
  refresh();
  timeHandler();
  initMenu();
});

onUnmounted(() => {
  clearInterval(timeCounter.value);
});

const titleClick = (e) => {
  console.log("titleClick", e);
};
watch(
  () => state.openKeys,
  (_val, oldVal) => {
    state.preOpenKeys = oldVal;
  }
);

const initMenu = (url) => {
  const currentUrl = url ? url : router.options.history.state.current;
  menu.value.forEach((ele) => {
    if (ele.url === currentUrl) {
      state.selectedKeys = [ele.key];
    }
  });
};

const refresh = () => {
  if (
    router.currentRoute.value.query &&
    router.currentRoute.value.query["status"] === "refresh"
  ) {
    // console.log(router.currentRoute.value)
    // console.log(router.currentRoute.value.path)
    location.replace(router.currentRoute.value.path);
  }
};

const timeHandler = () => {
  user.value = userStore.getUserInfo;
  // console.log(user.value)
  timeCounter.value = setInterval(() => {
    currentTime.value = new Date().toLocaleString();
  }, 1000);
};

const backHandler = () => {
  // console.log(router)
  router.push({ name: "studyList" });
};
</script>

<style scoped lang="scss">
.highlight {
  background-color: rgb(255, 192, 105);
  padding: 0px;
}
.container {
  height: 100vh;
  background: #1d1f21;
  display: flex;
  flex-direction: row;

  .header {
    height: 62px;
    display: flex;
    justify-content: space-between;
    padding: 4px 15px;
    color: white;
    background-color: #2c2e30;
    border-bottom: 1px solid rgb(119, 119, 119);

    .back {
      display: flex;
      align-self: center;
      flex-direction: column;
      align-items: center;
      font-size: 16px;
      &:hover {
        color: #b1e5f8;
        cursor: pointer;
      }
      .icon {
        font-size: 20px;
      }
    }

    .system {
      align-self: center;

      .anticon {
        margin-left: 16px;
      }
    }
  }

  .panel-wrap {
    width: calc(100% - 240px);
    margin-left: 240px;

    .panel {
      width: 100%;
      height: calc(100% - 62px);
      display: flex;
      justify-content: space-between;

      .main {
        width: 100%;
        background-color: #1d1f22;
      }
    }
  }

  .sideMenu {
    position: fixed;
    left: 0;
    top: 0;
    width: 240px;
    height: 100%;
    border-right: 1px solid rgb(119, 119, 119);
    background: rgb(44, 46, 48);

    :deep(.anticon) {
      font-size: 22px;
      margin-right: 10px;
      color: #fff;
    }

    .logo-box {
      height: 62px;
      color: #fff;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-evenly;

      img {
        max-width: 90px;
      }

      span {
        font-size: 16px;
      }
    }

    .page-title {
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgb(68, 70, 72);
      font-size: 16px;
      height: 60px;
      color: #fff;
    }

    #menu {
      width: 100% !important;
      background-color: transparent;

      :deep(.ant-menu-item) {
        margin-top: 0;
        height: 40px;
        text-align: left;
        &.ant-menu-item-selected {
          background-color: #6d7373;
        }
        .ant-menu-title-content {
          display: flex;
          align-items: center;
          a:focus {
            outline: none;
          }
        }
        a {
          color: #fff;
        }
      }
    }
  }
}
</style>
