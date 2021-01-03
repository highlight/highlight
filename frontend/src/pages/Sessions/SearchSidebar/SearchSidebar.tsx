import React, { useState } from 'react';
import styles from './SearchSidebar.module.scss';
import classNames from 'classnames/bind';
import { DateInput } from '../SearchInputs/DateInput';
import { BrowserInput, OperatingSystemInput } from '../SearchInputs/DeviceInputs';
import { UserPropertyInput, IdentifiedUsersSwitch } from '../SearchInputs/UserPropertyInputs';
import { ReferrerInput, VisitedUrlInput } from '../SearchInputs/SessionInputs';
import Collapsible from 'react-collapsible';
import { ReactComponent as DownIcon } from '../../../static/chevron-down.svg';
import { ReactComponent as Hamburger } from '../../../static/hamburger.svg';

export const SearchSidebar = () => {
    const [open, setOpen] = useState(true);
    return (
        <div
            className={classNames([
                styles.searchBar,
                open ? styles.searchBarOpen : styles.searchBarClosed
            ])}
        >
            <div className={classNames(styles.sideTab, open ? styles.sideTabHidden : styles.sideTabVisible)} onClick={() => setOpen(o => !o)}>
                <Hamburger className={styles.hamburgerSide} />
            </div>
            <div
                style={{
                    flexGrow: 1,
                    height: '100%',
                    position: 'relative',
                    width: '100%',
                    padding: 20,
                }}
            >
                <div className={styles.hideWrapper} onClick={() => setOpen(false)}>
                    <span className={styles.hideText}>Hide</span>
                </div>
                <div className={styles.title}>Advanced Search</div>
                <SearchSection title="User Properties" open>
                    <UserPropertyInput />
                    <IdentifiedUsersSwitch />
                </SearchSection>
                <SearchSection title="Date Range" open>
                    <DateInput />
                </SearchSection>
                <SearchSection title="Device Details" open>
                    <OperatingSystemInput />
                    <BrowserInput />
                </SearchSection>
                <SearchSection title="Session Details" open>
                    <VisitedUrlInput />
                    <ReferrerInput />
                </SearchSection>
            </div>
        </div>
    );
};


type SearchSectionProps = {
    title: string;
    open: boolean;
};

const SearchSection: React.FunctionComponent<SearchSectionProps> = ({
    children,
    title,
    open
}) => {
    const [isOpen, setIsOpen] = useState<boolean>(open);
    const header = (
        <div className={styles.headerWrapper}>
            <DownIcon
                className={styles.icon}
                style={{
                    transform: !isOpen ? 'rotate(180deg)' : 'rotate(360deg)',
                }}
            />
            <div className={styles.header}>{title}</div>
        </div>
    );
    return (
        <div className={styles.searchSectionWrapper}>
            <Collapsible
                open
                onOpening={() => setIsOpen(true)}
                onClosing={() => setIsOpen(false)}
                trigger={header}
                transitionTime={150}
                style={{ margin: 10 }}
                contentOuterClassName={isOpen ? styles.contentOuterOpen : styles.contentOuterClosed}
            >
                <div className={styles.searchSection}>
                    {children}
                </div>
            </Collapsible>
        </div>
    );
}