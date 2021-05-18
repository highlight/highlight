import React from 'react';

import useHighlightAdminFlag from '../../../hooks/useHighlightAdminFlag/useHighlightAdminFlag';
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
    const { isHighlightAdmin } = useHighlightAdminFlag();

    return (
        <div className={styles.searchPanel}>
            <div className={styles.filtersContainer}>
                <SegmentPickerForPlayer />
                {isHighlightAdmin && (
                    <>
                        <ViewedSessionsSwitch />
                        <LiveSessionsSwitch />
                        <IdentifiedUsersSwitch />
                        <FirstTimeUsersSwitch />{' '}
                    </>
                )}
            </div>

            <SessionFeed minimal />
        </div>
    );
};

export default SearchPanel;
