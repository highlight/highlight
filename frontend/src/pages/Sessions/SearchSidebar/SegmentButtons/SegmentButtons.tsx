import React, { useContext, useState, useEffect } from 'react';
import _ from 'lodash';

import commonStyles from '../../../../Common.module.scss';
import { gql, useMutation } from '@apollo/client';
import { SearchContext, SearchParams } from '../../SearchContext/SearchContext';
import { useParams } from 'react-router-dom';
import { CircularSpinner } from '../../../../components/Spinner/Spinner';
import { message, Modal } from 'antd';
import styles from './SegmentButtons.module.scss';
import { useForm } from 'react-hook-form';

type Inputs = {
    name: string;
};

export const SegmentButtons = () => {
    const { register, handleSubmit, errors, reset } = useForm<Inputs>();
    const { organization_id, segment_id } = useParams<{
        organization_id: string;
        segment_id: string;
    }>();
    const [createClicked, setCreateClicked] = useState(false);
    const { searchParams, isSegment, existingParams, setExistingParams } = useContext(
        SearchContext
    );
    const [paramsIsDifferent, setParamsIsDifferent] = useState(false);
    const [editSegment, editSegmentOptions] = useMutation<
        boolean,
        { organization_id: number; id: number; params: SearchParams }
    >(
        gql`
            mutation EditSegment(
                $organization_id: ID!
                $id: ID!
                $params: SearchParamsInput!
            ) {
                editSegment(
                    organization_id: $organization_id
                    id: $id
                    params: $params
                )
            }
        `,
        { refetchQueries: ['GetSegments'] }
    );
    const [createSegment, { loading }] = useMutation<
        { id: number },
        { organization_id: number; name: string; params: SearchParams }
    >(
        gql`
            mutation CreateSegment(
                $organization_id: ID!
                $name: String!
                $params: SearchParamsInput!
            ) {
                createSegment(
                    organization_id: $organization_id
                    name: $name
                    params: $params
                ) {
                    name
                    id
                    params {
                        user_properties { name, value }
                        excluded_properties { name, value }
                        date_range { start_date, end_date }
                        os, browser, visited_url, referrer, identified
                    }
                }
            }
        `,
        { refetchQueries: ['GetSegments'] }
    );
    const onSubmit = (inputs: Inputs) => {
        createSegment({
            variables: {
                organization_id: parseInt(organization_id),
                name: inputs.name,
                params: searchParams,
            },
        }).then((r) => {
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
                _.omitBy(_.pickBy(searchParams, _.identity), (v) => Array.isArray(v) && v.length === 0),
                _.omitBy(_.pickBy(existingParams, _.identity), (v) => Array.isArray(v) && v.length === 0)
            )
        );
    }, [searchParams, existingParams]);
    return (
        <>
            <Modal
                visible={createClicked}
                maskClosable
                onCancel={() => setCreateClicked(false)}
                style={{ display: 'flex' }}
                footer={null}
            >
                <div className={styles.modalWrapper}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className={styles.modalTitle}>
                            Create a Segment
                        </div>
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
                        <button className={commonStyles.submitButton}>
                            {loading ? (
                                <CircularSpinner
                                    style={{ fontSize: 18, color: 'white' }}
                                />
                            ) : (
                                'Save As Segment'
                            )}
                        </button>
                    </form>
                </div>
            </Modal>
            {paramsIsDifferent ? (
                isSegment ? (
                    <>
                        <div
                            onClick={() => {
                                editSegment({
                                    variables: {
                                        organization_id: parseInt(
                                            organization_id
                                        ),
                                        id: parseInt(segment_id),
                                        params: searchParams,
                                    },
                                })
                                    .then(() => {
                                        message.success('Updated Segment!', 5);
                                        setExistingParams(searchParams)
                                    })
                                    .catch(() => {
                                        message.error(
                                            'Error updating segment!',
                                            5
                                        );
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
                        </div>
                        <div
                            onClick={() => setCreateClicked(true)}
                            className={commonStyles.secondaryButton}
                        >
                            Save New Segment
                        </div>
                    </>
                ) : (
                    <div
                        onClick={() => setCreateClicked(true)}
                        className={commonStyles.submitButton}
                    >
                        Save As Segment
                    </div>
                )
            ) : (
                <></>
            )}
        </>
    );
};
