import classNames from 'classnames';
import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';

import Button from '../../../../components/Button/Button/Button';
import Popover from '../../../../components/Popover/Popover';
import SvgFilterIcon from '../../../../static/FilterIcon';
import { useSearchContext } from '../../../Sessions/SearchContext/SearchContext';
import { DateInput } from '../../../Sessions/SearchInputs/DateInput';
import {
    BrowserInput,
    DeviceIdInput,
    OperatingSystemInput,
} from '../../../Sessions/SearchInputs/DeviceInputs';
import { LengthInput } from '../../../Sessions/SearchInputs/LengthInput';
import {
    LiveSessionsSwitch,
    ViewedSessionsSwitch,
} from '../../../Sessions/SearchInputs/SessionInputs';
import { TrackPropertyInput } from '../../../Sessions/SearchInputs/TrackPropertyInputs';
import {
    FirstTimeUsersSwitch,
    IdentifiedUsersSwitch,
    UserPropertyInput,
} from '../../../Sessions/SearchInputs/UserPropertyInputs';
import segmentPickerStyles from '../SegmentPickerForPlayer/SegmentPickerForPlayer.module.scss';
import styles from './SessionSearchFilters.module.scss';

const SessionSearchFilters = () => {
    const { searchParams } = useSearchContext();
    const [filtersSetCount, setFiltersSetCount] = useState(0);

    useEffect(() => {
        const filterOptions = [
            !!searchParams.browser,
            !!searchParams.os,
            !!searchParams.device_id,
            searchParams.hide_viewed,
            searchParams.identified,
            searchParams.first_time,
            !!searchParams.length_range?.max ||
                !!searchParams.length_range?.min,
            !!searchParams.date_range?.end_date ||
                !!searchParams.date_range?.start_date,
            !!searchParams.excluded_properties?.length,
            !!searchParams.excluded_track_properties?.length,
        ];

        setFiltersSetCount(
            filterOptions.reduce((prev, cur) => (cur ? prev + 1 : prev), 0)
        );
    }, [
        searchParams.browser,
        searchParams.date_range?.end_date,
        searchParams.date_range?.start_date,
        searchParams.device_id,
        searchParams.excluded_properties?.length,
        searchParams.excluded_track_properties?.length,
        searchParams.first_time,
        searchParams.hide_viewed,
        searchParams.identified,
        searchParams.length_range?.max,
        searchParams.length_range?.min,
        searchParams.os,
    ]);

    return (
        <Popover
            large
            content={
                <main className={styles.contentContainer}>
                    <section className={styles.groupContainer}>
                        <ViewedSessionsSwitch />
                        <LiveSessionsSwitch />
                        <IdentifiedUsersSwitch />
                        <FirstTimeUsersSwitch />
                    </section>
                    <section
                        className={classNames(
                            styles.groupContainer,
                            styles.inputContainer
                        )}
                    >
                        <label>
                            <span>Excluded User Properties</span>
                            <UserPropertyInput include={false} />
                        </label>
                        <label>
                            <span>Excluded Track Properties</span>
                            <TrackPropertyInput include={false} />
                        </label>
                        <div></div>
                        <div></div>
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
                            <span>Device ID</span>
                            <DeviceIdInput />
                        </label>
                        <div></div>
                        <div></div>
                        <div></div>
                        <LengthInput />
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
            popoverClassName={styles.popover}
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

export default SessionSearchFilters;
