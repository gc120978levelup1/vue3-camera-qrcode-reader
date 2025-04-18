import type { App } from 'vue';
import Vue3CameraQrcodeReader from "@/components";

export default {
  install: (app: App) => {
    app.component('Vue3CameraQrcodeReader', Vue3CameraQrcodeReader);
  }
};

export {Vue3CameraQrcodeReader} ;
