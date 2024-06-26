import { loginPassword } from '@/api';
import { useCookies } from '@vueuse/integrations/useCookies';
import { defineStore } from 'pinia';
import { watch } from 'vue';
import router from "@/router";

const TOKEN_KEY = 'token';
const token = useCookies().get(TOKEN_KEY as string);

interface StoreUser {
  token: string;
  info: Record<any, any>;
}

export const useUserStore = defineStore({
  id: 'app-user',
  state: (): StoreUser => ({
    token: token,
    info: {},
  }),
  getters: {
    getUserInfo(): any {
      const infoFromCookies = useCookies().get('info')
      return this.info.nickName ? this.info : infoFromCookies
    },
  },
  actions: {
    setInfo(info: any) {
      this.info = {}
      useCookies().set('token',info.token, { path: '/' } )
      useCookies().set('info',info, { path: '/' } )
      this.info = info ? info : {};
    },
    updateInfo(info: any) {
      this.info = {}
      useCookies().set('info',info, { path: '/' } )
      this.info = info ? info : {};
    },
    login(info: any) {
      return new Promise((resolve) => {
        const { data, error } = loginPassword(info);
        watch(data, () => {
          this.setInfo(data.value);
          console.log('login: ', data)
          // useCookies().set(VITE_TOKEN_KEY as string, data.value.token);
          resolve(data.value);
        });
        watch(error, () => {
          resolve(error.value);
        });
      });
    },
    logout() {
      this.setInfo({})
      useCookies().remove('info', { path: '/' })
      useCookies().remove('token', { path: '/' })
      router.push({ path: '/login'})
    },
  },
});
