import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Field } from '../../components/Field/Field';
import { SidebarContext } from '../../components/Sidebar/SidebarContext';
import { useGetErrorGroupQuery } from '../../graph/generated/hooks';
import {
    BarChart,
    Bar,
    XAxis,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    CartesianGrid,
    YAxis,
    Cell,
} from 'recharts';
import LinesEllipsis from 'react-lines-ellipsis';

import styles from './ErrorPage.module.scss';
import commonStyles from '../../Common.module.scss';
import Skeleton from 'react-loading-skeleton';
import { ErrorGroup, Maybe } from '../../graph/generated/schemas';
import moment from 'moment';
import { frequencyTimeData } from '../../util/errorCalculations';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { ResolveErrorButton } from './ResolveErrorButton/ResolveErrorButton';
import { PlayerSearchParameters } from '../Player/PlayerHook/utils';
import Tooltip from '../../components/Tooltip/Tooltip';

export const ErrorPage = () => {
    const { error_id } = useParams<{ error_id: string }>();
    const { setOpenSidebar } = useContext(SidebarContext);
    const { organization_id } = useParams<{
        organization_id: string;
    }>();
    const { data, loading } = useGetErrorGroupQuery({
        variables: { id: error_id },
    });
    const [title, setTitle] = useState<string | undefined>(undefined);
    const [eventLineExpand, setEventLineExpand] = useState(false);
    const [showExpandButton, setShowExpandButton] = useState(true);
    const [errorActivityCount, setErrorActivityCount] = useState(20);

    useEffect(() => {
        setTitle(getHeaderFromError(data?.error_group?.event ?? []));
    }, [data]);

    useEffect(() => {
        setOpenSidebar(false);
    }, [setOpenSidebar]);

    return (
        <div className={styles.errorPageWrapper}>
            <div className={styles.errorPage}>
                <div className={styles.errorPageLeft}>
                    <div className={styles.titleWrapper}>
                        {loading ? (
                            <Skeleton count={1} style={{ width: 300 }} />
                        ) : (
                            <>
                                <div className={styles.title}>{title}</div>
                                <Field
                                    k={'mechanism'}
                                    v={
                                        data?.error_group?.type ||
                                        'window.onerror'
                                    }
                                    color={'warning'}
                                />
                            </>
                        )}
                    </div>
                    <div className={styles.eventText}>
                        {loading ? (
                            <Skeleton
                                count={2}
                                style={{ height: 20, marginBottom: 10 }}
                            />
                        ) : (
                            <>
                                <LinesEllipsis
                                    text={data?.error_group?.event.join() ?? ''}
                                    maxLine={
                                        eventLineExpand
                                            ? Number.MAX_SAFE_INTEGER
                                            : 2
                                    }
                                    style={{ display: 'inline' }}
                                    onReflow={(c) => {
                                        setShowExpandButton(
                                            !(
                                                c.text ===
                                                data?.error_group?.event.join()
                                            )
                                        );
                                    }}
                                />
                                {showExpandButton && (
                                    <span
                                        className={styles.expandButton}
                                        onClick={() => setEventLineExpand(true)}
                                    >
                                        {' '}
                                        show more
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                    <div className={styles.subTitle}>
                        {loading ? (
                            <Skeleton
                                duration={1}
                                count={1}
                                style={{ width: 300 }}
                            />
                        ) : (
                            'Stack Trace'
                        )}
                    </div>
                    <div className={styles.fieldWrapper}>
                        {data?.error_group?.trace.map((e, i) => (
                            <StackSection
                                key={i}
                                fileName={e?.file_name ?? ''}
                                functionName={e?.function_name ?? ''}
                                lineNumber={e?.line_number ?? 0}
                                columnNumber={e?.column_number ?? 0}
                            />
                        ))}
                    </div>
                    <div className={styles.subTitle}>
                        {loading ? (
                            <Skeleton
                                duration={1}
                                count={1}
                                style={{ width: 300 }}
                            />
                        ) : (
                            'Error Frequency'
                        )}
                    </div>
                    <div className={styles.fieldWrapper}>
                        <ErrorFrequencyGraph errorGroup={data?.error_group} />
                    </div>
                    <div
                        className={styles.fieldWrapper}
                        style={{ paddingBottom: '40px' }}
                    >
                        <div className={styles.section}>
                            <div className={styles.collapsible}>
                                <div
                                    className={classNames(
                                        styles.triggerWrapper,
                                        styles.errorLogDivider
                                    )}
                                >
                                    <div className={styles.errorLogsTitle}>
                                        <span>Error ID</span>
                                        <span>Session ID</span>
                                        <span>Visited URL</span>
                                        <span>Browser</span>
                                        <span>OS</span>
                                        <span>Timestamp</span>
                                    </div>
                                </div>
                                <div className={styles.errorLogWrapper}>
                                    {data?.error_group?.metadata_log
                                        .slice(
                                            Math.max(
                                                data?.error_group?.metadata_log
                                                    .length -
                                                    errorActivityCount,
                                                0
                                            )
                                        )
                                        .reverse()
                                        .map((e, i) => (
                                            <Link
                                                to={`/${organization_id}/sessions/${
                                                    e?.session_id
                                                }${
                                                    e?.timestamp
                                                        ? `?${PlayerSearchParameters.errorId}=${e.error_id}`
                                                        : ''
                                                }`}
                                                key={i}
                                            >
                                                <div
                                                    key={i}
                                                    className={
                                                        styles.errorLogItem
                                                    }
                                                >
                                                    <span>{e?.error_id}</span>
                                                    <span>{e?.session_id}</span>
                                                    <div
                                                        className={
                                                            styles.errorLogCell
                                                        }
                                                    >
                                                        <span
                                                            className={
                                                                styles.errorLogOverflow
                                                            }
                                                        >
                                                            {e?.visited_url}
                                                        </span>
                                                    </div>
                                                    <span>{e?.browser}</span>
                                                    <span>{e?.os}</span>
                                                    <span>
                                                        {moment(
                                                            e?.timestamp
                                                        ).format(
                                                            'D MMMM YYYY, HH:mm:ss'
                                                        )}
                                                    </span>
                                                </div>
                                            </Link>
                                        ))}
                                    {data?.error_group?.metadata_log.length &&
                                        errorActivityCount <
                                            data?.error_group?.metadata_log
                                                .length && (
                                            <button
                                                onClick={() =>
                                                    setErrorActivityCount(
                                                        errorActivityCount + 20
                                                    )
                                                }
                                                className={classNames(
                                                    commonStyles.secondaryButton,
                                                    styles.errorLogButton
                                                )}
                                            >
                                                Show more...
                                            </button>
                                        )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.errorPageRight}>
                    <div className={styles.errorPageRightContent}>
                        <div className={styles.fieldWrapper}>
                            <ResolveErrorButton
                                resolved={data?.error_group?.resolved || false}
                                loading={loading}
                            />
                        </div>
                        <div className={styles.subTitle}>
                            {loading ? (
                                <Skeleton count={1} style={{ width: 280 }} />
                            ) : (
                                'Context / Fields'
                            )}
                        </div>
                        <div className={styles.fieldWrapper}>
                            {loading ? (
                                <Skeleton
                                    count={2}
                                    style={{ height: 20, marginBottom: 10 }}
                                />
                            ) : (
                                <>
                                    {data?.error_group?.field_group?.map(
                                        (e, i) =>
                                            e?.name != 'visited_url' && (
                                                <Field
                                                    key={i}
                                                    k={e?.name ?? ''}
                                                    v={
                                                        e?.value.toLowerCase() ??
                                                        ''
                                                    }
                                                />
                                            )
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

type StackSectionProps = {
    fileName?: string;
    functionName?: string;
    lineNumber?: number;
    columnNumber?: number;
};

export const StackSection: React.FC<StackSectionProps> = ({
    fileName,
    functionName,
    lineNumber,
    columnNumber,
}) => {
    const trigger = (
        <Tooltip
            title={`${fileName} in ${functionName} at line ${lineNumber}:${columnNumber}`}
        >
            <div className={styles.triggerWrapper}>
                <div className={styles.snippetHeadingTwo}>
                    <span
                        className={styles.stackTraceErrorTitle}
                        style={{ maxWidth: 300, fontWeight: 300 }}
                    >
                        {fileName}
                    </span>
                    <span style={{ fontWeight: 300, color: '#808080' }}>
                        &nbsp;in&nbsp;
                    </span>
                    <span
                        className={styles.stackTraceErrorTitle}
                        style={{ maxWidth: 300, fontWeight: 400 }}
                    >
                        {functionName}
                    </span>
                    <span style={{ fontWeight: 300, color: '#808080' }}>
                        &nbsp;at line&nbsp;
                    </span>
                    <span>
                        {lineNumber}:{columnNumber}
                    </span>
                </div>
            </div>
        </Tooltip>
    );
    return (
        <div className={styles.section}>
            <div className={styles.collapsible}>{trigger}</div>
        </div>
    );
};

type FrequencyGraphProps = {
    errorGroup?: Maybe<ErrorGroup>;
};

type ErrorFrequency = {
    date: string;
    occurences: number;
};

export const ErrorFrequencyGraph: React.FC<FrequencyGraphProps> = ({
    errorGroup,
}) => {
    const [errorDates, setErrorDates] = useState<Array<ErrorFrequency>>(
        Array(30).fill(0)
    );
    const [totalErrors, setTotalErrors] = useState<number>(0);

    useEffect(() => {
        const errorDatesCopy = frequencyTimeData(errorGroup, 30);
        const errorData = errorDatesCopy.map((val, idx) => ({
            date: moment()
                .startOf('day')
                .subtract(29 - idx, 'days')
                .format('D MMM YYYY'),
            occurences: val,
        }));
        setTotalErrors(errorDatesCopy.reduce((acc, val) => acc + val, 0));
        setErrorDates(errorData);
    }, [errorGroup]);
    return (
        <div className={classNames(styles.section, styles.graphSection)}>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart
                    width={500}
                    height={300}
                    data={errorDates}
                    margin={{
                        top: 5,
                        right: 10,
                        left: 10,
                        bottom: 0,
                    }}
                >
                    <CartesianGrid stroke={'#D9D9D9'} vertical={false} />
                    <XAxis
                        dataKey="date"
                        tick={false}
                        axisLine={{ stroke: '#D9D9D9' }}
                    />
                    <YAxis
                        tickCount={10}
                        interval="preserveStart"
                        allowDecimals={false}
                        hide={true}
                    />
                    <RechartsTooltip
                        contentStyle={{
                            backgroundColor: 'rgba(0, 0, 0, 0.85)',
                            borderRadius: '5px',
                            borderWidth: 0,
                            color: 'white',
                        }}
                        itemStyle={{ color: 'white' }}
                    />
                    <Bar dataKey="occurences" radius={[2, 2, 0, 0]}>
                        {errorDates.map((e, i) => (
                            <Cell
                                key={i}
                                fill={
                                    e.occurences >
                                    Math.max(totalErrors * 0.1, 10)
                                        ? '#C62929'
                                        : '#835E00'
                                }
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
            <div className={styles.graphLabels}>
                <div>Past 30 days</div>
                <div>{`Total Occurences: ${totalErrors}`}</div>
            </div>
        </div>
    );
};

export const getHeaderFromError = (errorMsg: Maybe<string>[]): string => {
    const eventText = errorMsg[0];
    let title = '';
    // Try to get the text in the form Text: ....
    const splitOnColon = eventText?.split(':') ?? [];
    if (
        splitOnColon.length &&
        (!splitOnColon[0].includes(' ') ||
            splitOnColon[0].toLowerCase().includes('error'))
    ) {
        return splitOnColon[0];
    }
    // Try to get text in the form "'Something' Error" in the event.
    const split = eventText?.split(' ') ?? [];
    let prev = '';
    for (let i = 0; i < split?.length; i++) {
        const curr = split[i];
        if (curr.toLowerCase().includes('error')) {
            title = (prev ? prev + ' ' : '') + curr;
            return title;
        }
        prev = curr;
    }

    return errorMsg.join() ?? '';
};
