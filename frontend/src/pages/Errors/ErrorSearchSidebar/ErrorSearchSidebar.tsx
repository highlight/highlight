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
                        <div className={styles.topPadding}>
                            <DateInput />
                        </div>
                    </SearchSection>
                    <SearchSection
                        title="Device Details"
                        searchParamsKey={['os', 'browser']}
                    >
                        <div
                            className={classNames(
                                styles.inputContainer,
                                styles.topPadding
                            )}
                        >
                            <OperatingSystemInput />
                        </div>
                        <div>
                            <BrowserInput />
                        </div>
                    </SearchSection>
                    <SearchSection
                        title="Event Details"
                        searchParamsKey={['visited_url']}
                    >
                        <div
                            className={classNames(
                                styles.inputContainer,
                                styles.topPadding
                            )}
                        >
                            <EventInput />
                        </div>
                        <VisitedUrlInput />
                    </SearchSection>
                </div>
            </div>
        </>
    );
};
