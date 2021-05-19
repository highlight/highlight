import { DatePicker } from 'antd';
import moment from 'moment';
import React from 'react';

import { SearchParams, useSearchContext } from '../SearchContext/SearchContext';
import inputStyles from './InputStyles.module.scss';

const { RangePicker } = DatePicker;

export const DateInput = () => {
    const { searchParams, setSearchParams } = useSearchContext();
    return (
        <div className={inputStyles.commonInputWrapper}>
            <RangePicker
                value={
                    searchParams.date_range
                        ? [
                              moment(searchParams.date_range.start_date),
                              moment(searchParams.date_range.end_date),
                          ]
                        : null
                }
                className={inputStyles.datePicker}
                onChange={(_date: any, dateStrings: [string, string]) => {
                    // Dates in local timezone.
                    const start_date = dateStrings[0]
                        ? moment(dateStrings[0])
                        : undefined;
                    const end_date = dateStrings[1]
                        ? moment(dateStrings[1])
                        : undefined;

                    // Move the end date to the end of the day so the range is end-inclusive.
                    const momentStartDate = moment(start_date).startOf('day');
                    const momentEndDate = moment(end_date).endOf('day');

                    setSearchParams(
                        (params: SearchParams): SearchParams => {
                            return {
                                ...params,
                                date_range:
                                    !start_date || !end_date
                                        ? undefined
                                        : {
                                              start_date: momentStartDate.toDate(),
                                              end_date: momentEndDate.toDate(),
                                          },
                            };
                        }
                    );
                }}
            />
        </div>
    );
};
