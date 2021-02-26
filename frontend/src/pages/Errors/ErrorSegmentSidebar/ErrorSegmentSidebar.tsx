import React from 'react';
import styles from './ErrorSegmentSidebar.module.scss';
import classNames from 'classnames/bind';
import { SegmentButtons } from './SegmentButtons/SegmentButtons';
import { SegmentPicker } from './SegmentPicker/SegmentPicker';

export const ErrorSegmentSidebar = () => {
    return (
        <>
            <div className={classNames([styles.searchBar])}>
                <SegmentPicker />
                <SegmentButtons />
            </div>
        </>
    );
};
