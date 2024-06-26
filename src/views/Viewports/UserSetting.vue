<template>
  <div class="user-setting">
    <a-dropdown :trigger="['click']">
      <div @click.prevent>
        <div class="login-user">
          <span>{{ userInfo?.nickName }}</span>
          <span>{{ userInfo?.deptName }}</span>
        </div>
        <SettingOutlined :style="{ fontSize: '20px', cursor: 'pointer' }" />
      </div>
      <template #overlay>
        <a-menu @click="handleSetUserSetting">
          <a-menu-item
            class="menu-list"
            key="1"
            v-if="!router.currentRoute.value.path.includes('configurations')"
            >个人设置</a-menu-item
          >
          <a-menu-item
            class="menu-list menu-border-bottom"
            key="2"
            v-if="
              userInfo?.roleKeyList.includes('admin') &&
              !router.currentRoute.value.path.includes('configurations')
            "
            >系统设置</a-menu-item
          >
          <!-- <a-menu-item class="menu-list" key="3">使用说明</a-menu-item> -->
          <a-menu-item class="menu-list" key="4">关于</a-menu-item>
          <a-menu-item class="menu-list menu-border-top" key="5"
            >退出</a-menu-item
          >
        </a-menu>
      </template>
    </a-dropdown>

    <UserInstructionsModal ref="instructionsModal" />
    <UserAboutModal ref="aboutModal" />
    <UserSettingsModal ref="settingsModal" />
    <LogoutModal ref="logoutModal" />
    <PersonalModal ref="personalModal" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import router from "@/router";
import { message } from "ant-design-vue";
import { SettingOutlined } from "@ant-design/icons-vue";

import { getVersion } from "@/api";
import { getAPIResponse } from "@/utils/apiTools/useAxiosApi";
import { useUserStore } from "@/store/modules/user";

import UserAboutModal from "./UserAboutModal.vue";
import UserInstructionsModal from "./UserInstructionsModal.vue";
import UserSettingsModal from "./UserSettingsModal.vue";
import LogoutModal from "@/components/Logout";
import PersonalModal from "./PersonalModal.vue";

const userStore = useUserStore();

const aboutModal = ref(null);
const instructionsModal = ref(null);
const settingsModal = ref(null);
const logoutModal = ref(null);
const personalModal = ref(null);

const userInfo = computed(() => userStore.getUserInfo);

onMounted(() => {
  userInfo.value = userStore.getUserInfo;
});

const handleSetUserSetting = (e) => {
  switch (e.key) {
    // 个人设置
    case "1":
      personalModal.value.showModal();
      break;
    // 系统设置
    case "2":
      router.push({ path: "/configurations/department" });
      break;
    // 使用说明
    case "3":
      instructionsModal.value.showModal();
      break;
    // 关于
    case "4":
      getVersion().then((res) => {
        const version = getAPIResponse(res);
        if (version) {
          aboutModal.value.showModal(version);
        } else {
          message.warning(`版本信息查询失败，请重新尝试！`);
        }
      });
      break;
    case "5":
      logoutModal.value.showLogoutModal();
      break;
    default:
      break;
  }
};
</script>

<style scoped lang="scss">
.user-setting {
  display: flex;
  flex-direction: row;
  align-items: center;

  .login-user {
    font-size: 16px;
    margin-right: 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    text-align: right;

    span:first-child {
      margin-bottom: 3px;
    }
  }

  .ant-dropdown-trigger {
    cursor: pointer;
    display: flex;
    flex-direction: row;
    align-items: center;

    &:hover {
      transition: all 0.3s;
      color: #b1e5f8;
    }
  }
}
</style>
