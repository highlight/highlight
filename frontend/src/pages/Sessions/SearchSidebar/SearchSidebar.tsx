import React, { useEffect, useState } from 'react';
import styles from './SearchSidebar.module.scss';
import classNames from 'classnames/bind';
import { DateInput } from '../SearchInputs/DateInput';
import { BrowserInput, OperatingSystemInput } from '../SearchInputs/DeviceInputs';
import { UserPropertyInput, IdentifiedUsersSwitch } from '../SearchInputs/UserPropertyInputs';
import { ReferrerInput, VisitedUrlInput } from '../SearchInputs/SessionInputs';
import { SegmentButtons } from './SegmentButtons/SegmentButtons';
import { ReactComponent as Hamburger } from '../../../static/hamburger.svg';
import { SegmentPicker } from './SegmentPicker/SegmentPicker';
import { SearchSection } from './SearchSection/SearchSection'

export const SearchSidebar = ({ feedPosition }: { feedPosition: { top: number; right: number } }) => {
    const [open, setOpen] = useState(true);
    const [width, setWidth] = useState(window.innerWidth);
    const updateDimensions = () => {
        setWidth(window.innerWidth);
    }
    useEffect(() => {
        window.addEventListener("resize", updateDimensions);
        return () => window.removeEventListener("resize", updateDimensions);
    }, []);
    return (
        <>
            <div
                className={classNames([
                    styles.searchBar,
                ])}
                style={{
                    left: open ? feedPosition.right + 20 : width, top: 80
                }}
            >
                <div className={classNames(styles.sideTab, open ? styles.sideTabHidden : styles.sideTabVisible)} onClick={() => setOpen(o => !o)}>
                    <Hamburger className={styles.hamburgerSide} />
                </div>
                <div
                    className={styles.sideContentWrapper}
                >
                    <SegmentPicker />
                    <SearchSection title="User Properties" open>
                        <div className={classNames(styles.subTitle)}>
                            Included... 
                        </div>
                        <UserPropertyInput include/>
                        <div className={classNames(styles.subTitle)}>
                            Excluded... 
                        </div>
                        <UserPropertyInput include={false}/>
                        <IdentifiedUsersSwitch />
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
                <SegmentButtons />
            </div >
        </>
    );
};
