import { app, BrowserWindow, session, shell } from "electron";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

let server;
let win;

async function waitForServer(url, attempts = 40) {
  for (let i = 0; i < attempts; i++) {
    try { const r = await fetch(url); if (r.ok) return; } catch {}
    await delay(500);
  }
  throw new Error("Zagkas AI server did not start.");
}

async function createWindow() {
  server = spawn(process.execPath, ["server.js"], {
    cwd: app.getAppPath(),
    env: { ...process.env, PORT: process.env.PORT || "3000" },
    stdio: "inherit",
    windowsHide: true
  });
  server.on("exit", code => { if (!app.isQuitting && code) console.error("Zagkas server exited:", code); });
  await waitForServer("http://127.0.0.1:3000/api/health");

  session.defaultSession.setPermissionRequestHandler((_wc, permission, callback) => {
    callback(permission === "media");
  });

  win = new BrowserWindow({
    width: 1380, height: 900, minWidth: 900, minHeight: 650,
    backgroundColor: "#080b13",
    title: "ZAGKAS AI",
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://")) shell.openExternal(url);
    return { action: "deny" };
  });
  await win.loadURL("http://127.0.0.1:3000/?desktop=1");
}

app.whenReady().then(createWindow).catch(err => {
  console.error(err);
  app.quit();
});
app.on("before-quit", () => {
  app.isQuitting = true;
  if (server && !server.killed) server.kill();
});
app.on("window-all-closed", () => app.quit());
