import React, { RefObject, useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import styles from './ErrorFeed.module.scss';
import Skeleton from 'react-loading-skeleton';
import classNames from 'classnames/bind';
import { Tag, Tooltip } from 'antd';
import { useGetErrorGroupsQuery } from '../../../graph/generated/hooks';
import {
    ErrorGroup,
    ErrorResults,
    Maybe,
} from '../../../graph/generated/schemas';
import { ErrorSearchContext } from '../ErrorSearchContext/ErrorSearchContext';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import { gqlSanitize } from '../../../util/gqlSanitize';
import moment from 'moment';
import { EventInput } from '../ErrorSearchInputs/EventInput';

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

    const { loading, fetchMore } = useGetErrorGroupsQuery({
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
                >{`${data.totalCount} errors`}</div>
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
                            {data.error_groups?.map(
                                (u: Maybe<ErrorGroup>, ind: number) => (
                                    <ErrorCard errorGroup={u} key={ind} />
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
        if (!errorGroup) return;
        const today = moment();
        const errorDatesCopy = Array(6).fill(0);
        for (const error of errorGroup?.metadata_log ?? []) {
            const errorDate = moment(error?.timestamp);
            const insertIndex =
                errorDatesCopy.length - 1 - today.diff(errorDate, 'days');
            if (insertIndex >= 0 || insertIndex < errorDatesCopy.length) {
                errorDatesCopy[insertIndex] += 1;
            }
        }
        setErrorDates(errorDatesCopy);
    }, [errorGroup]);

    return (
        <Link
            to={`/${organization_id}/errors/${errorGroup?.id}`}
            key={errorGroup?.id}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
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
                                    <div className={styles.errorBarBase}></div>
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
                                {errorGroup?.event[0]}
                            </div>
                            <div className={styles.tagWrapper}>
                                <Tag color="#F2EEFB">
                                    <span
                                        style={{
                                            color: 'black',
                                            fontWeight: 300,
                                        }}
                                    >
                                        {errorGroup?.trace[0]?.function_name}
                                    </span>
                                </Tag>
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
                        <div className={styles.readMarkerContainer}></div>
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
    );
};
