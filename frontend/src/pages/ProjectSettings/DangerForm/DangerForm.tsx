import { FieldsBox } from '@components/FieldsBox/FieldsBox';
import Input from '@components/Input/Input';
import { useDeleteProjectMutation, useGetProjectQuery } from '@graph/hooks';
import { namedOperations } from '@graph/operations';
import { FieldsForm } from '@pages/WorkspaceSettings/FieldsForm/FieldsForm';
import { useParams } from '@util/react-router/useParams';
import { Skeleton } from 'antd';
import classNames from 'classnames/bind';
import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';

import commonStyles from '../../../Common.module.scss';
import Button from '../../../components/Button/Button/Button';
import styles from './DangerForm.module.scss';

export const DangerForm = () => {
    const { project_id } = useParams<{ project_id: string }>();
    const { loading, data } = useGetProjectQuery({
        variables: { id: project_id },
    });
    const [confirmationText, setConfirmationText] = useState('');

    const [deleteProject, { loading: deleteLoading, data: deleteData }] =
        useDeleteProjectMutation({
            refetchQueries: [namedOperations.Query.GetProjects],
        });

    const onSubmit = (e: { preventDefault: () => void }) => {
        e.preventDefault();
        deleteProject({ variables: { id: project_id } });
    };
    if (deleteData?.deleteProject) {
        return <Redirect to={`/`} />;
    }
    return (
        <>
            <FieldsBox id={'project'}>
                <h3>Project Properties</h3>
                <FieldsForm />
            </FieldsBox>
            <FieldsBox id={'danger'}>
                <h3>Danger Zone</h3>

                <form onSubmit={onSubmit}>
                    {loading ? (
                        <Skeleton />
                    ) : (
                        <>
                            <p className={styles.dangerSubTitle}>
                                This will immediately delete all session and
                                errors in this project. Please type '
                                {`${data?.project?.name}`}' to confirm.
                            </p>
                            <div className={styles.dangerRow}>
                                <Input
                                    placeholder={`${data?.project?.name}`}
                                    name="text"
                                    value={confirmationText}
                                    onChange={(e) => {
                                        setConfirmationText(e.target.value);
                                    }}
                                />
                                <Button
                                    trackingId="DeleteProject"
                                    danger
                                    type="primary"
                                    className={classNames(
                                        commonStyles.submitButton,
                                        styles.deleteButton
                                    )}
                                    disabled={
                                        confirmationText !== data?.project?.name
                                    }
                                    htmlType="submit"
                                    loading={deleteLoading}
                                >
                                    Delete
                                </Button>
                            </div>
                        </>
                    )}
                </form>
            </FieldsBox>
        </>
    );
};
