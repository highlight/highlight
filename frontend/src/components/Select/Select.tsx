import {
    // eslint-disable-next-line no-restricted-imports
    Select as AntDesignSelect,
    SelectProps as AntDesignSelectProps,
} from 'antd';
import classNames from 'classnames';
import React from 'react';

import styles from './Select.module.scss';

const { Option } = AntDesignSelect;

type Props = Pick<
    AntDesignSelectProps<any>,
    | 'onChange'
    | 'placeholder'
    | 'loading'
    | 'value'
    | 'className'
    | 'allowClear'
    | 'notFoundContent'
    | 'mode'
    | 'dropdownClassName'
> & {
    options: {
        value: string;
        displayValue: string;
        disabled?: boolean;
        id: string;
    }[];
};

const Select = ({ options, dropdownClassName, ...props }: Props) => {
    return (
        <AntDesignSelect
            {...props}
            disabled={props.loading}
            dropdownClassName={classNames(styles.select, dropdownClassName)}
            menuItemSelectedIcon={null}
            defaultActiveFirstOption={false}
        >
            {options.map(({ displayValue, value, disabled, id }) => (
                <Option key={id} value={value} disabled={disabled}>
                    {displayValue}
                </Option>
            ))}
        </AntDesignSelect>
    );
};

export default Select;
