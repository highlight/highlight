import ErrorTypeInput from '@pages/Errors/ErrorSearchInputs/ErrorTypeInput';
import classNames from 'classnames';
import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';

import Button from '../../../../components/Button/Button/Button';
import Popover from '../../../../components/Popover/Popover';
import { ErrorState } from '../../../../graph/generated/schemas';
import SvgFilterIcon from '../../../../static/FilterIcon';
import { useErrorSearchContext } from '../../../Errors/ErrorSearchContext/ErrorSearchContext';
import { DateInput } from '../../../Errors/ErrorSearchInputs/DateInput';
import {
    BrowserInput,
    OperatingSystemInput,
} from '../../../Errors/ErrorSearchInputs/DeviceInputs';
import ErrorStateInput from '../../../Errors/ErrorSearchInputs/ErrorStateInput';
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
            searchParams?.state !== ErrorState.Open,
            !!searchParams.os,
            !!searchParams.visited_url,
            !!searchParams?.type,
        ];

        setFiltersSetCount(
            filterOptions.reduce((prev, cur) => (cur ? prev + 1 : prev), 0)
        );
    }, [
        searchParams.browser,
        searchParams.date_range?.end_date,
        searchParams.date_range?.start_date,
        searchParams.event,
        searchParams.state,
        searchParams.os,
        searchParams.visited_url,
        searchParams.type,
    ]);

    return (
        <Popover
            large
            content={
                <main className={styles.contentContainer}>
                    <section
                        className={classNames(
                            styles.groupContainer,
                            styles.inputContainer
                        )}
                    >
                        <label>
                            <span>Error State</span>
                            <ErrorStateInput />
                        </label>
                        <label>
                            <span>Error Type</span>
                            <ErrorTypeInput />
                        </label>
                        <label>
                            <span>Browser</span>
                            <BrowserInput />
                        </label>
                        <label>
                            <span>Operating System</span>
                            <OperatingSystemInput />
                        </label>
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
