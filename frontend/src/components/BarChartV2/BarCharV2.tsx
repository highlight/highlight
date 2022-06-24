import {
    CLICK_NEARBY_THRESHOLD,
    CustomLegend,
    CustomTooltip,
    findMax,
    Props as LineChartProps,
} from '@components/LineChart/LineChart';
import { RechartTooltip } from '@components/recharts/RechartTooltip/RechartTooltip';
import React, { useState } from 'react';
import ReactSlider from 'react-slider';
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

import styles from './BarChartV2.module.scss';

type Props = Omit<LineChartProps, 'lineColorMapping'> & {
    xAxisLabel?: string;
    yAxisKeys?: string[];
    barColorMapping: any;
    yAxisLabel: string;
    hideLegend?: boolean;
    referenceAreaProps?: ReferenceAreaProps;
};

const BarChartV2 = ({
    height,
    referenceLines,
    showReferenceLineLabels,
    xAxisDataKeyName = 'date',
    data,
    xAxisLabel,
    xAxisTickFormatter,
    hideXAxis = false,
    barColorMapping,
    yAxisTickFormatter,
    yAxisKeys,
    yAxisLabel,
    hideLegend = false,
    referenceAreaProps,
    xAxisProps,
}: Props) => {
    yAxisKeys =
        yAxisKeys ||
        (data.length > 0
            ? Object.keys(data[0]).filter(
                  (keyName) =>
                      keyName !== xAxisDataKeyName && keyName !== '__typename'
              )
            : []);
    const max = findMax(data, 'range_start');
    const gridColor = 'none';
    const labelColor = 'var(--color-gray-500)';
    const [dataTypesToShow, setDataTypesToShow] = useState<string[]>(yAxisKeys);
    const draggableReferenceLines = referenceLines?.filter((rl) => rl.onDrag);

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            {!!draggableReferenceLines?.length && (
                <ReactSlider
                    className={styles.horizontalSlider}
                    thumbClassName={styles.sliderThumb}
                    trackClassName={styles.sliderTrack}
                    max={max}
                    min={0}
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
                        <div {...props}>{state.valueNow.toFixed(1)}</div>
                    )}
                    pearling
                    minDistance={0}
                    step={0.1}
                />
            )}
            <ResponsiveContainer width="100%" height={height}>
                <RechartsBarChart
                    width={500}
                    height={300}
                    data={data}
                    margin={{
                        top: 42,
                        right: 4,
                        left: -18,
                        bottom: 0,
                    }}
                    barSize={5}
                    barGap={3}
                    barCategoryGap={3}
                    maxBarSize={3}
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
                        type={'number'}
                        hide={hideXAxis}
                        unit={xAxisLabel}
                        {...xAxisProps}
                    />
                    <YAxis
                        tickFormatter={yAxisTickFormatter}
                        tick={{ fontSize: '8px', fill: labelColor }}
                        tickLine={{ stroke: labelColor, visibility: 'hidden' }}
                        axisLine={{ stroke: gridColor }}
                        dx={-10}
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
                            hide={!dataTypesToShow.includes(key)}
                            key={key}
                            dataKey={key}
                            stroke={barColorMapping[key]}
                            fill={barColorMapping[key]}
                            animationDuration={100}
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

export default BarChartV2;
