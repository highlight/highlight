import { DatePicker } from 'antd';
import React, { useContext } from 'react';
import moment from 'moment';
import { SearchContext, SearchParams } from '../SearchContext/SearchContext';
import inputStyles from './InputStyles.module.scss';

const { RangePicker } = DatePicker;

export const DateInput = () => {
    const { searchParams, setSearchParams } = useContext(SearchContext);
    return (
        <div className={inputStyles.commonInputWrapper}>
            <RangePicker
                value ={[moment(searchParams.date_range?.start_date), moment(searchParams.date_range?.end_date)]}
                className={inputStyles.datePicker}
                onChange={(date: any, dateStrings: [string, string]) => {
                    const start_date = dateStrings[0] ? new Date(dateStrings[0]) : undefined;
                    const end_date = dateStrings[1] ? new Date(dateStrings[1]) : undefined;
                    setSearchParams((params: SearchParams): SearchParams => {
                        return {
                            ...params,
                            date_range: (!start_date || !end_date) ? undefined : { start_date, end_date },
                        }
                    })
                }}
            />
        </div>
    );

}