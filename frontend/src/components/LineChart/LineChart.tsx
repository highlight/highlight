import Button from '@components/Button/Button/Button';
import { RechartTooltip } from '@components/recharts/RechartTooltip/RechartTooltip';
import { Slider } from '@components/Slider/Slider';
import SvgCheckCircleIcon from '@icons/CheckCircleIcon';
import SvgShieldWarningIcon from '@icons/ShieldWarningIcon';
import SvgSkullIcon from '@icons/SkullIcon';
import {
    getMetricValueScore,
    MetricValueScore,
} from '@pages/Player/StreamElement/Renderers/WebVitals/components/Metric';
import classNames from 'classnames';
import React, { useState } from 'react';
import {
    CartesianGrid,
    Label,
    Legend,
    Line,
    LineChart as RechartsLineChart,
    ReferenceArea,
    ReferenceAreaProps,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    XAxisProps,
    YAxis,
} from 'recharts';
import { AxisDomain } from 'recharts/types/util/types';

import styles from './LineChart.module.scss';

export const CLICK_NEARBY_THRESHOLD = 4;

export interface Reference {
    value: number;
    color: string;
    label?: string;
    onDrag?: (y: number) => void;
}

export interface Props {
    data: any[];
    domain?: AxisDomain;
    referenceLines?: Reference[];
    showReferenceLineLabels?: boolean;
    height: number;
    xAxisDataKeyName?: string;
    xAxisTickFormatter?: (value: any, index: number) => string;
    xAxisProps?: XAxisProps;
    hideXAxis?: boolean;
    yAxisTickFormatter?: (value: any, index: number) => string;
    lineColorMapping: any;
    yAxisLabel: string;
    hideLegend?: boolean;
    referenceAreaProps?: ReferenceAreaProps;
    onMouseDown?: (e: any) => void;
    onMouseMove?: (e: any) => void;
    onMouseUp?: (e: any) => void;
}

export function findMax(data: any[], key?: string) {
    let max = Number.MIN_VALUE;
    for (const x of data) {
        for (const vS of (key ? [x[key]] : Object.values(x)) || []) {
            const v = Number(vS);
            if (!isFinite(v)) continue;
            if (v > max) {
                max = v;
            }
        }
    }
    return max;
}

const LineChart = ({
    height,
    referenceLines,
    showReferenceLineLabels,
    xAxisDataKeyName = 'date',
    data,
    domain,
    xAxisTickFormatter,
    hideXAxis = false,
    yAxisTickFormatter,
    lineColorMapping,
    yAxisLabel,
    hideLegend = false,
    referenceAreaProps,
    xAxisProps,
    onMouseDown,
    onMouseMove,
    onMouseUp,
}: Props) => {
    const nonXAxisKeys =
        data.length > 0
            ? Object.keys(data[0]).filter(
                  (keyName) =>
                      keyName !== xAxisDataKeyName && keyName !== '__typename'
              )
            : [];
    const max = findMax(data);
    const gridColor = 'none';
    const labelColor = 'var(--color-gray-500)';
    const [dataTypesToShow, setDataTypesToShow] = useState<string[]>(
        nonXAxisKeys
    );
    const draggableReferenceLines = referenceLines?.filter((rl) => rl.onDrag);

    return (
        <>
            {!!draggableReferenceLines?.length && (
                <Slider
                    min={0}
                    max={max}
                    values={draggableReferenceLines.map((rl) => rl.value)}
                    onChange={(value) => {
                        value.map((v, idx) => {
                            const d = draggableReferenceLines[idx].onDrag;
                            if (d) {
                                d(v);
                            }
                        });
                    }}
                    orientation={'vertical'}
                />
            )}
            <ResponsiveContainer width="100%" height={height}>
                <RechartsLineChart
                    width={500}
                    height={300}
                    data={data}
                    margin={{
                        top: 42,
                        right: 4,
                        left: -18,
                        bottom: 0,
                    }}
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp}
                >
                    <CartesianGrid
                        strokeDasharray=""
                        vertical={false}
                        stroke="var(--color-gray-200)"
                    />
                    <XAxis
                        dataKey={xAxisDataKeyName}
                        tickFormatter={xAxisTickFormatter}
                        tick={{ fontSize: '11px', fill: labelColor }}
                        tickLine={{ stroke: 'var(--color-gray-200)' }}
                        axisLine={{ stroke: gridColor }}
                        dy={6}
                        hide={hideXAxis}
                        {...xAxisProps}
                    />
                    <YAxis
                        tickFormatter={yAxisTickFormatter}
                        tick={{ fontSize: '8px', fill: labelColor }}
                        tickLine={{ stroke: labelColor, visibility: 'hidden' }}
                        axisLine={{ stroke: gridColor }}
                        domain={domain}
                        type={'number'}
                        dx={-2}
                        unit={yAxisLabel}
                    />

                    <Tooltip
                        position={{ y: 0 }}
                        content={
                            <RechartTooltip
                                render={(payload: any[]) => {
                                    return (
                                        <CustomTooltip
                                            payload={payload}
                                            yAxisLabel={yAxisLabel}
                                            referenceLines={referenceLines}
                                            precision={1}
                                        />
                                    );
                                }}
                            />
                        }
                    />
                    {!hideLegend && (
                        <Legend
                            verticalAlign="bottom"
                            height={18}
                            iconType={'square'}
                            iconSize={8}
                            content={(props) => {
                                return (
                                    <CustomLegend
                                        props={props}
                                        dataTypesToShow={dataTypesToShow}
                                        setDataTypesToShow={setDataTypesToShow}
                                    />
                                );
                            }}
                        />
                    )}
                    {referenceLines?.map((referenceLine, index) => (
                        <ReferenceLine
                            key={`${referenceLine.label}-${index}`}
                            y={referenceLine.value}
                            stroke={referenceLine.color}
                            strokeDasharray={`${CLICK_NEARBY_THRESHOLD} ${CLICK_NEARBY_THRESHOLD}`}
                            strokeWidth={CLICK_NEARBY_THRESHOLD / 2}
                            isFront
                            ifOverflow="extendDomain"
                        >
                            {!!showReferenceLineLabels && (
                                <>
                                    <Label
                                        position={'center'}
                                        alignmentBaseline="auto"
                                        offset={10}
                                        className={styles.referenceLineValue}
                                    >
                                        {referenceLine.label}
                                    </Label>
                                </>
                            )}
                        </ReferenceLine>
                    ))}
                    {nonXAxisKeys.map((key) => (
                        <Line
                            hide={!dataTypesToShow.includes(key)}
                            key={key}
                            type="linear"
                            dataKey={key}
                            stroke={lineColorMapping[key]}
                            strokeWidth={2}
                            animationDuration={100}
                            dot={false}
                        />
                    ))}
                    {referenceAreaProps && (
                        <ReferenceArea {...referenceAreaProps} isFront />
                    )}
                </RechartsLineChart>
            </ResponsiveContainer>
        </>
    );
};

export const CustomTooltip = ({
    yAxisLabel,
    referenceLines,
    precision,
    payload,
}: {
    yAxisLabel: string;
    referenceLines?: Reference[];
    precision: number;
    payload: any[];
}) => {
    return (
        <>
            <div>
                {payload.reverse().map((entry: any) => {
                    return (
                        <p key={entry.dataKey} className={styles.tooltipEntry}>
                            <div
                                className={styles.legendIcon}
                                style={{
                                    background: entry.color,
                                }}
                            ></div>
                            <div className={styles.tooltipRow}>
                                <span>
                                    <span className={styles.tooltipValue}>
                                        {entry.value.toFixed(precision)}
                                    </span>{' '}
                                    {yAxisLabel}
                                </span>
                                {referenceLines?.length === 2
                                    ? getScoreIcon(
                                          getMetricValueScore(entry.value, {
                                              max_good_value: referenceLines![0]
                                                  .value,
                                              max_needs_improvement_value: referenceLines![1]
                                                  .value,
                                          })
                                      )
                                    : undefined}
                            </div>
                        </p>
                    );
                })}
            </div>
        </>
    );
};

export const CustomLegend = ({
    dataTypesToShow,
    setDataTypesToShow,
    props,
}: {
    dataTypesToShow: string[];
    setDataTypesToShow: React.Dispatch<React.SetStateAction<string[]>>;
    props: any;
}) => {
    const { payload }: { payload: any[] } = props;
    return (
        <div className={styles.legendContainer}>
            {payload?.map((entry, index) => (
                <Button
                    trackingId="LineChartLegendFilter"
                    key={`item-${index}`}
                    type="text"
                    size="small"
                    onClick={() => {
                        setDataTypesToShow((previous) => {
                            // Toggle off
                            if (previous.includes(entry.value)) {
                                return previous.filter(
                                    (e) => e !== entry.value
                                );
                            } else {
                                // Toggle on
                                return [...previous, entry.value];
                            }
                        });
                    }}
                    className={classNames(styles.legendItem)}
                >
                    <div
                        className={classNames(styles.legendIcon, {
                            [styles.notShowing]: !dataTypesToShow.includes(
                                entry.value
                            ),
                        })}
                        style={{
                            background: entry.color,
                        }}
                    ></div>
                    <span
                        className={classNames(styles.legendValue, {
                            [styles.notShowing]: !dataTypesToShow.includes(
                                entry.value
                            ),
                        })}
                    >
                        {entry.value}
                    </span>
                </Button>
            ))}
        </div>
    );
};

export default LineChart;

const getScoreIcon = (score: MetricValueScore) => {
    let icon = <></>;
    switch (score) {
        case MetricValueScore.Good:
            icon = <SvgCheckCircleIcon />;
            break;
        case MetricValueScore.NeedsImprovement:
            icon = <SvgShieldWarningIcon />;
            break;
        case MetricValueScore.Poor:
            icon = <SvgSkullIcon />;
            break;
    }

    return <div className={styles.scoreIcon}>{icon}</div>;
};
