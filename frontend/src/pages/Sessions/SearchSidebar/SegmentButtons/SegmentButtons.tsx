import React, { useContext, useState, useEffect } from 'react';
import _ from 'lodash';

import commonStyles from '../../../../Common.module.scss';
import { SearchContext } from '../../SearchContext/SearchContext';
import { RouteComponentProps, useParams, withRouter } from 'react-router-dom';
import { CircularSpinner } from '../../../../components/Loading/Loading';
import { message } from 'antd';
import styles from './SegmentButtons.module.scss';
import { useForm } from 'react-hook-form';
import {
    useCreateSegmentMutation,
    useEditSegmentMutation,
} from '../../../../graph/generated/hooks';
import Modal from '../../../../components/Modal/Modal';
import ModalBody from '../../../../components/ModalBody/ModalBody';
import Button from '../../../../components/Button/Button/Button';

type Inputs = {
    name: string;
};

const Buttons: React.FunctionComponent<RouteComponentProps> = ({ history }) => {
    const { register, handleSubmit, errors, reset } = useForm<Inputs>();
    const { organization_id, segment_id } = useParams<{
        organization_id: string;
        segment_id: string;
    }>();
    const [createClicked, setCreateClicked] = useState(false);
    const {
        searchParams,
        segmentName,
        existingParams,
        setExistingParams,
    } = useContext(SearchContext);
    const [paramsIsDifferent, setParamsIsDifferent] = useState(false);
    const [editSegment, editSegmentOptions] = useEditSegmentMutation({
        refetchQueries: ['GetSegments'],
    });

    const [createSegment, { loading }] = useCreateSegmentMutation({
        refetchQueries: ['GetSegments'],
    });
    const onSubmit = (inputs: Inputs) => {
        createSegment({
            variables: {
                organization_id,
                name: inputs.name,
                params: searchParams,
            },
        }).then((r) => {
            history.push(
                `/${organization_id}/sessions/segment/${r.data?.createSegment?.id}`
            );
            setCreateClicked(false);
            reset();
            message.success('Segment Saved!', 5);
        });
    };
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
            <Modal
                title="Create a segment"
                visible={createClicked}
                onCancel={() => setCreateClicked(false)}
                style={{ display: 'flex' }}
            >
                <ModalBody className={styles.modalWrapper}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className={styles.modalSubTitle}>
                            Enter the name of your segment and you'll be good to
                            go!
                        </div>
                        <input
                            className={commonStyles.input}
                            name="name"
                            ref={register({ required: true })}
                            placeholder={'Segment Name'}
                        />
                        <div className={commonStyles.errorMessage}>
                            {errors.name &&
                                'Error with segment name ' +
                                    errors.name.message}
                        </div>
                        <Button style={{ width: '100%', marginTop: 10 }}>
                            {loading ? (
                                <CircularSpinner
                                    style={{ fontSize: 18, color: 'white' }}
                                />
                            ) : (
                                'Save As Segment'
                            )}
                        </Button>
                    </form>
                </ModalBody>
            </Modal>
            {/* If the params have changed for the current segment, offer to update it. */}
            {paramsIsDifferent && segmentName ? (
                <>
                    <Button
                        type="primary"
                        onClick={() => {
                            editSegment({
                                variables: {
                                    organization_id,
                                    id: segment_id,
                                    params: searchParams,
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
                                style={{ fontSize: 18, color: 'white' }}
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
                onClick={() => setCreateClicked(true)}
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
