import { getElementSelector } from '../../utils/dom';

export const FocusListener = (callback: (targetSelector: string) => void) => {
    window.addEventListener('focusin', (event: FocusEvent) => {
        if (event.target) {
            const targetSelector = getElementSelector(event.target as Element);
            callback(targetSelector);
        }
    });
};
