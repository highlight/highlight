// eslint-disable-next-line no-restricted-imports
import { DatePicker as AntDesignDatePicker, DatePickerProps } from 'antd';
import React from 'react';

type Props = DatePickerProps;

const DatePicker = (props: Props) => {
    return <AntDesignDatePicker {...props} />;
};

export default DatePicker;
