import { app, shell, BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";
import { spawn } from "child_process";
import path from "path";




ipcMain.handle("ping", async (_: unknown, ip: string) => {
  const windowsPingPath = path.join(process.env.SystemRoot || "", "System32", "ping.exe");
  const pingCommand = process.platform === "win32" ? windowsPingPath : "ping6";
  const pingArgs = process.platform === "win32" ? [] : ["-c 4"];
  console.log(ip);
  try {
    // return await new Promise((resolve, reject) => {
    //   exec(`${pingCommand} ${ip}`, (error: any, stdout: any, stderr: any) => {
    //     if (error) {
    //       console.error(`Error: ${error.message}`);
    //       reject(error.message);
    //     }

    //     if (stderr) {
    //       console.error(`Error: ${stderr}`);
    //       reject(stderr);
    //     }
    //     console.log(`Ping Result:\n${stdout}`);
    //     resolve(true);
    //   });
    // });
    return await new Promise((resolve, reject) => {
      console.log(ip);
      const _spawn = spawn(pingCommand, [...pingArgs, ip]);
      _spawn.stdout.on("data", (message) => {
        if (message) {
          console.log(message.toString());
        }
        // reject();
      });
      // Listen for errors (if any)
      _spawn.stderr.on("data", (data) => {
        console.error(`Error: ${data}`);
        reject(new Error());
      });

      // Listen for the process to exit
      _spawn.on("close", (code) => {
        console.log(`Ping process exited with code ${code}`);
        if (code === 0) {
          resolve(true);
        } else {
          reject(new Error());
        }
      });
    });
  } catch (e) {
    console.error(e);
    throw e;
  }

});

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 650,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
      nodeIntegration: true
    }
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId("com.electron");

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
