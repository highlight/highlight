import SessionsQueryBuilder from '@pages/Sessions/SessionsFeedV2/components/SessionsQueryBuilder/SessionsQueryBuilder';
import React from 'react';

import { SessionFeed } from '../../Sessions/SessionsFeedV2/SessionsFeed';
import styles from './SearchPanel.module.scss';
import SegmentPickerForPlayer from './SegmentPickerForPlayer/SegmentPickerForPlayer';

interface Props {
    visible: boolean;
}

const SearchPanel = React.memo(({ visible }: Props) => {
    return (
        <div className={styles.searchPanel}>
            {visible && (
                <div className={styles.searchContainer}>
                    <div className={styles.filtersContainer}>
                        <SegmentPickerForPlayer />
                        <SessionsQueryBuilder />
                    </div>
                    <SessionFeed />
                </div>
            )}
        </div>
    );
});

export default SearchPanel;
