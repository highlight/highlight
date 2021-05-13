import classNames from 'classnames/bind';
import React, { useContext, useRef } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';

import { DemoContext } from '../../DemoContext';
import { useGetBillingDetailsQuery } from '../../graph/generated/hooks';
import { ReactComponent as CreditCardIcon } from '../../static/credit-cards.svg';
import SvgErrorsIcon from '../../static/ErrorsIcon';
import { ReactComponent as SessionsIcon } from '../../static/sessions-icon.svg';
import { ReactComponent as SetupIcon } from '../../static/setup-icon.svg';
import { ReactComponent as TeamIcon } from '../../static/team-icon.svg';
import { ReactComponent as WorkspaceIcon } from '../../static/workspace-icon.svg';
import Changelog from '../Changelog/Changelog';
import {
    MiniWorkspaceIcon,
    WorkspaceDropdown,
} from '../Header/WorkspaceDropdown/WorkspaceDropdown';
import Tooltip from '../Tooltip/Tooltip';
import { CurrentUsageCard } from '../Upsell/CurrentUsageCard/CurrentUsageCard';
import styles from './Sidebar.module.scss';
import { SidebarState, useSidebarContext } from './SidebarContext';

export const Sidebar = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const { state, setState } = useSidebarContext();
    const { data, loading: loadingBillingDetails } = useGetBillingDetailsQuery({
        variables: { organization_id },
    });

    return (
        <>
            <StaticSidebar />
            <div
                className={classNames([
                    styles.sideBar,
                    state === SidebarState.Expanded ||
                    state === SidebarState.TemporarilyExpanded
                        ? styles.open
                        : undefined,
                ])}
                onMouseLeave={() => {
                    if (state === SidebarState.TemporarilyExpanded) {
                        setState(SidebarState.Collapsed);
                    }
                }}
            >
                <div style={{ width: '100%' }}>
                    <WorkspaceDropdown />
                </div>
                <SidebarItem text="Sessions" route="sessions">
                    <div className={styles.iconWrapper}>
                        <SessionsIcon className={styles.icon} />
                    </div>
                </SidebarItem>
                <SidebarItem text="Errors" route="errors">
                    <div className={styles.iconWrapper}>
                        <SvgErrorsIcon
                            className={classNames(styles.icon, styles.rotated)}
                        />
                    </div>
                </SidebarItem>
                <div className={styles.settingsDivider} />
                <SidebarItem text="Setup" route="setup">
                    <div className={styles.iconWrapper}>
                        <SetupIcon
                            className={classNames(styles.icon, styles.rotated)}
                        />
                    </div>
                </SidebarItem>
                <SidebarItem text="Workspace" route="settings">
                    <div className={styles.iconWrapper}>
                        <WorkspaceIcon className={styles.icon} />
                    </div>
                </SidebarItem>
                <SidebarItem text="Team" route="team">
                    <div className={styles.iconWrapper}>
                        <TeamIcon className={styles.icon} />
                    </div>
                </SidebarItem>
                {process.env.REACT_APP_ONPREM !== 'true' ? (
                    <SidebarItem text="Billing" route="billing">
                        <div className={styles.iconWrapper}>
                            <CreditCardIcon className={styles.icon} />
                        </div>
                    </SidebarItem>
                ) : (
                    <> </>
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
    const { setState } = useSidebarContext();
    const timerId = useRef<ReturnType<typeof setTimeout> | null>(null);

    return (
        <>
            <div
                className={classNames(
                    styles.staticSidebarWrapper,
                    styles.sideBar
                )}
                onMouseEnter={() => {
                    const id = setTimeout(() => {
                        setState(SidebarState.TemporarilyExpanded);
                    }, 1000);
                    timerId.current = id;
                }}
                onMouseLeave={() => {
                    if (timerId.current) {
                        clearTimeout(timerId.current);
                        timerId.current = null;
                    }
                }}
            >
                <MiniWorkspaceIcon />
                <MiniSidebarItem route="sessions" text="Sessions">
                    <SessionsIcon className={styles.icon} />
                </MiniSidebarItem>
                <MiniSidebarItem route="errors" text="Errors">
                    <SvgErrorsIcon
                        className={classNames(styles.icon, styles.rotated)}
                    />
                </MiniSidebarItem>
                <div className={styles.settingsDivider} />
                <MiniSidebarItem route="setup" text="Setup">
                    <SetupIcon
                        className={classNames(styles.icon, styles.rotated)}
                    />
                </MiniSidebarItem>
                <MiniSidebarItem route="settings" text="Workspace">
                    <WorkspaceIcon className={styles.icon} />
                </MiniSidebarItem>
                <MiniSidebarItem route="team" text="Team">
                    <TeamIcon className={styles.icon} />
                </MiniSidebarItem>
                <MiniSidebarItem route="billing" text="Billing">
                    <CreditCardIcon className={styles.icon} />
                </MiniSidebarItem>
                <div
                    className={styles.changelogContainer}
                    onMouseEnter={() => {
                        if (timerId.current) {
                            clearTimeout(timerId.current);
                            timerId.current = null;
                        }
                    }}
                >
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
