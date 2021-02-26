import React, { useState } from 'react';
import styles from './ErrorSearchSidebar.module.scss';
import classNames from 'classnames/bind';
import { DateInput } from '../ErrorSearchInputs/ErrorDateInput';
import {
    BrowserInput,
    OperatingSystemInput,
} from '../ErrorSearchInputs/ErrorDeviceInputs';
import {
    VisitedUrlInput,
    ViewedSessionsSwitch,
} from '../ErrorSearchInputs/ErrorSessionInputs';
import { ReactComponent as Hamburger } from '../../../static/hamburger.svg';
import { SearchSection } from './SearchSection/SearchSection';

export const ErrorSearchSidebar = () => {
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
                    </div>
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
                        searchParamsKey={['visited_url']}
                    >
                        <VisitedUrlInput />
                    </SearchSection>
                </div>
            </div>
        </>
    );
};
