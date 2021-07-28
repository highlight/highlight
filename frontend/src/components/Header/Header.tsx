import classNames from 'classnames/bind';
import moment from 'moment';
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';

import { useAuthContext } from '../../AuthContext';
import { DemoContext } from '../../DemoContext';
import { useGetBillingDetailsQuery } from '../../graph/generated/hooks';
import { PlanType } from '../../graph/generated/schemas';
import { ReactComponent as Banner } from '../../static/banner.svg';
import { ReactComponent as Hamburger } from '../../static/hamburger.svg';
import { isOrganizationWithinTrial } from '../../util/billing/billing';
import { HighlightLogo } from '../HighlightLogo/HighlightLogo';
import { SidebarState, useSidebarContext } from '../Sidebar/SidebarContext';
import { CommandBar } from './CommandBar/CommandBar';
import styles from './Header.module.scss';
import HelpMenu from './HelpMenu/HelpMenu';
import Notifications from './Notifications/Notifications';
import ThemeToggle from './ThemeToggle/ThemeToggle';
import { UserDropdown } from './UserDropdown/UserDropdown';

export const Header = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const { demo } = useContext(DemoContext);
    const { state, toggleSidebar } = useSidebarContext();
    const { isLoggedIn } = useAuthContext();

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
                        {isLoggedIn && (
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
                        )}
                        <Link
                            className={styles.homeLink}
                            to={demo ? '/' : `/${organization_id}/home`}
                        >
                            <HighlightLogo />
                        </Link>
                    </div>
                    <div className={styles.rightHeader}>
                        <ThemeToggle />
                        {isLoggedIn && <Notifications />}
                        <HelpMenu />
                        {isLoggedIn && <UserDropdown />}
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

    let bannerMessage = `You've used ${data?.billingDetails.meter}/${data?.billingDetails.plan.quota} of your free sessions.`;
    if (isOrganizationWithinTrial(data?.organization)) {
        bannerMessage = `You have unlimited sessions until ${moment(
            data?.organization?.trial_end_date
        ).format('MM/DD/YY')}. `;
    }

    return (
        <div className={styles.trialWrapper}>
            <Banner className={styles.bannerSvg} />
            <div className={classNames(styles.trialTimeText)}>
                {bannerMessage + ' '} Upgrade{' '}
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
            style={{
                backgroundColor: 'var(--color-primary-inverted-background',
            }}
        >
            <Banner
                className={styles.bannerSvg}
                style={{ fill: 'var(--text-primary)' }}
            />
            <div className={classNames(styles.trialTimeText)}>
                Running Highlight On-premise{' '}
                {`v${process.env.REACT_APP_COMMIT_SHA}`}
            </div>
        </div>
    );
};
