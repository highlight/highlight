import { Styles } from 'react-select';

export const SharedSelectStyleProps: Styles<
    { label: string; value: string },
    false
> = {
    control: (provided) => ({
        ...provided,
        borderColor: '#eaeaea',
        borderRadius: 8,
        minHeight: 45,
    }),
    singleValue: (provided) => ({
        ...provided,
        maxWidth: 'calc(90% - 8px)',
    }),
    menu: (provided) => ({ ...provided, zIndex: 100 }),
    option: (provided) => ({
        ...provided,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        direction: 'rtl',
        textAlign: 'left',
    }),
};

export const ContainsLabel = (inputValue: string) => {
    return 'Contains: ' + inputValue;
};
