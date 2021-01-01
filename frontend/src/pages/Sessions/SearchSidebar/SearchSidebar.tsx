import React from 'react';
import styles from './SearchSidebar.module.scss';
import classNames from 'classnames/bind';
import { DateInput } from '../SearchInputs/DateInput';
import { BrowserInput, OperatingSystemInput } from '../SearchInputs/DeviceInputs';
import { UserPropertyInput, IdentifiedUsersSwitch } from '../SearchInputs/UserPropertyInputs';
import { ReferrerInput, VisitedUrlInput } from '../SearchInputs/SessionInputs';

export const SearchSidebar = ({ open }: { open: boolean }) => {
    return (
        <div
            className={classNames([
                styles.searchBar,
                open ? styles.searchBarOpen : styles.searchBarClosed
            ])}
        >
            <div
                style={{
                    flexGrow: 1,
                    height: '100%',
                    position: 'relative',
                    width: '100%',
                    padding: 20,
                }}
            >
                <div className={styles.title}>Advanced Search</div>
                <div className={styles.searchSection}>
                    <div className={styles.header}>USER PROPERTIES</div>
                    <UserPropertyInput />
                    <IdentifiedUsersSwitch />
                </div>
                <div className={styles.searchSection}>
                    <div className={styles.header}>DATE RANGE</div>
                    <DateInput />
                </div>
                <div className={styles.searchSection}>
                    <div className={styles.header}>DEVICE DETAILS</div>
                    <OperatingSystemInput />
                    <BrowserInput />
                </div>
                <div className={styles.searchSection}>
                    <div className={styles.header}>SESSION DETAILS</div>
                    <VisitedUrlInput />
                    <ReferrerInput />
                </div>
            </div>
        </div>
    );
};
