import { message } from 'antd';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TextTransition from 'react-text-transition';

import Button from '../../../../components/Button/Button/Button';
import Select from '../../../../components/Select/Select';
import {
    useEditSegmentMutation,
    useGetSegmentsQuery,
} from '../../../../graph/generated/hooks';
import useHighlightAdminFlag from '../../../../hooks/useHighlightAdminFlag/useHighlightAdminFlag';
import SvgPlayIcon from '../../../../static/PlayIcon';
import { gqlSanitize } from '../../../../util/gqlSanitize';
import { useSearchContext } from '../../../Sessions/SearchContext/SearchContext';
import CreateSegmentModal from '../../../Sessions/SearchSidebar/SegmentButtons/CreateSegmentModal';
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
    const [showCreateSegmentModal, setShowCreateSegmentModal] = useState(false);
    const [editSegment] = useEditSegmentMutation({
        refetchQueries: ['GetSegments'],
    });
    const { isHighlightAdmin } = useHighlightAdminFlag();

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

    const showUpdateSegmentOption = paramsIsDifferent && segmentName;

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

            {isHighlightAdmin && (
                <>
                    <Button
                        trackingId="CreateSessionSegment"
                        onClick={() => {
                            if (showUpdateSegmentOption && selectedSegment) {
                                editSegment({
                                    variables: {
                                        organization_id,
                                        id: selectedSegment.id,
                                        params: searchParams,
                                    },
                                })
                                    .then(() => {
                                        message.success(
                                            `Updated '${selectedSegment.value}'`,
                                            5
                                        );
                                        setExistingParams(searchParams);
                                    })
                                    .catch(() => {
                                        message.error(
                                            'Error updating segment!',
                                            5
                                        );
                                    });
                            } else {
                                setShowCreateSegmentModal(true);
                            }
                        }}
                        type="ghost"
                        small
                        className={styles.segmentButton}
                    >
                        <SvgPlayIcon />
                        <span>
                            <TextTransition
                                text={
                                    showUpdateSegmentOption
                                        ? 'Update'
                                        : 'Create'
                                }
                                inline
                            />{' '}
                            Segment
                        </span>
                    </Button>
                    <CreateSegmentModal
                        showModal={showCreateSegmentModal}
                        onHideModal={() => {
                            setShowCreateSegmentModal(false);
                        }}
                    />
                </>
            )}
        </section>
    );
};

export default SegmentPickerForPlayer;
