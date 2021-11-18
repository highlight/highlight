import SvgCalendarIcon from '@icons/CalendarIcon';
// eslint-disable-next-line no-restricted-imports
import { DatePicker as AntDesignDatePicker } from 'antd';
import locale from 'antd/es/date-picker/locale/en_US';
import { RangePickerProps } from 'antd/lib/date-picker';
import classNames from 'classnames';
import moment from 'moment';
import React, { ReactElement } from 'react';

import styles from './RangePicker.module.scss';

type Props = RangePickerProps;

const { RangePicker: AntDesignRangePicker } = AntDesignDatePicker;

function RangePicker({
    ranges = {
        Today: [moment().startOf('day'), moment().endOf('day')],
        'This Week': [moment().startOf('week'), moment().endOf('week')],
        'This Month': [moment().startOf('month'), moment().endOf('month')],
    },
    ...props
}: Props): ReactElement {
    return (
        <AntDesignRangePicker
            {...props}
            className={classNames(props.className)}
            dropdownClassName={classNames(
                props.dropdownClassName,
                styles.dropdown
            )}
            suffixIcon={<SvgCalendarIcon height="16px" width="16px" />}
            ranges={ranges}
            locale={{
                ...locale,
                lang: {
                    ...locale.lang,
                    ok: 'Next',
                },
            }}
        ></AntDesignRangePicker>
    );
}

export default RangePicker;

type RangePickerButtonProps = {
    rangePickerProps: Props;
};

export const RangePickerButton = ({
    rangePickerProps,
}: RangePickerButtonProps) => {
    return <RangePicker {...rangePickerProps} />;
};
