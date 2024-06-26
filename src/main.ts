import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';
import './reset.css'

const script = window.document.createElement('script');
script.setAttribute('type', 'module');
script.setAttribute('src', '');
Object.defineProperty(window.document, 'currentScript', {
  value: script
});

createApp(App).use(store).use(router).use(Antd).mount('#app')
