import React, { useContext } from 'react';
import { ReactComponent as HighlightLogoSmall } from '../../static/highlight-logo-small.svg';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { WorkspaceDropdown } from './WorkspaceDropdown/WorkspaceDropdown';
import { UserDropdown } from './UserDropdown/UserDropdown';

import commonStyles from '../../Common.module.css';
import styles from './Header.module.css';
import { DemoContext } from '../../DemoContext';

export const Header = () => {
    const { organization_id } = useParams();
    const { demo } = useContext(DemoContext);

    return (
        <div className={styles.header}>
            <Link
                className={styles.logoWrapper}
                to={demo ? '/' : `/${organization_id}/sessions`}
            >
                <HighlightLogoSmall className={styles.logo} />
                <span style={{ fontSize: 22, fontWeight: 400 }}>Highlight</span>
            </Link>
            <div className={styles.rightHeader}>
                <Link
                    onClick={() => {
                        window.analytics.track('Settings Click', {
                            foo: 'bar',
                            bar: 'foo',
                        });
                    }}
                    to={demo ? '#' : `/${organization_id}/settings`}
                    className={commonStyles.headerLink}
                >
                    Settings
                </Link>
                <Link
                    onClick={() => {
                        window.analytics.track('Team Click', {
                            foo: 'bar',
                            bar: 'foo',
                        });
                    }}
                    to={demo ? '#' : `/${organization_id}/team`}
                    className={commonStyles.headerLink}
                >
                    Team
                </Link>
                <Link
                    onClick={() => {
                        window.analytics.track('Sessions Click', {
                            foo: 'bar',
                            bar: 'foo',
                        });
                    }}
                    to={demo ? '#' : `/${organization_id}/sessions`}
                    className={commonStyles.headerLink}
                >
                    Sessions
                </Link>
                <Link
                    onClick={() => {
                        window.analytics.track('Setup Click', {
                            foo: 'bar',
                            bar: 'foo',
                        });
                    }}
                    to={demo ? '#' : `/${organization_id}`}
                    className={commonStyles.headerLink}
                >
                    Setup
                </Link>
                <WorkspaceDropdown />
                <UserDropdown />
            </div>
        </div>
    );
};
