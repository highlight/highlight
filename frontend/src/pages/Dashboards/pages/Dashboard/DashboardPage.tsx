import { useDashboardsContext } from '@pages/Dashboards/DashboardsContext/DashboardsContext';
import { useParams } from '@util/react-router/useParams';
import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

const DashboardPage = () => {
    const history = useHistory();
    const { id } = useParams<{ id: string }>();
    const { dashboards } = useDashboardsContext();

    useEffect(() => {
        const dashboard = dashboards.find((d) => d.id === parseInt(id, 10));
        const name = dashboard?.name || '';

        history.replace({ state: { dashboardName: name } });
    }, [dashboards, history, id]);

    return (
        <div>
            <h2>Hello</h2>
        </div>
    );
};

export default DashboardPage;
