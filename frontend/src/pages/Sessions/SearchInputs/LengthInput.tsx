import { Slider } from 'antd';
import React, { useCallback, useContext } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import 'antd/dist/antd.css';
import { SearchContext, SearchParams } from '../SearchContext/SearchContext';
import inputStyles from './InputStyles.module.scss';

export const LengthInput = () => {
    const { searchParams, setSearchParams } = useContext(SearchContext);
    const debouncedSearchParams = useDebouncedCallback(
        useCallback((sessionLength: [number, number]) => {
            let min = sessionLength[0];
            let max = sessionLength[1];
            if (min > max) {
                const temp = max;
                max = min;
                min = temp;
            }
            setSearchParams(
                (params: SearchParams): SearchParams => {
                    return {
                        ...params,
                        length_range: { min, max },
                    };
                }
            );
        }, []),
        500
    );
    const marks = {
        0: '0',
        60: '60+',
    };
    return (
        <div className={inputStyles.commonInputWrapper}>
            <div className={inputStyles.subTitle}>Length (min)</div>
            <Slider
                range
                tooltipPlacement={'bottom'}
                disabled={false}
                min={0}
                max={60}
                marks={marks}
                value={
                    searchParams.length_range
                        ? [
                              searchParams.length_range.min,
                              searchParams.length_range.max,
                          ]
                        : undefined
                }
                onChange={(value) => debouncedSearchParams(value)}
            />
        </div>
    );
};
