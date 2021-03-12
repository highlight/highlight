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

export const Sidebar = () => {
    const { openSidebar } = useContext(SidebarContext);
    return (
        <>
            <StaticSidebar />
            <div
                className={classNames([
                    styles.sideBar,
                    openSidebar ? styles.open : undefined,
                ])}
            >
                <div style={{ width: '100%', padding: '20px 20px 5px 20px' }}>
                    <WorkspaceDropdown />
                </div>
                <SidebarItem text="Sessions" route="sessions">
                    <div className={styles.iconWrapper}>
                        <SessionsIcon className={styles.icon} />
                    </div>
                </SidebarItem>
                <SidebarItem text="Errors" route="errors">
                    <div className={styles.iconWrapper}>
                        <ErrorsIcon className={styles.icon} />
                    </div>
                </SidebarItem>
                <SidebarItem text="Setup" route="setup">
                    <div className={styles.iconWrapper}>
                        <SetupIcon className={styles.icon} />
                    </div>
                </SidebarItem>
                <div className={styles.settingsDivider} />
                <div className={styles.settingsTitle}>Settings</div>
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
                <SidebarItem text="Billing" route="billing">
                    <div className={styles.iconWrapper}>
                        <CreditCardIcon className={styles.icon} />
                    </div>
                </SidebarItem>
                <div className={styles.bottomWrapper}>
                    <div className={styles.bottomSection}>
                        <Link
                            to={{
                                pathname:
                                    'https://www.highlight.run/terms-of-service',
                            }}
                            className={styles.bottomLink}
                            target="_blank"
                        >
                            Terms of Service
                        </Link>
                        <Link
                            className={styles.bottomLink}
                            to={{
                                pathname: 'https://www.highlight.run/privacy',
                            }}
                            target="_blank"
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
            <div
                style={{
                    position: 'fixed',
                    top: 80,
                    width: 64,
                    height: 'calc(100vh - 80px)',
                    borderRight: '1px solid #eaeaea',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 30,
                    backgroundColor: 'white',
                    alignItems: 'center',
                }}
            >
                <MiniWorkspaceIcon />
                <MiniSidebarItem route="sessions">
                    <SessionsIcon className={styles.icon} />
                </MiniSidebarItem>
                <MiniSidebarItem route="errors">
                    <ErrorsIcon className={styles.icon} />
                </MiniSidebarItem>
                <MiniSidebarItem route="setup">
                    <SetupIcon className={styles.icon} />
                </MiniSidebarItem>
                <div className={styles.settingsDivider} />
                <MiniSidebarItem route="settings">
                    <WorkspaceIcon className={styles.icon} />
                </MiniSidebarItem>
                <MiniSidebarItem route="team">
                    <TeamIcon className={styles.icon} />
                </MiniSidebarItem>
                <MiniSidebarItem route="billing">
                    <CreditCardIcon className={styles.icon} />
                </MiniSidebarItem>
            </div>
            <div style={{ width: 64, height: '100%' }} />
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
}> = ({ route, children }) => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const { pathname } = useLocation();
    const page = pathname.split('/')[2] ?? '';
    const { demo } = useContext(DemoContext);
    return (
        <Link
            className={styles.miniRow}
            to={demo ? '/' : `/${organization_id}/${route}`}
        >
            <div
                className={classNames([
                    styles.miniSidebarIconWrapper,
                    page.includes(route) && styles.selected,
                ])}
            >
                {children}
            </div>
        </Link>
    );
};
