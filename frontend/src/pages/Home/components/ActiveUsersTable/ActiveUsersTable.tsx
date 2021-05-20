import { ColumnsType } from 'antd/lib/table';
import classNames from 'classnames';
import React, { useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { useHistory, useParams } from 'react-router-dom';

import { Avatar } from '../../../../components/Avatar/Avatar';
import BarChartTable from '../../../../components/BarChartTable/BarChartTable';
import { useGetReferrersCountQuery } from '../../../../graph/generated/hooks';
import mockData from '../../../../MOCK_DATA.json';
import { SessionPageSearchParams } from '../../../Player/utils/utils';
import homePageStyles from '../../HomePage.module.scss';
import { useHomePageFiltersContext } from '../HomePageFilters/HomePageFiltersContext';
import { formatShortTime } from '../KeyPerformanceIndicators/utils/utils';
import styles from './ActiveUsersTable.module.scss';

const ActiveUsersTable = () => {
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

    return (
        <div
            className={classNames(
                homePageStyles.section,
                homePageStyles.graphSection,
                styles.tableContainer
            )}
        >
            <div className={homePageStyles.chartHeaderWrapper}>
                <h3>Top Users</h3>
            </div>
            <BarChartTable
                columns={Columns}
                data={mockData}
                onClickHandler={(record) => {
                    history.push(
                        `/${organization_id}/sessions?${SessionPageSearchParams.identifier}=${record.user}`
                    );
                }}
            />
        </div>
    );
};

export default ActiveUsersTable;

const Columns: ColumnsType<any> = [
    {
        title: 'User',
        dataIndex: 'user',
        key: 'user',
        width: 250,
        render: (user) => (
            <div className={styles.hostContainer}>
                <Avatar seed={user} style={{ height: 18, width: 18 }} />
                <span>{user}</span>
            </div>
        ),
    },
    {
        title: 'Active Time',
        dataIndex: 'active_time',
        key: 'active_time',
        width: 75,
        align: 'right',
        render: (count) => (
            <div className={styles.countContainer}>
                {formatShortTime(count / 1000)}
            </div>
        ),
    },
    {
        title: 'Percentage',
        dataIndex: 'percentage',
        key: 'percentage',
        render: (percent) => (
            <div
                className={styles.percentContainer}
                style={
                    {
                        '--percentage': `${percent * 100}%`,
                    } as React.CSSProperties
                }
            >
                <span>{(percent * 100).toFixed(0)}%</span>
            </div>
        ),
    },
];
