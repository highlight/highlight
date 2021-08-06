import { Dropdown } from 'antd';
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import {
    useGetOrganizationQuery,
    useGetOrganizationsQuery,
} from '../../../graph/generated/hooks';
import { ReactComponent as CheckIcon } from '../../../static/check.svg';
import { ReactComponent as DownIcon } from '../../../static/chevron-down-icon.svg';
import { ReactComponent as PlusIcon } from '../../../static/plus.svg';
import { generateRandomColor } from '../../../util/color';
import styles from './WorkspaceDropdown.module.scss';

export const MiniWorkspaceIcon = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const { data: currentOrg } = useGetOrganizationQuery({
        variables: { id: organization_id },
    });
    return (
        <div>
            <div
                className={styles.workspaceIcon}
                style={{
                    backgroundColor: generateRandomColor(
                        currentOrg?.organization?.name ?? ''
                    ),
                }}
            >
                {currentOrg?.organization?.name[0]?.toUpperCase() ?? 'H'}
            </div>
        </div>
    );
};

export const WorkspaceDropdown = () => {
    const [visible, setVisible] = useState(false);
    const { organization_id } = useParams<{ organization_id: string }>();
    const { data } = useGetOrganizationsQuery();
    const { data: currentOrg } = useGetOrganizationQuery({
        variables: { id: organization_id },
    });
    const menu = (
        <div className={styles.dropdownMenu}>
            <div className={styles.dropdownInner}>
                {data?.organizations?.map((o) => (
                    <Link
                        to={`/${o?.id}/home`}
                        onClick={() => setVisible(false)}
                        key={o?.id}
                    >
                        <div className={styles.orgItem}>
                            <div
                                className={styles.workspaceIcon}
                                style={{
                                    backgroundColor: generateRandomColor(
                                        o?.name ?? ''
                                    ),
                                }}
                            >
                                {o?.name[0]?.toUpperCase() ?? 'H'}
                            </div>
                            <div className={styles.orgText}>{o?.name}</div>
                            {o?.id.toString() === organization_id ? (
                                <CheckIcon className={styles.plusIcon} />
                            ) : (
                                <></>
                            )}
                        </div>
                    </Link>
                ))}
                <Link className={styles.newOrgDiv} to="/new">
                    New Workspace
                    <PlusIcon className={styles.plusIcon} />
                </Link>
            </div>
        </div>
    );
    return (
        <Dropdown
            placement={'bottomLeft'}
            overlay={menu}
            onVisibleChange={(v) => setVisible(v)}
            trigger={['click', 'hover']}
        >
            <div
                className={styles.dropdownHandler}
                onClick={(e) => e.preventDefault()}
            >
                <div className={styles.orgNameWrapper}>
                    <div
                        className={styles.workspaceIcon}
                        style={{
                            backgroundColor: generateRandomColor(
                                currentOrg?.organization?.name ?? ''
                            ),
                        }}
                    >
                        {currentOrg?.organization?.name[0]?.toUpperCase() ??
                            'H'}
                    </div>
                    <h4 className={styles.orgNameText}>
                        {currentOrg?.organization?.name}
                    </h4>
                </div>
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
