import Card from '@components/Card/Card';
import {
    DEMO_WORKSPACE_APPLICATION_ID,
    DEMO_WORKSPACE_PROXY_APPLICATION_ID,
} from '@components/DemoWorkspaceButton/DemoWorkspaceButton';
import { ProgressBarTableRowGroup } from '@components/ProgressBarTable/components/ProgressBarTableColumns';
import { useGetNetworkHistogramQuery } from '@graph/hooks';
import { NetworkRequestAttribute } from '@graph/schemas';
import { useParams } from '@util/react-router/useParams';
import { ColumnsType } from 'antd/lib/table';
import React from 'react';
import Skeleton from 'react-loading-skeleton';
import { Link } from 'react-router-dom';

import ProgressBarTable from '../../../../components/ProgressBarTable/ProgressBarTable';
import homePageStyles from '../../HomePage.module.scss';
import { useHomePageFiltersContext } from '../HomePageFilters/HomePageFiltersContext';
import styles from './TopRoutesTable.module.scss';

const TopRoutesTable = () => {
    const { project_id } =
        useParams<{
            project_id: string;
        }>();
    const projectIdRemapped =
        project_id === DEMO_WORKSPACE_APPLICATION_ID
            ? DEMO_WORKSPACE_PROXY_APPLICATION_ID
            : project_id;

    const { dateRangeLength } = useHomePageFiltersContext();

    const { loading, data } = useGetNetworkHistogramQuery({
        variables: {
            project_id: projectIdRemapped,
            params: {
                lookback_days: dateRangeLength,
                attribute: NetworkRequestAttribute.Url,
            },
        },
    });

    if (loading) {
        return <Skeleton count={1} style={{ width: '100%', height: 300 }} />;
    }

    return (
        <Card
            title={
                <div className={homePageStyles.chartHeaderWrapper}>
                    <h3 id={homePageStyles.h3}>Top Routes</h3>
                </div>
            }
            noTitleBottomMargin
            full
        >
            <ProgressBarTable
                loading={loading}
                columns={Columns}
                data={
                    data?.network_histogram?.buckets
                        .slice()
                        .map((bucket, index) => ({
                            key: index,
                            route: bucket.category,
                            count: bucket.count,
                        })) || []
                }
                onClickHandler={() => {}}
                noDataMessage={
                    !data?.network_histogram?.buckets.length && (
                        <>
                            Have you{' '}
                            <Link
                                to={`/${project_id}/settings/recording#network`}
                            >
                                configured your backend domains?
                            </Link>
                        </>
                    )
                }
                noDataTitle={'No route data yet 😔'}
            />
        </Card>
    );
};

export default TopRoutesTable;

const Columns: ColumnsType<any> = [
    {
        title: 'Route',
        dataIndex: 'route',
        key: 'route',
        width: '80%',
        render: (route) => {
            return (
                <div className={styles.hostContainer}>
                    <ProgressBarTableRowGroup>
                        <span>{route}</span>
                    </ProgressBarTableRowGroup>
                </div>
            );
        },
    },
    {
        title: 'Count',
        dataIndex: 'count',
        key: 'count',
        render: (count) => {
            return (
                <ProgressBarTableRowGroup alignment="ending">
                    <span>{count.toLocaleString()}</span>
                </ProgressBarTableRowGroup>
            );
        },
    },
];
