import Input from '@components/Input/Input';
import {
    useEditProjectMutation,
    useEditWorkspaceMutation,
    useGetProjectOrWorkspaceQuery,
} from '@graph/hooks';
import { namedOperations } from '@graph/operations';
import { useParams } from '@util/react-router/useParams';
import { message } from 'antd';
import classNames from 'classnames/bind';
import React from 'react';
import { useForm } from 'react-hook-form';

import commonStyles from '../../../Common.module.scss';
import Button from '../../../components/Button/Button/Button';
import {
    CircularSpinner,
    LoadingBar,
} from '../../../components/Loading/Loading';
import styles from './FieldsForm.module.scss';

type Inputs = {
    name: string;
    email: string;
};

export const FieldsForm = () => {
    const { project_id, workspace_id } = useParams<{
        project_id: string;
        workspace_id: string;
    }>();
    const isWorkspace = !!workspace_id;
    const { register, handleSubmit, errors } = useForm<Inputs>();
    const { data, loading } = useGetProjectOrWorkspaceQuery({
        variables: {
            project_id,
            workspace_id,
            is_workspace: isWorkspace,
        },
    });

    const [
        editProject,
        { loading: editProjectLoading },
    ] = useEditProjectMutation({
        refetchQueries: [
            namedOperations.Query.GetProjects,
            namedOperations.Query.GetProject,
        ],
    });

    const [
        editWorkspace,
        { loading: editWorkspaceLoading },
    ] = useEditWorkspaceMutation();

    const onSubmit = (inputs: Inputs) => {
        if (isWorkspace) {
            editWorkspace({
                variables: {
                    id: workspace_id,
                    name: inputs.name,
                },
            }).then(() => {
                message.success('Updated workspace fields!', 5);
            });
        } else {
            editProject({
                variables: {
                    id: project_id,
                    name: inputs.name,
                    billing_email: inputs.email,
                },
            }).then(() => {
                message.success('Updated project fields!', 5);
            });
        }
    };

    if (loading) {
        return <LoadingBar />;
    }

    const editingObj = isWorkspace ? data?.workspace : data?.project;

    return (
        <form onSubmit={handleSubmit(onSubmit)} key={project_id}>
            <div className={styles.fieldRow}>
                <label className={styles.fieldKey}>Name</label>
                <Input
                    defaultValue={editingObj?.name}
                    name="name"
                    ref={register({ required: true })}
                />
            </div>
            {isWorkspace ? null : (
                <>
                    {' '}
                    <div className={styles.fieldRow}>
                        <label className={styles.fieldKey}>Billing Email</label>
                        <Input
                            defaultValue={data?.project?.billing_email ?? ''}
                            placeholder={'Billing Email'}
                            type="email"
                            name="email"
                            ref={register({ required: true })}
                        />
                    </div>
                    <div className={commonStyles.errorMessage}>
                        {errors.email && 'Enter an email yo!'}
                    </div>
                </>
            )}
            <div className={styles.fieldRow}>
                <div className={styles.fieldKey} />
                <Button
                    trackingId={`${
                        isWorkspace ? 'Workspace' : 'Project'
                    }Update`}
                    htmlType="submit"
                    type="primary"
                    className={classNames(
                        commonStyles.submitButton,
                        styles.saveButton
                    )}
                >
                    {editProjectLoading || editWorkspaceLoading ? (
                        <CircularSpinner
                            style={{
                                fontSize: 18,
                                color: 'var(--text-primary-inverted)',
                            }}
                        />
                    ) : (
                        'Save'
                    )}
                </Button>
            </div>
        </form>
    );
};
