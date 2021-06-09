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
import { Field } from '../../components/Field/Field';
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
import { ResolveErrorButton } from './ResolveErrorButton/ResolveErrorButton';

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
                                        const traceLines = data.error_group.trace.map(
                                            (trace) => {
                                                return `${trace?.file_name} in ${trace?.function_name} at line ${trace?.line_number}:${trace?.column_number}`;
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
                    <h3>
                        {loading ? (
                            <Skeleton
                                duration={1}
                                count={1}
                                style={{ width: 300 }}
                            />
                        ) : (
                            'Error Frequency'
                        )}
                    </h3>
                    <div className={styles.fieldWrapper}>
                        <ErrorFrequencyGraph errorGroup={data?.error_group} />
                    </div>
                    {data?.error_group && (
                        <ErrorSessionsTable errorGroup={data.error_group} />
                    )}
                </div>
                <div className={styles.errorPageRight}>
                    <div className={styles.errorPageRightContent}>
                        <div className={styles.fieldWrapper}>
                            <ResolveErrorButton
                                resolved={data?.error_group?.resolved || false}
                                loading={loading}
                            />
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
            occurrences: val,
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
                <div>Past 30 days</div>
                <div>{`Total Occurrences: ${totalErrors}`}</div>
            </div>
        </div>
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
