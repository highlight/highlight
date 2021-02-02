export const ErrorStringify = (object: any) => {
    return JSON.stringify(
        object,
        (key, value) => (typeof value === 'bigint' ? value.toString() : value) // return everything else unchanged
    );
};

export const ContainsLabel = (inputValue: string) => {
    return 'Contains: ' + inputValue;
};
