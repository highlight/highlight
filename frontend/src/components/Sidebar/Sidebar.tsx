import { useAuthContext } from '@authentication/AuthContext';
import {
    DEMO_WORKSPACE_APPLICATION_ID,
    DEMO_WORKSPACE_PROXY_APPLICATION_ID,
} from '@components/DemoWorkspaceButton/DemoWorkspaceButton';
import { AdminRole } from '@graph/schemas';
import { useApplicationContext } from '@routers/OrgRouter/ApplicationContext';
import { isOnPrem } from '@util/onPrem/onPremUtils';
import { useParams } from '@util/react-router/useParams';
import classNames from 'classnames/bind';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import SvgAnnouncementIcon from '../../static/AnnouncementIcon';
import SvgBriefcase2Icon from '../../static/Briefcase2Icon';
import SvgBugIcon from '../../static/BugIcon';
import SvgCreditCardIcon from '../../static/CreditCardIcon';
import SvgHomeIcon from '../../static/HomeIcon';
import SvgPlugIcon from '../../static/PlugIcon';
import SvgSessionsIcon from '../../static/SessionsIcon';
import SvgUsersIcon from '../../static/UsersIcon';
import Changelog from '../Changelog/Changelog';
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

export const Sidebar = () => {
    const { currentProject } = useApplicationContext();
    const { admin } = useAuthContext();

    const END_NAVIGATION_ITEMS: NavigationItem[] = [
        {
            Icon: SvgPlugIcon,
            displayName: 'Setup',
            route: 'setup',
        },
        {
            Icon: SvgBriefcase2Icon,
            displayName: 'Project',
            route: 'settings',
        },
        {
            Icon: SvgUsersIcon,
            displayName: 'Team',
            route: 'team',
        },
        ...(!isOnPrem && admin?.role === AdminRole.Admin
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

    return (
        <>
            <div
                className={classNames(
                    styles.staticSidebarWrapper,
                    styles.sideBar
                )}
            >
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
                {currentProject?.id !== DEMO_WORKSPACE_APPLICATION_ID && (
                    <>
                        <div className={styles.settingsDivider} />
                        {END_NAVIGATION_ITEMS.map(
                            ({ Icon, displayName, route, className }) => (
                                <MiniSidebarItem
                                    route={route}
                                    text={displayName}
                                    key={route}
                                >
                                    <Icon
                                        className={classNames(
                                            styles.icon,
                                            className
                                        )}
                                        height="32px"
                                        width="32px"
                                    />
                                </MiniSidebarItem>
                            )
                        )}
                    </>
                )}
                <div className={styles.changelogContainer}>
                    <Changelog />
                </div>
            </div>
        </>
    );
};

const MiniSidebarItem: React.FC<{
    route: string;
    text: string;
}> = ({ route, text, children }) => {
    const { project_id } = useParams<{ project_id: string }>();
    const projectIdRemapped =
        project_id === DEMO_WORKSPACE_APPLICATION_ID
            ? DEMO_WORKSPACE_PROXY_APPLICATION_ID
            : project_id;
    const { pathname } = useLocation();
    const page = pathname.split('/')[2] ?? '';

    return (
        <Link className={styles.miniRow} to={`/${projectIdRemapped}/${route}`}>
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
