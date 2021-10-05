import { LoadingBar } from '@components/Loading/Loading';
import Select from '@components/Select/Select';
import { useGetWorkspacesQuery } from '@graph/hooks';
import { useParams } from '@util/react-router/useParams';
import React from 'react';
import { useHistory } from 'react-router-dom';

import styles from './NewProject.module.scss';

type Inputs = {
    name: string;
};

const SwitchWorkspace = () => {
    const history = useHistory();
    const { workspace_id } = useParams<{ workspace_id: string }>();
    const { loading, data } = useGetWorkspacesQuery();

    if (loading) {
        return <LoadingBar />;
    }

    const workspaceOptions = data!.workspaces
        ?.map((workspace) => ({
            value: workspace?.id,
            displayValue: workspace?.name,
            id: workspace?.id,
        }))
        .concat([
            {
                value: '-1',
                displayValue: 'Create New Workspace',
                id: '-1',
            },
        ]);

    return (
        <div className={styles.box} key={workspace_id}>
            <form>
                <h2
                    className={styles.title}
                >{`Select or Create a Workspace`}</h2>
                <p className={styles.subTitle}>Select a workspace</p>
                <Select
                    // onSearch={handleUserPropertiesSearch}
                    options={workspaceOptions}
                    mode="multiple"
                    onChange={(workspaceId) => {
                        history.push(`/w/${workspaceId}`);
                    }}
                />
            </form>
        </div>
    );
};

export default SwitchWorkspace;
