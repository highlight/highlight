import React from 'react';

import {
    LiveSessionsSwitch,
    ViewedSessionsSwitch,
} from '../../Sessions/SearchInputs/SessionInputs';
import {
    FirstTimeUsersSwitch,
    IdentifiedUsersSwitch,
} from '../../Sessions/SearchInputs/UserPropertyInputs';
import SessionSearch from '../../Sessions/SessionsFeedV2/components/SessionSearch/SessionSearch';
import { SessionFeed } from '../../Sessions/SessionsFeedV2/SessionsFeed';
import styles from './SearchPanel.module.scss';
import SegmentPickerForPlayer from './SegmentPickerForPlayer/SegmentPickerForPlayer';

const SearchPanel = () => {
    return (
        <div className={styles.searchPanel}>
            <div className={styles.filtersContainer}>
                <SessionSearch />
                <SegmentPickerForPlayer />
                <ViewedSessionsSwitch />
                <LiveSessionsSwitch />
                <IdentifiedUsersSwitch />
                <FirstTimeUsersSwitch />
            </div>
            <SessionFeed />
        </div>
    );
};

export default SearchPanel;
