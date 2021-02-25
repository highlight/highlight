import React, { RefObject, useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import styles from './ErrorFeed.module.scss';
import Skeleton from 'react-loading-skeleton';
import classNames from 'classnames/bind';
import { Tag, Tooltip } from 'antd';
import { useGetErrorGroupsQuery } from '../../../graph/generated/hooks';
import { Maybe } from '../../../graph/generated/schemas';

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
    const [showLoadingSkeleton, setShowLoadingSkeleton] = useState(true);
    const [data, setData] = useState<any>({
        error_groups: [],
    });

    const { loading, fetchMore } = useGetErrorGroupsQuery({
        variables: { organization_id: organization_id },
        onCompleted: (response) => {
            if (response.error_groups) {
                setData(response);
            }
            setShowLoadingSkeleton(false);
        },
    });

    return (
        <>
            <div className={styles.feedContent}>
                <div>
                    {showLoadingSkeleton ? (
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
                            {data?.error_groups?.map((u: any, ind: number) => {
                                return <ErrorCard error={u} key={ind} />;
                            })}
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

const ErrorCard = ({ error }: { error: Maybe<any> }) => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const [hovered, setHovered] = useState(false);
    const [trace, setTrace] = useState<ErrorTrace>({});
    const [metadata, setMetadata] = useState<Array<ErrorMetadata>>([]);
    const [errorDates, setErrorDates] = useState<{ [date: string]: number }>(
        {}
    );
    const [maxErrors, setMaxErrors] = useState(5);

    useEffect(() => {
        try {
            const parsedMetadata = JSON.parse(error.metadata_log);
            setMetadata(parsedMetadata);
            const parsedTrace = JSON.parse(error.trace);
            setTrace(parsedTrace);
        } catch (e) {}
    }, [error]);

    useEffect(() => {
        const currentDate = new Date();
        const pastSixDays = Object.fromEntries(
            new Map(
                Array.from({ length: 6 }, (_, idx) => {
                    currentDate.setDate(new Date().getDate() - idx);
                    return [
                        currentDate.toLocaleDateString('fr-CA', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                        }),
                        0,
                    ];
                })
            )
        );
        for (const error of metadata) {
            const created_date = new Date(error.timestamp).toLocaleDateString(
                'fr-CA',
                {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                }
            );
            if (pastSixDays.hasOwnProperty(created_date)) {
                pastSixDays[created_date] += 1;
            }
        }
        setErrorDates(pastSixDays);
    }, [metadata]);

    useEffect(
        () =>
            setMaxErrors(
                Math.max(
                    ...Object.keys(errorDates).map((date) => errorDates[date]),
                    5
                )
            ),
        [errorDates]
    );

    return metadata && trace ? (
        <Link
            to={`/${organization_id}/errors/${error?.id}`}
            key={error?.id}
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
                        {Object.keys(errorDates)
                            .sort()
                            .map((date, ind) => (
                                <Tooltip
                                    title={`${date}\n ${errorDates[date]} occurences`}
                                    overlayStyle={{ whiteSpace: 'pre-line' }}
                                    key={ind}
                                >
                                    <div className={styles.errorBarDiv}>
                                        {date ? (
                                            <div
                                                className={styles.errorBar}
                                                style={{
                                                    height: `${
                                                        (60 *
                                                            errorDates[date]) /
                                                        maxErrors
                                                    }px`,
                                                }}
                                            ></div>
                                        ) : (
                                            <></>
                                        )}
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
                                {trace?.fileName}
                            </div>
                            <div
                                className={classNames(
                                    styles.middleText,
                                    'rr-block'
                                )}
                            >
                                {error?.event}
                            </div>
                            <div className={styles.tagWrapper}>
                                <Tag color="#F2EEFB">
                                    <span
                                        style={{
                                            color: 'black',
                                            fontWeight: 300,
                                        }}
                                    >
                                        {trace?.functionName}
                                    </span>
                                </Tag>
                            </div>
                        </div>
                        <div className={styles.errorTextSection}>
                            <div
                                className={styles.topText}
                            >{`Line ${trace.lineNumber}`}</div>
                            <div
                                className={styles.middleText}
                            >{`${metadata[0]?.os} • ${metadata[0]?.browser}`}</div>
                            <div className={styles.bottomText}>
                                {`Since ${new Date(
                                    metadata[0]?.timestamp
                                ).toLocaleString('en-us', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                })}`}
                            </div>
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
    ) : (
        <></>
    );
};
