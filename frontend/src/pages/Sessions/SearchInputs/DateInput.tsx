import { DatePicker } from 'antd';
import React, { useContext } from 'react';
import { SearchContext, SearchParams } from '../SearchContext/SearchContext';

export const DateInput = () => {
    const { searchParams, setSearchParams } = useContext(SearchContext);
    return (<DatePicker.RangePicker onChange={(date: any, dateStrings: [string, string]) => {
        setSearchParams((params: SearchParams): SearchParams => {
            return {
                ...params,
                date_range: { start_date: new Date(dateStrings[0]), end_date: new Date(dateStrings[1]) },
            }
        })
    }} />);

}