export const snakeCaseString = (string: string) => {
    return string
        .replace(/\W+/g, ' ')
        .split(/ |\B(?=[A-Z])/)
        .map((word) => word.toLowerCase())
        .join('_');
};
