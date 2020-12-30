import React, { useContext } from 'react';
import styles from './SearchSidebar.module.scss';
import classNames from 'classnames/bind';
import { Link, useParams, useLocation } from 'react-router-dom';
import { ReactComponent as SessionsIcon } from '../../static/sessions-icon.svg';
import { ReactComponent as SetupIcon } from '../../static/setup-icon.svg';
import { ReactComponent as WorkspaceIcon } from '../../static/workspace-icon.svg';

export const SearchSidebar = ({ open }: { open: boolean }) => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const { pathname } = useLocation();
    const page = pathname.split('/')[2] ?? '';
    return (
        <div
            className={classNames([
                styles.searchBar,
                open ? styles.searchBarOpen : styles.searchBarClosed
            ])}
        >
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
