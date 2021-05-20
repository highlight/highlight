import { ColumnsType } from 'antd/lib/table';
import classNames from 'classnames';
import React, { useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { useHistory, useParams } from 'react-router-dom';

import { Avatar } from '../../../../components/Avatar/Avatar';
import BarChartTable from '../../../../components/BarChartTable/BarChartTable';
import Tooltip from '../../../../components/Tooltip/Tooltip';
import { useGetTopUsersQuery } from '../../../../graph/generated/hooks';
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

    const { loading } = useGetTopUsersQuery({
        variables: { organization_id, lookBackPeriod: dateRangeLength },
        onCompleted: (data) => {
            if (data.topUsers) {
                const transformedData = data.topUsers.map((topUser, index) => ({
                    key: index,
                    identifier: topUser?.identifier,
                    total_active_time: topUser?.total_active_time,
                    active_time_percentage: topUser?.active_time_percentage,
                }));

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
                data={tableData}
                onClickHandler={(record) => {
                    history.push(
                        `/${organization_id}/sessions?${SessionPageSearchParams.identifier}=${record.identifier}`
                    );
                }}
                noDataMessage={
                    <>
                        It doesn't look like we have any sessions with
                        identified users. You will need to call{' '}
                        <code>identify()</code> in your app to identify users
                        during their sessions. You can{' '}
                        <a
                            href="https://docs.highlight.run/docs/identifying-users"
                            target="_blank"
                            rel="noreferrer"
                        >
                            learn more here
                        </a>
                        .
                        <br />
                        <br /> Once we have that data, we'll be able to show you
                        how much time your users have spent on your app.
                    </>
                }
            />
        </div>
    );
};

export default ActiveUsersTable;

const Columns: ColumnsType<any> = [
    {
        title: 'User',
        dataIndex: 'identifier',
        key: 'identifier',
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
        dataIndex: 'total_active_time',
        key: 'total_active_time',
        width: 75,
        align: 'right',
        render: (count) => (
            <Tooltip title="Total active time the user has spent on your app">
                <div className={styles.countContainer}>
                    {formatShortTime(count / 1000)}
                </div>
            </Tooltip>
        ),
    },
    {
        title: 'Percentage',
        dataIndex: 'active_time_percentage',
        key: 'active_time_percentage',
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
