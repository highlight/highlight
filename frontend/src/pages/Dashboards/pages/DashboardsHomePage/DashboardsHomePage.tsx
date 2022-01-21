import Button from '@components/Button/Button/Button';
import Card from '@components/Card/Card';
import HighlightGate from '@components/HighlightGate/HighlightGate';
import { SearchEmptyState } from '@components/SearchEmptyState/SearchEmptyState';
import Table from '@components/Table/Table';
import { useGetWorkspaceAdminsByProjectIdQuery } from '@graph/hooks';
import SvgChevronRightIcon from '@icons/ChevronRightIcon';
import AlertLastEditedBy from '@pages/Alerts/components/AlertLastEditedBy/AlertLastEditedBy';
import { useDashboardsContext } from '@pages/Dashboards/DashboardsContext/DashboardsContext';
import { useParams } from '@util/react-router/useParams';
import React from 'react';
import { Link, useHistory } from 'react-router-dom';

import alertStyles from '../../../Alerts/Alerts.module.scss';

const DashboardsHomePage = () => {
    const { project_id } = useParams<{ project_id: string }>();
    const { loading } = useGetWorkspaceAdminsByProjectIdQuery({
        variables: { project_id },
    });
    const history = useHistory();
    const { dashboards } = useDashboardsContext();

    const onCreateNewDashboard = () => {
        // TODO: Create a new dashboard in DB.
        alert(
            "Hi I don't do anything yet. I only show up for Highlight staff."
        );
        if (false) {
            const newId = 2;

            history.push(`/${project_id}/dashboards/${newId}`);
        }
    };

    return (
        <div>
            <div className={alertStyles.subTitleContainer}>
                <p>
                    Dashboards allow you to visualize what's happening in your
                    app.
                </p>
                <HighlightGate>
                    <Button
                        trackingId="NewDashboard"
                        className={alertStyles.callToAction}
                        onClick={onCreateNewDashboard}
                        type="primary"
                    >
                        New Dashboard
                    </Button>
                </HighlightGate>
            </div>

            <Card noPadding>
                <Table
                    columns={TABLE_COLUMNS}
                    loading={loading}
                    dataSource={dashboards}
                    pagination={false}
                    showHeader={false}
                    rowHasPadding
                    renderEmptyComponent={
                        <SearchEmptyState
                            className={alertStyles.emptyContainer}
                            item={'dashboards'}
                            customTitle={`Your project doesn't have any dashboards yet 😔`}
                            customDescription={
                                <>
                                    <Button
                                        trackingId="NewDashboard"
                                        className={alertStyles.callToAction}
                                        onClick={onCreateNewDashboard}
                                    >
                                        New Dashboard
                                    </Button>
                                </>
                            }
                        />
                    }
                    onRow={(record) => ({
                        onClick: () => {
                            history.push({
                                pathname: `dashboards/${record.id}`,
                                state: {
                                    dashboardName: record.name,
                                },
                            });
                        },
                    })}
                />
            </Card>
        </div>
    );
};

export default DashboardsHomePage;

const TABLE_COLUMNS = [
    {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        render: (name: string, record: any) => {
            return (
                <div className={alertStyles.nameCell}>
                    <div className={alertStyles.primary}>{name}</div>
                    <div>
                        <AlertLastEditedBy
                            adminId={record.LastAdminToEditID}
                            lastEditedTimestamp={record.updated_at}
                            allAdmins={record.allAdmins}
                            loading={record.loading}
                        />
                    </div>
                </div>
            );
        },
    },
    {
        title: 'View',
        dataIndex: 'view',
        key: 'view',
        render: (_: any, record: any) => (
            <Link
                to={{
                    pathname: `dashboards/${record.id}`,
                    state: { dashboardName: record.name },
                }}
                className={alertStyles.configureButton}
                onClick={(e) => {
                    e.stopPropagation();
                }}
            >
                View <SvgChevronRightIcon />
            </Link>
        ),
    },
];
