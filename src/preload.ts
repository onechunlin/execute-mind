// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';

// 暴露给渲染进程的接口
contextBridge.exposeInMainWorld('electron', {
  // 打开新窗口
  openWindow: (page: string) => ipcRenderer.send('open-window', page),
  // 获取环境变量
  getEnv: async (key: string) => await ipcRenderer.invoke('get-env', key),
});
