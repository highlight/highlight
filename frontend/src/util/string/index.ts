export const snakeCaseString = (string: string) => {
    return string
        .replace(/\W+/g, ' ')
        .split(/ |\B(?=[A-Z])/)
        .map((word) => word.toLowerCase())
        .join('_');
};

export const titleCaseString = (string: string) => {
    return string.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};

export const getDisplayNameFromEmail = (email: string) => {
    if (!email.includes('@')) {
        return email;
    }
    return titleCaseString(email.split('@')[0]);
};
