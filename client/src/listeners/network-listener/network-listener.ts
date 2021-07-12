import { XHRListener } from './utils/xhr-listener';

export const NetworkListener = () => {
    const removeXHRListener = XHRListener();

    return () => {
        removeXHRListener();
    };
};
