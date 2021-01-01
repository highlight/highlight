import React, { useEffect, useContext } from 'react';
import { ReactComponent as HighlightLogoSmall } from '../../static/highlight-logo-small.svg';
import { ReactComponent as Hamburger } from '../../static/hamburger.svg';
import { Link, withRouter } from 'react-router-dom';
import { useParams, RouteComponentProps } from 'react-router-dom';
import { UserDropdown } from './UserDropdown/UserDropdown';
import { FaSearch } from 'react-icons/fa';
import * as Mousetrap from 'mousetrap';

import styles from './Header.module.scss';
import { DemoContext } from '../../DemoContext';
import { SidebarContext } from '../Sidebar/SidebarContext';
import classNames from 'classnames/bind';

const Head: React.FunctionComponent<RouteComponentProps> = ({ history }) => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const { demo } = useContext(DemoContext);
    const { setOpenSidebar, openSidebar } = useContext(SidebarContext);

    useEffect(() => {
        const keys = ['command+k', 'ctrl+k'];
        const method = () => {
            history.push(`/${organization_id}/sessions`);
        };

        // @ts-ignore
        Mousetrap.bind(keys, method);

        return () => {
            // @ts-ignore
            Mousetrap.unbind(keys, method);
        };
    }, [history, organization_id]);

    return (
        <>
            <div className={styles.header}>
                <div className={styles.logoWrapper}>
                    <Hamburger
                        className={styles.hamburger}
                        onClick={() => {
                            console.log('clicked');
                            setOpenSidebar(!openSidebar)
                        }}
                        style={{
                            transform: openSidebar
                                ? 'rotate(-180deg)'
                                : 'rotate(0deg)',
                        }}
                    />
                    <Link
                        className={styles.homeLink}
                        to={demo ? '/' : `/${organization_id}/sessions`}
                    >
                        <HighlightLogoSmall className={styles.logo} />
                        <span className={styles.logoText}>Highlight</span>
                    </Link>
                </div>
                <div className={styles.searchWrapper}>
                    <Link
                        className={styles.searchBar}
                        to={`/${organization_id}/sessions`}
                    >
                        <FaSearch style={{ marginRight: 8 }} />
                        <span className={styles.dontSelect}>Search for sessions</span>
                        <div className={classNames(styles.commandWrapper, styles.dontSelect)}>
                            <div className={styles.commandContainer}>⌘</div>
                            <div className={styles.commandContainer}>K</div>
                        </div>
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

export const Header = withRouter(Head);
