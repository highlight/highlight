import React, { useContext } from 'react';
import { ReactComponent as Banner } from '../../static/banner.svg';
import { ReactComponent as Hamburger } from '../../static/hamburger.svg';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { UserDropdown } from './UserDropdown/UserDropdown';

import styles from './Header.module.scss';
import { DemoContext } from '../../DemoContext';
import { SidebarState, useSidebarContext } from '../Sidebar/SidebarContext';
import classNames from 'classnames/bind';
import { HighlightLogo } from '../HighlightLogo/HighlightLogo';
import { CommandBar } from './CommandBar/CommandBar';
import Notifications from './Notifications/Notifications';
import { useGetBillingDetailsQuery } from '../../graph/generated/hooks';
import { PlanType } from '../../graph/generated/schemas';

export const Header = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const { demo } = useContext(DemoContext);
    const { state, toggleSidebar } = useSidebarContext();

    return (
        <>
            <CommandBar />
            <div className={styles.header}>
                {process.env.REACT_APP_ONPREM === 'true' ? (
                    <OnPremiseBanner />
                ) : (
                    <FreePlanBanner />
                )}
                <div className={styles.headerContent}>
                    <div className={styles.logoWrapper}>
                        <Hamburger
                            className={styles.hamburger}
                            onClick={toggleSidebar}
                            style={{
                                transform:
                                    state === SidebarState.Expanded
                                        ? 'rotate(-180deg)'
                                        : 'rotate(0deg)',
                            }}
                        />
                        <Link
                            className={styles.homeLink}
                            to={demo ? '/' : `/${organization_id}/sessions`}
                        >
                            <HighlightLogo />
                        </Link>
                    </div>
                    <div className={styles.rightHeader}>
                        <Notifications />
                        <UserDropdown />
                    </div>
                </div>
            </div>
        </>
    );
};

const FreePlanBanner = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const { data, loading } = useGetBillingDetailsQuery({
        variables: { organization_id },
    });

    if (loading) {
        return null;
    }

    if (data?.billingDetails.plan.type !== PlanType.Free) {
        return null;
    }

    return (
        <div className={styles.trialWrapper}>
            <Banner className={styles.bannerSvg} />
            <div className={classNames(styles.trialTimeText)}>
                You are currently on the free plan. Upgrade{' '}
                <Link
                    className={styles.trialLink}
                    to={`/${organization_id}/billing`}
                >
                    here!
                </Link>
            </div>
        </div>
    );
};

const OnPremiseBanner = () => {
    return (
        <div
            className={styles.trialWrapper}
            style={{ backgroundColor: 'black' }}
        >
            <Banner className={styles.bannerSvg} style={{ fill: 'black' }} />
            <div className={classNames(styles.trialTimeText)}>
                Runnning Highlight On-premise{' '}
                {`v${process.env.REACT_APP_COMMIT_SHA}`}
            </div>
        </div>
    );
};
