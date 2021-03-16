export const ClickListener = (callback: (targetSelector: string) => void) => {
    window.addEventListener('click', (event: MouseEvent) => {
        const targetSelector = getTargetSelector(event);
        callback(targetSelector);
    });
};

export const getTargetSelector = (event: MouseEvent) => {
    let selector = '';
    if (event.target) {
        const target = event.target as Element;
        const classNames = target.getAttribute('class');
        const ids = target.getAttribute('id');

        if (ids) {
            selector = selector.concat(getSelectorString(ids, '#'));
        }
        if (classNames) {
            selector = selector.concat(getSelectorString(classNames, '.'));
        }

        if (selector === '') {
            selector = selector.concat(target.tagName.toLowerCase());
        }
    }
    if (selector === '') {
        selector = selector.concat(
            (event.target as HTMLElement).tagName.toLowerCase()
        );
    }

    return selector;
};

const getSelectorString = (selector: string, delimeter: string) => {
    return `${delimeter}${selector.trim().split(' ').join(delimeter)}`;
};
