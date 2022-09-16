/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;
let replayerWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});
ipcMain.on('player-event', async (event, arg) => {
  console.log('player', arg);
  event.sender.send('player-reply', { ack: true });
  mainWindow?.webContents.send('player-event', arg);
});
ipcMain.on('main-event', async (event, arg) => {
  console.log('main', arg);
  event.sender.send('main-reply', { ack: true });
  replayerWindow?.webContents.send('main-event', arg);
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      sandbox: false,
      devTools: false,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });
  mainWindow.maximize();

  replayerWindow = new BrowserWindow({
    frame: false,
    autoHideMenuBar: true,
    alwaysOnTop: true,
    width: 800,
    height: 500,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      sandbox: false,
      devTools: true,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  }); //

  const handleReplayResize = () => {
    if (mainWindow && replayerWindow) {
      const playerBounds = replayerWindow.getBounds();
      const mainBounds = mainWindow.getBounds();
      replayerWindow.setPosition(
        mainBounds.x + mainBounds.width - playerBounds.width,
        mainBounds.y
      );
    }
  };
  setTimeout(handleReplayResize, 100);

  mainWindow.loadURL(
    'https://localhost:3000/1/sessions/BxBQcNpxiZD3CO9kYThQ1FiXzfnL'
  );
  replayerWindow.loadURL(
    'https://localhost:3000/1/player/BxBQcNpxiZD3CO9kYThQ1FiXzfnL'
  );
  // replayerWindow.loadURL(resolveHtmlPath('index.html'));
  replayerWindow.once('ready-to-show', () => {
    replayerWindow?.show();
  });
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */
app.on(
  'certificate-error',
  function (event, webContents, url, error, certificate, callback) {
    event.preventDefault();
    callback(true);
  }
);

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
