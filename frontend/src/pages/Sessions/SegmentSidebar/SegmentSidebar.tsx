import React, { useState } from 'react';
import styles from './SegmentSidebar.module.scss';
import classNames from 'classnames/bind';
import { SegmentButtons } from '../SearchSidebar/SegmentButtons/SegmentButtons';
import { ReactComponent as Hamburger } from '../../../static/hamburger.svg';
import { SegmentPicker } from '../SearchSidebar/SegmentPicker/SegmentPicker';

export const SegmentSidebar = ({
    feedPosition,
}: {
    feedPosition: { top: number; x: number };
}) => {
    const [open, setOpen] = useState(true);

    return (
        <>
            <div className={classNames([styles.searchBar])}>
                <SegmentPicker />
                <SegmentButtons />
            </div>
        </>
    );
};
