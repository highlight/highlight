import { Slider } from 'antd';
import React, { useContext } from 'react';
import { SearchContext, SearchParams } from '../SearchContext/SearchContext';
import inputStyles from './InputStyles.module.scss';

export const LengthInput = () => {
    const { searchParams, setSearchParams } = useContext(SearchContext);
    return (
        <div className={inputStyles.commonInputWrapper}>
            <Slider range disabled={false}></Slider>
        </div>
    );
};
