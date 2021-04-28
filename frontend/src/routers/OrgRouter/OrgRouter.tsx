import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { LoadingPage } from '../../components/Loading/Loading';
import { Header } from '../../components/Header/Header';
import { useIntegrated } from '../../util/integrated';
import { Sidebar } from '../../components/Sidebar/Sidebar';
import { SidebarContext } from '../../components/Sidebar/SidebarContext';

import commonStyles from '../../Common.module.scss';
import { Duration, MillisToDaysHoursMinSeconds } from '../../util/time';
import { useGetOrganizationQuery } from '../../graph/generated/hooks';
import { ErrorState } from '../../components/ErrorState/ErrorState';
import ApplicationRouter from './ApplicationRouter';

export const OrgRouter = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const [trialTimeRemaining, setTrialTimeRemaining] = useState<
        Duration | undefined
    >(undefined);
    const { loading, error, data } = useGetOrganizationQuery({
        variables: { id: organization_id },
    });

    const { integrated, loading: integratedLoading } = useIntegrated(
        parseInt(organization_id)
    );
    const [openSidebar, setOpenSidebar] = useState(false);

    useEffect(() => {
        const diff =
            new Date(data?.organization?.trial_end_date ?? 0).valueOf() -
            Date.now().valueOf();
        const trialTimeRemaining =
            diff > 0 ? MillisToDaysHoursMinSeconds(diff) : undefined;
        setTrialTimeRemaining(trialTimeRemaining);
    }, [data]);

    useEffect(() => {
        window.Intercom('update', {
            hide_default_launcher: true,
        });
        return () => {
            window.Intercom('update', {
                hide_default_launcher: false,
            });
        };
    }, []);

    if (integratedLoading || loading) {
        return <LoadingPage />;
    }
    return (
        <SidebarContext.Provider value={{ openSidebar, setOpenSidebar }}>
            <Header trialTimeRemaining={trialTimeRemaining} />
            <div className={commonStyles.bodyWrapper}>
                {error || !data?.organization ? (
                    <ErrorState
                        message={`
                        Seems like you don’t have access to this page 😢. If you're
                        part of a team, ask your workspace admin to send you an
                        invite. Otherwise, feel free to make an account!
                        `}
                        errorString={
                            'OrgRouter Error: ' + JSON.stringify(error)
                        }
                    />
                ) : (
                    <>
                        <Sidebar />
                        <ApplicationRouter integrated={integrated} />
                    </>
                )}
            </div>
        </SidebarContext.Provider>
    );
};
