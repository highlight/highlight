import Button from '@components/Button/Button/Button';
import { RechartTooltip } from '@components/recharts/RechartTooltip/RechartTooltip';
import SvgCheckCircleIcon from '@icons/CheckCircleIcon';
import SvgShieldWarningIcon from '@icons/ShieldWarningIcon';
import SvgSkullIcon from '@icons/SkullIcon';
import {
    getWebVitalValueScore,
    WebVitalValueScore,
} from '@pages/Player/StreamElement/Renderers/WebVitals/components/Metric';
import classNames from 'classnames';
import React, { useState } from 'react';
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart as RechartsLineChart,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import styles from './LineChart.module.scss';

interface Props {
    data: any[];
    referenceLines?: any[];
    height: number;
    xAxisDataKeyName?: string;
    xAxisTickFormatter?: (value: any, index: number) => string;
    yAxisTickFormatter?: (value: any, index: number) => string;
    lineColorMapping: any;
    yAxisLabel: string;
}

const LineChart = ({
    height,
    referenceLines,
    xAxisDataKeyName = 'date',
    data,
    xAxisTickFormatter,
    yAxisTickFormatter,
    lineColorMapping,
    yAxisLabel,
}: Props) => {
    const nonXAxisKeys = Object.keys(data[0]).filter(
        (keyName) => keyName !== xAxisDataKeyName && keyName !== '__typename'
    );
    const gridColor = 'none';
    const labelColor = 'var(--color-gray-500)';
    const [dataTypesToShow, setDataTypesToShow] = useState<string[]>(
        nonXAxisKeys
    );

    return (
        <ResponsiveContainer width="100%" height={height}>
            <RechartsLineChart
                width={500}
                height={300}
                data={data}
                margin={{
                    top: 0,
                    right: 0,
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
                />
                <YAxis
                    tickFormatter={yAxisTickFormatter}
                    tick={{ fontSize: '8px', fill: labelColor }}
                    tickLine={{ stroke: labelColor, visibility: 'hidden' }}
                    axisLine={{ stroke: gridColor }}
                    dx={0}
                />
                <Tooltip
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
                                                            key={entry.dataKey}
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
                                                                    {yAxisLabel}
                                                                </span>
                                                                {getScoreIcon(
                                                                    getWebVitalValueScore(
                                                                        entry.value,
                                                                        {
                                                                            maxGoodValue: referenceLines![0]
                                                                                .value,
                                                                            maxNeedsImprovementValue: referenceLines![1]
                                                                                .value,
                                                                        }
                                                                    )
                                                                )}
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
                                            setDataTypesToShow((previous) => {
                                                // Toggle off
                                                if (
                                                    previous.includes(
                                                        entry.value
                                                    )
                                                ) {
                                                    return previous.filter(
                                                        (e) => e !== entry.value
                                                    );
                                                } else {
                                                    // Toggle on
                                                    return [
                                                        ...previous,
                                                        entry.value,
                                                    ];
                                                }
                                            });
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
                                            style={{ background: entry.color }}
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
                {referenceLines?.map((referenceLine) => (
                    <ReferenceLine
                        key={referenceLine.label}
                        y={referenceLine.value}
                        // label={referenceLine.label}
                        stroke={referenceLine.color}
                        strokeDasharray="3 3"
                        isFront
                    >
                        {/* <Label
                            position={'insideLeft'}
                            alignmentBaseline="before-edge"
                            offset={10}
                            className={styles.referenceLineValue}
                        >
                            {referenceLine.label}
                        </Label> */}
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
            </RechartsLineChart>
        </ResponsiveContainer>
    );
};

export default LineChart;

const getScoreIcon = (score: WebVitalValueScore) => {
    let icon = <></>;
    switch (score) {
        case WebVitalValueScore.Good:
            icon = <SvgCheckCircleIcon />;
            break;
        case WebVitalValueScore.NeedsImprovement:
            icon = <SvgShieldWarningIcon />;
            break;
        case WebVitalValueScore.Poor:
            icon = <SvgSkullIcon />;
            break;
    }

    return <div className={styles.scoreIcon}>{icon}</div>;
};
