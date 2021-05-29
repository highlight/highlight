import React from 'react';
import logo from './logo.svg';
import './App.css';

// console.log('hi...');
// chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
//     console.log('updated');
//     try {
//         chrome.tabs.executeScript(tabId ?? 0, {
//             file: '/firstload/firstload/firstload/src/index.js',
//         });
//     } catch (e) {
//         console.log(e);
//     }
//     console.log('running script on', tabId);
// });

function App() {
    /**
     * Get current URL
     */
    // useEffect(() => {
    //     const queryInfo = { active: true, lastFocusedWindow: true };
    //     chrome.tabs &&
    //         chrome.tabs.query(queryInfo, (tabs) => {
    //             const tab = tabs[0];
    //             if (!tab) {
    //                 return;
    //             }
    //             setUrl(tab.url ?? '');
    //             const id = tab.id ?? 0;
    //             console.log('id', id);
    //         });
    // }, []);

    // This actually append the script to the chrome extension, so not super useful :(
    // useEffect(() => {
    //     var s = document.createElement('script');
    //     s.src = chrome.runtime.getURL('/firstload/firstload/src/index.js');
    //     s.onload = function () {
    //         console.log('remote script loaded');
    //         // @ts-ignore
    //         this.remove();
    //     };
    //     (document.head || document.documentElement).appendChild(s);
    //     console.log('appended to doc');
    // }, []);

    return (
        <div className="App">
            <button
                onClick={() => {
                    chrome.tabs.query(
                        { active: true, currentWindow: true },
                        function (tabs) {
                            const tab = tabs[0];
                            // query the active tab, which will be only one tab
                            //and inject the script in it
                            chrome.tabs.executeScript(tab.id ?? 0, {
                                file: '/firstload/firstload/src/index.js',
                            });
                            console.log('loaded script');
                        }
                    );
                }}
            >
                inject script
            </button>
            <button
                onClick={() => {
                    console.log('sending event');
                    chrome.tabs.query(
                        { active: true, currentWindow: true },
                        function (tabs) {
                            const tab = tabs[0];
                            // query the active tab, which will be only one tab
                            //and inject the script in it
                            chrome.tabs.sendMessage(tab?.id ?? 0, {
                                action: 'init',
                            });
                        }
                    );
                }}
            >
                start recording
            </button>
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
            </header>
        </div>
    );
}

export default App;
