import React, { useState } from 'react';
import styles from './ErrorSearchSidebar.module.scss';
import classNames from 'classnames/bind';
import { ReactComponent as Hamburger } from '../../../static/hamburger.svg';
import {
    ViewedSessionsSwitch,
    VisitedUrlInput,
} from '../../Sessions/SearchInputs/SessionInputs';
import { SearchSection } from '../../Sessions/SearchSidebar/SearchSection/SearchSection';
import { DateInput } from '../../Sessions/SearchInputs/DateInput';
import {
    BrowserInput,
    OperatingSystemInput,
} from '../../Sessions/SearchInputs/DeviceInputs';

export const ErrorSearchSidebar = () => {
    const [open, setOpen] = useState(true);

    return (
        <>
            <div className={classNames([styles.searchBar])}>
                <button
                    className={classNames(
                        styles.sideTab,
                        open ? styles.sideTabHidden : styles.sideTabVisible
                    )}
                    onClick={() => setOpen((o) => !o)}
                >
                    <Hamburger className={styles.hamburgerSide} />
                </button>
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
