import { LoadingBar } from '@components/Loading/Loading';
import Select from '@components/Select/Select';
import { useGetWorkspacesQuery } from '@graph/hooks';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { StringParam, useQueryParam } from 'use-query-params';

import styles from './SwitchWorkspace.module.scss';

const SwitchWorkspace = () => {
    const [currentWorkspaceId] = useQueryParam(
        'current_workspace',
        StringParam
    );

    const history = useHistory();
    const { loading, data } = useGetWorkspacesQuery();

    if (loading) {
        return <LoadingBar />;
    }

    const workspaceOptions = data!.workspaces?.map((workspace) => ({
        value: workspace?.id,
        displayValue: workspace?.name,
        id: workspace?.id,
    }));

    const currentWorkspace = workspaceOptions?.find(
        (workspace) => workspace.id === currentWorkspaceId
    );

    return (
        <div className={styles.box}>
            <form>
                <h2 className={styles.title}>{`Select Workspace`}</h2>
                <p className={styles.subTitle}>Choose a workspace to use.</p>
                <Select
                    className={styles.fullWidth}
                    options={workspaceOptions}
                    onChange={(workspaceId) => {
                        history.push(`/w/${workspaceId}`);
                    }}
                    value={currentWorkspace?.value}
                    placeholder="Choose a Workspace"
                />
            </form>
        </div>
    );
};

export default SwitchWorkspace;
