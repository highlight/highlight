import {
    BarChartTablePercentage,
    BarChartTablePill,
    BarChartTableRowGroup,
} from '@components/BarChartTable/components/BarChartTableColumns';
import Card from '@components/Card/Card';
import {
    DEMO_WORKSPACE_APPLICATION_ID,
    DEMO_WORKSPACE_PROXY_APPLICATION_ID,
} from '@components/DemoWorkspaceButton/DemoWorkspaceButton';
import SvgReferrer from '@icons/Referrer';
import { useParams } from '@util/react-router/useParams';
import { message } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import React, { useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { useHistory } from 'react-router-dom';

import BarChartTable from '../../../../components/BarChartTable/BarChartTable';
import { useGetReferrersCountQuery } from '../../../../graph/generated/hooks';
import { EmptySessionsSearchParams } from '../../../Sessions/EmptySessionsSearchParams';
import { useSearchContext } from '../../../Sessions/SearchContext/SearchContext';
import { useHomePageFiltersContext } from '../HomePageFilters/HomePageFiltersContext';
import styles from './ReferrersTable.module.scss';

const ReferrersTable = () => {
    const [tableData, setTableData] = useState<any[]>([]);
    const { project_id } = useParams<{
        project_id: string;
    }>();
    const projectIdRemapped =
        project_id === DEMO_WORKSPACE_APPLICATION_ID
            ? DEMO_WORKSPACE_PROXY_APPLICATION_ID
            : project_id;

    const { dateRangeLength } = useHomePageFiltersContext();
    const history = useHistory();
    const {
        setSearchParams,
        setSegmentName,
        setSelectedSegment,
    } = useSearchContext();

    const { loading } = useGetReferrersCountQuery({
        variables: { project_id, lookBackPeriod: dateRangeLength },
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
        <Card title="Top Referrers" noTitleBottomMargin>
            <BarChartTable
                columns={Columns}
                data={tableData}
                loading={loading}
                onClickHandler={(record) => {
                    setSegmentName(null);
                    setSelectedSegment(undefined);
                    setSearchParams({
                        ...EmptySessionsSearchParams,
                        referrer: record.host,
                    });
                    message.success(
                        `Showing sessions that were referred by ${record.host}`
                    );
                    history.push(`/${projectIdRemapped}/sessions`);
                }}
                noDataTitle="No referrer data yet 😔"
                noDataMessage="Doesn't look like your app has been referred to yet."
            />
        </Card>
    );
};

export default ReferrersTable;

const Columns: ColumnsType<any> = [
    {
        title: 'Referrers',
        dataIndex: 'host',
        key: 'host',
        render: (host) => (
            <div className={styles.hostContainer}>
                <span>{host}</span>
            </div>
        ),
    },
    {
        title: 'Percentage',
        dataIndex: 'percent',
        key: 'percent',
        render: (percent, record) => {
            return (
                <BarChartTableRowGroup alignment="ending">
                    <BarChartTablePercentage percent={percent} />
                    <BarChartTablePill
                        displayValue={`${record.count} refers`}
                        icon={<SvgReferrer />}
                    />
                </BarChartTableRowGroup>
            );
        },
    },
];
