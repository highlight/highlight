import classNames from 'classnames/bind';
import React, { RefObject, useContext, useEffect, useState } from 'react';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import Skeleton from 'react-loading-skeleton';
import { Link, useParams } from 'react-router-dom';

import { Field } from '../../../components/Field/Field';
import { SearchEmptyState } from '../../../components/SearchEmptyState/SearchEmptyState';
import Tooltip from '../../../components/Tooltip/Tooltip';
import { useGetErrorGroupsQuery } from '../../../graph/generated/hooks';
import {
    ErrorGroup,
    ErrorResults,
    ErrorState,
    Maybe,
} from '../../../graph/generated/schemas';
import { frequencyTimeData } from '../../../util/errorCalculations';
import { gqlSanitize } from '../../../util/gqlSanitize';
import { formatNumberWithDelimiters } from '../../../util/numbers';
import { parseErrorDescription } from '../../Error/components/ErrorDescription/utils/utils';
import { ErrorSearchContext } from '../ErrorSearchContext/ErrorSearchContext';
import { EventInput } from '../ErrorSearchInputs/EventInput';
import styles from './ErrorFeed.module.scss';

export type ErrorMetadata = {
    browser: string;
    os: string;
    error_id: number;
    session_id: number;
    timestamp: string;
};

export type ErrorTrace = {
    fileName?: string;
    lineNumber?: number;
    functionName?: string;
    columnNumber?: number;
};

export const ErrorFeed = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const [count, setCount] = useState(10);
    const [showLoadingSkeleton, setShowLoadingSkeleton] = useState(true);
    const [data, setData] = useState<ErrorResults>({
        error_groups: [],
        totalCount: -1,
    });
    const { searchParams } = useContext(ErrorSearchContext);

    const { loading, fetchMore, data: errorData } = useGetErrorGroupsQuery({
        variables: {
            organization_id,
            count: count + 10,
            params: searchParams,
        },
        onCompleted: (response) => {
            if (response.error_groups) {
                setData(gqlSanitize(response.error_groups));
            }
            setShowLoadingSkeleton(false);
        },
    });

    useEffect(() => {
        if (errorData?.error_groups) {
            setData(gqlSanitize(errorData.error_groups));
        }
    }, [errorData]);

    const infiniteRef = useInfiniteScroll({
        checkInterval: 1200, // frequency to check (1.2s)
        loading,
        hasNextPage: data.error_groups.length < data.totalCount,
        scrollContainer: 'parent',
        onLoadMore: () => {
            setCount((previousCount) => previousCount + 10);
            fetchMore({
                variables: {
                    params: searchParams,
                    count,
                    organization_id,
                },
            });
        },
    });

    return (
        <>
            <div className={styles.fixedContent}>
                <div className={styles.mainUserInput}>
                    <div className={styles.userInputWrapper}>
                        <EventInput />
                    </div>
                </div>
                <div
                    className={styles.resultCount}
                >{`${formatNumberWithDelimiters(data.totalCount)} errors`}</div>
            </div>
            <div className={styles.feedContent}>
                <div ref={infiniteRef as RefObject<HTMLDivElement>}>
                    {loading && showLoadingSkeleton ? (
                        <Skeleton
                            height={110}
                            count={3}
                            style={{
                                borderRadius: 8,
                                marginTop: 14,
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
                                        <ErrorCard errorGroup={u} key={ind} />
                                    )
                                )
                            )}
                            {data.error_groups.length < data.totalCount && (
                                <Skeleton
                                    height={110}
                                    style={{
                                        borderRadius: 8,
                                        marginTop: 14,
                                        marginBottom: 14,
                                    }}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

const ErrorCard = ({ errorGroup }: { errorGroup: Maybe<ErrorGroup> }) => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const [hovered, setHovered] = useState(false);
    // Represents the last six days i.e. [5 days ago, 4 days ago, 3 days ago, etc..]
    const [errorDates, setErrorDates] = useState<Array<number>>(
        Array(6).fill(0)
    );

    useEffect(() => {
        setErrorDates(frequencyTimeData(errorGroup, 6));
    }, [errorGroup]);

    return (
        <div
            className={styles.errorCardWrapper}
            key={errorGroup?.id}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <Link to={`/${organization_id}/errors/${errorGroup?.id}`}>
                <div className={styles.errorCard}>
                    <div
                        className={classNames(
                            styles.hoverBorderLeft,
                            hovered && styles.hoverBorderOn
                        )}
                    />
                    <div className={styles.errorCardContentWrapper}>
                        <div className={styles.avatarWrapper}>
                            {errorDates.map((num, ind) => (
                                <Tooltip
                                    title={`${
                                        5 - ind
                                    } day(s) ago\n ${num} occurences`}
                                    overlayStyle={{
                                        whiteSpace: 'pre-line',
                                    }}
                                    key={ind}
                                >
                                    <div className={styles.errorBarDiv}>
                                        <div
                                            className={styles.errorBar}
                                            style={{
                                                height: `${
                                                    (60 * num) /
                                                    Math.max(...errorDates, 5)
                                                }px`,
                                            }}
                                        />
                                        <div
                                            className={styles.errorBarBase}
                                        ></div>
                                    </div>
                                </Tooltip>
                            ))}
                        </div>
                        <div className={styles.errorTextSectionWrapper}>
                            <div
                                className={styles.errorTextSection}
                                style={{ width: '240px' }}
                            >
                                <div className={styles.topText} dir="rtl">
                                    {errorGroup?.trace[0]?.file_name}
                                </div>
                                <div
                                    className={classNames(
                                        styles.middleText,
                                        'highlight-block'
                                    )}
                                >
                                    {parseErrorDescription(errorGroup?.event)}
                                </div>
                                <div className={styles.tagWrapper}>
                                    {errorGroup?.trace[0]?.function_name && (
                                        <Field
                                            color={'normal'}
                                            k={'function'}
                                            v={
                                                errorGroup.trace[0]
                                                    .function_name
                                            }
                                        />
                                    )}
                                </div>
                            </div>
                            <div className={styles.errorTextSection}>
                                <div
                                    className={styles.topText}
                                >{`Line ${errorGroup?.trace[0]?.line_number}`}</div>
                                {errorGroup?.metadata_log[0] ? (
                                    <>
                                        <div className={styles.bottomText}>
                                            {`Since ${new Date(
                                                errorGroup.metadata_log[0].timestamp
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
                    <div
                        className={classNames(
                            styles.hoverBorderRight,
                            hovered && styles.hoverBorderOn
                        )}
                    />
                </div>
            </Link>
        </div>
    );
};
