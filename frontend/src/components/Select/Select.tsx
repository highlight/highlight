import SvgChevronDownIcon from '@icons/ChevronDownIcon';
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
    | 'children'
    | 'optionLabelProp'
    | 'filterOption'
    | 'bordered'
    | 'disabled'
    | 'defaultActiveFirstOption'
    | 'aria-label'
> & {
    options?: {
        value: string;
        displayValue: string | React.ReactNode;
        disabled?: boolean;
        id: string;
    }[];
    hasAccent?: boolean;
};

const Select = ({
    options,
    className,
    hasAccent = false,
    children,
    defaultActiveFirstOption = false,
    ...props
}: Props) => {
    return (
        <AntDesignSelect
            {...props}
            disabled={props.loading || props.disabled}
            className={classNames(className, styles.select, {
                [styles.selectHasValue]: hasAccent && !!props.value,
            })}
            menuItemSelectedIcon={null}
            defaultActiveFirstOption={defaultActiveFirstOption}
            dropdownClassName={styles.dropdown}
            suffixIcon={
                props.loading ? undefined : (
                    <SvgChevronDownIcon
                        className={classNames({
                            [styles.suffixIconActive]: !!props.value,
                        })}
                    />
                )
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

export default Select;
