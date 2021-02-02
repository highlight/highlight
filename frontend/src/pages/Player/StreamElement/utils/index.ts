export const isJson = (string: string) => {
    try {
        JSON.parse(string);
    } catch (e) {
        return false;
    }
    return true;
};
