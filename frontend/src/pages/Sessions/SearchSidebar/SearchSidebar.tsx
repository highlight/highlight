import React, { useState } from 'react';
import styles from './SearchSidebar.module.scss';
import classNames from 'classnames/bind';
import { DateInput } from '../SearchInputs/DateInput';
import { LengthInput } from '../SearchInputs/LengthInput';
import {
    BrowserInput,
    OperatingSystemInput,
} from '../SearchInputs/DeviceInputs';
import {
    UserPropertyInput,
    IdentifiedUsersSwitch,
    FirstTimeUsersSwitch,
} from '../SearchInputs/UserPropertyInputs';
import { TrackPropertyInput } from '../SearchInputs/TrackPropertyInputs';
import {
    ReferrerInput,
    VisitedUrlInput,
    ViewedSessionsSwitch,
    LiveSessionsSwitch,
} from '../SearchInputs/SessionInputs';
import { ReactComponent as Hamburger } from '../../../static/hamburger.svg';
import { SearchSection } from './SearchSection/SearchSection';

export const SearchSidebar = () => {
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
                        <ViewedSessionsSwitch />
                        <LiveSessionsSwitch />
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
                        <IdentifiedUsersSwitch />
                        <FirstTimeUsersSwitch />
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
                        searchParamsKey={[
                            'visited_url',
                            'referrer',
                            'length_range',
                        ]}
                    >
                        <VisitedUrlInput />
                        <ReferrerInput />
                        <LengthInput />
                    </SearchSection>
                </div>
            </div>
        </>
    );
};
