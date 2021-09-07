import {
    DEMO_WORKSPACE_APPLICATION_ID,
    DEMO_WORKSPACE_PROXY_APPLICATION_ID,
} from '@components/DemoWorkspaceButton/DemoWorkspaceButton';
import { useApplicationContext } from '@routers/OrgRouter/ApplicationContext';
import { useParams } from '@util/react-router/useParams';
import classNames from 'classnames/bind';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CSSProperties } from 'react-router-dom/node_modules/@types/react';

import SvgAnnouncementIcon from '../../static/AnnouncementIcon';
import SvgBriefcase2Icon from '../../static/Briefcase2Icon';
import SvgBugIcon from '../../static/BugIcon';
import SvgCreditCardIcon from '../../static/CreditCardIcon';
import SvgHomeIcon from '../../static/HomeIcon';
import SvgPlugIcon from '../../static/PlugIcon';
import SvgSessionsIcon from '../../static/SessionsIcon';
import SvgUsersIcon from '../../static/UsersIcon';
import Changelog from '../Changelog/Changelog';
import { MiniWorkspaceIcon } from '../Header/WorkspaceDropdown/WorkspaceDropdown';
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
    const { currentApplication } = useApplicationContext();
    const isClickable = currentApplication?.id !== '0';
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
                            isClickable={isClickable}
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

const MiniSidebarItem: React.FC<{
    route: string;
    text: string;
    isClickable?: boolean;
}> = ({ route, text, isClickable, children }) => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const organizationIdRemapped =
        organization_id === DEMO_WORKSPACE_APPLICATION_ID
            ? DEMO_WORKSPACE_PROXY_APPLICATION_ID
            : organization_id;
    const { pathname } = useLocation();
    const page = pathname.split('/')[2] ?? '';

    let linkStyleOverride: CSSProperties | undefined;
    let divStyleOverride: CSSProperties | undefined;
    if (isClickable !== undefined && !isClickable) {
        linkStyleOverride = { pointerEvents: 'none' };
        divStyleOverride = { cursor: 'not-allowed' };
    }

    return (
        <div style={divStyleOverride}>
            <Link
                className={styles.miniRow}
                style={linkStyleOverride}
                to={`/${organizationIdRemapped}/${route}`}
            >
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
        </div>
    );
};
