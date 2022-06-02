import React from 'react';

import { SessionFeed } from '../../Sessions/SessionsFeedV2/SessionsFeed';
import styles from './SearchPanel.module.scss';

interface Props {
    visible: boolean;
}

const SearchPanel = React.memo(({ visible }: Props) => {
    return (
        <div className={styles.searchPanel}>{visible && <SessionFeed />}</div>
    );
});

export default SearchPanel;
