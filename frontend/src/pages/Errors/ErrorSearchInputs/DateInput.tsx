import { DatePicker } from 'antd';
import React, { useContext } from 'react';
import moment from 'moment';
import {
    ErrorSearchContext,
    ErrorSearchParams,
} from '../ErrorSearchContext/ErrorSearchContext';
import inputStyles from '../../Sessions/SearchInputs/InputStyles.module.scss';

const { RangePicker } = DatePicker;

export const DateInput = () => {
    const { searchParams, setSearchParams } = useContext(ErrorSearchContext);
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
                onChange={(date: any, dateStrings: [string, string]) => {
                    const start_date = dateStrings[0]
                        ? new Date(dateStrings[0])
                        : undefined;
                    const end_date = dateStrings[1]
                        ? new Date(dateStrings[1])
                        : undefined;
                    setSearchParams(
                        (params: ErrorSearchParams): ErrorSearchParams => {
                            return {
                                ...params,
                                date_range:
                                    !start_date || !end_date
                                        ? undefined
                                        : { start_date, end_date },
                            };
                        }
                    );
                }}
            />
        </div>
    );
};
