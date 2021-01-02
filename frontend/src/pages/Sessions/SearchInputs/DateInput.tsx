import { DatePicker } from 'antd';
import React, { useContext } from 'react';
import { SearchContext, SearchParams } from '../SearchContext/SearchContext';
import inputStyles from './InputStyles.module.scss';

export const DateInput = () => {
    const { setSearchParams } = useContext(SearchContext);
    return (
        <div className={inputStyles.commonInputWrapper}>
            <DatePicker.RangePicker
                className={inputStyles.datePicker}
                onChange={(date: any, dateStrings: [string, string]) => {
                    setSearchParams((params: SearchParams): SearchParams => {
                        return {
                            ...params,
                            date_range: { start_date: new Date(dateStrings[0]), end_date: new Date(dateStrings[1]) },
                        }
                    })
                }} />
        </div>
    );

}