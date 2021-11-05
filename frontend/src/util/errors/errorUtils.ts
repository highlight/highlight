const MAX_TITLE_CHARACTER_LENGTH = 20;

export const getErrorTitle = (str: string): string | null => {
    if (str.length === 0) {
        return null;
    }

    try {
        const json = JSON.parse(str);

        if (Array.isArray(json)) {
            const firstValue = json[0];
            if (typeof firstValue === 'string') {
                return firstValue;
            } else if (typeof firstValue === 'object') {
                const values = Object.values(firstValue);

                if (values.length > 0) {
                    if (typeof values[0] === 'string') {
                        return values[0];
                    }
                }
            }
        }
    } catch {
        return str.slice(0, MAX_TITLE_CHARACTER_LENGTH);
    }

    return str.slice(0, MAX_TITLE_CHARACTER_LENGTH);
};
