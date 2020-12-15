import React, { useContext } from 'react';
import styles from './Sidebar.module.scss';
import { SidebarContext } from './SidebarContext';
import classNames from 'classnames/bind';
import { Link, useParams, useLocation } from 'react-router-dom';
import { WorkspaceDropdown } from '../Header/WorkspaceDropdown/WorkspaceDropdown';
import { ReactComponent as SessionsIcon } from '../../static/sessions-icon.svg';
import { ReactComponent as SetupIcon } from '../../static/setup-icon.svg';
import { ReactComponent as WorkspaceIcon } from '../../static/workspace-icon.svg';
import { ReactComponent as TeamIcon } from '../../static/team-icon.svg';
import { DemoContext } from '../../DemoContext';

export const Sidebar = () => {
    const { organization_id } = useParams();
    const { pathname } = useLocation();
    const { openSidebar } = useContext(SidebarContext);
    const { demo } = useContext(DemoContext);
    const page = pathname.split('/')[2] ?? '';
    return (
        <div
            className={classNames([
                styles.sideBar,
                openSidebar ? styles.open : undefined,
            ])}
        >
            <div style={{ width: '100%', padding: 20 }}>
                <WorkspaceDropdown />
            </div>
            <Link
                className={classNames([
                    styles.row,
                    page.includes('sessions') && styles.selected,
                ])}
                to={demo ? '/' : `/${organization_id}/sessions`}
            >
                <SessionsIcon />
                <span className={styles.rowText}>Sessions</span>
            </Link>
            <Link
                className={classNames([styles.row, !page && styles.selected])}
                to={demo ? '/' : `/${organization_id}/setup`}
            >
                <SetupIcon />
                <span className={styles.rowText}>Setup</span>
            </Link>
            <Link
                className={classNames([
                    styles.row,
                    page.includes('settings') && styles.selected,
                ])}
                to={demo ? '/' : `/${organization_id}/settings`}
            >
                <WorkspaceIcon />
                <span className={styles.rowText}>Workspace</span>
            </Link>
            <Link
                className={classNames([
                    styles.row,
                    page.includes('team') && styles.selected,
                ])}
                to={demo ? '/' : `/${organization_id}/team`}
            >
                <TeamIcon />
                <span className={styles.rowText}>Team</span>
            </Link>
            {/* <Link
                className={classNames([
                    styles.row,
                    page.includes('billing') && styles.selected,
                ])}
                to={demo ? '/' : `/${organization_id}/billing`}
            >
                <span className={styles.rowText}>Billing</span>
            </Link> */}
            <div
                style={{
                    flexGrow: 1,
                    height: '100%',
                    position: 'relative',
                    width: '100%',
                    padding: 20,
                }}
            >
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
                        to={{ pathname: 'https://www.highlight.run/privacy' }}
                        target="_blank"
                    >
                        Privacy Policy
                    </Link>
                </div>
            </div>
        </div>
    );
};
