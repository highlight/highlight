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

        if (target.id) {
            selector = selector.concat(getSelectorString(target.id, '#'));
        }
        if (target.className) {
            if (target.className.trim) {
                selector = selector.concat(
                    getSelectorString(target.className, '.')
                );
            } else if (
                ((target.className as unknown) as SVGAnimatedString)?.baseVal
            ) {
                selector = selector.concat(
                    getSelectorString(
                        ((target.className as unknown) as SVGAnimatedString)
                            .baseVal,
                        '.'
                    )
                );
            }
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
