import classNames from 'classnames/bind';
import React, { useState } from 'react';

import { ReactComponent as Hamburger } from '../../../static/hamburger.svg';
import { SearchSectionForErrors as SearchSection } from '../../Sessions/SearchSidebar/SearchSection/SearchSectionForErrors';
import { DateInput } from '../ErrorSearchInputs/DateInput';
import {
    BrowserInput,
    OperatingSystemInput,
} from '../ErrorSearchInputs/DeviceInputs';
import {
    EventInput,
    ResolvedErrorSwitch,
} from '../ErrorSearchInputs/EventInput';
import { VisitedUrlInput } from '../ErrorSearchInputs/VisitedUrlInput';
import styles from './ErrorSearchSidebar.module.scss';

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
                        searchParamsKey={['date_range']}
                    >
                        <DateInput />
                    </SearchSection>
                    <SearchSection
                        title="Device Details"
                        searchParamsKey={['os', 'browser']}
                    >
                        <OperatingSystemInput />
                        <BrowserInput />
                    </SearchSection>
                    <SearchSection
                        title="Event Details"
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
