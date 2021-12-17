import { DatePicker } from 'antd';
import { RangePickerProps } from 'antd/lib/date-picker/generatePicker';
import moment from 'moment';
import React from 'react';

import SvgCalendarIcon from '../../../static/CalendarIcon';
import { SearchParams, useSearchContext } from '../SearchContext/SearchContext';
import inputStyles from './InputStyles.module.scss';

const { RangePicker } = DatePicker;

export const DateInput = () => {
    const { searchParams, setSearchParams } = useSearchContext();

    const setDateRange = (dateRange: DateRange) => {
        setSearchParams(
            (params: SearchParams): SearchParams => {
                return {
                    ...params,
                    date_range: dateRange,
                };
            }
        );
    };

    return (
        <DateRangePicker
            dateRange={searchParams.date_range}
            setDateRange={setDateRange}
        />
    );
};

export type DateRange =
    | {
          start_date: Date;
          end_date: Date;
      }
    | undefined;
interface DateInputProps {
    dateRange: DateRange;
    setDateRange: (dateRange: DateRange) => void;
}

export const DateRangePicker = ({
    dateRange,
    setDateRange,
    ...props
}: DateInputProps & RangePickerProps<moment.Moment>) => (
    <div>
        <RangePicker
            // @ts-expect-error
            showTime
            ranges={{
                Today: [moment().startOf('day'), moment().endOf('day')],
                'This Week': [moment().startOf('week'), moment().endOf('week')],
                'This Month': [
                    moment().startOf('month'),
                    moment().endOf('month'),
                ],
            }}
            value={
                dateRange
                    ? [moment(dateRange.start_date), moment(dateRange.end_date)]
                    : null
            }
            suffixIcon={<SvgCalendarIcon height="16px" width="16px" />}
            className={inputStyles.datePicker}
            onChange={(_date: any, dateStrings: [string, string]) => {
                // Dates in local timezone.
                const start_date = dateStrings[0]
                    ? moment(dateStrings[0])
                    : undefined;
                const end_date = dateStrings[1]
                    ? moment(dateStrings[1])
                    : undefined;

                setDateRange(
                    !start_date || !end_date
                        ? undefined
                        : getDateRangeForDateInput(start_date, end_date)
                );
            }}
            {...props}
        />
    </div>
);

export const getDateRangeForDateInput = (
    start_date?: moment.Moment,
    end_date?: moment.Moment
): { start_date: Date; end_date: Date } => {
    const momentStartDate = moment(start_date);
    const momentEndDate = moment(end_date);

    return {
        start_date: momentStartDate.toDate(),
        end_date: momentEndDate.toDate(),
    };
};
