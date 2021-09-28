import { DatePicker } from 'antd';
import moment from 'moment';
import React from 'react';

import SvgCalendarIcon from '../../../static/CalendarIcon';
import { getDateRangeForDateInput } from '../../Sessions/SearchInputs/DateInput';
import inputStyles from '../../Sessions/SearchInputs/InputStyles.module.scss';
import {
    ErrorSearchParams,
    useErrorSearchContext,
} from '../ErrorSearchContext/ErrorSearchContext';

const { RangePicker } = DatePicker;

export const DateInput = () => {
    const { searchParams, setSearchParams } = useErrorSearchContext();

    return (
        <div>
            <RangePicker
                showTime
                ranges={{
                    Today: [moment().startOf('day'), moment().endOf('day')],
                    'This Week': [
                        moment().startOf('week'),
                        moment().endOf('week'),
                    ],
                    'This Month': [
                        moment().startOf('month'),
                        moment().endOf('month'),
                    ],
                }}
                value={
                    searchParams.date_range
                        ? [
                              moment(searchParams.date_range.start_date),
                              moment(searchParams.date_range.end_date),
                          ]
                        : null
                }
                className={inputStyles.datePicker}
                suffixIcon={<SvgCalendarIcon />}
                onChange={(_date: any, dateStrings: [string, string]) => {
                    // Dates in local timezone.
                    const start_date = dateStrings[0]
                        ? moment(dateStrings[0])
                        : undefined;
                    const end_date = dateStrings[1]
                        ? moment(dateStrings[1])
                        : undefined;

                    setSearchParams(
                        (params: ErrorSearchParams): ErrorSearchParams => {
                            return {
                                ...params,
                                date_range:
                                    !start_date || !end_date
                                        ? undefined
                                        : getDateRangeForDateInput(
                                              start_date,
                                              end_date
                                          ),
                            };
                        }
                    );
                }}
            />
        </div>
    );
};
