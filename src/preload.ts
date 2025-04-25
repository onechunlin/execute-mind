// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';

// 暴露API给渲染进程
contextBridge.exposeInMainWorld('electron', {
  // 获取环境变量
  getEnv: (key: string) => ipcRenderer.invoke('get-env', key),

  // 打开新窗口
  openWindow: (page: string) => ipcRenderer.send('open-window', page),

  // 屏幕截图
  captureScreen: () => ipcRenderer.invoke('capture-screen'),
});
