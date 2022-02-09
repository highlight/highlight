import Card from '@components/Card/Card';
import { RechartTooltip } from '@components/recharts/RechartTooltip/RechartTooltip';
import { ErrorGroup, Maybe } from '@graph/schemas';
import classNames from 'classnames';
import React, { useState } from 'react';
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

// Maximum number of categories to show in the distribution chart
const MAX_CATEGORIES_TO_DISPLAY = 6;

export const ErrorDistributionChart: React.FC<DistributionGraphProps> = ({
    errorGroup,
    field,
    title,
}) => {
    const [data, setData] = useState<any[]>([]);

    useGetErrorDistributionQuery({
        variables: {
            project_id: `${errorGroup?.project_id}`,
            error_group_secure_id: `${errorGroup?.secure_id}`,
            property: field,
        },
        skip: !errorGroup,
        onCompleted: (response) => {
            if (response.errorDistribution.length > MAX_CATEGORIES_TO_DISPLAY) {
                const parsedData = response.errorDistribution.slice(
                    0,
                    MAX_CATEGORIES_TO_DISPLAY - 1
                );
                let remainingCount = 0;
                response.errorDistribution.map((obj, i) => {
                    if (i >= MAX_CATEGORIES_TO_DISPLAY - 1) {
                        remainingCount += obj?.value;
                    }
                });
                parsedData.push({
                    name: 'Others',
                    value: remainingCount,
                });
                setData(parsedData);
            } else {
                setData(response.errorDistribution);
            }
        },
    });

    const minChartHeight = (data: Array<any>) => {
        return Math.min(data.length * 36, 200);
    };

    return (
        <Card className={classNames(styles.distributionSection)} title={title}>
            <ResponsiveContainer width="100%" height={minChartHeight(data)}>
                <BarChart
                    width={200}
                    data={data}
                    layout="vertical"
                    barSize={16}
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
        </Card>
    );
};
