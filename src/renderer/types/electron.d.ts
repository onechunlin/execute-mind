export interface IElectronAPI {
  openWindow: (page: string) => void;
  getEnv: (key: string) => Promise<string>;
}

export interface IEnvAPI {
  DEEPSEEK_API_KEY: string;
}

declare global {
  interface Window {
    electron: IElectronAPI;
  }
}
