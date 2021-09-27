import { DatePicker, message } from 'antd';
import moment from 'moment';
import React, { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import SvgCalendarIcon from '../../../static/CalendarIcon';
import { SessionPageSearchParams } from '../../Player/utils/utils';
import { getDateRangeForDateInput } from '../../Sessions/SearchInputs/DateInput';
import inputStyles from '../../Sessions/SearchInputs/InputStyles.module.scss';
import {
    ErrorSearchParams,
    useErrorSearchContext,
} from '../ErrorSearchContext/ErrorSearchContext';
import { EmptyErrorsSearchParams } from '../ErrorsPage';

const { RangePicker } = DatePicker;

export const DateInput = () => {
    const { searchParams, setSearchParams } = useErrorSearchContext();
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
                ...EmptyErrorsSearchParams,
                date_range: getDateRangeForDateInput(start_date, end_date),
            }));
            message.success(
                `Showing errors that were thrown on ${dateFromSearchParams}`
            );
            history.replace({ search: '' });
        }
    }, [history, dateFromSearchParams, setSearchParams]);

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
