import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import * as dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

interface CreateWindowOptions {
  width?: number;
  height?: number;
  page?: string;
}

const createWindow = (options: CreateWindowOptions = {}) => {
  const { width = 800, height = 600, page } = options;

  // Create the browser window.
  const win = new BrowserWindow({
    width,
    height,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
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
};

// 处理新窗口请求
ipcMain.on('open-window', (_, page: string) => {
  createWindow({
    width: 600,
    height: 400,
    page,
  });
});

// 添加 IPC 处理器来提供环境变量
ipcMain.handle('get-env', (_, key) => {
  return process.env[key];
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => createWindow());

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
