/**
 * Listens to when the tab becomes active or not active.
 * Active: The tab is in focused
 * Not Active: The user has switched to another tab or window.
 * Supported on all browsers: https://developer.mozilla.org/en-US/docs/Web/API/Document/hidden
 */
export declare const TabStateListener: (callback: (tabState: string) => void) => void;
