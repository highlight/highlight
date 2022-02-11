import { getElementSelector } from '../../utils/dom';

export const ClickListener = (callback: (targetSelector: string) => void) => {
    const recordClick = (event: MouseEvent) => {
        if (event.target) {
            const element = event.target as Element;
            const targetSelector = getElementSelector(element);

            callback(targetSelector);
        }
    };
    window.addEventListener('click', recordClick);
    return () => window.removeEventListener('click', recordClick);
};
