import React, { useState } from 'react';
import { Dropdown } from 'antd';
import { useQuery, gql } from '@apollo/client';
import { useParams, Link } from 'react-router-dom';
import { ReactComponent as DownIcon } from '../../../static/chevron-down.svg';
import { ReactComponent as PlusIcon } from '../../../static/plus.svg';
import { ReactComponent as CheckIcon } from '../../../static/check.svg';

import styles from './WorkspaceDropdown.module.css';

export const WorkspaceDropdown = () => {
    const [visible, setVisible] = useState(false);
    const { organization_id } = useParams();
    const { data } = useQuery<{
        organizations: Array<{ id: number; name: string }>;
    }>(gql`
        query GetOrganizations {
            organizations {
                id
                name
            }
        }
    `);
    const menu = (
        <div className={styles.dropdownMenu}>
            <div className={styles.dropdownInner}>
                {data?.organizations.map((o) => (
                    <Link
                        to={`/${o.id}/setup`}
                        onClick={() => setVisible(false)}
                    >
                        <div className={styles.orgItem}>
                            <div className={styles.orgText}>{o.name}</div>
                            {o.id === organization_id ? (
                                <CheckIcon className={styles.plusIcon} />
                            ) : (
                                <></>
                            )}
                        </div>
                    </Link>
                ))}
                <div className={styles.newOrgDiv}>
                    New Workspace
                    <PlusIcon className={styles.plusIcon} />
                </div>
            </div>
        </div>
    );
    return (
        <Dropdown
            placement={'bottomLeft'}
            overlay={menu}
            onVisibleChange={(v) => setVisible(v)}
        >
            <div
                className={styles.dropdownHandler}
                onClick={(e) => e.preventDefault()}
            >
                {
                    data?.organizations.find((o) => o.id === organization_id)
                        ?.name
                }
                <DownIcon
                    className={styles.icon}
                    style={{
                        transform: visible ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                />
            </div>
        </Dropdown>
    );
};
