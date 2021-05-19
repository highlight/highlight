import { DatePicker, message } from 'antd';
import moment from 'moment';
import React, { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { SessionPageSearchParams } from '../../Player/utils/utils';
import { SearchParams, useSearchContext } from '../SearchContext/SearchContext';
import { EmptySessionsSearchParams } from '../SessionsPage';
import inputStyles from './InputStyles.module.scss';

const { RangePicker } = DatePicker;

export const DateInput = () => {
    const { searchParams, setSearchParams } = useSearchContext();
    const location = useLocation();
    const history = useHistory();
    const dateFromSearchParams = new URLSearchParams(location.search).get(
        SessionPageSearchParams.date
    );

    useEffect(() => {
        if (dateFromSearchParams) {
            const start_date = moment(dateFromSearchParams);
            const end_date = moment(dateFromSearchParams);

            setSearchParams(() => ({
                // We are explicitly clearing any existing search params so the only applied search param is the date range.
                ...EmptySessionsSearchParams,
                date_range: getDateRangeForDateInput(start_date, end_date),
            }));
            message.success(
                `Showing sessions that were recorded on ${dateFromSearchParams}`
            );
            history.replace({ search: '' });
        }
    }, [history, dateFromSearchParams, setSearchParams]);

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
