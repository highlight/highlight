import { Slider } from 'antd';
import React, { useContext } from 'react';
import 'antd/dist/antd.css';
import { SearchContext, SearchParams } from '../SearchContext/SearchContext';
import inputStyles from './InputStyles.module.scss';

export const LengthInput = () => {
    const { searchParams, setSearchParams } = useContext(SearchContext);
    const marks = {
        0: '0 min',
        120: '120+ mins',
    };
    return (
        <div className={inputStyles.commonInputWrapper}>
            <Slider
                range
                tooltipPlacement={'bottom'}
                disabled={false}
                min={0}
                max={120}
                marks={marks}
                value={
                    searchParams.length_range
                        ? [
                              searchParams.length_range.min,
                              searchParams.length_range.max,
                          ]
                        : undefined
                }
                onChange={(lengthNums: [number, number]) => {
                    let min = lengthNums[0];
                    let max = lengthNums[1];
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
                }}
            />
        </div>
    );
};
