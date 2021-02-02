import React, { useContext, useState } from 'react';
import { Dropdown } from 'antd';
import { useParams, Link } from 'react-router-dom';
import { ReactComponent as DownIcon } from '../../../static/chevron-down.svg';
import { ReactComponent as PlusIcon } from '../../../static/plus.svg';
import { ReactComponent as CheckIcon } from '../../../static/check.svg';

import styles from './WorkspaceDropdown.module.scss';
import { DemoContext } from '../../../DemoContext';
import {
    useGetOrganizationQuery,
    useGetOrganizationsQuery,
} from '../../../graph/generated/hooks';

export const WorkspaceDropdown = () => {
    const [visible, setVisible] = useState(false);
    const { demo } = useContext(DemoContext);
    const { organization_id } = useParams<{ organization_id: string }>();
    const { data } = useGetOrganizationsQuery({ skip: demo });
    const { data: currentOrg } = useGetOrganizationQuery({
        variables: { id: organization_id },
    });
    const menu = (
        <div className={styles.dropdownMenu}>
            <div className={styles.dropdownInner}>
                {data?.organizations?.map((o) => (
                    <Link
                        to={`/${o?.id}/setup`}
                        onClick={() => setVisible(false)}
                        key={o?.id}
                    >
                        <div className={styles.orgItem}>
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
            overlay={demo ? <></> : menu}
            onVisibleChange={(v) => setVisible(v)}
        >
            <div
                className={styles.dropdownHandler}
                onClick={(e) => e.preventDefault()}
            >
                <div className={styles.orgNameText}>
                    {demo ? 'Highlight' : currentOrg?.organization?.name}
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
