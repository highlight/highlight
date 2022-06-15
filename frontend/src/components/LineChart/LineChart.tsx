import Button from '@components/Button/Button/Button';
import { RechartTooltip } from '@components/recharts/RechartTooltip/RechartTooltip';
import SvgCheckCircleIcon from '@icons/CheckCircleIcon';
import SvgShieldWarningIcon from '@icons/ShieldWarningIcon';
import SvgSkullIcon from '@icons/SkullIcon';
import {
    getMetricValueScore,
    MetricValueScore,
} from '@pages/Player/StreamElement/Renderers/WebVitals/components/Metric';
import classNames from 'classnames';
import React, { useRef, useState } from 'react';
import ReactSlider from 'react-slider';
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

import styles from './LineChart.module.scss';

const CLICK_NEARBY_THRESHOLD = 10;

interface Reference {
    value: number;
    color: string;
    label?: string;
    onDrag?: (y: number) => void;
}

interface Props {
    data: any[];
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
}

const LineChart = ({
    height,
    referenceLines,
    showReferenceLineLabels,
    xAxisDataKeyName = 'date',
    data,
    xAxisTickFormatter,
    hideXAxis = false,
    yAxisTickFormatter,
    lineColorMapping,
    yAxisLabel,
    hideLegend = false,
    referenceAreaProps,
    xAxisProps,
}: Props) => {
    const nonXAxisKeys =
        data.length > 0
            ? Object.keys(data[0]).filter(
                  (keyName) =>
                      keyName !== xAxisDataKeyName && keyName !== '__typename'
              )
            : [];
    let max = Number.MIN_VALUE;
    let min = Number.MAX_VALUE;
    for (const x of data) {
        for (const vS of Object.values(x)) {
            const v = Number(vS);
            if (!isFinite(v)) continue;
            if (v > max) {
                max = v;
            }
            if (v < min) {
                min = v;
            }
        }
    }
    const gridColor = 'none';
    const labelColor = 'var(--color-gray-500)';
    const [dataTypesToShow, setDataTypesToShow] = useState<string[]>(
        nonXAxisKeys
    );
    const chartRef = useRef<any>(null);
    const draggableReferenceLines = referenceLines?.filter((rl) => rl.onDrag);

    return (
        <>
            {!!draggableReferenceLines?.length && (
                <ReactSlider
                    className="vertical-slider"
                    // TODO(vkorolik) styling
                    thumbClassName="example-thumb"
                    trackClassName="example-track"
                    max={max}
                    min={min}
                    value={draggableReferenceLines.map((rl) => rl.value)}
                    onChange={(value) => {
                        value.map((v, idx) => {
                            const d = draggableReferenceLines[idx].onDrag;
                            if (d) {
                                d(v);
                            }
                        });
                    }}
                    renderThumb={(props, state) => (
                        <div {...props}>{state.valueNow}</div>
                    )}
                    pearling
                    invert
                    minDistance={1}
                    orientation={'vertical'}
                />
            )}
            <ResponsiveContainer width="100%" height={height}>
                <RechartsLineChart
                    width={500}
                    ref={chartRef}
                    height={300}
                    data={data}
                    margin={{
                        top: 42,
                        right: 4,
                        left: -18,
                        bottom: 0,
                    }}
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
                        dx={0}
                    />

                    <Tooltip
                        position={{ y: 0 }}
                        content={
                            <RechartTooltip
                                render={(payload: any) => {
                                    return (
                                        <>
                                            <div>
                                                {payload
                                                    .reverse()
                                                    .map((entry: any) => {
                                                        return (
                                                            <p
                                                                key={
                                                                    entry.dataKey
                                                                }
                                                                className={
                                                                    styles.tooltipEntry
                                                                }
                                                            >
                                                                <div
                                                                    className={
                                                                        styles.legendIcon
                                                                    }
                                                                    style={{
                                                                        background:
                                                                            entry.color,
                                                                    }}
                                                                ></div>
                                                                <div
                                                                    className={
                                                                        styles.tooltipRow
                                                                    }
                                                                >
                                                                    <span>
                                                                        <span
                                                                            className={
                                                                                styles.tooltipValue
                                                                            }
                                                                        >
                                                                            {entry.value.toFixed(
                                                                                2
                                                                            )}
                                                                        </span>{' '}
                                                                        {
                                                                            yAxisLabel
                                                                        }
                                                                    </span>
                                                                    {referenceLines?.length ===
                                                                    2
                                                                        ? getScoreIcon(
                                                                              getMetricValueScore(
                                                                                  entry.value,
                                                                                  {
                                                                                      max_good_value: referenceLines![0]
                                                                                          .value,
                                                                                      max_needs_improvement_value: referenceLines![1]
                                                                                          .value,
                                                                                  }
                                                                              )
                                                                          )
                                                                        : undefined}
                                                                </div>
                                                            </p>
                                                        );
                                                    })}
                                            </div>
                                        </>
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
                                const { payload } = props;

                                return (
                                    <div className={styles.legendContainer}>
                                        {payload?.map((entry, index) => (
                                            <Button
                                                trackingId="LineChartLegendFilter"
                                                key={`item-${index}`}
                                                type="text"
                                                size="small"
                                                onClick={() => {
                                                    setDataTypesToShow(
                                                        (previous) => {
                                                            // Toggle off
                                                            if (
                                                                previous.includes(
                                                                    entry.value
                                                                )
                                                            ) {
                                                                return previous.filter(
                                                                    (e) =>
                                                                        e !==
                                                                        entry.value
                                                                );
                                                            } else {
                                                                // Toggle on
                                                                return [
                                                                    ...previous,
                                                                    entry.value,
                                                                ];
                                                            }
                                                        }
                                                    );
                                                }}
                                                className={classNames(
                                                    styles.legendItem
                                                )}
                                            >
                                                <div
                                                    className={classNames(
                                                        styles.legendIcon,
                                                        {
                                                            [styles.notShowing]: !dataTypesToShow.includes(
                                                                entry.value
                                                            ),
                                                        }
                                                    )}
                                                    style={{
                                                        background: entry.color,
                                                    }}
                                                ></div>
                                                <span
                                                    className={classNames(
                                                        styles.legendValue,
                                                        {
                                                            [styles.notShowing]: !dataTypesToShow.includes(
                                                                entry.value
                                                            ),
                                                        }
                                                    )}
                                                >
                                                    {entry.value}
                                                </span>
                                            </Button>
                                        ))}
                                    </div>
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
