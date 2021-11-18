// eslint-disable-next-line no-restricted-imports
import { DatePicker as AntDesignDatePicker } from 'antd';
import { RangePickerProps } from 'antd/lib/date-picker';
import React, { ReactElement } from 'react';

type Props = RangePickerProps;

const { RangePicker: AntDesignRangePicker } = AntDesignDatePicker;

function RangePicker(props: Props): ReactElement {
    return <AntDesignRangePicker {...props}></AntDesignRangePicker>;
}

export default RangePicker;
