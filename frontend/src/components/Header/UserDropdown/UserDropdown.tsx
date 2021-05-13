import { Dropdown, Skeleton } from 'antd';
import React, { useContext } from 'react';
import { FiLogOut } from 'react-icons/fi';

import { DemoContext } from '../../../DemoContext';
import { useGetAdminQuery } from '../../../graph/generated/hooks';
import { auth } from '../../../util/auth';
import { client } from '../../../util/graph';
import { AdminAvatar } from '../../Avatar/Avatar';
import styles from './UserDropdown.module.scss';

export const UserDropdown = () => {
    const { demo } = useContext(DemoContext);
    const {
        loading: a_loading,
        error: a_error,
        data: a_data,
    } = useGetAdminQuery({ skip: demo });

    const menu = (
        <div className={styles.dropdownMenu}>
            <div className={styles.dropdownInner}>
                {a_loading || a_error ? (
                    <Skeleton />
                ) : (
                    <>
                        <div className={styles.userInfoWrapper}>
                            <div className={styles.avatarWrapper}>
                                <AdminAvatar
                                    adminInfo={{
                                        name: a_data?.admin?.name,
                                        email: a_data?.admin?.email,
                                        photo_url:
                                            a_data?.admin?.photo_url ?? '',
                                    }}
                                    size={40}
                                />
                            </div>
                            <div className={styles.userCopy}>
                                <h4 className={styles.dropdownName}>
                                    {a_data?.admin?.name}
                                </h4>
                                <p className={styles.dropdownEmail}>
                                    {a_data?.admin?.email}
                                </p>
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
            overlay={demo ? <></> : menu}
            placement={'bottomRight'}
            onVisibleChange={() => {
                window.analytics.track('User Icon Hover', {
                    foo: 'bar',
                    bar: 'foo',
                });
            }}
        >
            <div className={styles.accountIconWrapper}>
                {a_data?.admin ? (
                    <AdminAvatar
                        adminInfo={{
                            name: a_data?.admin?.name,
                            email: a_data?.admin?.email,
                            photo_url: a_data?.admin?.photo_url ?? '',
                        }}
                        size={35}
                    />
                ) : (
                    <p>loading</p>
                )}
            </div>
        </Dropdown>
    );
};
