/* eslint-disable no-undef */
chrome.tabs.onActivated.addListener(function(activeInfo) {
    injectScript(activeInfo.tabId);
});

chrome.webNavigation.onCommitted.addListener(details => {
    if (["reload", "link"].includes(details.transitionType)) {
        console.log(`[highlight] Detected ${details.transitionType} transition`);
        chrome.tabs.query({
            currentWindow: true,
            active: true,
        }, (currentWindowActiveTabs = []) => {
            injectScript(currentWindowActiveTabs[0].id);
            // TODO: call init here, after the script loads.
        });
    }
});

function injectScript(tabId) {
    console.log('[highlight] Injecting Highlight snippet on', tabId);
    chrome.tabs.executeScript(
        tabId,
        {
            file: '/firstload/firstload/src/index.js',
        },
        () => {
            console.log("[highlight] Loaded highlight snippet on", tabId);
        }
    );
}