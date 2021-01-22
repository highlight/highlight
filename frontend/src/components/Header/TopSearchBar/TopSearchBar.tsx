import classNames from 'classnames/bind';
import React, { useState } from 'react';

import { ReactComponent as Search } from '../../../static/search.svg';
import styles from './TopSearchBar.module.scss';

export const TopSearchBar = () => {
    const [focus, setFocus] = useState(true);
    return (
        <>
            <div className={styles.searchBarWrapper}>
                <Search className={styles.searchIcon} />
                <input
                    className={styles.searchBarInput}
                    placeholder={"Search properties, segments, etc."}
                    onFocus={() => setFocus(true)}
                    onBlur={() => setFocus(false)}
                />
                <div className={styles.commandContainer}>⌘</div>
                <div className={styles.commandContainer}>K</div>
            </div>
        </>
    );
}