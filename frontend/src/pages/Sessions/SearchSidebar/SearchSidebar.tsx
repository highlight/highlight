import React, { useContext } from 'react';
import styles from './SearchSidebar.module.scss';
import classNames from 'classnames/bind';
import { DatePicker } from 'antd';
import { SearchContext, SearchParams } from '../SearchContext/SearchContext';
import { DateInput } from '../SearchInputs/DateInput';
import { BrowserInput, OperatingSystemInput } from '../SearchInputs/DeviceInputs';
import { UserPropertyInput } from '../SearchInputs/UserPropertyInput';

export const SearchSidebar = ({ open }: { open: boolean }) => {
    const { searchParams, setSearchParams } = useContext(SearchContext);
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
            </div>
        </div>
    );
};
