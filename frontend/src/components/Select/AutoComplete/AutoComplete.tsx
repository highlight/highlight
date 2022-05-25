import SvgChevronDownIcon from '@icons/ChevronDownIcon';
import {
    // eslint-disable-next-line no-restricted-imports
    AutoComplete as AntDesignAutoComplete,
    AutoCompleteProps as AntDesignAutoCompleteProps,
} from 'antd';
import classNames from 'classnames';
import React from 'react';

import styles from '../Select.module.scss';

const { Option } = AntDesignAutoComplete;

export interface OptionType {
    value: string;
    displayValue: string | React.ReactNode;
    disabled?: boolean;
    id: string;
    dropDownIcon?: React.ReactNode;
}

type Props = Pick<
    AntDesignAutoCompleteProps,
    | 'onChange'
    | 'placeholder'
    | 'value'
    | 'className'
    | 'allowClear'
    | 'notFoundContent'
    | 'dropdownRender'
    | 'defaultValue'
    | 'onSearch'
    | 'children'
    | 'filterOption'
    | 'bordered'
    | 'disabled'
    | 'defaultActiveFirstOption'
    | 'aria-label'
    | 'tagRender'
    | 'open'
    | 'dropdownMatchSelectWidth'
> & {
    options?: OptionType[];
    hasAccent?: boolean;
};

const AutoComplete = ({
    options,
    className,
    hasAccent = false,
    children,
    defaultActiveFirstOption = false,
    ...props
}: Props) => {
    return (
        <AntDesignAutoComplete
            {...props}
            disabled={props.disabled}
            className={classNames(className, styles.select, {
                [styles.selectHasValue]: hasAccent && !!props.value,
            })}
            menuItemSelectedIcon={null}
            defaultActiveFirstOption={defaultActiveFirstOption}
            dropdownClassName={styles.dropdown}
            suffixIcon={
                <SvgChevronDownIcon
                    className={classNames({
                        [styles.suffixIconActive]: !!props.value,
                    })}
                />
            }
        >
            {options?.map(
                ({ displayValue, value, disabled, id, dropDownIcon }) => {
                    let display = displayValue;
                    if (!!dropDownIcon) {
                        display = (
                            <div className={styles.dropdownIcon}>
                                {displayValue}{' '}
                                <div className={styles.icon}>
                                    {dropDownIcon}
                                </div>
                            </div>
                        );
                    }

                    return (
                        <Option key={id} value={value} disabled={disabled}>
                            {display}
                        </Option>
                    );
                }
            )}
            {children}
        </AntDesignAutoComplete>
    );
};

export default AutoComplete;
