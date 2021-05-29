interface ViewportResizeListenerCallback {
    height: number;
    width: number;
}
/**
 * Listens to when resize events on the viewport.
 * Takes the last value after DELAY ms passes. We're doing this to avoid taking the intermediate values while the user is resizing.
 */
export declare const ViewportResizeListener: (callback: (args: ViewportResizeListenerCallback) => void) => () => void;
export {};
