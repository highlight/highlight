import { DatePicker } from 'antd';
import moment from 'moment';
import React from 'react';

import { SessionPageSearchParams } from '../../Player/utils/utils';
import { SearchParams, useSearchContext } from '../SearchContext/SearchContext';
import { EmptySessionsSearchParams } from '../SessionsPage';
import useWatchSessionPageSearchParams from './hooks/useWatchSessionPageSearchParams';
import inputStyles from './InputStyles.module.scss';

const { RangePicker } = DatePicker;

export const DateInput = () => {
    const { searchParams, setSearchParams } = useSearchContext();

    useWatchSessionPageSearchParams(
        SessionPageSearchParams.date,
        (value) => {
            const start_date = moment(value);
            const end_date = moment(value);

            return {
                ...EmptySessionsSearchParams,
                date_range: getDateRangeForDateInput(start_date, end_date),
            };
        },
        (value) => `Showing sessions that were recorded on ${value}`
    );

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
    // Move the end date to the end of the day so the range is end-inclusive.
    const momentStartDate = moment(start_date).startOf('day');
    const momentEndDate = moment(end_date).endOf('day');

    return {
        start_date: momentStartDate.toDate(),
        end_date: momentEndDate.toDate(),
    };
};
