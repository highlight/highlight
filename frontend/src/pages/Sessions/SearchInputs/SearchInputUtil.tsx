import { Styles } from 'react-select';

export const SharedSelectStyleProps: Styles = {
    control: (provided, state) => ({ ...provided, borderColor: "#eaeaea", borderRadius: 8, minHeight: 45 }),
    singleValue: (provided, state) => ({ ...provided, maxWidth: "calc(90% - 8px)" }),
};