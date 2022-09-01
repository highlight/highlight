import { H } from '..'

export const listenToChromeExtensionMessage = () => {
	// typeof checks to see if chrome is defined. chrome is not defined outside of the context of an extension or Chromium browser.
	if (typeof chrome !== 'undefined' && chrome?.runtime?.onMessage) {
		chrome?.runtime?.onMessage.addListener(
			(message, _sender, sendResponse) => {
				const action = message.action
				console.log(
					`[highlight] received '${action}' event from extension.`,
				)
				switch (action) {
					case 'init': {
						const scriptUrl = 'http://localhost:8080/dist/index.js'
						console.log('url', scriptUrl)
						H.init(1, {
							debug: true,
							scriptUrl,
						})
						H.getSessionURL().then((url) => {
							sendResponse({ url })
						})
						break
					}
					case 'stop': {
						H.stop()
						sendResponse({ success: true })
						break
					}
					default: {
						break
					}
				}
				return true
			},
		)
	}
}
