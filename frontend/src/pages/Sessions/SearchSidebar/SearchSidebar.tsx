import React from 'react';
import styles from './SearchSidebar.module.scss';
import classNames from 'classnames/bind';
import { UserPropertyInput } from '../UserPropertyInput/UserPropertyInput';

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
                </div>
            </div>
        </div>
    );
};
