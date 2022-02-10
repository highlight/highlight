import Card from '@components/Card/Card';
import { RechartTooltip } from '@components/recharts/RechartTooltip/RechartTooltip';
import { ErrorGroup, Maybe } from '@graph/schemas';
import classNames from 'classnames';
import React from 'react';
import {
    Bar,
    BarChart,
    LabelList,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    XAxis,
    YAxis,
} from 'recharts';

import { useGetErrorDistributionQuery } from '../../../../graph/generated/hooks';
import styles from './ErrorDistributionChart.module.scss';

type DistributionGraphProps = {
    errorGroup?: Maybe<Pick<ErrorGroup, 'secure_id' | 'project_id'>>;
    field: string;
    title: string;
};

export const ErrorDistributionChart: React.FC<DistributionGraphProps> = ({
    errorGroup,
    field,
    title,
}) => {
    const { data } = useGetErrorDistributionQuery({
        variables: {
            project_id: `${errorGroup?.project_id}`,
            error_group_secure_id: `${errorGroup?.secure_id}`,
            property: field,
        },
    });

    const chartHeight = (data: Array<any> | undefined) => {
        if (data) {
            let totalHeight = data.length * 32;
            if (data.length <= 2) {
                totalHeight += 60;
            }
            return totalHeight;
        }
        return 200;
    };

    return (
        <Card className={classNames(styles.distributionSection)} title={title}>
            <div className={styles.distributionChart}>
                <ResponsiveContainer
                    width="100%"
                    height={chartHeight(data?.errorDistribution)}
                >
                    <BarChart
                        width={200}
                        data={data?.errorDistribution}
                        layout="vertical"
                        barSize={14}
                        margin={{
                            top: 5,
                            right: 20,
                            left: -20,
                            bottom:
                                data && data?.errorDistribution.length > 2
                                    ? 0
                                    : 60,
                        }}
                    >
                        <RechartsTooltip
                            cursor={{ fill: 'transparent' }}
                            content={<RechartTooltip />}
                        />
                        <XAxis type="number" hide={true} />
                        <YAxis
                            type="category"
                            dataKey="name"
                            width={80}
                            tick={{ fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Bar
                            dataKey="value"
                            radius={[0, 0, 0, 0]}
                            fill="#5629c6"
                        >
                            <LabelList
                                dataKey="value"
                                position="right"
                                className={styles.chartLabel}
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};
