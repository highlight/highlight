import {
    Select as AntDesignSelect,
    SelectProps as AntDesignSelectProps,
} from 'antd';
import React from 'react';

const { Option } = AntDesignSelect;

type Props = Pick<
    AntDesignSelectProps<any>,
    | 'onChange'
    | 'placeholder'
    | 'loading'
    | 'value'
    | 'className'
    | 'allowClear'
> & {
    options: {
        value: string;
        displayValue: string;
        disabled?: boolean;
        id: string;
    }[];
};

const Select = ({ options, ...props }: Props) => {
    return (
        <AntDesignSelect {...props} disabled={props.loading}>
            {options.map(({ displayValue, value, disabled, id }) => (
                <Option key={id} value={value} disabled={disabled}>
                    {displayValue}
                </Option>
            ))}
        </AntDesignSelect>
    );
};

export default Select;
