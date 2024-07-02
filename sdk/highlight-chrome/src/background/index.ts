let getCurrentTab = async () => {
  let queryOptions = { active: true, lastFocusedWindow: true }
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions)

  return tab
}

let disableCSP = async (id?: number) => {
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
  await chrome.declarativeNetRequest.updateDynamicRules({ addRules })
}

let init = () => {
  chrome.action.onClicked.addListener(async (tab) => {
    await disableCSP(tab.id)
  })
  chrome.tabs.onActivated.addListener(async (tab) => {
    await disableCSP(tab.tabId)
  })
}

init()

export {}
