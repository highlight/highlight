import React from 'react';
import styles from './SegmentSidebar.module.scss';
import classNames from 'classnames/bind';
import { SegmentButtons } from '../SearchSidebar/SegmentButtons/SegmentButtons';
import { SegmentPicker } from '../SearchSidebar/SegmentPicker/SegmentPicker';

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
