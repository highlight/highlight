import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TextTransition from 'react-text-transition';

import Button from '../../../../components/Button/Button/Button';
import Select from '../../../../components/Select/Select';
import {
    useCreateSegmentMutation,
    useEditSegmentMutation,
    useGetSegmentsQuery,
} from '../../../../graph/generated/hooks';
import SvgPlayIcon from '../../../../static/PlayIcon';
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
        searchParams,
        existingParams,
    } = useSearchContext();
    const { loading, data } = useGetSegmentsQuery({
        variables: { organization_id },
    });
    const [selectedSegment, setSelectedSegment] = useState<
        { value: string; id: string } | undefined
    >(undefined);
    const [paramsIsDifferent, setParamsIsDifferent] = useState(false);
    const [editSegment, editSegmentOptions] = useEditSegmentMutation({
        refetchQueries: ['GetSegments'],
    });

    const [
        createSegment,
        { loading: createSegmentLoading },
    ] = useCreateSegmentMutation({
        refetchQueries: ['GetSegments'],
    });

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

    useEffect(() => {
        // Compares original params and current search params to check if they are different
        // Removes undefined, null fields, and empty arrays when comparing
        setParamsIsDifferent(
            !_.isEqual(
                _.omitBy(
                    _.pickBy(searchParams, _.identity),
                    (v) => Array.isArray(v) && v.length === 0
                ),
                _.omitBy(
                    _.pickBy(existingParams, _.identity),
                    (v) => Array.isArray(v) && v.length === 0
                )
            )
        );
    }, [searchParams, existingParams]);

    return (
        <section className={styles.segmentPickerSection}>
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
                        a.displayValue.toLowerCase() >
                        b.displayValue.toLowerCase()
                            ? 1
                            : -1
                    )}
                loading={loading}
                hasAccent
            />
            <Button
                trackingId="CreateSessionSegment"
                // onClick={() => setCreateClicked(true)}
                type="ghost"
                small
                className={styles.segmentButton}
            >
                <SvgPlayIcon />
                <span>
                    <TextTransition
                        text={
                            paramsIsDifferent && segmentName
                                ? 'Update'
                                : 'Create'
                        }
                        inline
                    />{' '}
                    Segment
                </span>
            </Button>
        </section>
    );
};

export default SegmentPickerForPlayer;
