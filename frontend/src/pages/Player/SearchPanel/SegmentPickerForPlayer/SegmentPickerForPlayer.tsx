import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import Select from '../../../../components/Select/Select';
import { useGetSegmentsQuery } from '../../../../graph/generated/hooks';
import { gqlSanitize } from '../../../../util/gqlSanitize';
import { useSearchContext } from '../../../Sessions/SearchContext/SearchContext';
import { EmptySessionsSearchParams } from '../../../Sessions/SessionsPage';
import styles from './SegmentPickerForPlayer.module.scss';

const SegmentPickerForPlayer = () => {
    const { organization_id } = useParams<{
        organization_id: string;
    }>();
    const {
        setSearchParams,
        setSegmentName,
        setExistingParams,
        segmentName,
    } = useSearchContext();
    const { loading, data } = useGetSegmentsQuery({
        variables: { organization_id },
    });
    const [selectedSegment, setSelectedSegment] = useState<
        { value: string; id: string } | undefined
    >(undefined);

    const currentSegment = data?.segments?.find(
        (s) => s?.id === selectedSegment?.id
    );

    useEffect(() => {
        if (currentSegment) {
            const segmentParameters = gqlSanitize({
                ...currentSegment?.params,
            });
            setExistingParams(segmentParameters);
            setSearchParams(segmentParameters);
            setSegmentName(currentSegment?.name || null);
        }
    }, [currentSegment, setExistingParams, setSearchParams, setSegmentName]);

    return (
        <Select
            value={segmentName}
            onChange={(value, option) => {
                let nextValue = undefined;
                if (value && option) {
                    nextValue = {
                        value: value,
                        id: (option as any).key,
                    };
                } else {
                    setExistingParams(EmptySessionsSearchParams);
                    setSearchParams(EmptySessionsSearchParams);
                    setSegmentName(null);
                }
                setSelectedSegment(nextValue);
            }}
            className={styles.segmentSelect}
            placeholder="Choose Segment"
            allowClear
            options={(data?.segments || [])
                .map((segment) => ({
                    displayValue: segment?.name || '',
                    value: segment?.name || '',
                    id: segment?.id || '',
                }))
                .sort((a, b) =>
                    a.displayValue.toLowerCase() > b.displayValue.toLowerCase()
                        ? 1
                        : -1
                )}
            loading={loading}
        />
    );
};

export default SegmentPickerForPlayer;
