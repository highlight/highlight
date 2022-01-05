import { namedOperations } from '@graph/operations';
import SvgXIcon from '@icons/XIcon';
import { message, Select as AntDesignSelect } from 'antd';
import classNames from 'classnames';
const { Option } = AntDesignSelect;
import {
    deserializeGroup,
    getDefaultRules,
    RuleProps,
    serializeRules,
} from '@pages/Sessions/SessionsFeedV2/components/QueryBuilder/QueryBuilder';
import { useParams } from '@util/react-router/useParams';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import TextTransition from 'react-text-transition';

import Button from '../../../../components/Button/Button/Button';
import Select from '../../../../components/Select/Select';
import Tooltip from '../../../../components/Tooltip/Tooltip';
import {
    useEditSegmentMutation,
    useGetSegmentsQuery,
} from '../../../../graph/generated/hooks';
import SvgEditIcon from '../../../../static/EditIcon';
import SvgPlusIcon from '../../../../static/PlusIcon';
import { gqlSanitize } from '../../../../util/gqlSanitize';
import { EmptySessionsSearchParams } from '../../../Sessions/EmptySessionsSearchParams';
import { useSearchContext } from '../../../Sessions/SearchContext/SearchContext';
import CreateSegmentModal from '../../../Sessions/SearchSidebar/SegmentButtons/CreateSegmentModal';
import DeleteSessionSegmentModal from '../../../Sessions/SearchSidebar/SegmentPicker/DeleteSessionSegmentModal/DeleteSessionSegmentModal';
import { STARRED_SEGMENT_ID } from '../../../Sessions/SearchSidebar/SegmentPicker/SegmentPicker';
import styles from './SegmentPickerForPlayer.module.scss';

const SegmentPickerForPlayer = () => {
    const { project_id } = useParams<{
        project_id: string;
    }>();
    const {
        setSearchParams,
        setSegmentName,
        setExistingParams,
        segmentName,
        searchParams,
        existingParams,
        setShowStarredSessions,
        selectedSegment,
        setSelectedSegment,
        setQueryBuilderState,
    } = useSearchContext();
    const { loading, data } = useGetSegmentsQuery({
        variables: { project_id },
    });
    const [paramsIsDifferent, setParamsIsDifferent] = useState(false);
    const [showCreateSegmentModal, setShowCreateSegmentModal] = useState(false);
    const [segmentToDelete, setSegmentToDelete] = useState<{
        name?: string;
        id?: string;
    } | null>(null);
    const [editSegment] = useEditSegmentMutation({
        refetchQueries: [namedOperations.Query.GetSegments],
    });

    const currentSegment = data?.segments?.find(
        (s) => s?.id === selectedSegment?.id
    );

    const propertiesToRules = (
        properties: any[],
        type: string,
        op: string
    ): RuleProps[] => {
        const propsMap = new Map<string, any[]>();
        for (const prop of properties) {
            if (!propsMap.has(prop.name)) {
                propsMap.set(prop.name, []);
            }
            propsMap.get(prop.name)?.push(prop.value);
        }
        const rules: RuleProps[] = [];
        for (const [name, vals] of propsMap) {
            rules.push(deserializeGroup(`${type}_${name}`, op, vals));
        }
        return rules;
    };

    useEffect(() => {
        // If there is no query builder param (for segments saved
        // before the query builder was released), create one.
        const addQueryBuilderParam = (params: any) => {
            if (!!params.query) {
                return params;
            }
            const rules: RuleProps[] = [];
            if (params.user_properties) {
                rules.push(
                    ...propertiesToRules(params.user_properties, 'user', 'is')
                );
            }
            if (params.excluded_properties) {
                rules.push(
                    ...propertiesToRules(
                        params.excluded_properties,
                        'user',
                        'is_not'
                    )
                );
            }
            if (params.track_properties) {
                rules.push(
                    ...propertiesToRules(params.track_properties, 'track', 'is')
                );
            }
            if (params.excluded_track_properties) {
                rules.push(
                    ...propertiesToRules(
                        params.excluded_track_properties,
                        'track',
                        'is_not'
                    )
                );
            }
            if (params.date_range) {
                const start = params.date_range.start_date;
                const end = params.date_range.end_date;
                rules.push(
                    deserializeGroup('created_at', 'between_date', [
                        {
                            l: `${start} and ${end}`,
                            v: `${start}_${end}`,
                        },
                    ])
                );
            }
            if (params.length_range) {
                const min = params.length_range.min;
                const max = params.length_range.max;
                rules.push(
                    deserializeGroup('active_length', 'between', [
                        {
                            l: `${min} and ${max}`,
                            v: `${min}_${max}`,
                        },
                    ])
                );
            }
            if (params.browser) {
                rules.push(
                    deserializeGroup('session_browser', 'is', [params.browser])
                );
            }
            if (params.os) {
                rules.push(
                    deserializeGroup('session_os_name', 'is', [params.os])
                );
            }
            if (params.environments) {
                rules.push(
                    deserializeGroup(
                        'session_environment',
                        'is',
                        params.environments
                    )
                );
            }
            if (params.app_versions) {
                rules.push(
                    deserializeGroup(
                        'custom_app_version',
                        'is',
                        params.app_versions
                    )
                );
            }
            if (params.device_id) {
                rules.push(
                    deserializeGroup('session_device_id', 'is', [
                        params.device_id,
                    ])
                );
            }
            if (params.visited_url) {
                rules.push(
                    deserializeGroup('session_visited-url', 'is', [
                        params.visited_url,
                    ])
                );
            }
            if (params.referrer) {
                rules.push(
                    deserializeGroup('session_referrer', 'is', [
                        params.referrer,
                    ])
                );
            }
            if (params.identified) {
                rules.push(deserializeGroup('user_identifier', 'exists', []));
            }
            if (params.hide_viewed) {
                rules.push(deserializeGroup('custom_viewed', 'is', ['false']));
            }
            if (params.first_time) {
                rules.push(
                    deserializeGroup('custom_first_time', 'is', ['true'])
                );
            }
            if (!params.show_live_sessions) {
                rules.push(
                    deserializeGroup('custom_processed', 'is', [
                        { v: 'true', l: 'Completed' },
                    ])
                );
            }
            return {
                ...params,
                query: JSON.stringify({
                    isAnd: true,
                    rules: serializeRules(rules),
                }),
            };
        };

        if (currentSegment) {
            const segmentParameters = addQueryBuilderParam(
                gqlSanitize({
                    ...currentSegment?.params,
                })
            );
            setExistingParams(segmentParameters);
            setSearchParams(segmentParameters);
            setQueryBuilderState(JSON.parse(segmentParameters.query));
            setSegmentName(currentSegment?.name || null);
        }
    }, [
        currentSegment,
        setExistingParams,
        setQueryBuilderState,
        setSearchParams,
        setSegmentName,
    ]);

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
    const segmentOptions = [
        {
            displayValue: 'Starred',
            id: STARRED_SEGMENT_ID,
            value: 'Starred',
        },
        ...(data?.segments || [])
            .map((segment) => ({
                displayValue: segment?.name || '',
                value: segment?.name || '',
                id: segment?.id || '',
            }))
            .sort((a, b) =>
                a.displayValue.toLowerCase() > b.displayValue.toLowerCase()
                    ? 1
                    : -1
            ),
    ];

    return (
        <section className={styles.segmentPickerSection}>
            <Select
                value={segmentName}
                onChange={(value, option) => {
                    if ((option as any)?.key === STARRED_SEGMENT_ID) {
                        setShowStarredSessions(true);
                        setExistingParams(EmptySessionsSearchParams);
                        setSearchParams(EmptySessionsSearchParams);
                        setQueryBuilderState({
                            isAnd: true,
                            rules: serializeRules([
                                deserializeGroup('custom_starred', 'is', [
                                    'true',
                                ]),
                            ]),
                        });
                        setSegmentName('Starred');
                        setSelectedSegment({ value, id: STARRED_SEGMENT_ID });
                        return;
                    } else {
                        setShowStarredSessions(false);
                    }

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
                        setQueryBuilderState({
                            isAnd: true,
                            rules: getDefaultRules(),
                        });
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
                            {option.id !== STARRED_SEGMENT_ID && (
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
                                    <SvgXIcon />
                                </Button>
                            )}
                        </span>
                    </Option>
                ))}
            </Select>

            <Button
                trackingId="CreateSessionSegment"
                onClick={() => {
                    if (showUpdateSegmentOption && selectedSegment) {
                        editSegment({
                            variables: {
                                project_id,
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
