export interface IElectronAPI {
  openWindow: (page: string) => void;
}

declare global {
  interface Window {
    electron: IElectronAPI;
  }
}
