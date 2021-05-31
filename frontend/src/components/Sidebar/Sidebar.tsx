import classNames from 'classnames/bind';
import React, { useContext } from 'react';
import { HiOutlineSpeakerphone } from 'react-icons/hi';
import { Link, useLocation, useParams } from 'react-router-dom';

import { DemoContext } from '../../DemoContext';
import { useGetBillingDetailsQuery } from '../../graph/generated/hooks';
import SvgCreditCardsIcon from '../../static/CreditCardsIcon';
import SvgErrorsIcon from '../../static/ErrorsIcon';
import SvgHomeIcon from '../../static/HomeIcon';
import SvgSessionsIcon from '../../static/SessionsIcon';
import SvgSetupIcon from '../../static/SetupIcon';
import SvgTeamIcon from '../../static/TeamIcon';
import SvgWorkspaceIcon from '../../static/WorkspaceIcon';
import Changelog from '../Changelog/Changelog';
import {
    MiniWorkspaceIcon,
    WorkspaceDropdown,
} from '../Header/WorkspaceDropdown/WorkspaceDropdown';
import Tooltip from '../Tooltip/Tooltip';
import { CurrentUsageCard } from '../Upsell/CurrentUsageCard/CurrentUsageCard';
import styles from './Sidebar.module.scss';
import { SidebarState, useSidebarContext } from './SidebarContext';

interface NavigationItem {
    Icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
    displayName: string;
    route: string;
    className?: string;
}

const LEAD_NAVIGATION_ITEMS: NavigationItem[] = [
    {
        Icon: SvgHomeIcon,
        displayName: 'Home',
        route: 'home',
    },
    {
        Icon: SvgSessionsIcon,
        displayName: 'Sessions',
        route: 'sessions',
    },
    {
        Icon: SvgErrorsIcon,
        displayName: 'Errors',
        route: 'errors',
    },
];

const END_NAVIGATION_ITEMS: NavigationItem[] = [
    {
        Icon: SvgSetupIcon,
        displayName: 'Setup',
        route: 'setup',
        className: styles.rotated,
    },
    {
        Icon: SvgWorkspaceIcon,
        displayName: 'Workspace',
        route: 'settings',
    },
    {
        Icon: SvgTeamIcon,
        displayName: 'Team',
        route: 'team',
    },
    ...(process.env.REACT_APP_ONPREM !== 'true'
        ? [
              {
                  Icon: SvgCreditCardsIcon,
                  displayName: 'Billing',
                  route: 'billing',
              },
          ]
        : []),
    {
        Icon: HiOutlineSpeakerphone,
        displayName: 'Alerts',
        route: 'alerts',
    },
];

export const Sidebar = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const { state } = useSidebarContext();
    const { data, loading: loadingBillingDetails } = useGetBillingDetailsQuery({
        variables: { organization_id },
    });

    return (
        <>
            <StaticSidebar />
            <div
                className={classNames([
                    styles.sideBar,
                    state === SidebarState.Expanded ? styles.open : undefined,
                ])}
            >
                <div style={{ width: '100%' }}>
                    <WorkspaceDropdown />
                </div>
                {LEAD_NAVIGATION_ITEMS.map(({ displayName, Icon, route }) => (
                    <SidebarItem text={displayName} route={route} key={route}>
                        <div className={styles.iconWrapper}>
                            <Icon className={styles.icon} />
                        </div>
                    </SidebarItem>
                ))}
                <div className={styles.settingsDivider} />
                {END_NAVIGATION_ITEMS.map(
                    ({ displayName, Icon, route, className }) => (
                        <SidebarItem
                            text={displayName}
                            route={route}
                            key={route}
                        >
                            <div className={styles.iconWrapper}>
                                <Icon
                                    className={classNames(
                                        styles.icon,
                                        className
                                    )}
                                />
                            </div>
                        </SidebarItem>
                    )
                )}

                <div className={styles.bottomWrapper}>
                    <div className={styles.bottomSection}>
                        {!loadingBillingDetails &&
                        data?.billingDetails.meter !== undefined &&
                        data?.billingDetails.plan.quota !== undefined ? (
                            <CurrentUsageCard
                                currentUsage={data?.billingDetails.meter}
                                limit={data?.billingDetails.plan.quota}
                            />
                        ) : (
                            <></>
                        )}
                        <div className={styles.bottomContainer}>
                            <div className={styles.bottomLinkContainer}>
                                <Link
                                    to={'/about/terms'}
                                    className={styles.bottomLink}
                                >
                                    Terms of Service
                                </Link>
                                <Link
                                    className={styles.bottomLink}
                                    to={'/about/privacy'}
                                >
                                    Privacy Policy
                                </Link>
                            </div>
                            <Changelog className={styles.changelogButton} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const StaticSidebar = () => {
    return (
        <>
            <div
                className={classNames(
                    styles.staticSidebarWrapper,
                    styles.sideBar
                )}
            >
                <MiniWorkspaceIcon />
                {LEAD_NAVIGATION_ITEMS.map(
                    ({ Icon, displayName, route, className }) => (
                        <MiniSidebarItem
                            route={route}
                            text={displayName}
                            key={route}
                        >
                            <Icon
                                className={classNames(styles.icon, className)}
                                height="32px"
                                width="32px"
                            />
                        </MiniSidebarItem>
                    )
                )}
                <div className={styles.settingsDivider} />
                {END_NAVIGATION_ITEMS.map(
                    ({ Icon, displayName, route, className }) => (
                        <MiniSidebarItem
                            route={route}
                            text={displayName}
                            key={route}
                        >
                            <Icon
                                className={classNames(styles.icon, className)}
                                height="32px"
                                width="32px"
                            />
                        </MiniSidebarItem>
                    )
                )}
                <div className={styles.changelogContainer}>
                    <Changelog />
                </div>
            </div>
            <div style={{ paddingLeft: 62, height: '100%' }} />
        </>
    );
};

const SidebarItem: React.FC<{
    route: string;
    text: string;
}> = ({ route, text, children }) => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const { pathname } = useLocation();
    const page = pathname.split('/')[2] ?? '';
    const { demo } = useContext(DemoContext);
    return (
        <Link
            className={styles.row}
            to={demo ? '/' : `/${organization_id}/${route}`}
        >
            <div
                className={classNames([
                    styles.innerButton,
                    page.includes(route) && styles.selected,
                ])}
            >
                {children}
                <h3 className={styles.rowText}>{text}</h3>
            </div>
        </Link>
    );
};

const MiniSidebarItem: React.FC<{
    route: string;
    text: string;
}> = ({ route, text, children }) => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const { pathname } = useLocation();
    const page = pathname.split('/')[2] ?? '';
    const { demo } = useContext(DemoContext);
    return (
        <Link
            className={styles.miniRow}
            to={demo ? '/' : `/${organization_id}/${route}`}
        >
            <Tooltip title={text} placement="right" align={{ offset: [16, 0] }}>
                <div
                    className={classNames([
                        styles.miniSidebarIconWrapper,
                        page.includes(route) && styles.selected,
                    ])}
                >
                    {children}
                </div>
            </Tooltip>
        </Link>
    );
};
