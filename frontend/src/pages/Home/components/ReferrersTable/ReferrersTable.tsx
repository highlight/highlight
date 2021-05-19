import { ConfigProvider, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import classNames from 'classnames';
import React, { useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { useHistory, useParams } from 'react-router-dom';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    XAxis,
    YAxis,
} from 'recharts';

import { RechartTooltip } from '../../../../components/recharts/RechartTooltip/RechartTooltip';
import { useGetReferrersCountQuery } from '../../../../graph/generated/hooks';
import { SessionPageSearchParams } from '../../../Player/utils/utils';
import homePageStyles from '../../HomePage.module.scss';
import EmptyCardPlaceholder from '../EmptyCardPlaceholder/EmptyCardPlaceholder';
import { useHomePageFiltersContext } from '../HomePageFilters/HomePageFiltersContext';
import styles from './ReferrersTable.module.scss';

const ReferrersTable = () => {
    const [tableData, setTableData] = useState<any[]>([]);
    const { organization_id } = useParams<{
        organization_id: string;
    }>();
    const { dateRangeLength } = useHomePageFiltersContext();
    const history = useHistory();

    const { loading } = useGetReferrersCountQuery({
        variables: { organization_id, lookBackPeriod: dateRangeLength },
        onCompleted: (data) => {
            if (data.referrers) {
                const transformedData = data.referrers.map(
                    (referrer, index) => ({
                        key: index,
                        host: referrer?.host,
                        count: referrer?.count,
                        percent: (referrer?.percent || 0).toFixed(0),
                    })
                );

                setTableData(transformedData);
            }
        },
    });

    if (loading) {
        return <Skeleton count={1} style={{ width: '100%', height: 300 }} />;
    }
    const labelColor = 'var(--color-gray-500)';
    const gridColor = 'none';

    return (
        <>
            <div
                className={classNames(
                    homePageStyles.section,
                    homePageStyles.graphSection,
                    styles.tableContainer
                )}
            >
                <div className={homePageStyles.chartHeaderWrapper}>
                    <h3>Referrers</h3>
                </div>

                <ConfigProvider renderEmpty={EmptyCardPlaceholder}>
                    <Table
                        scroll={{ y: 250 }}
                        showHeader={false}
                        columns={Columns}
                        dataSource={tableData}
                        pagination={false}
                        onRow={(record) => ({
                            onClick: () => {
                                history.push(
                                    `/${organization_id}/sessions?${SessionPageSearchParams.referrer}=${record.host}`
                                );
                            },
                        })}
                    />
                </ConfigProvider>
            </div>
            <div
                className={classNames(
                    homePageStyles.section,
                    homePageStyles.graphSection
                )}
            >
                <div className={homePageStyles.chartHeaderWrapper}>
                    <h3>Referrers</h3>
                </div>
                <BarChart
                    width={500}
                    height={300}
                    data={tableData}
                    margin={{
                        top: 0,
                        right: 12,
                        left: -26,
                        bottom: 0,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <RechartsTooltip
                        contentStyle={{
                            paddingBottom: '16px',
                        }}
                        itemStyle={{
                            padding: 0,
                        }}
                        cursor={false}
                        content={<RechartTooltip />}
                    />
                    <XAxis
                        dataKey="host"
                        tick={{ fontSize: '11px', fill: labelColor }}
                        tickLine={{ stroke: labelColor, visibility: 'hidden' }}
                        axisLine={{ stroke: gridColor }}
                        dy={5}
                    />
                    <YAxis
                        tick={{ fontSize: '11px', fill: labelColor }}
                        tickLine={{ stroke: labelColor, visibility: 'hidden' }}
                        axisLine={{ stroke: gridColor }}
                    />
                    <Bar
                        dataKey="count"
                        fill="var(--color-purple-200)"
                        stroke="var(--color-purple)"
                        layout="vertical"
                    />
                </BarChart>
            </div>
        </>
    );
};

export default ReferrersTable;

const Columns: ColumnsType<any> = [
    {
        title: 'Referrers',
        dataIndex: 'host',
        key: 'host',
        width: 150,
        render: (host) => <div className={styles.hostContainer}>{host}</div>,
    },
    {
        title: 'Views',
        dataIndex: 'count',
        key: 'count',
        width: 75,
        align: 'right',
        render: (count) => <div className={styles.countContainer}>{count}</div>,
    },
    {
        title: 'Percentage',
        dataIndex: 'percent',
        key: 'percent',
        render: (percent) => (
            <div
                className={styles.percentContainer}
                style={{ '--percentage': `${percent}%` } as React.CSSProperties}
            >
                <span>{percent}%</span>
            </div>
        ),
    },
];
