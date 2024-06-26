import { useAxios } from '@vueuse/integrations/useAxios';
import axios, { AxiosRequestConfig } from 'axios';
import {useCookies} from "@vueuse/integrations/useCookies";
import {message} from "ant-design-vue";
import { useUserStore } from '@/store/modules/user';
// create an axios instance


const instance = axios.create({
  withCredentials: false,
  timeout: 10000,
});

// request interceptor
instance.interceptors.request.use(
  (config) => {
    // do something before request is sent
    const token = useCookies().get('token')
    if (token) {
      // let each request carry token
      config.headers = {
        ...config.headers,
        'X-Access-Token': `${token}`
      };
    }
    return config;
  },
  (error) => {
    // do something with request error

    console.log(error); // for debug
    return Promise.reject(error);
  },
);

// response interceptor
instance.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
   */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  (response) => {
    const res = response.data;
    // if the custom code is not 200, it is judged as an error.
    if (res.code !== 200) {
      // 412: Token expired;
      if (res.code === 412 || res.code === 500 || res.code === 401 || res.code === 404) {
        const userStore = useUserStore();
        userStore.logout()
      }
      return Promise.reject(res.message || 'Error');
    } else {
      return res;
    }
  },
  (error) => {

    // console.log('err:' + JSON.parse(error.request.response));
    const errorResult = JSON.parse(error.request.response)

    if (errorResult.code === 412 ||errorResult.code === 500 || errorResult.code === 401 || errorResult.code === 404 || errorResult.code === 400) {
      const userStore = useUserStore();
      // 412: Token expired;
      userStore.logout()
      // message.error(errorResult.message);
      if (errorResult.code === 404) {
        return Promise.reject('请求发生错误，请联系管理员');
      }
      return Promise.reject(errorResult.message);

    } else {
      return Promise.reject(error.message);
    }
  },
);

/**
 * reactive useFetchApi
 */
export function getAPIResponse(data:any) {
  if (data.response.value && data.response.value.code === 200) {
    // console.log(data.response.value)
    return data.response.value.data
  } else {
    // console.log(data.response.value)
    message.error(data.error.value);
    return false
  }
}


export default function useAxiosApi(url: string, config: AxiosRequestConfig) {
  return useAxios('/api' + url, config, instance);
}
