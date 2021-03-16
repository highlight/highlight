import { Slider } from 'antd';
import React, { useContext, useState } from 'react';
import 'antd/dist/antd.css';
import { SearchContext } from '../SearchContext/SearchContext';
import inputStyles from './InputStyles.module.scss';

export const LengthInput = () => {
    const { searchParams, setSearchParams } = useContext(SearchContext);
    const [localMin, setLocalMin] = useState(
        searchParams.length_range?.min ? searchParams.length_range?.min : 0
    );
    const [localMax, setLocalMax] = useState(
        searchParams.length_range?.max ? searchParams.length_range?.max : 0
    );

    const updateSearchParams = () => {
        setSearchParams((params) => {
            return {
                ...params,
                length_range: {
                    min: Math.min(localMin, localMax),
                    max: Math.max(localMin, localMax),
                },
            };
        });
    };

    const marks = {
        0: '0',
        60: '60+',
    };
    return (
        <div className={inputStyles.commonInputWrapper}>
            <div className={inputStyles.subTitle}>Length (minutes)</div>
            <Slider
                range
                tooltipPlacement={'bottom'}
                disabled={false}
                min={0}
                max={60}
                marks={marks}
                value={[localMin, localMax]}
                onChange={([min, max]) => {
                    setLocalMin(min);
                    setLocalMax(max);
                }}
                onAfterChange={updateSearchParams}
            />
        </div>
    );
};
