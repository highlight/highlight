import { getElementSelector } from '../../utils/dom';

export const ClickListener = (callback: (targetSelector: string) => void) => {
    window.addEventListener('click', (event: MouseEvent) => {
        if (event.target) {
            const targetSelector = getElementSelector(event.target as Element);
            callback(targetSelector);
        }
    });
};
