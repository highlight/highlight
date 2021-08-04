import { message } from 'antd';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { RouteComponentProps, useParams, withRouter } from 'react-router-dom';

import commonStyles from '../../../../Common.module.scss';
import Button from '../../../../components/Button/Button/Button';
import { CircularSpinner } from '../../../../components/Loading/Loading';
import { useEditSegmentMutation } from '../../../../graph/generated/hooks';
import { useSearchContext } from '../../SearchContext/SearchContext';
import CreateSegmentModal from './CreateSegmentModal';

const Buttons: React.FunctionComponent<RouteComponentProps> = () => {
    const { organization_id, segment_id } = useParams<{
        organization_id: string;
        segment_id: string;
    }>();
    const [showCreateSegmentModal, setShowCreateSegmentModal] = useState(false);
    const {
        searchParams,
        segmentName,
        existingParams,
        setExistingParams,
    } = useSearchContext();
    const [paramsIsDifferent, setParamsIsDifferent] = useState(false);
    const [editSegment, editSegmentOptions] = useEditSegmentMutation({
        refetchQueries: ['GetSegments'],
    });

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
        <>
            <CreateSegmentModal
                showModal={showCreateSegmentModal}
                onHideModal={() => {
                    setShowCreateSegmentModal(false);
                }}
            />
            {/* If the params have changed for the current segment, offer to update it. */}
            {paramsIsDifferent && segmentName ? (
                <>
                    <Button
                        trackingId="UpdateSessionSegment"
                        type="primary"
                        onClick={() => {
                            const {
                                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                show_live_sessions,
                                ...restOfSearchParams
                            } = searchParams;
                            editSegment({
                                variables: {
                                    organization_id,
                                    id: segment_id,
                                    params: restOfSearchParams,
                                },
                            })
                                .then(() => {
                                    message.success('Updated Segment!', 5);
                                    setExistingParams(searchParams);
                                })
                                .catch(() => {
                                    message.error('Error updating segment!', 5);
                                });
                        }}
                        className={commonStyles.submitButton}
                    >
                        {editSegmentOptions.loading ? (
                            <CircularSpinner
                                style={{
                                    fontSize: 18,
                                    color: 'var(--text-primary-inverted)',
                                }}
                            />
                        ) : (
                            'Update Current Segment'
                        )}
                    </Button>
                </>
            ) : (
                <></>
            )}
            {/* In every case, let someone create a new segment w/ the current search params. */}
            <Button
                trackingId="CreateSessionSegment"
                onClick={() => setShowCreateSegmentModal(true)}
                type={paramsIsDifferent && segmentName ? 'default' : 'primary'}
                className={
                    paramsIsDifferent && segmentName
                        ? commonStyles.secondaryButton
                        : commonStyles.submitButton
                }
            >
                Create New Segment
            </Button>
        </>
    );
};

export const SegmentButtons = withRouter(Buttons);
