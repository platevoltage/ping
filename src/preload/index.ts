
import { contextBridge, ipcRenderer } from "electron";

// Custom APIs for renderer


declare global {
  interface Window {
    electron: ElectronAPI;
  }
}


export type ElectronAPI = {

  ping: (ip: string) => Promise<string>; //returns last_sync_date

}


contextBridge.exposeInMainWorld("electron", {


  ping: async (ip: string): Promise<string> => ipcRenderer.invoke("ping", ip),


});
