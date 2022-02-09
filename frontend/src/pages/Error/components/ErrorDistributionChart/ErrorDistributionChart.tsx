import Card from '@components/Card/Card';
import { RechartTooltip } from '@components/recharts/RechartTooltip/RechartTooltip';
import { ErrorGroup, Maybe } from '@graph/schemas';
import classNames from 'classnames';
import React from 'react';
import {
    Bar,
    BarChart,
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

    const minChartHeight = (data: Array<any> | undefined) => {
        return data ? Math.min(Math.max(data.length * 32, 96), 160) : 160;
    };

    return (
        <Card className={classNames(styles.distributionSection)} title={title}>
            <div className={styles.distributionChart}>
                <ResponsiveContainer
                    width="100%"
                    height={minChartHeight(data?.errorDistribution)}
                >
                    <BarChart
                        width={200}
                        data={data?.errorDistribution}
                        layout="vertical"
                        barSize={14}
                        margin={{
                            top: 5,
                            right: 10,
                            left: -20,
                            bottom: 0,
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
                        ></Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};
