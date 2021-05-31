import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { useChromeStorageLocal } from 'use-chrome-storage';

function App() {
    // Load the script when the page loads
    // const [scriptLoaded, setScriptLoaded] = useLocalStorage<boolean>(
    //     '_highlightScriptLoaded',
    //     false
    // );
    const [scriptLoaded, setScriptLoaded] = useChromeStorageLocal(
        '_highlightScriptLoaded',
        false
    );
    const [sessionURL, setSessionURL] = useChromeStorageLocal(
        '_highlightSessionURL',
        ''
    );

    const initRecording = () => {
        chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
                const tab = tabs[0];
                // query the active tab, which will be only one tab
                //and inject the script in it
                chrome.tabs.sendMessage(
                    tab?.id ?? 0,
                    {
                        action: 'init',
                    },
                    (resp) => {
                        setSessionURL(resp.url);
                    }
                );
            }
        );
    };

    useEffect(() => {
        async function InjectScript() {
            chrome.tabs.query(
                {
                    active: true,
                    currentWindow: true,
                },
                (tabs) => {
                    const tab = tabs[0];
                    chrome.tabs.executeScript(
                        tab.id ?? 0,
                        {
                            file: '/firstload/firstload/src/index.js',
                        },
                        () => {
                            setScriptLoaded(true);
                        }
                    );
                }
            );
        }
        try {
            if (scriptLoaded) {
                console.log('already loaded the script!');
            } else {
                InjectScript();
            }
        } catch (e) {
            console.warn(e);
        }
    }, [setScriptLoaded, scriptLoaded]);

    useEffect(() => {
        console.log(scriptLoaded);
    }, [scriptLoaded]);

    return (
        <div className="App">
            <button
                onClick={() => {
                    chrome.storage.local.clear();
                }}
            >
                clear storage
            </button>
            {sessionURL ? (
                <button>stop recording</button>
            ) : (
                <button
                    onClick={() => {
                        initRecording();
                    }}
                >
                    start recording
                </button>
            )}
            URL: {sessionURL}
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
            </header>
        </div>
    );
}

export default App;
