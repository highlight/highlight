import {
    useCreateProjectMutation,
    useCreateWorkspaceMutation,
    useGetWorkspaceQuery,
} from '@graph/hooks';
import { useParams } from '@util/react-router/useParams';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Redirect } from 'react-router-dom';

import commonStyles from '../../Common.module.scss';
import Button from '../../components/Button/Button/Button';
import { CircularSpinner, LoadingBar } from '../../components/Loading/Loading';
import { client } from '../../util/graph';
import styles from './NewProject.module.scss';

type Inputs = {
    name: string;
};

const NewProjectPage = () => {
    const { workspace_id } = useParams<{ workspace_id: string }>();
    const { data, loading } = useGetWorkspaceQuery({
        variables: {
            id: workspace_id,
        },
        skip: !workspace_id,
    });

    const { register, handleSubmit, errors, setError } = useForm<Inputs>();
    const [
        createProject,
        { loading: projectLoading, data: projectData, error: projectError },
    ] = useCreateProjectMutation();
    const [
        createWorkspace,
        {
            loading: workspaceLoading,
            data: workspaceData,
            error: workspaceError,
        },
    ] = useCreateWorkspaceMutation();

    const history = useHistory();

    useEffect(() => {
        if (projectError || workspaceError) {
            setError('name', {
                type: 'request error',
                message: projectError?.message ?? workspaceError?.message,
            });
        }
    }, [setError, projectError, workspaceError]);

    // User is creating a workspace if workspace is not specified in the URL
    const isWorkspace = !workspace_id;

    const onSubmit = (data: Inputs) => {
        if (isWorkspace) {
            createWorkspace({
                variables: {
                    name: data.name,
                },
            }).then(() => client.cache.reset());
        } else {
            createProject({
                variables: {
                    name: data.name,
                    workspace_id,
                },
            }).then(() => client.cache.reset());
        }
    };

    // When a workspace is created, redirect to the 'create project' page
    if (isWorkspace && workspaceData?.createWorkspace?.id) {
        return <Redirect to={`/w/${workspaceData.createWorkspace.id}/new`} />;
    }

    // When a project is created, redirect to the 'project setup' page
    if (projectData?.createProject?.id) {
        return <Redirect to={`/${projectData.createProject.id}/setup`} />;
    }

    const pageType = isWorkspace ? 'workspace' : 'project';
    const pageTypeCaps = isWorkspace ? 'Workspace' : 'Project';

    if (loading) {
        return <LoadingBar />;
    }

    return (
        <div className={styles.box} key={workspace_id}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <h2 className={styles.title}>{`Create a ${pageTypeCaps}`}</h2>
                <p className={styles.subTitle}>
                    {isWorkspace &&
                        `A workspace is a group of projects that can share team members. If you want to use an existing workspace that you have access to, you can `}
                    {isWorkspace && (
                                                               <span
                        onClick={() => history.push('/switch'))}
                        className={
                            styles.loginStateSwitcher
                        }
                    >
                        Create an account.
                    </span> href="/switch" rel="noreferrer">
                            Switch Workspaces
                        </a>
                    )}
                    {!isWorkspace &&
                        `This project will be added to the '${
                            data?.workspace!.name
                        }' workspace. Enter the name of your project and you'll be good to go!`}
                </p>
                <div className={commonStyles.errorMessage}>
                    {errors.name &&
                        `Error with ${pageType} name ` + errors.name.message}
                </div>
                <input
                    placeholder={`${pageTypeCaps} Name`}
                    name="name"
                    ref={register({ required: true })}
                    className={commonStyles.input}
                />
                <Button
                    trackingId={`Create${pageTypeCaps}`}
                    type="primary"
                    className={commonStyles.submitButton}
                    htmlType="submit"
                >
                    {projectLoading || workspaceLoading ? (
                        <CircularSpinner
                            style={{
                                fontSize: 18,
                                color: 'var(--text-primary-inverted)',
                            }}
                        />
                    ) : (
                        `Create ${pageTypeCaps}`
                    )}
                </Button>
            </form>
        </div>
    );
};

export default NewProjectPage;
