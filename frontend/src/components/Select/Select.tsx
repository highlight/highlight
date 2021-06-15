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
    | 'dropdownRender'
    | 'defaultValue'
    | 'onSearch'
    | 'suffixIcon'
> & {
    options: {
        value: string;
        displayValue: string | React.ReactNode;
        disabled?: boolean;
        id: string;
    }[];
};

const Select = ({ options, className, ...props }: Props) => {
    return (
        <AntDesignSelect
            {...props}
            disabled={props.loading}
            className={classNames(className, styles.select)}
            menuItemSelectedIcon={null}
            defaultActiveFirstOption={false}
            dropdownClassName={styles.dropdown}
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
