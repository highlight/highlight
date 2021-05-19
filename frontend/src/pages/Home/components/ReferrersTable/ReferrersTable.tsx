import { Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import classNames from 'classnames';
import React, { useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { useHistory, useParams } from 'react-router-dom';

import { useGetReferrersCountQuery } from '../../../../graph/generated/hooks';
import { SessionPageSearchParams } from '../../../Player/utils/utils';
import homePageStyles from '../../HomePage.module.scss';
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

    if (loading || tableData.length === 0) {
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
                <h3>Referrers</h3>
            </div>

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
        </div>
    );
};

export default ReferrersTable;

const Columns: ColumnsType<any> = [
    {
        title: 'Referrers',
        dataIndex: 'host',
        key: 'host',
    },
    {
        title: 'Views',
        dataIndex: 'count',
        key: 'count',
        width: 100,
        align: 'right',
        render: (count) => <div className={styles.countContainer}>{count}</div>,
    },
    {
        title: 'Percentage',
        dataIndex: 'percent',
        key: 'percent',
        width: 60,
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
