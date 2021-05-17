import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import Select from '../../../components/Select/Select';
import { useGetSegmentsQuery } from '../../../graph/generated/hooks';
import { SessionFeed } from '../../Sessions/SessionsFeed/SessionsFeed';
import styles from './SearchPanel.module.scss';

const SearchPanel = () => {
    const { organization_id } = useParams<{
        organization_id: string;
    }>();
    const { loading: loadingSegments, data } = useGetSegmentsQuery({
        variables: { organization_id },
    });
    const [selectedSegment, setSelectedSegment] = useState<
        { value: string; segmentId: string } | undefined
    >(undefined);
    const [showViewedSessions, setShowViewedSessions] = useState(false);

    const isLoading = loadingSegments;

    return (
        <div className={styles.searchPanel}>
            <div className={styles.selectContainer}>
                <Select
                    value={selectedSegment?.value}
                    onChange={(value, option) => {
                        let nextValue = undefined;
                        if (value && option) {
                            nextValue = {
                                value: value,
                                segmentId: (option as any).key,
                            };
                        }
                        setSelectedSegment(nextValue);
                    }}
                    className={styles.segmentSelect}
                    placeholder="Segment: None"
                    allowClear
                    options={(data?.segments || [])
                        .map((segment) => ({
                            displayValue: segment?.name || '',
                            value: segment?.name || '',
                            id: segment?.id || '',
                        }))
                        .sort((a, b) =>
                            a.displayValue.toLowerCase() >
                            b.displayValue.toLowerCase()
                                ? 1
                                : -1
                        )}
                    loading={isLoading}
                />

                <Select
                    value={showViewedSessions ? 'Viewed' : 'Not Viewed'}
                    onChange={(value) => {
                        setShowViewedSessions(value === 'Viewed');
                    }}
                    className={styles.viewedSelect}
                    options={[
                        {
                            displayValue: 'Viewed',
                            value: 'Viewed',
                            id: 'Viewed',
                        },
                        {
                            displayValue: 'Not Viewed',
                            value: 'Not Viewed',
                            id: 'Not Viewed',
                        },
                    ]}
                    loading={isLoading}
                />
            </div>

            <SessionFeed />
        </div>
    );
};

export default SearchPanel;
