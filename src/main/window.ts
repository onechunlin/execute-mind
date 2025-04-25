import { BrowserWindow } from 'electron';
import path from 'node:path';

export interface CreateWindowOptions {
  width?: number;
  height?: number;
  page?: string;
}

/**
 * 创建应用窗口
 */
export function createWindow(options: CreateWindowOptions = {}) {
  const { width = 1000, height = 800, page } = options;

  // Create the browser window.
  const win = new BrowserWindow({
    width,
    height,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      // 添加安全策略，允许屏幕捕获
      webSecurity: true,
    },
  });

  // 设置安全策略，允许屏幕捕获API
  win.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'media') {
      callback(true); // 允许屏幕捕获
    } else {
      callback(false);
    }
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    const url = page
      ? `${MAIN_WINDOW_VITE_DEV_SERVER_URL}?page=${page}`
      : MAIN_WINDOW_VITE_DEV_SERVER_URL;
    win.loadURL(url);
  } else {
    win.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`), {
      query: page ? { page } : undefined,
    });
  }

  return win;
}
