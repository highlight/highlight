import classNames from 'classnames';
import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';

import Button from '../../../../components/Button/Button/Button';
import Popover from '../../../../components/Popover/Popover';
import SvgFilterIcon from '../../../../static/FilterIcon';
import { useErrorSearchContext } from '../../../Errors/ErrorSearchContext/ErrorSearchContext';
import { DateInput } from '../../../Errors/ErrorSearchInputs/DateInput';
import {
    BrowserInput,
    OperatingSystemInput,
} from '../../../Errors/ErrorSearchInputs/DeviceInputs';
import segmentPickerStyles from '../SegmentPickerForErrors/SegmentPickerForErrors.module.scss';
import styles from './ErrorSearchFilters.module.scss';

const ErrorSearchFilters = () => {
    const { searchParams } = useErrorSearchContext();
    const [filtersSetCount, setFiltersSetCount] = useState(0);

    useEffect(() => {
        const filterOptions = [
            !!searchParams.browser,
            !!searchParams.date_range?.start_date ||
                !!searchParams.date_range?.end_date,
            !!searchParams.event,
            !!searchParams.hide_resolved,
            !!searchParams.os,
            !!searchParams.visited_url,
        ];

        setFiltersSetCount(
            filterOptions.reduce((prev, cur) => (cur ? prev + 1 : prev), 0)
        );
    }, [
        searchParams.browser,
        searchParams.date_range?.end_date,
        searchParams.date_range?.start_date,
        searchParams.event,
        searchParams.hide_resolved,
        searchParams.os,
        searchParams.visited_url,
    ]);

    return (
        <Popover
            hasBorder
            large
            content={
                <main className={styles.contentContainer}>
                    <section className={styles.groupContainer}></section>
                    <section
                        className={classNames(
                            styles.groupContainer,
                            styles.inputContainer
                        )}
                    >
                        <label>
                            <span>Browser</span>
                            <BrowserInput />
                        </label>
                        <label>
                            <span>Operating System</span>
                            <OperatingSystemInput />
                        </label>
                        <div></div>
                        <div></div>
                        <label>
                            <span>Date Range</span>
                            <DateInput />
                        </label>
                    </section>
                </main>
            }
            trigger="click"
            placement="rightTop"
            align={{ offset: [8, -24] }}
        >
            <Button
                className={classNames(segmentPickerStyles.segmentButton, {
                    [styles.hasFilters]: filtersSetCount > 0,
                })}
                type="ghost"
                small
                trackingId="sessionPlayerSearchFilters"
            >
                <SvgFilterIcon />
                <span>Filters ({filtersSetCount})</span>
            </Button>
        </Popover>
    );
};

export default ErrorSearchFilters;
