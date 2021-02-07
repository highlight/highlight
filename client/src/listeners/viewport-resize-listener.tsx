interface ViewportResizeListenerCallback {
    height: number;
    width: number;
}

/**
 * Listens to when resize events on the viewport.
 * Takes the last value after DELAY ms passes. We're doing this to avoid taking the intermediate values while the user is resizing.
 */
export const ViewportResizeListener = (
    callback: (args: ViewportResizeListenerCallback) => void
) => {
    let id: ReturnType<typeof setTimeout>;
    const DELAY = 500;

    window.addEventListener('resize', () => {
        clearTimeout(id);
        id = setTimeout(() => {
            callback({ height: window.innerHeight, width: window.innerWidth });
        }, DELAY);
    });
};
