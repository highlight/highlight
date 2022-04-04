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

export const validateEmail = (email: string) => {
    // https://stackoverflow.com/a/46181
    return !!email.match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}])|(([a-zA-Z\-\d]+\.)+[a-zA-Z]{2,}))$/
    );
};

export const bytesToPrettyString = (
    bytes: number,
    use1024 = false,
    decimalPoints = 1
) => {
    const thresh = use1024 ? 1000 : 1024;

    if (Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }

    const units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let u = -1;
    const r = 10 ** decimalPoints;

    do {
        bytes /= thresh;
        ++u;
    } while (
        Math.round(Math.abs(bytes) * r) / r >= thresh &&
        u < units.length - 1
    );

    return bytes.toFixed(decimalPoints) + ' ' + units[u];
};
