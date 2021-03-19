import React, { useState } from 'react';
import styles from './ErrorSearchSidebar.module.scss';
import classNames from 'classnames/bind';
import { ReactComponent as Hamburger } from '../../../static/hamburger.svg';
import { VisitedUrlInput } from '../ErrorSearchInputs/VisitedUrlInput';
import { SearchSection } from '../../Sessions/SearchSidebar/SearchSection/SearchSection';
import { DateInput } from '../ErrorSearchInputs/DateInput';
import {
    BrowserInput,
    OperatingSystemInput,
} from '../ErrorSearchInputs/DeviceInputs';
import {
    EventInput,
    ResolvedErrorSwitch,
} from '../ErrorSearchInputs/EventInput';

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
                        <ResolvedErrorSwitch />
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
                        title="Event Details"
                        open={false}
                        searchParamsKey={['visited_url']}
                    >
                        <EventInput />
                        <VisitedUrlInput />
                    </SearchSection>
                </div>
            </div>
        </>
    );
};
