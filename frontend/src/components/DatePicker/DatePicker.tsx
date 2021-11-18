// eslint-disable-next-line no-restricted-imports
import { DatePicker as AntDesignDatePicker, DatePickerProps } from 'antd';
import classNames from 'classnames';
import React from 'react';

import styles from './DatePicker.module.scss';

type Props = DatePickerProps;

const DatePicker = (props: Props) => {
    return (
        <AntDesignDatePicker
            {...props}
            className={classNames(styles.datePicker, props.className)}
            dropdownClassName={styles.datePicker}
        />
    );
};

export default DatePicker;
