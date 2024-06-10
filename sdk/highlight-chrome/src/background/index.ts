let getCurrentTab = async () => {
  let queryOptions = { active: true, lastFocusedWindow: true }
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions)

  return tab
}

let disableCSP = async (id) => {
  let addRules = [],
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
  chrome.action.onClicked.addListener((tab) => {
    disableCSP(tab.id)
  })
  chrome.tabs.onActivated.addListener((tab) => {
    disableCSP(tab.tabId)
  })
}

init()

export {}
