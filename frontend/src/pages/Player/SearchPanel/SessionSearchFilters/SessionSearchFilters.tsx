import { EmptySessionsSearchParams } from '@pages/Sessions/EmptySessionsSearchParams';
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
    AppVersionInput,
    BrowserInput,
    DeviceIdInput,
    EnvironmentInput,
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
    const { searchParams, setSearchParams } = useSearchContext();
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
            !!searchParams.show_live_sessions,
            !!searchParams.app_versions?.length,
            !!searchParams.environments?.length,
            !!searchParams.track_properties?.length,
            !!searchParams.user_properties?.length,
        ];

        setFiltersSetCount(
            filterOptions.reduce((prev, cur) => (cur ? prev + 1 : prev), 0)
        );
    }, [
        searchParams.app_versions?.length,
        searchParams.browser,
        searchParams.date_range?.end_date,
        searchParams.date_range?.start_date,
        searchParams.device_id,
        searchParams.environments?.length,
        searchParams.excluded_properties?.length,
        searchParams.excluded_track_properties?.length,
        searchParams.first_time,
        searchParams.hide_viewed,
        searchParams.identified,
        searchParams.length_range?.max,
        searchParams.length_range?.min,
        searchParams.os,
        searchParams.show_live_sessions,
        searchParams.track_properties?.length,
        searchParams.user_properties?.length,
    ]);

    return (
        <Popover
            large
            visible
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
                            <span>Included User Properties</span>
                            <UserPropertyInput include />
                        </label>
                        <label>
                            <span>Excluded User Properties</span>
                            <UserPropertyInput include={false} />
                        </label>
                        <label>
                            <span>Included Track Properties</span>
                            <TrackPropertyInput include />
                        </label>
                        <label>
                            <span>Excluded Track Properties</span>
                            <TrackPropertyInput include={false} />
                        </label>
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
                        <label>
                            <span>Environments</span>
                            <EnvironmentInput />
                        </label>
                        <div></div>
                        <div></div>
                        <label>
                            <span>App Version</span>
                            <AppVersionInput />
                        </label>
                        <LengthInput />
                        <label>
                            <span>Date Range</span>
                            <DateInput />
                        </label>

                        <div className={styles.clearFiltersContainer}>
                            <Button
                                disabled={filtersSetCount === 0}
                                size="small"
                                trackingId="ClearSessionFilters"
                                className={styles.clearFilters}
                                onClick={() => {
                                    setSearchParams(EmptySessionsSearchParams);
                                }}
                            >
                                Clear Filters
                            </Button>
                        </div>
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
