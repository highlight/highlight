/*
Given a `BrowserWindow`, sets up event listeners for Highlight.
 */
export default function configureElectronHighlight(window: any) {
	if (window.on && window.webContents?.send) {
		window.on('focus', () => {
			window.webContents.send('highlight.run', { visible: true })
		})

		window.on('blur', () => {
			window.webContents.send('highlight.run', { visible: false })
		})

		window.on('close', () => {
			window.webContents.send('highlight.run', { visible: false })
		})
	}
}
