import React from 'react';
import { Dropdown, Skeleton } from 'antd';
import { FiLogOut } from 'react-icons/fi';
import { ReactComponent as HighlightLogo } from '../../static/highlight-logo.svg';
import { Link } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import { TeamModal } from '../../pages/TeamModal/TeamModal';
import { useParams } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import { auth } from '../../util/auth';
import { client } from '../../util/graph';

import commonStyles from '../../Common.module.css';
import styles from './Header.module.css';

export const Header = () => {
    const { organization_id } = useParams();
    const { loading: a_loading, error: a_error, data: a_data } = useQuery<{
        admin: { id: string; name: string; email: string };
    }>(gql`
        query GetAdmin {
            admin {
                id
                name
                email
            }
        }
    `);
    const menu = (
        <div className={styles.dropdownMenu}>
            <div className={styles.dropdownInner}>
                {a_loading || a_error ? (
                    <Skeleton />
                ) : (
                    <div>
                        <div className={styles.dropdownName}>
                            {a_data?.admin.name}
                        </div>
                        <div className={styles.dropdownEmail}>
                            {a_data?.admin.email}
                        </div>
                        <div
                            className={styles.dropdownLogout}
                            onClick={async () => {
                                try {
                                    auth.signOut();
                                } catch (e) {
                                    console.log(e);
                                }
                                client.cache.reset();
                            }}
                        >
                            <FiLogOut />
                            <span className={styles.dropdownLogoutText}>
                                Logout
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

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
                <Dropdown
                    overlay={menu}
                    placement={'bottomRight'}
                    arrow
                    onVisibleChange={() => {
                        window.analytics.track('User Icon Hover', {
                            foo: 'bar',
                            bar: 'foo',
                        });
                    }}
                >
                    <div className={styles.accountIconWrapper}>
                        <FaUserCircle className={styles.accountIcon} />
                    </div>
                </Dropdown>
            </div>
        </div>
    );
};
