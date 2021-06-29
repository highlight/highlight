import classNames from 'classnames/bind';
import React, { useState } from 'react';

import { ReactComponent as Hamburger } from '../../../static/hamburger.svg';
import { DateInput } from '../SearchInputs/DateInput';
import {
    BrowserInput,
    DeviceIdInput,
    OperatingSystemInput,
} from '../SearchInputs/DeviceInputs';
import { LengthInput } from '../SearchInputs/LengthInput';
import {
    LiveSessionsSwitch,
    ReferrerInput,
    ViewedSessionsSwitch,
    VisitedUrlInput,
} from '../SearchInputs/SessionInputs';
import { TrackPropertyInput } from '../SearchInputs/TrackPropertyInputs';
import {
    FirstTimeUsersSwitch,
    IdentifiedUsersSwitch,
    UserPropertyInput,
} from '../SearchInputs/UserPropertyInputs';
import { SearchSection } from './SearchSection/SearchSection';
import styles from './SearchSidebar.module.scss';

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
                        <div className={styles.inputContainer}>
                            <UserPropertyInput include={false} />
                        </div>
                        <div className={styles.checkboxContainer}>
                            <IdentifiedUsersSwitch />
                            <FirstTimeUsersSwitch />
                        </div>
                    </SearchSection>
                    <SearchSection
                        title="Track Properties"
                        searchParamsKey={['track_properties']}
                    >
                        <div className={classNames(styles.subTitle)}>
                            Included Properties
                        </div>
                        <TrackPropertyInput />
                        <div className={classNames(styles.subTitle)}>
                            Excluded Properties
                        </div>
                        <TrackPropertyInput include={false} />
                    </SearchSection>
                    <SearchSection
                        title="Date Range"
                        searchParamsKey={['date_range']}
                    >
                        <div className={styles.topPadding}>
                            <DateInput />
                        </div>
                    </SearchSection>
                    <SearchSection
                        title="Device Details"
                        searchParamsKey={['os', 'browser', 'device_id']}
                    >
                        <div className={styles.topPadding}>
                            <div className={styles.inputContainer}>
                                <OperatingSystemInput />
                            </div>
                            <div className={styles.inputContainer}>
                                <BrowserInput />
                            </div>
                            <div className={styles.inputContainer}>
                                <DeviceIdInput />
                            </div>
                        </div>
                    </SearchSection>
                    <SearchSection
                        title="Session Details"
                        searchParamsKey={[
                            'visited_url',
                            'referrer',
                            'length_range',
                        ]}
                    >
                        <div className={styles.topPadding}>
                            <div className={styles.inputContainer}>
                                <VisitedUrlInput />
                            </div>
                            <div className={styles.inputContainer}>
                                <ReferrerInput />
                            </div>
                            <div className={styles.inputContainer}>
                                <LengthInput />
                            </div>
                        </div>
                    </SearchSection>
                </div>
            </div>
        </>
    );
};
