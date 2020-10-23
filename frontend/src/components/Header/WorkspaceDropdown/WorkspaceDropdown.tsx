import React, { useEffect } from 'react';
import { Dropdown, Skeleton } from 'antd';
import { useQuery, gql } from '@apollo/client';
import { useParams } from 'react-router-dom';

import styles from './WorkspaceDropdown.module.css';

export const WorkspaceDropdown = () => {
    const { organization_id } = useParams();
    const { loading, error, data } = useQuery<{
        organizations: { id: number; name: string };
    }>(gql`
        query GetOrganizations {
            organizations {
                id
                name
            }
        }
    `);
    useEffect(() => {}, [organization_id]);
    console.log(organization_id);
    console.log(data);
    const menu = (
        <div className={styles.dropdownMenu}>
            <div className={styles.dropdownInner}>
                <div className={styles.dropdownLogout}>
                    <span className={styles.dropdownLogoutText}>Logout</span>
                </div>
            </div>
        </div>
    );
    return (
        <Dropdown overlay={menu}>
            <div className={styles.dropdownHandler} onClick={(e) => e.preventDefault()}>Hover me</div>
        </Dropdown>
    );
};
