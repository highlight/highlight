import BarChart from '@components/BarChart/BarChart';
import {
    DEMO_WORKSPACE_APPLICATION_ID,
    DEMO_WORKSPACE_PROXY_APPLICATION_ID,
} from '@components/DemoWorkspaceButton/DemoWorkspaceButton';
import { SearchEmptyState } from '@components/SearchEmptyState/SearchEmptyState';
import {
    useGetErrorGroupsOpenSearchQuery,
    useGetErrorGroupsQuery,
} from '@graph/hooks';
import {
    GetErrorGroupsOpenSearchQuery,
    GetErrorGroupsQuery,
} from '@graph/operations';
import { ErrorGroup, ErrorResults, ErrorState, Maybe } from '@graph/schemas';
import { getErrorTitle } from '@util/errors/errorUtils';
import { gqlSanitize } from '@util/gqlSanitize';
import { formatNumber } from '@util/numbers';
import { useParams } from '@util/react-router/useParams';
import classNames from 'classnames/bind';
import React, { useEffect, useState } from 'react';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import Skeleton from 'react-loading-skeleton';
import { Link } from 'react-router-dom';

import Tooltip from '../../../components/Tooltip/Tooltip';
import { useErrorSearchContext } from '../ErrorSearchContext/ErrorSearchContext';
import styles from './ErrorFeedV2.module.scss';

const PAGE_SIZE = 20;

export const ErrorFeedV2 = () => {
    const { project_id } = useParams<{ project_id: string }>();
    const [count, setCount] = useState(10);
    const [data, setData] = useState<ErrorResults>({
        error_groups: [],
        totalCount: 0,
    });
    const { searchParams, searchQuery } = useErrorSearchContext();
    const [
        errorFeedIsInTopScrollPosition,
        setErrorFeedIsInTopScrollPosition,
    ] = useState(true);
    // Used to determine if we need to show the loading skeleton. The loading skeleton should only be shown on the first load and when searchParams changes. It should not show when loading more sessions via infinite scroll.
    const [showLoadingSkeleton, setShowLoadingSkeleton] = useState(true);
    const {
        isQueryBuilder,
        startErrorGroupID,
        setStartErrorGroupID,
    } = useErrorSearchContext();

    const {
        loading: loadingOpenSearch,
        fetchMore: fetchOpenSearch,
        data: errorDataOpenSearch,
    } = useGetErrorGroupsOpenSearchQuery({
        variables: {
            query: searchQuery,
            count: PAGE_SIZE,
            start_error_group_id: startErrorGroupID,
            project_id,
        },
        onCompleted: () => {
            setShowLoadingSkeleton(false);
        },
        skip: !isQueryBuilder || !searchQuery,
    });

    const {
        loading: loadingOriginal,
        fetchMore: fetchOriginal,
        data: errorDataOriginal,
    } = useGetErrorGroupsQuery({
        variables: {
            params: searchParams,
            count: PAGE_SIZE,
            start_error_group_id: startErrorGroupID,
            project_id,
        },
        onCompleted: () => {
            setShowLoadingSkeleton(false);
        },
        skip: isQueryBuilder,
    });

    const loading = isQueryBuilder ? loadingOpenSearch : loadingOriginal;
    const fetchMore = isQueryBuilder ? fetchOpenSearch : fetchOriginal;

    useEffect(() => {
        if (errorDataOriginal?.error_groups) {
            setData(gqlSanitize(errorDataOriginal?.error_groups));
        }
        if (errorDataOpenSearch?.error_groups_opensearch) {
            setData(gqlSanitize(errorDataOpenSearch?.error_groups_opensearch));
        }
    }, [
        errorDataOpenSearch?.error_groups_opensearch,
        errorDataOriginal?.error_groups,
    ]);

    useEffect(() => {
        const s = data.error_groups.slice(-1);
        if (s.length) {
            setStartErrorGroupID(s[0].id);
        }
    }, [setStartErrorGroupID, data.error_groups]);

    useEffect(() => {
        setShowLoadingSkeleton(true);
    }, [searchParams]);

    // TODO(vkorolik) infinite scroll in other direction
    const [sentryRef, { rootRef }] = useInfiniteScroll({
        loading,
        hasNextPage: data.error_groups.length < data.totalCount,
        rootMargin: '-20px',
        delayInMs: 300,
        onLoadMore: () => {
            setCount((previousCount) => previousCount + 10);
            fetchMore({
                variables: {
                    params: searchParams,
                    count,
                    project_id,
                },
            }).then((r) => {
                if (isQueryBuilder) {
                    addErrorGroupsOpenSearch(
                        (r as unknown) as GetErrorGroupsOpenSearchQuery
                    );
                } else {
                    addErrorGroups(r as GetErrorGroupsQuery);
                }
            });
        },
    });

    const addErrorGroupsOpenSearch = (r: GetErrorGroupsOpenSearchQuery) => {
        setData((p) => ({
            ...gqlSanitize(r?.error_groups_opensearch),
            error_groups: [
                ...p.error_groups,
                ...(r?.error_groups_opensearch.error_groups || []),
            ],
        }));
    };

    const addErrorGroups = (r: GetErrorGroupsQuery) => {
        setData((p) => ({
            ...gqlSanitize(r?.error_groups),
            error_groups: [
                ...p.error_groups,
                ...(r?.error_groups?.error_groups || []),
            ],
        }));
    };

    const onFeedScrollListener = (
        e: React.UIEvent<HTMLElement> | undefined
    ) => {
        setErrorFeedIsInTopScrollPosition(e?.currentTarget.scrollTop === 0);
    };

    return (
        <>
            <div className={styles.fixedContent}>
                <div className={styles.resultCount}>
                    {loading ? (
                        <Skeleton width="100px" />
                    ) : (
                        `${formatNumber(data.totalCount)} errors`
                    )}
                </div>
            </div>
            <div
                ref={rootRef}
                className={classNames(styles.feedContent, {
                    [styles.hasScrolled]: !errorFeedIsInTopScrollPosition,
                })}
                onScroll={onFeedScrollListener}
            >
                <div>
                    {showLoadingSkeleton ? (
                        <Skeleton
                            height={110}
                            count={3}
                            style={{
                                borderRadius: 8,
                                marginBottom: 14,
                            }}
                        />
                    ) : (
                        <>
                            {!data.error_groups.length ? (
                                <SearchEmptyState item={'errors'} />
                            ) : (
                                data.error_groups?.map(
                                    (u: Maybe<ErrorGroup>, ind: number) => (
                                        <ErrorCardV2 errorGroup={u} key={ind} />
                                    )
                                )
                            )}
                            <div ref={sentryRef} />
                            {loading ||
                                (data.error_groups.length < data.totalCount && (
                                    <Skeleton
                                        height={110}
                                        style={{
                                            borderRadius: 8,
                                            marginTop: 14,
                                            marginBottom: 14,
                                        }}
                                    />
                                ))}
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

const ErrorCardV2 = ({ errorGroup }: { errorGroup: Maybe<ErrorGroup> }) => {
    const { project_id, error_secure_id } = useParams<{
        project_id: string;
        error_secure_id?: string;
    }>();
    const projectIdRemapped =
        project_id === DEMO_WORKSPACE_APPLICATION_ID
            ? DEMO_WORKSPACE_PROXY_APPLICATION_ID
            : project_id;
    // Represents the last six days i.e. [5 days ago, 4 days ago, 3 days ago, etc..]
    const [errorDates, setErrorDates] = useState<Array<number>>(
        Array(6).fill(0)
    );

    useEffect(() => {
        if (errorGroup?.error_frequency)
            setErrorDates(errorGroup.error_frequency);
    }, [setErrorDates, errorGroup]);

    return (
        <div className={styles.errorCardWrapper} key={errorGroup?.secure_id}>
            <Link to={`/${projectIdRemapped}/errors/${errorGroup?.secure_id}`}>
                <div
                    className={classNames(styles.errorCard, {
                        [styles.selected]:
                            error_secure_id === errorGroup?.secure_id,
                    })}
                >
                    <div style={{ paddingRight: '20px' }}>
                        <BarChart data={errorDates} />
                    </div>
                    <div className={styles.errorTextSectionWrapper}>
                        <div
                            className={styles.errorTextSection}
                            style={{ width: '240px' }}
                        >
                            <div className={styles.topText} dir="rtl">
                                {
                                    errorGroup?.structured_stack_trace[0]
                                        ?.fileName
                                }
                            </div>
                            <div
                                className={classNames(
                                    styles.middleText,
                                    'highlight-block'
                                )}
                            >
                                {getErrorTitle(errorGroup?.event)}
                            </div>
                        </div>
                        <div className={styles.errorTextSection}>
                            {errorGroup?.created_at ? (
                                <>
                                    <div className={styles.bottomText}>
                                        {`Since ${new Date(
                                            errorGroup.created_at
                                        ).toLocaleString('en-us', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}`}
                                    </div>
                                </>
                            ) : (
                                <></>
                            )}
                        </div>
                        <div className={styles.readMarkerContainer}>
                            <Tooltip
                                title={`This error is ${errorGroup?.state?.toLowerCase()}.`}
                            >
                                <div
                                    className={classNames(
                                        styles.readMarker,
                                        // @ts-ignore
                                        styles[
                                            errorGroup?.state.toLowerCase() ||
                                                ErrorState.Open.toLowerCase()
                                        ]
                                    )}
                                />
                            </Tooltip>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
};
