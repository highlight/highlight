import useLocalStorage from '@rehooks/local-storage';
import { message, Select as AntDesignSelect } from 'antd';
import classNames from 'classnames';
const { Option } = AntDesignSelect;
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TextTransition from 'react-text-transition';

import Button from '../../../../components/Button/Button/Button';
import Select from '../../../../components/Select/Select';
import Tooltip from '../../../../components/Tooltip/Tooltip';
import {
    useEditSegmentMutation,
    useGetSegmentsQuery,
} from '../../../../graph/generated/hooks';
import SvgCloseIcon from '../../../../static/CloseIcon';
import SvgEditIcon from '../../../../static/EditIcon';
import SvgPlusIcon from '../../../../static/PlusIcon';
import { gqlSanitize } from '../../../../util/gqlSanitize';
import { useSearchContext } from '../../../Sessions/SearchContext/SearchContext';
import CreateSegmentModal from '../../../Sessions/SearchSidebar/SegmentButtons/CreateSegmentModal';
import DeleteSessionSegmentModal from '../../../Sessions/SearchSidebar/SegmentPicker/DeleteSessionSegmentModal/DeleteSessionSegmentModal';
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
    const [selectedSegment, setSelectedSegment] = useLocalStorage<
        { value: string; id: string } | undefined
    >('highlightSegmentPickerForPlayerSelectedSegmentId', undefined);
    const [paramsIsDifferent, setParamsIsDifferent] = useState(false);
    const [showCreateSegmentModal, setShowCreateSegmentModal] = useState(false);
    const [segmentToDelete, setSegmentToDelete] = useState<{
        name?: string;
        id?: string;
    } | null>(null);
    const [editSegment] = useEditSegmentMutation({
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

    const showUpdateSegmentOption = paramsIsDifferent && segmentName;
    const segmentOptions = (data?.segments || [])
        .map((segment) => ({
            displayValue: segment?.name || '',
            value: segment?.name || '',
            id: segment?.id || '',
        }))
        .sort((a, b) =>
            a.displayValue.toLowerCase() > b.displayValue.toLowerCase() ? 1 : -1
        );

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
                loading={loading}
                hasAccent
                optionLabelProp="label"
                notFoundContent={
                    <p>
                        You haven't created any segments yet. Segments allow you
                        to quickly view sessions that match a search query.
                    </p>
                }
            >
                {segmentOptions.map((option) => (
                    <Option
                        value={option.value}
                        label={option.displayValue}
                        key={option.id}
                        className={styles.segmentOption}
                    >
                        <span className={styles.segmentOptionContainer}>
                            <Tooltip
                                title={option.displayValue}
                                placement="topLeft"
                            >
                                {option.displayValue}
                            </Tooltip>
                            <Button
                                trackingId="deleteSegmentFromPlayerSegmentPicker"
                                type="ghost"
                                iconButton
                                aria-label={`Delete ${option.value} segment`}
                                small
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSegmentToDelete({
                                        id: option.id,
                                        name: option.displayValue,
                                    });
                                }}
                            >
                                <SvgCloseIcon />
                            </Button>
                        </span>
                    </Option>
                ))}
            </Select>

            <Button
                trackingId="CreateSessionSegment"
                onClick={() => {
                    if (showUpdateSegmentOption && selectedSegment) {
                        const {
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            show_live_sessions,
                            ...restOfSearchParams
                        } = searchParams;
                        editSegment({
                            variables: {
                                organization_id,
                                id: selectedSegment.id,
                                params: restOfSearchParams,
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
                                message.error('Error updating segment!', 5);
                            });
                    } else {
                        setShowCreateSegmentModal(true);
                    }
                }}
                type="ghost"
                small
                className={classNames(
                    styles.segmentButton,
                    styles.createOrUpdateButton
                )}
            >
                {showUpdateSegmentOption ? <SvgEditIcon /> : <SvgPlusIcon />}
                <span>
                    <TextTransition
                        text={showUpdateSegmentOption ? 'Update' : 'Create'}
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
                afterCreateHandler={(segmentId, segmentName) => {
                    if (data?.segments) {
                        setSelectedSegment({
                            id: segmentId,
                            value: segmentName,
                        });
                        setSegmentName(segmentName);
                    }
                }}
            />
            <DeleteSessionSegmentModal
                showModal={!!segmentToDelete}
                hideModalHandler={() => {
                    setSegmentToDelete(null);
                }}
                segmentToDelete={segmentToDelete}
                afterDeleteHandler={() => {
                    if (
                        segmentToDelete &&
                        segmentName === segmentToDelete.name
                    ) {
                        setSelectedSegment(undefined);
                        setSegmentName(null);
                        setSearchParams(EmptySessionsSearchParams);
                    }
                }}
            />
        </section>
    );
};

export default SegmentPickerForPlayer;
