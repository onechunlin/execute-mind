export interface IElectronAPI {
  openWindow: (page: string) => void;
  getEnv: (key: string) => Promise<string>;
}

export interface IEnvAPI {
  DEEPSEEK_API_KEY: string;
}

// 类型定义，可以放在单独的.d.ts文件中
declare global {
  interface Window {
    electron: {
      getEnv: (key: string) => Promise<string | undefined>;
      openWindow: (page: string) => void;
      captureScreen: () => Promise<{
        success: boolean;
        filePath?: string;
        message: string;
      }>;
    };
  }
}
