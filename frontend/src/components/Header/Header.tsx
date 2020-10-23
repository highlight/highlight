import React from 'react';
import { ReactComponent as HighlightLogo } from '../../static/highlight-logo.svg';
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
            <div className={styles.logoWrapper}>
                <HighlightLogo className={styles.logo} />
            </div>
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
