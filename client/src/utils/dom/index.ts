/**
 * Gets a CSS selector for a given element. Will default to the element's tag name if there are no class name or id.
 */
export const getElementSelector = (element: Element) => {
    let selector = '';
    const classNames = element.getAttribute('class');
    const ids = element.getAttribute('id');

    if (ids) {
        selector = selector.concat(getSelectorString(ids, '#'));
    }
    if (classNames) {
        selector = selector.concat(getSelectorString(classNames, '.'));
    }

    // Default to the element's tag if the element doesn't have ids or class names.
    if (selector === '') {
        selector = selector.concat(element.tagName.toLowerCase());
    }

    return selector;
};

const getSelectorString = (selector: string, delimiter: string) => {
    return `${delimiter}${selector.trim().split(' ').join(delimiter)}`;
};
