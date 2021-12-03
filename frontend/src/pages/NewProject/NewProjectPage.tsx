import ButtonLink from '@components/Button/ButtonLink/ButtonLink';
import Dot from '@components/Dot/Dot';
import Input from '@components/Input/Input';
import { useAppLoadingContext } from '@context/AppLoadingContext';
import {
    useCreateProjectMutation,
    useCreateWorkspaceMutation,
    useGetWorkspacesCountQuery,
} from '@graph/hooks';
import { useParams } from '@util/react-router/useParams';
import classNames from 'classnames';
import { H } from 'highlight.run';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Redirect } from 'react-router-dom';

import commonStyles from '../../Common.module.scss';
import Button from '../../components/Button/Button/Button';
import { CircularSpinner } from '../../components/Loading/Loading';
import { client } from '../../util/graph';
import styles from './NewProject.module.scss';

const NewProjectPage = () => {
    const { workspace_id } = useParams<{ workspace_id: string }>();
    const [error, setError] = useState<undefined | string>(undefined);
    const [name, setName] = useState<string>('');

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
    const { setIsLoading } = useAppLoadingContext();

    useEffect(() => {
        if (projectError || workspaceError) {
            setError(projectError?.message ?? workspaceError?.message);
        }
    }, [setError, projectError, workspaceError]);

    useEffect(() => {
        setIsLoading(false);
    }, [setIsLoading]);

    const { data, loading } = useGetWorkspacesCountQuery();

    // User is creating a workspace if workspace is not specified in the URL
    const isWorkspace = !workspace_id;

    const onSubmit = (e: { preventDefault: () => void }) => {
        e.preventDefault();
        if (isWorkspace) {
            createWorkspace({
                variables: {
                    name: name,
                },
            }).then(() => {
                client.cache.reset();
                H.track('CreateWorkspace', { name });
                setName('');
            });
        } else {
            createProject({
                variables: {
                    name: name,
                    workspace_id,
                },
            }).then(() => {
                H.track('CreateProject', { name });
                client.cache.reset();
                setName('');
            });
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

    return (
        <>
            <Helmet>
                <title>{isWorkspace ? 'New Workspace' : 'New Project'}</title>
            </Helmet>
            <div className={styles.box} key={workspace_id}>
                <form onSubmit={onSubmit}>
                    <h2
                        className={styles.title}
                    >{`Create a ${pageTypeCaps}`}</h2>
                    <p className={styles.subTitle}>
                        {isWorkspace &&
                            `This is usually your company name (e.g. Pied Piper, Hooli, Google, etc.) and can contain multiple projects.`}
                        {!isWorkspace &&
                            `Let's create a project! This is usually a single application (e.g. web front end, landing page, etc.).`}
                    </p>
                    {error && (
                        <div className={commonStyles.errorMessage}>
                            {`Error with ${pageType} name ` + error}
                        </div>
                    )}
                    <Input
                        placeholder={
                            isWorkspace ? 'Pied Piper, Inc' : 'Web Front End'
                        }
                        name="name"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                        }}
                        autoComplete="off"
                        autoFocus
                    />
                    <Button
                        trackingId={`Create${pageTypeCaps}`}
                        type="primary"
                        className={classNames(styles.button)}
                        block
                        htmlType="submit"
                        disabled={name.length === 0}
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
                    {isWorkspace && (
                        <ButtonLink
                            trackingId={`Enter${pageTypeCaps}`}
                            className={classNames(styles.button)}
                            to="/switch"
                            fullWidth
                            type="default"
                        >
                            Already Have a Workspace?{' '}
                            {!loading && !!data && (
                                <Dot className={styles.workspaceCount}>
                                    {data.workspaces_count}
                                </Dot>
                            )}
                        </ButtonLink>
                    )}
                </form>
            </div>
        </>
    );
};

export default NewProjectPage;
