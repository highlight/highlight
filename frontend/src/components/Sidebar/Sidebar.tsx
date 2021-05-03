import React, { useContext } from 'react';
import styles from './Sidebar.module.scss';
import { SidebarContext } from './SidebarContext';
import classNames from 'classnames/bind';
import { Link, useParams, useLocation } from 'react-router-dom';
import {
    MiniWorkspaceIcon,
    WorkspaceDropdown,
} from '../Header/WorkspaceDropdown/WorkspaceDropdown';
import { ReactComponent as SessionsIcon } from '../../static/sessions-icon.svg';
import { ReactComponent as ErrorsIcon } from '../../static/errors-icon.svg';
import { ReactComponent as SetupIcon } from '../../static/setup-icon.svg';
import { ReactComponent as WorkspaceIcon } from '../../static/workspace-icon.svg';
import { ReactComponent as TeamIcon } from '../../static/team-icon.svg';
import { ReactComponent as CreditCardIcon } from '../../static/credit-cards.svg';
import { DemoContext } from '../../DemoContext';
import { CurrentUsageCard } from '../Upsell/CurrentUsageCard/CurrentUsageCard';
import { useGetBillingDetailsQuery } from '../../graph/generated/hooks';
import Tooltip from '../Tooltip/Tooltip';

export const Sidebar = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const { openSidebar } = useContext(SidebarContext);
    const { data, loading: loadingBillingDetails } = useGetBillingDetailsQuery({
        variables: { organization_id },
    });

    return (
        <>
            <StaticSidebar />
            <div
                className={classNames([
                    styles.sideBar,
                    openSidebar ? styles.open : undefined,
                ])}
            >
                <div style={{ width: '100%', padding: '20px 20px 10px 20px' }}>
                    <WorkspaceDropdown />
                </div>
                <SidebarItem text="Sessions" route="sessions">
                    <div className={styles.iconWrapper}>
                        <SessionsIcon className={styles.icon} />
                    </div>
                </SidebarItem>
                <SidebarItem text="Errors" route="errors">
                    <div className={styles.iconWrapper}>
                        <ErrorsIcon
                            className={classNames(styles.icon, styles.rotated)}
                        />
                    </div>
                </SidebarItem>
                <div className={styles.settingsDivider} />
                <div className={styles.settingsTitle}>Settings</div>
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
                {process.env.REACT_APP_ONPREM === 'true' ? (
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
                        <Link to={'/about/terms'} className={styles.bottomLink}>
                            Terms of Service
                        </Link>
                        <Link
                            className={styles.bottomLink}
                            to={'/about/privacy'}
                        >
                            Privacy Policy
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};

const StaticSidebar = () => {
    return (
        <>
            <div className={styles.staticSidebarWrapper}>
                <MiniWorkspaceIcon />
                <MiniSidebarItem route="sessions" text="Sessions">
                    <SessionsIcon className={styles.icon} />
                </MiniSidebarItem>
                <MiniSidebarItem route="errors" text="Errors">
                    <ErrorsIcon
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
                <span className={styles.rowText}>{text}</span>
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
