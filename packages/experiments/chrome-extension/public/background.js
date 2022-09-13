/* eslint-disable no-undef */
chrome.tabs.onActivated.addListener(function (activeInfo) {
	injectScript(activeInfo.tabId, false)
})

chrome.webNavigation.onCommitted.addListener((details) => {
	if (['reload', 'link'].includes(details.transitionType)) {
		console.log(`[highlight] Detected ${details.transitionType} transition`)
		chrome.tabs.query(
			{
				currentWindow: true,
				active: true,
			},
			(currentWindowActiveTabs = []) => {
				injectScript(
					currentWindowActiveTabs[0].id,
					details.transitionType === 'link',
				)
			},
		)
	}
})

function injectScript(tabId, isLinkTransition) {
	console.log('[highlight] Injecting Highlight snippet on', tabId)
	chrome.tabs.executeScript(
		tabId,
		{
			file: '/firstload/firstload/src/index.js',
		},
		() => {
			console.log('[highlight] Loaded highlight snippet on', tabId)
			if (isLinkTransition) {
				console.log(
					'[highlight] Detected link transition, calling init()',
				)
				chrome.tabs.query(
					{ active: true, currentWindow: true },
					function (tabs) {
						const tab = tabs[0]
						// query the active tab, which will be only one tab
						//and inject the script in it
						chrome.tabs.sendMessage(
							tab?.id ?? 0,
							{ action: 'init' },
							(resp) => {
								return
							},
						)
					},
				)
			}
		},
	)
}
