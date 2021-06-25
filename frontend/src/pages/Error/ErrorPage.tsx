import classNames from 'classnames';
import classnames from 'classnames';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { useParams } from 'react-router';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    XAxis,
    YAxis,
} from 'recharts';

import Button from '../../components/Button/Button/Button';
import { StandardDropdown } from '../../components/Dropdown/StandardDropdown/StandardDropdown';
import { Field } from '../../components/Field/Field';
import InfoTooltip from '../../components/InfoTooltip/InfoTooltip';
import { RechartTooltip } from '../../components/recharts/RechartTooltip/RechartTooltip';
import Tooltip from '../../components/Tooltip/Tooltip';
import { useGetErrorGroupQuery } from '../../graph/generated/hooks';
import { ErrorGroup, Maybe } from '../../graph/generated/schemas';
import SvgDownloadIcon from '../../static/DownloadIcon';
import { frequencyTimeData } from '../../util/errorCalculations';
import ErrorComments from './components/ErrorComments/ErrorComments';
import ErrorDescription from './components/ErrorDescription/ErrorDescription';
import { parseErrorDescriptionList } from './components/ErrorDescription/utils/utils';
import ErrorSessionsTable from './components/ErrorSessionsTable/ErrorSessionsTable';
import ErrorTitle from './components/ErrorTitle/ErrorTitle';
import StackTraceSection from './components/StackTraceSection/StackTraceSection';
import styles from './ErrorPage.module.scss';
import { ErrorStateSelect } from './ErrorStateSelect/ErrorStateSelect';

const ErrorPage = () => {
    const { error_id } = useParams<{ error_id: string }>();

    const { data, loading } = useGetErrorGroupQuery({
        variables: { id: error_id },
    });
    return (
        <div className={styles.errorPageWrapper}>
            <div className={styles.errorPage}>
                <div className={styles.errorPageLeft}>
                    <div className={styles.titleWrapper}>
                        {loading ? (
                            <Skeleton count={1} style={{ width: 300 }} />
                        ) : (
                            <ErrorTitle errorGroup={data?.error_group} />
                        )}
                    </div>
                    <div className={styles.eventText}>
                        {loading ? (
                            <Skeleton
                                count={2}
                                style={{ height: 20, marginBottom: 10 }}
                            />
                        ) : (
                            <ErrorDescription errorGroup={data?.error_group} />
                        )}
                    </div>
                    <h3 className={styles.titleWithAction}>
                        {loading ? (
                            <Skeleton
                                duration={1}
                                count={1}
                                style={{ width: 300 }}
                            />
                        ) : (
                            'Stack Trace'
                        )}
                        <Tooltip title="Download the stack trace">
                            <Button
                                trackingId="DownloadErrorStackTrace"
                                iconButton
                                type="text"
                                onClick={() => {
                                    if (data?.error_group) {
                                        const traceLines = data.error_group.stack_trace.map(
                                            (stack_trace) => {
                                                return `${stack_trace?.file_name} in ${stack_trace?.function_name} at line ${stack_trace?.line_number}:${stack_trace?.column_number}`;
                                            }
                                        );

                                        const a = document.createElement('a');
                                        const file = new Blob(
                                            [
                                                JSON.stringify(
                                                    traceLines,
                                                    undefined,
                                                    2
                                                ),
                                            ],
                                            {
                                                type: 'application/json',
                                            }
                                        );

                                        a.href = URL.createObjectURL(file);
                                        a.download = `stack-trace-for-error-${error_id}.json`;
                                        a.click();

                                        URL.revokeObjectURL(a.href);
                                    }
                                }}
                            >
                                <SvgDownloadIcon />
                            </Button>
                        </Tooltip>
                    </h3>
                    <div className={styles.fieldWrapper}>
                        <StackTraceSection errorGroup={data?.error_group} />
                    </div>
                    {loading && (
                        <h3>
                            <Skeleton
                                duration={1}
                                count={1}
                                style={{ width: 300 }}
                            />
                        </h3>
                    )}
                    <div className={styles.fieldWrapper}>
                        <ErrorFrequencyGraph errorGroup={data?.error_group} />
                    </div>
                    {data?.error_group && (
                        <ErrorSessionsTable errorGroup={data.error_group} />
                    )}
                </div>
                <div className={styles.errorPageRight}>
                    <div className={styles.errorPageRightContent}>
                        <h3 className={styles.tooltipTitle}>
                            {loading ? (
                                <Skeleton count={1} style={{ width: 280 }} />
                            ) : (
                                'State'
                            )}
                            <InfoTooltip
                                title={
                                    <>
                                        <ul className={styles.tooltipList}>
                                            <li>
                                                <strong>Open</strong>: This
                                                error has not been fixed. You
                                                will receive alerts when this
                                                error is thrown.
                                            </li>
                                            <li>
                                                <strong>Resolved</strong>: This
                                                error has been fixed and you are
                                                not expecting this error to be
                                                thrown again. If this error gets
                                                thrown, you will receive an
                                                alert.
                                            </li>
                                            <li>
                                                <strong>Ignored</strong>: This
                                                is a noisy/false positive error
                                                that should be ignored. You will
                                                not receive any alerts for this
                                                error.
                                            </li>
                                        </ul>
                                    </>
                                }
                            />
                        </h3>
                        <div className={styles.fieldWrapper}>
                            {data?.error_group?.state && (
                                <ErrorStateSelect
                                    state={data.error_group.state}
                                />
                            )}
                        </div>
                        <h3>
                            {loading ? (
                                <Skeleton count={1} style={{ width: 280 }} />
                            ) : (
                                'Context / Fields'
                            )}
                        </h3>
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
                        <h3>
                            {loading ? (
                                <Skeleton count={1} style={{ width: 280 }} />
                            ) : (
                                'Comments'
                            )}
                        </h3>
                        <div
                            className={classnames(
                                styles.fieldWrapper,
                                styles.commentSection
                            )}
                        >
                            {loading ? (
                                <Skeleton
                                    count={2}
                                    style={{ height: 20, marginBottom: 10 }}
                                />
                            ) : (
                                <ErrorComments />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

type FrequencyGraphProps = {
    errorGroup?: Maybe<ErrorGroup>;
};

type ErrorFrequency = {
    date: string;
    occurrences: number;
};

const LookbackPeriod = 60;

const timeFilter = [
    { label: 'Last 24 hours', value: 2 },
    { label: 'Last 7 days', value: 7 },
    { label: 'Last 30 days', value: 30 },
    { label: 'Last 90 days', value: 90 },
    { label: 'This year', value: 30 * 12 },
] as const;

export const ErrorFrequencyGraph: React.FC<FrequencyGraphProps> = ({
    errorGroup,
}) => {
    const [errorDates, setErrorDates] = useState<Array<ErrorFrequency>>(
        Array(LookbackPeriod).fill(0)
    );
    const [totalErrors, setTotalErrors] = useState<number>(0);
    const [dateRangeLength, setDateRangeLength] = useState<number>(
        timeFilter[1].value
    );

    useEffect(() => {
        setErrorDates(Array(dateRangeLength).fill(0));
    }, [dateRangeLength]);

    useEffect(() => {
        const errorDatesCopy = frequencyTimeData(errorGroup, dateRangeLength);
        const errorData = errorDatesCopy.map((val, idx) => ({
            date: moment()
                .startOf('day')
                .subtract(dateRangeLength - 1 - idx, 'days')
                .format('D MMM YYYY'),
            occurrences: val,
        }));
        setTotalErrors(errorDatesCopy.reduce((acc, val) => acc + val, 0));
        setErrorDates(errorData);
    }, [errorGroup, dateRangeLength]);
    return (
        <>
            <div
                className={classNames(
                    styles.titleWithAction,
                    styles.titleWithMargin
                )}
            >
                <h3>Error Frequency</h3>
                <StandardDropdown
                    data={timeFilter}
                    defaultValue={timeFilter[1]}
                    onSelect={setDateRangeLength}
                />
            </div>
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
                        <RechartsTooltip content={<RechartTooltip />} />
                        <Bar dataKey="occurrences" radius={[2, 2, 0, 0]}>
                            {errorDates.map((e, i) => (
                                <Cell
                                    key={i}
                                    fill={
                                        e.occurrences >
                                        Math.max(totalErrors * 0.1, 10)
                                            ? 'var(--color-red-500)'
                                            : 'var(--color-brown)'
                                    }
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
                <div className={styles.graphLabels}>
                    <div>{`Total Occurrences: ${totalErrors}`}</div>
                </div>
            </div>
        </>
    );
};

export const getHeaderFromError = (
    errorMsg: Maybe<string>[] | undefined
): string => {
    const eventText = parseErrorDescriptionList(errorMsg)[0];
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

    return errorMsg?.join() ?? '';
};

export default ErrorPage;
