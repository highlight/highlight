import ButtonLink from '@components/Button/ButtonLink/ButtonLink';
import { LoadingBar } from '@components/Loading/Loading';
import Select from '@components/Select/Select';
import { useGetWorkspacesQuery } from '@graph/hooks';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { StringParam, useQueryParam } from 'use-query-params';

import styles from './SwitchWorkspace.module.scss';

type Inputs = {
    name: string;
};

const SwitchWorkspace = () => {
    const [workspaceId] = useQueryParam('current_workspace', StringParam);

    const history = useHistory();
    const { loading, data } = useGetWorkspacesQuery();

    if (loading) {
        return <LoadingBar />;
    }

    const newWorkspaceOption = {
        value: '-1',
        displayValue: 'Create New Workspace',
        id: '-1',
    };

    const workspaceOptions = data!.workspaces?.map((workspace) => ({
        value: workspace?.id,
        displayValue: workspace?.name,
        id: workspace?.id,
    }));

    return (
        <div className={styles.box}>
            <form>
                <h2 className={styles.title}>{`Select a Workspace`}</h2>
                <Select
                    className={styles.fullWidth}
                    options={workspaceOptions}
                    onChange={(workspaceId) => {
                        history.push(`/w/${workspaceId}`);
                    }}
                />
                <ButtonLink to={`/new`} trackingId="CreateNewWorkspace">
                    Create a New Workspace
                </ButtonLink>
            </form>
        </div>
    );
};

export default SwitchWorkspace;
