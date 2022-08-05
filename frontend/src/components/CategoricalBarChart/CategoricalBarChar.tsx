import {
    CLICK_NEARBY_THRESHOLD,
    CustomLegend,
    CustomTooltip,
    Props as LineChartProps,
} from '@components/LineChart/LineChart';
import { RechartTooltip } from '@components/recharts/RechartTooltip/RechartTooltip';
import { generateRandomColor } from '@util/color';
import React from 'react';
import {
    Bar,
    BarChart as RechartsBarChart,
    CartesianGrid,
    Label,
    Legend,
    ReferenceArea,
    ReferenceAreaProps,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import styles from './CategoricalBarChart.module.scss';

type Props = Omit<LineChartProps, 'lineColorMapping'> & {
    xAxisLabel?: string;
    xAxisUnits?: string;
    barColorMapping: any;
    yAxisLabel: string;
    hideLegend?: boolean;
    stacked?: boolean;
    referenceAreaProps?: ReferenceAreaProps;
};

const CategoricalBarChart = ({
    height,
    referenceLines,
    showReferenceLineLabels,
    xAxisDataKeyName = 'date',
    data,
    xAxisLabel,
    xAxisUnits,
    xAxisTickFormatter,
    hideXAxis = false,
    barColorMapping,
    yAxisTickFormatter,
    yAxisLabel,
    syncId,
    hideLegend = false,
    stacked = false,
    referenceAreaProps,
    xAxisProps,
}: Props) => {
    const dateGroups: any = {};
    for (const x of data) {
        dateGroups[x.date] = { ...dateGroups[x.date], ...x };
    }
    const groupedData: any[] = Object.values(dateGroups);
    const yAxisKeys =
        data.length > 0
            ? Object.keys(groupedData[0]).filter(
                  (keyName) =>
                      keyName !== xAxisDataKeyName && keyName !== '__typename'
              )
            : [];
    const gridColor = 'none';
    const labelColor = 'var(--color-gray-500)';

    if (!groupedData) return null;
    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <ResponsiveContainer width="100%" height={height}>
                <RechartsBarChart
                    width={500}
                    height={300}
                    data={groupedData}
                    syncId={syncId}
                    margin={{
                        top: 42,
                        right: 4,
                        left: -6,
                        bottom: 2,
                    }}
                    barSize={20}
                    barGap={0}
                    barCategoryGap={0}
                >
                    <CartesianGrid
                        strokeDasharray=""
                        vertical={true}
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
                        unit={xAxisLabel}
                        {...xAxisProps}
                    />
                    <YAxis
                        tickFormatter={yAxisTickFormatter}
                        tick={{ fontSize: '8px', fill: labelColor }}
                        tickLine={{ stroke: labelColor, visibility: 'hidden' }}
                        axisLine={{ stroke: gridColor }}
                        dx={-12}
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
                                            precision={0}
                                            units={xAxisUnits || ''}
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
                                        dataTypesToShow={yAxisKeys}
                                        setDataTypesToShow={() => {}}
                                    />
                                );
                            }}
                        />
                    )}
                    {referenceLines?.map((referenceLine, index) => (
                        <ReferenceLine
                            key={`${referenceLine.label}-${index}`}
                            x={referenceLine.value}
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
                    {yAxisKeys.map((key) => (
                        <Bar
                            stackId={stacked ? 'a' : undefined}
                            key={key}
                            dataKey={key}
                            stroke={
                                barColorMapping[key] || generateRandomColor(key)
                            }
                            fill={
                                barColorMapping[key] || generateRandomColor(key)
                            }
                            animationDuration={100}
                            radius={[2, 2, 0, 0]}
                        />
                    ))}
                    {referenceAreaProps && (
                        <ReferenceArea {...referenceAreaProps} isFront />
                    )}
                </RechartsBarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CategoricalBarChart;
