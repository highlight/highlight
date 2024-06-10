let isRunning = false

let getCurrentTab = async () => {
  let queryOptions = { active: true, lastFocusedWindow: true }
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions)

  return tab
}

let disableCSP = async (id: number) => {
  if (isRunning) return
  isRunning = true

  let addRules: any[] = [],
    { url } = await getCurrentTab()

  addRules.push({
    id,
    action: {
      type: 'modifyHeaders',
      responseHeaders: [{ header: 'content-security-policy', operation: 'set', value: '' }],
    },
    condition: { urlFilter: url, resourceTypes: ['main_frame', 'sub_frame'] },
  })

  chrome.browsingData.remove({}, { serviceWorkers: true }, () => {})

  await chrome.declarativeNetRequest.updateSessionRules({ addRules })

  isRunning = false
}

let init = () => {
  chrome.action.onClicked.addListener((tab) => {
    console.log('toggle highlight recording active')
  })

  chrome.tabs.onActivated.addListener(async (tab) => {
    await disableCSP(tab.tabId)
  })
}

init()
