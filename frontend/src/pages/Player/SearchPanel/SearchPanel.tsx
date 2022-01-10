import { usePlayerUIContext } from '@pages/Player/context/PlayerUIContext';
import SessionsQueryBuilder from '@pages/Sessions/SessionsFeedV2/components/SessionsQueryBuilder/SessionsQueryBuilder';
import React from 'react';

import SessionSearch from '../../Sessions/SessionsFeedV2/components/SessionSearch/SessionSearch';
import { SessionFeed } from '../../Sessions/SessionsFeedV2/SessionsFeed';
import styles from './SearchPanel.module.scss';
import SegmentPickerForPlayer from './SegmentPickerForPlayer/SegmentPickerForPlayer';
import SessionSearchFilters from './SessionSearchFilters/SessionSearchFilters';

interface Props {
    visible: boolean;
}

const SearchPanel = React.memo(({ visible }: Props) => {
    const { isQueryBuilder } = usePlayerUIContext();
    return (
        <div className={styles.searchPanel}>
            {visible && (
                <>
                    <div className={styles.filtersContainer}>
                        {isQueryBuilder ? (
                            <>
                                <SegmentPickerForPlayer />
                                <SessionsQueryBuilder />
                            </>
                        ) : (
                            <>
                                <SessionSearch />
                                <SegmentPickerForPlayer />
                                <SessionSearchFilters />
                            </>
                        )}
                    </div>
                    <SessionFeed />
                </>
            )}
        </div>
    );
});

export default SearchPanel;
