import classNames from 'classnames/bind';
import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';

import SvgAnnouncementIcon from '../../static/AnnouncementIcon';
import SvgBriefcase2Icon from '../../static/Briefcase2Icon';
import SvgBugIcon from '../../static/BugIcon';
import SvgCreditCardIcon from '../../static/CreditCardIcon';
import SvgHomeIcon from '../../static/HomeIcon';
import SvgPlugIcon from '../../static/PlugIcon';
import SvgSessionsIcon from '../../static/SessionsIcon';
import SvgUsersIcon from '../../static/UsersIcon';
import Changelog from '../Changelog/Changelog';
import {
    MiniWorkspaceIcon,
    WorkspaceDropdown,
} from '../Header/WorkspaceDropdown/WorkspaceDropdown';
import Tooltip from '../Tooltip/Tooltip';
import styles from './Sidebar.module.scss';

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
        Icon: SvgBugIcon,
        displayName: 'Errors',
        route: 'errors',
    },
];

const END_NAVIGATION_ITEMS: NavigationItem[] = [
    {
        Icon: SvgPlugIcon,
        displayName: 'Setup',
        route: 'setup',
    },
    {
        Icon: SvgBriefcase2Icon,
        displayName: 'Workspace',
        route: 'settings',
    },
    {
        Icon: SvgUsersIcon,
        displayName: 'Team',
        route: 'team',
    },
    ...(process.env.REACT_APP_ONPREM !== 'true'
        ? [
              {
                  Icon: SvgCreditCardIcon,
                  displayName: 'Billing',
                  route: 'billing',
              },
          ]
        : []),
    {
        Icon: SvgAnnouncementIcon,
        displayName: 'Alerts',
        route: 'alerts',
    },
];

export const Sidebar = () => {
    return (
        <>
            <StaticSidebar />
            <div className={classNames([styles.sideBar])}>
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
    return (
        <Link className={styles.row} to={`/${organization_id}/${route}`}>
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
    return (
        <Link className={styles.miniRow} to={`/${organization_id}/${route}`}>
            <Tooltip
                title={text}
                placement="right"
                align={{ offset: [16, 0] }}
                mouseEnterDelay={0}
            >
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
