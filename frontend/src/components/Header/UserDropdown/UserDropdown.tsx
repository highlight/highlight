import React from 'react';

import { Dropdown, Skeleton } from 'antd';
import { useQuery, gql } from '@apollo/client';
import { FaUserCircle } from 'react-icons/fa';
import { auth } from '../../../util/auth';
import { client } from '../../../util/graph';
import { FiLogOut } from 'react-icons/fi';

import styles from './UserDropdown.module.css';

export const UserDropdown = () => {
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
                    <>
                        <div className={styles.userCopy}>
                            <div className={styles.dropdownName}>
                                {a_data?.admin.name}
                            </div>
                            <div className={styles.dropdownEmail}>
                                {a_data?.admin.email}
                            </div>
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
                            <span className={styles.dropdownLogoutText}>
                                Logout
                            </span>
                            <FiLogOut className={styles.logoutIcon} />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
    return (
        <Dropdown
            overlay={menu}
            placement={'bottomRight'}
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
    );
};
