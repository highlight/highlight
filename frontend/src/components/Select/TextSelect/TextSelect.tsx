import {
    // eslint-disable-next-line no-restricted-imports
    Select as AntDesignSelect,
    SelectProps as AntDesignSelectProps,
} from 'antd';
import classNames from 'classnames';
import React from 'react';

import SvgChevronDownIcon from '../../../static/ChevronDownIcon';
import styles from './TextSelect.module.scss';
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
    | 'children'
    | 'optionLabelProp'
    | 'filterOption'
    | 'open'
> & {
    options?: {
        value: string;
        displayValue: string | React.ReactNode;
        disabled?: boolean;
        id: string;
    }[];
};

const TextSelect = ({ options, className, children, ...props }: Props) => {
    return (
        <AntDesignSelect
            {...props}
            disabled={props.loading}
            className={classNames(className, styles.select)}
            menuItemSelectedIcon={null}
            defaultActiveFirstOption={false}
            dropdownClassName={styles.dropdown}
            suffixIcon={
                <SvgChevronDownIcon
                    className={classNames({
                        [styles.suffixIconActive]: !!props.value,
                    })}
                />
            }
        >
            {options?.map(({ displayValue, value, disabled, id }) => (
                <Option key={id} value={value} disabled={disabled}>
                    {displayValue}
                </Option>
            ))}
            {children}
        </AntDesignSelect>
    );
};

export default TextSelect;
