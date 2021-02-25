import React, { RefObject, useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import styles from './ErrorFeed.module.scss';
import Skeleton from 'react-loading-skeleton';
import classNames from 'classnames/bind';
import { Tag, Tooltip } from 'antd';
import { useGetErrorGroupsQuery } from '../../../graph/generated/hooks';
import { Maybe, ErrorObject } from '../../../graph/generated/schemas';

export const ErrorFeed = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    // const [count, setCount] = useState(10);
    // Used to determine if we need to show the loading skeleton. The loading skeleton should only be shown on the first load and when searchParams changes. It should not show when loading more sessions via infinite scroll.
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
    const trace = JSON.parse(error.trace);
    const metadata: Array<any> = JSON.parse(error.metadata_log);
    const initialDate = new Date(metadata[0]?.timestamp);
    let maxErrors = 5;
    const currentDate = new Date();
    const error_dates: { [date: string]: number } = Object.fromEntries(
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
        if (error_dates.hasOwnProperty(created_date)) {
            error_dates[created_date] += 1;
            maxErrors =
                error_dates[created_date] > maxErrors
                    ? error_dates[created_date]
                    : maxErrors;
        }
    }

    return (
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
                        {Object.keys(error_dates)
                            .sort()
                            .map((date, ind) => (
                                <Tooltip
                                    title={`${date}\n ${error_dates[date]} occurences`}
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
                                                            error_dates[date]) /
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
                            >{`${metadata[0].os} • ${metadata[0].browser}`}</div>
                            <div className={styles.bottomText}>
                                {`Since ${initialDate.toLocaleString('en-us', {
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
    );
};
