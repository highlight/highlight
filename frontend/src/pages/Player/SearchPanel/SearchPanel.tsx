import React from 'react';

import {
    LiveSessionsSwitch,
    ViewedSessionsSwitch,
} from '../../Sessions/SearchInputs/SessionInputs';
import {
    FirstTimeUsersSwitch,
    IdentifiedUsersSwitch,
} from '../../Sessions/SearchInputs/UserPropertyInputs';
import { SessionFeed } from '../../Sessions/SessionsFeed/SessionsFeed';
import styles from './SearchPanel.module.scss';
import SegmentPickerForPlayer from './SegmentPickerForPlayer/SegmentPickerForPlayer';

const SearchPanel = () => {
    return (
        <div className={styles.searchPanel}>
            <div className={styles.filtersContainer}>
                <SegmentPickerForPlayer />
                <ViewedSessionsSwitch />
                <LiveSessionsSwitch />
                <IdentifiedUsersSwitch />
                <FirstTimeUsersSwitch />
            </div>

            <SessionFeed minimal />
        </div>
    );
};

export default SearchPanel;
