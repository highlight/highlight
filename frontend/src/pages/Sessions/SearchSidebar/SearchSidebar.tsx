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
                    <SearchSection title="User Properties" open>
                        <div className={classNames(styles.subTitle)}>
                            Included Properties
                        </div>
                        <UserPropertyInput include />
                        <div className={classNames(styles.subTitle)}>
                            Excluded Properties
                        </div>
                        <UserPropertyInput include={false} />
                    </SearchSection>
                    <SearchSection title="Track Properties" open={false}>
                        <TrackPropertyInput />
                    </SearchSection>
                    <SearchSection title="Date Range" open={false}>
                        <DateInput />
                    </SearchSection>
                    <SearchSection title="Device Details" open={false}>
                        <OperatingSystemInput />
                        <BrowserInput />
                    </SearchSection>
                    <SearchSection title="Session Details" open={false}>
                        <VisitedUrlInput />
                        <ReferrerInput />
                    </SearchSection>
                </div>
            </div>
        </>
    );
};
