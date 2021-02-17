import React, { useState } from 'react';
import styles from './SearchSidebar.module.scss';
import classNames from 'classnames/bind';
import { DateInput } from '../SearchInputs/DateInput';
import {
    BrowserInput,
    OperatingSystemInput,
} from '../SearchInputs/DeviceInputs';
import {
    UserPropertyInput,
    IdentifiedUsersSwitch,
} from '../SearchInputs/UserPropertyInputs';
import { TrackPropertyInput } from '../SearchInputs/TrackPropertyInputs';
import {
    ReferrerInput,
    VisitedUrlInput,
    ViewedSessionsSwitch,
} from '../SearchInputs/SessionInputs';
import { ReactComponent as Hamburger } from '../../../static/hamburger.svg';
import { SearchSection } from './SearchSection/SearchSection';

export const SearchSidebar = ({
    feedPosition,
}: {
    feedPosition: { top: number; right: number };
}) => {
    const [open, setOpen] = useState(true);

    return (
        <>
            <div className={classNames([styles.searchBar])}>
                <div
                    className={classNames(
                        styles.sideTab,
                        open ? styles.sideTabHidden : styles.sideTabVisible
                    )}
                    onClick={() => setOpen((o) => !o)}
                >
                    <Hamburger className={styles.hamburgerSide} />
                </div>
                <div className={styles.sideContentWrapper}>
                    <div className={styles.toggleSection}>
                        <IdentifiedUsersSwitch />
                        <ViewedSessionsSwitch />
                    </div>
                    <SearchSection
                        title="User Properties"
                        open
                        searchParamsKey={[
                            'user_properties',
                            'excluded_properties',
                        ]}
                    >
                        <div className={classNames(styles.subTitle)}>
                            Included Properties
                        </div>
                        <UserPropertyInput include />
                        <div className={classNames(styles.subTitle)}>
                            Excluded Properties
                        </div>
                        <UserPropertyInput include={false} />
                    </SearchSection>
                    <SearchSection
                        title="Track Properties"
                        open={false}
                        searchParamsKey={['track_properties']}
                    >
                        <TrackPropertyInput />
                    </SearchSection>
                    <SearchSection
                        title="Date Range"
                        open={false}
                        searchParamsKey={['date_range']}
                    >
                        <DateInput />
                    </SearchSection>
                    <SearchSection
                        title="Device Details"
                        open={false}
                        searchParamsKey={['os', 'browser']}
                    >
                        <OperatingSystemInput />
                        <BrowserInput />
                    </SearchSection>
                    <SearchSection
                        title="Session Details"
                        open={false}
                        searchParamsKey={['visited_url', 'referrer']}
                    >
                        <VisitedUrlInput />
                        <ReferrerInput />
                    </SearchSection>
                </div>
            </div>
        </>
    );
};
