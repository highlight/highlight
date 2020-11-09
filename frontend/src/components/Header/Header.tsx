import React from 'react';
import { ReactComponent as HighlightLogoSmall } from '../../static/highlight-logo-small.svg';
import { Link } from 'react-router-dom';
import { TeamModal } from './TeamModal/TeamModal';
import { useParams } from 'react-router-dom';
import { WorkspaceDropdown } from './WorkspaceDropdown/WorkspaceDropdown';
import { UserDropdown } from './UserDropdown/UserDropdown';

import commonStyles from '../../Common.module.css';
import styles from './Header.module.css';

export const Header = () => {
    const { organization_id } = useParams();
    return (
        <div className={styles.header}>
            <Link
                className={styles.logoWrapper}
                to={`/${organization_id}/sessions`}
            >
                <HighlightLogoSmall className={styles.logo} />
                <span style={{ fontSize: 22, fontWeight: 400 }}>Highlight</span>
            </Link>
            <div className={styles.rightHeader}>
                <TeamModal />
                <Link
                    onClick={() => {
                        window.analytics.track('Sessions Click', {
                            foo: 'bar',
                            bar: 'foo',
                        });
                    }}
                    to={`/${organization_id}/sessions`}
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
                    to={`/${organization_id}`}
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
