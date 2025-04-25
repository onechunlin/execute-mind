// 声明electron-squirrel-startup模块
declare module 'electron-squirrel-startup' {
  const started: boolean;
  export default started;
}

// 声明全局Vite环境变量
declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined;
declare const MAIN_WINDOW_VITE_NAME: string | undefined;
