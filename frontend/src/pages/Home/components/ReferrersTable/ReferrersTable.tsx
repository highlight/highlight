import { message } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import classNames from 'classnames';
import React, { useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { useHistory, useParams } from 'react-router-dom';

import BarChartTable from '../../../../components/BarChartTable/BarChartTable';
import { getPercentageDisplayValue } from '../../../../components/BarChartTable/utils/utils';
import { useGetReferrersCountQuery } from '../../../../graph/generated/hooks';
import { useSearchContext } from '../../../Sessions/SearchContext/SearchContext';
import { EmptySessionsSearchParams } from '../../../Sessions/SessionsPage';
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
    const { setSearchParams } = useSearchContext();

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
                <h3>Top Referrers</h3>
            </div>
            <BarChartTable
                columns={Columns}
                data={tableData}
                onClickHandler={(record) => {
                    setSearchParams({
                        ...EmptySessionsSearchParams,
                        referrer: record.host,
                    });
                    message.success(
                        `Showing sessions that were referred by ${record.host}`
                    );
                    history.push(`/${organization_id}/sessions`);
                }}
                noDataTitle="No referrer data yet 😔"
                noDataMessage="Doesn't look like your app has been referred to yet."
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
        width: 150,
        render: (host) => (
            <div className={styles.hostContainer}>
                <span>{host}</span>
            </div>
        ),
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
                <span>{getPercentageDisplayValue(percent / 100)}</span>
            </div>
        ),
    },
];
