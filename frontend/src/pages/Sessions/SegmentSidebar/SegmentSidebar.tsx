import classNames from 'classnames/bind';
import React from 'react';

import { SegmentButtons } from '../SearchSidebar/SegmentButtons/SegmentButtons';
import { SegmentPicker } from '../SearchSidebar/SegmentPicker/SegmentPicker';
import styles from './SegmentSidebar.module.scss';

export const SegmentSidebar = () => {
    return (
        <>
            <div className={classNames([styles.searchBar])}>
                <SegmentPicker />
                <SegmentButtons />
            </div>
        </>
    );
};
