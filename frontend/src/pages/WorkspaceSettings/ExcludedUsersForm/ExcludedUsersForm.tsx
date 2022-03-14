import {
    useEditProjectMutation,
    useEditWorkspaceMutation,
    useGetProjectOrWorkspaceQuery,
} from '@graph/hooks';
import { namedOperations } from '@graph/operations';
import { useParams } from '@util/react-router/useParams';
import { Form, message, Select } from 'antd';
import classNames from 'classnames/bind';
import React, { useEffect, useState } from 'react';

import commonStyles from '../../../Common.module.scss';
import Button from '../../../components/Button/Button/Button';
import {
    CircularSpinner,
    LoadingBar,
} from '../../../components/Loading/Loading';
import styles from './ExcludedUsersForm.module.scss';

export const ExcludedUsersForm = () => {
    const { project_id, workspace_id } = useParams<{
        project_id: string;
        workspace_id: string;
    }>();
    const isWorkspace = !!workspace_id;
    const [excludedUsers, setExcludedUsers] = useState<string[]>([]);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
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

    const onSubmit = (e: { preventDefault: () => void }) => {
        e.preventDefault();
        editProject({
            variables: {
                id: project_id,
                name,
                billing_email: email,
            },
        }).then(() => {
            message.success('Updated project fields!', 5);
        });
    };

    const editingObj = isWorkspace ? data?.workspace : data?.project;

    useEffect(() => {
        if (!loading) {
            setName(editingObj?.name || '');
            setEmail(data?.project?.billing_email || '');
        }
    }, [data?.project?.billing_email, editingObj?.name, loading]);

    if (loading) {
        return <LoadingBar />;
    }

    return (
        <form onSubmit={onSubmit} key={project_id}>
            <p>
                Pick user identifiers to exclude from Highlight (regular
                expressions are accepted). Sessions from these users will be
                discarded once recorded.
            </p>
            <Form.Item name={'excludedusers'}>
                <Select
                    // className={styles.channelSelect}
                    mode="tags"
                    placeholder={`User identifiers that .`}
                    onChange={(excluded: string[]) =>
                        setExcludedUsers(excluded)
                    }
                />
            </Form.Item>
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
