import RangePicker from '@components/RangePicker/RangePicker';
import moment from 'moment';
import React from 'react';

import { SearchParams, useSearchContext } from '../SearchContext/SearchContext';
import inputStyles from './InputStyles.module.scss';

export const DateInput = () => {
    const { searchParams, setSearchParams } = useSearchContext();

    return (
        <div>
            <RangePicker
                showTime
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

                    setSearchParams(
                        (params: SearchParams): SearchParams => {
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
