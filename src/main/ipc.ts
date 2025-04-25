import { ipcMain, desktopCapturer } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { createWindow } from './window';

/**
 * 注册所有IPC处理程序
 */
export function registerIpcHandlers() {
  // 处理新窗口请求
  ipcMain.on('open-window', (_, page: string) => {
    createWindow({
      width: 600,
      height: 400,
      page,
    });
  });

  // 提供环境变量
  ipcMain.handle('get-env', (_, key) => {
    return process.env[key];
  });

  // 处理屏幕截图
  ipcMain.handle('capture-screen', handleCaptureScreen);
}

/**
 * 处理屏幕截图请求
 */
async function handleCaptureScreen() {
  try {
    // 获取所有可用的屏幕源
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 1920, height: 1080 },
    });

    // 获取主屏幕源
    const mainSource = sources[0]; // 通常第一个是主屏幕
    if (!mainSource) {
      throw new Error('未找到屏幕源');
    }

    // 获取缩略图作为截图
    const thumbnail = mainSource.thumbnail.toDataURL();

    // 将base64转换为Buffer
    const base64Data = thumbnail.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // 创建临时文件名
    const tempDir = os.tmpdir();
    const timestamp = new Date().getTime();
    const filePath = path.join(tempDir, `screenshot-${timestamp}.png`);

    // 写入文件
    fs.writeFileSync(filePath, buffer);

    return {
      success: true,
      filePath,
      message: '截图已保存',
    };
  } catch (error) {
    console.error('截图失败:', error);
    return {
      success: false,
      message: `截图失败: ${error.message}`,
    };
  }
}
