import { getElementSelector } from '../../utils/dom';

export const ClickListener = (callback: (targetSelector: string) => void) => {
    const recordClick = (event: MouseEvent) => {
        if (event.target) {
            const targetSelector = getElementSelector(event.target as Element);
            callback(targetSelector);
        }
    };
    window.addEventListener('click', recordClick);
    return () => window.removeEventListener('click', recordClick);
};
