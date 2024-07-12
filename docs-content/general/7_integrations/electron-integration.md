---
title: Electron Support
slug: electron-integration
createdAt: 2022-09-29T04:16:22.000Z
updatedAt: 2022-10-13T18:04:13.000Z
---

If you are running Highlight in Electron, a Desktop based JS framework, you can benefit from the additional functionality that tracks main process window events to stop and start Highlight recording when your app is minimized.

Please ensure you are using Highlight SDK version [highlight.run@4.3.4.](https://www.npmjs.com/package/highlight.run/v/4.3.4) or higher. Call `configureElectronHighlight` with a `BrowserWindow` object to instrument Electron events.

```Text
const mainWindow = new BrowserWindow(...)
configureElectronHighlight(mainWindow)
```

Under the hood, the function will forward the `focus` and `blur` events to your renderer process so that the highlight recording SDK can track them.

```Text
mainWindow.on('focus', () => {
    mainWindow.webContents.send('highlight.run', { visible: true });
});
window.on('blur', () => {
    mainWindow.webContents.send('highlight.run', { visible: false });
 });
```

This will stop the Highlight recording when the app is not visible and resume the session when the app regains visibility to help minimize performance and battery impact that Highlight may have on Electron users.
