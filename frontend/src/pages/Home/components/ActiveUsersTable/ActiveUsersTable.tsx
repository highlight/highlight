import Card from '@components/Card/Card';
import {
    DEMO_WORKSPACE_APPLICATION_ID,
    DEMO_WORKSPACE_PROXY_APPLICATION_ID,
} from '@components/DemoWorkspaceButton/DemoWorkspaceButton';
import {
    ProgressBarTablePercentage,
    ProgressBarTablePill,
    ProgressBarTableRowGroup,
    ProgressBarTableUserAvatar,
} from '@components/ProgressBarTable/components/ProgressBarTableColumns';
import { useGetTopUsersQuery } from '@graph/hooks';
import SvgClockIcon from '@icons/ClockIcon';
import { EmptySessionsSearchParams } from '@pages/Sessions/EmptySessionsSearchParams';
import { useSearchContext } from '@pages/Sessions/SearchContext/SearchContext';
import { useParams } from '@util/react-router/useParams';
import { validateEmail } from '@util/string';
import { message } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import React, { useMemo, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { useHistory } from 'react-router-dom';

import Input from '../../../../components/Input/Input';
import ProgressBarTable from '../../../../components/ProgressBarTable/ProgressBarTable';
import Tooltip from '../../../../components/Tooltip/Tooltip';
import homePageStyles from '../../HomePage.module.scss';
import { useHomePageFiltersContext } from '../HomePageFilters/HomePageFiltersContext';
import { formatShortTime } from '../KeyPerformanceIndicators/utils/utils';
import styles from './ActiveUsersTable.module.scss';

const ActiveUsersTable = () => {
    const [tableData, setTableData] = useState<any[]>([]);
    const { project_id } = useParams<{
        project_id: string;
    }>();
    const projectIdRemapped =
        project_id === DEMO_WORKSPACE_APPLICATION_ID
            ? DEMO_WORKSPACE_PROXY_APPLICATION_ID
            : project_id;

    const {
        setSearchParams,
        setSegmentName,
        setSelectedSegment,
    } = useSearchContext();
    const { dateRangeLength } = useHomePageFiltersContext();
    const history = useHistory();
    const [filterSearchTerm, setFilterSearchTerm] = useState('');

    const { loading } = useGetTopUsersQuery({
        variables: { project_id, lookBackPeriod: dateRangeLength },
        fetchPolicy: 'no-cache',
        onCompleted: (data) => {
            if (data.topUsers) {
                const transformedData = data.topUsers
                    .slice()
                    .map((topUser, index) => ({
                        key: index,
                        identifier: topUser?.identifier,
                        total_active_time: topUser?.total_active_time,
                        active_time_percentage: topUser?.active_time_percentage,
                        id: topUser?.id,
                        userProperties: topUser?.user_properties,
                    }));

                setTableData(transformedData);
            }
        },
    });

    const filteredTableData = useMemo(() => {
        if (filterSearchTerm === '') {
            return tableData;
        }

        return tableData.filter((row) => {
            return row.identifier.includes(filterSearchTerm);
        });
    }, [filterSearchTerm, tableData]);

    if (loading) {
        return <Skeleton count={1} style={{ width: '100%', height: 300 }} />;
    }

    return (
        <Card
            title={
                <div className={homePageStyles.chartHeaderWrapper}>
                    <h3 id={homePageStyles.h3}>Top Users</h3>
                    <Input
                        allowClear
                        placeholder="Search for user"
                        value={filterSearchTerm}
                        onChange={(event) => {
                            setFilterSearchTerm(event.target.value);
                        }}
                        size="small"
                        disabled={loading}
                    />
                </div>
            }
            noTitleBottomMargin
        >
            <ProgressBarTable
                loading={loading}
                columns={Columns}
                data={filteredTableData}
                onClickHandler={(record) => {
                    setSegmentName(null);
                    setSelectedSegment(undefined);
                    setSearchParams({
                        ...EmptySessionsSearchParams,
                        user_properties: [
                            {
                                id: record.id,
                                name: validateEmail(record.identifier)
                                    ? 'email'
                                    : 'identifier',
                                value: record.identifier,
                            },
                        ],
                    });
                    message.success(
                        `Showing sessions for ${record.identifier}`
                    );
                    history.push(`/${projectIdRemapped}/sessions`);
                }}
                noDataMessage={
                    filteredTableData.length === 0 &&
                    filterSearchTerm !== '' ? (
                        <>
                            This table will only shows the top 50 users based on
                            total active time in your app. '{filterSearchTerm}'
                            is not in the top 50.
                        </>
                    ) : (
                        <>
                            It doesn't look like we have any sessions with
                            identified users. You will need to call{' '}
                            <code>identify()</code> in your app to identify
                            users during their sessions. You can{' '}
                            <a
                                href="https://docs.highlight.run/identifying-users"
                                target="_blank"
                                rel="noreferrer"
                            >
                                learn more here
                            </a>
                            .
                        </>
                    )
                }
                noDataTitle={
                    filteredTableData.length === 0 && filterSearchTerm !== ''
                        ? `No matches for '${filterSearchTerm}'`
                        : 'No user data yet 😔'
                }
            />
        </Card>
    );
};

export default ActiveUsersTable;

const Columns: ColumnsType<any> = [
    {
        title: 'User',
        dataIndex: 'identifier',
        key: 'identifier',
        render: (user, record) => {
            return (
                <div className={styles.hostContainer}>
                    <ProgressBarTableRowGroup>
                        <ProgressBarTableUserAvatar
                            identifier={user}
                            userProperties={record.userProperties}
                        />
                        <span>{user}</span>
                    </ProgressBarTableRowGroup>
                </div>
            );
        },
    },
    {
        title: 'Percentage',
        dataIndex: 'active_time_percentage',
        key: 'active_time_percentage',
        render: (percent, record) => {
            return (
                <ProgressBarTableRowGroup alignment="ending">
                    <ProgressBarTablePercentage percent={percent * 100} />
                    <Tooltip title="Total active time the user has spent on your app">
                        <ProgressBarTablePill
                            displayValue={`${formatShortTime(
                                record.total_active_time / 1000
                            )}`}
                            icon={<SvgClockIcon />}
                        />
                    </Tooltip>
                </ProgressBarTableRowGroup>
            );
        },
    },
];
