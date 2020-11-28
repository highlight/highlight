import React, { useContext } from 'react';
import { ReactComponent as HighlightLogoSmall } from '../../static/highlight-logo-small.svg';
import { ReactComponent as Hamburger } from '../../static/hamburger.svg';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { WorkspaceDropdown } from './WorkspaceDropdown/WorkspaceDropdown';
import { UserDropdown } from './UserDropdown/UserDropdown';

import commonStyles from '../../Common.module.css';
import styles from './Header.module.css';
import { DemoContext } from '../../DemoContext';
import { SidebarContext } from '../Sidebar/SidebarContext';

export const Header = () => {
    const { organization_id } = useParams();
    const { demo } = useContext(DemoContext);
    const { setOpenSidebar, openSidebar } = useContext(SidebarContext);

    return (
        <>
            <div className={styles.header}>
                <div className={styles.logoWrapper}>
                    <Hamburger
                        className={styles.hamburger}
                        onClick={() => setOpenSidebar(!openSidebar)}
                    />
                    <Link
                        className={styles.homeLink}
                        to={demo ? '/' : `/${organization_id}/sessions`}
                    >
                        <HighlightLogoSmall className={styles.logo} />
                        <span className={styles.logoText}>Highlight</span>
                    </Link>
                </div>
                <div className={styles.rightHeader}>
                    <UserDropdown />
                </div>
            </div>
            <div className={styles.headerPlaceholder} />
        </>
    );
};
