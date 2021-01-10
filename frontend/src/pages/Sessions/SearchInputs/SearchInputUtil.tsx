import { Styles } from 'react-select';

export const SharedSelectStyleProps: Styles<{ label: string; value: string }, false> = {
    control: (provided, state) => ({ ...provided, borderColor: "#eaeaea", borderRadius: 8, minHeight: 45 }),
    singleValue: (provided, state) => ({ ...provided, maxWidth: "calc(90% - 8px)" }),
    menu: (provided, state) => ({ ...provided, zIndex: 100 }),
    option: (provided, state) => ({
        ...provided,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        direction: "rtl",
        textAlign: "left",
    }),
};