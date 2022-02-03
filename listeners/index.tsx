import { ConsoleListener } from './listeners/console-listener';
import { ErrorListener } from './listeners/error-listener';
import { PathListener } from './listeners/path-listener';
import { ViewportResizeListener } from './listeners/viewport-resize-listener';
import { SegmentIntegrationListener } from './listeners/segment-integration-listener';
import { ClickListener } from './listeners/click-listener/click-listener';
import { FocusListener } from './listeners/focus-listener/focus-listener';
import { NetworkListener } from './listeners/network-listener/network-listener';
import { RequestResponsePair } from './listeners/network-listener/utils/models';
import {
    matchPerformanceTimingsWithRequestResponsePair,
    shouldNetworkRequestBeRecorded,
} from './listeners/network-listener/utils/utils';
import { DEFAULT_URL_BLOCKLIST } from './listeners/network-listener/utils/network-sanitizer';
import { SESSION_STORAGE_KEYS } from './utils/sessionStorage/sessionStorageKeys';
import SessionShortcutListener from './listeners/session-shortcut/session-shortcut-listener';
import { WebVitalsListener } from './listeners/web-vitals-listener/web-vitals-listener';
import { ERRORS_TO_IGNORE, ERROR_PATTERNS_TO_IGNORE } from './constants/errors';
import {
    PerformanceListener,
    PerformancePayload,
} from './listeners/performance-listener/performance-listener';

export const StartListeners = (listeners: (() => void)[]) => {
    const highlightThis = this;
    if (this.enableSegmentIntegration) {
        listeners.push(
            SegmentIntegrationListener((obj: any) => {
                if (obj.type === 'track') {
                    const properties: { [key: string]: string } = {};
                    properties['segment-event'] = obj.event;
                    highlightThis.addProperties(properties, {
                        type: 'track',
                        source: 'segment',
                    });
                } else if (obj.type === 'identify') {
                    // Removes the starting and end quotes
                    // Example: "boba" -> boba
                    const trimmedUserId = obj.userId.replace(/^"(.*)"$/, '$1');

                    highlightThis.identify(
                        trimmedUserId,
                        obj.traits,
                        'segment'
                    );
                }
            })
        );
    }

    if (document.referrer) {
        // Don't record the referrer if it's the same origin.
        // Non-single page apps might have the referrer set to the same origin.
        // If we record this then the referrer data will not be useful.
        // Most users will want to see referrers outside of their website/app.
        // This will be a configuration set in `H.init()` later.
        if (!(window && document.referrer.includes(window.location.origin))) {
            this.addCustomEvent<string>('Referrer', document.referrer);
            highlightThis.addProperties(
                { referrer: document.referrer },
                { type: 'session' }
            );
        }
    }
    listeners.push(
        PathListener((url: string) => {
            if (reloaded) {
                this.addCustomEvent<string>('Reload', url);
                reloaded = false;
                highlightThis.addProperties(
                    { reload: true },
                    { type: 'session' }
                );
            } else {
                this.addCustomEvent<string>('Navigate', url);
            }
            highlightThis.addProperties(
                { 'visited-url': url },
                { type: 'session' }
            );
        })
    );
    if (!this.disableConsoleRecording) {
        listeners.push(
            ConsoleListener(
                (c: ConsoleMessage) => {
                    if (
                        (c.type === 'Error' || c.type === 'error') &&
                        c.value &&
                        c.trace
                    ) {
                        const errorValue = stringify(c.value);
                        if (
                            ERRORS_TO_IGNORE.includes(errorValue) ||
                            ERROR_PATTERNS_TO_IGNORE.some((pattern) =>
                                errorValue.includes(pattern)
                            )
                        ) {
                            return;
                        }
                        highlightThis.errors.push({
                            event: errorValue,
                            type: 'console.error',
                            url: window.location.href,
                            source: c.trace[0]?.fileName
                                ? c.trace[0].fileName
                                : '',
                            lineNumber: c.trace[0]?.lineNumber
                                ? c.trace[0].lineNumber
                                : 0,
                            columnNumber: c.trace[0]?.columnNumber
                                ? c.trace[0].columnNumber
                                : 0,
                            stackTrace: c.trace,
                            timestamp: new Date().toISOString(),
                        });
                    } else {
                        highlightThis.messages.push(c);
                    }
                },
                {
                    lengthThreshold: 1000,
                    level: [
                        'assert',
                        'count',
                        'countReset',
                        'debug',
                        'dir',
                        'dirxml',
                        'error',
                        'group',
                        'groupCollapsed',
                        'groupEnd',
                        'info',
                        'log',
                        'table',
                        'time',
                        'timeEnd',
                        'timeLog',
                        'trace',
                        'warn',
                    ],
                    logger: 'console',
                    stringifyOptions: {
                        depthOfLimit: 10,
                        numOfKeysLimit: 100,
                        stringLengthLimit: 1000,
                    },
                }
            )
        );
    }
    listeners.push(
        ErrorListener((e: ErrorMessage) => highlightThis.errors.push(e))
    );
    listeners.push(
        ViewportResizeListener((viewport) => {
            this.addCustomEvent('Viewport', viewport);
        })
    );
    listeners.push(
        ClickListener((clickTarget) => {
            if (clickTarget) {
                this.addCustomEvent('Click', clickTarget);
            }
        })
    );
    listeners.push(
        FocusListener((focusTarget) => {
            if (focusTarget) {
                this.addCustomEvent('Focus', focusTarget);
            }
        })
    );

    listeners.push(
        WebVitalsListener((data) => {
            const { name, value } = data;
            try {
                this.graphqlSDK.addWebVitals({
                    session_id: this.sessionData.sessionID.toString(),
                    metric: { name, value },
                });
            } catch {}
        })
    );

    if (this.sessionShortcut) {
        SessionShortcutListener(this.sessionShortcut, () => {
            window.open(this.getCurrentSessionURLWithTimestamp(), '_blank');
        });
    }

    if (!this.disableNetworkRecording && this.enableRecordingNetworkContents) {
        listeners.push(
            NetworkListener({
                xhrCallback: (requestResponsePair) => {
                    this.xhrNetworkContents.push(requestResponsePair);
                },
                fetchCallback: (requestResponsePair) => {
                    this.fetchNetworkContents.push(requestResponsePair);
                },
                headersToRedact: this.networkHeadersToRedact,
                backendUrl: this._backendUrl,
                tracingOrigins: this.tracingOrigins,
                urlBlocklist: this.urlBlocklist,
                sessionData: this.sessionData,
            })
        );
    }

    listeners.push(
        PerformanceListener((payload: PerformancePayload) => {
            this.addCustomEvent('Performance', stringify(payload));
        }, this._recordingStartTime)
    );
};
