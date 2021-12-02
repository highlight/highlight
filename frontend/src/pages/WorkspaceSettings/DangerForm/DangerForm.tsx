import Input from '@components/Input/Input';
import { namedOperations } from '@graph/operations';
import { useParams } from '@util/react-router/useParams';
import { Skeleton } from 'antd';
import classNames from 'classnames/bind';
import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';

import commonStyles from '../../../Common.module.scss';
import Button from '../../../components/Button/Button/Button';
import { CircularSpinner } from '../../../components/Loading/Loading';
import {
    useDeleteProjectMutation,
    useGetProjectQuery,
} from '../../../graph/generated/hooks';
import styles from './DangerForm.module.scss';

export const DangerForm = () => {
    const { project_id } = useParams<{ project_id: string }>();
    const { loading, data } = useGetProjectQuery({
        variables: { id: project_id },
    });
    const [confirmationText, setConfirmationText] = useState('');

    const [
        deleteProject,
        { loading: deleteLoading, data: deleteData },
    ] = useDeleteProjectMutation({
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
        <form onSubmit={onSubmit}>
            {loading ? (
                <Skeleton />
            ) : (
                <>
                    <p className={styles.dangerSubTitle}>
                        This will immediately remove all team members and
                        projects, and cancel your subscription. Please type '
                        {`${data?.project?.name}`}' to confirm.
                    </p>
                    <div className={styles.dangerRow}>
                        <Input
                            placeholder={`Please type '${data?.project?.name}'`}
                            name="text"
                            value={confirmationText}
                            onChange={(e) => {
                                setConfirmationText(e.target.value);
                            }}
                        />
                        <Button
                            trackingId="DeleteWorkspace"
                            danger
                            type="primary"
                            className={classNames(
                                commonStyles.submitButton,
                                styles.deleteButton
                            )}
                            disabled={confirmationText !== data?.project?.name}
                        >
                            {deleteLoading ? (
                                <CircularSpinner
                                    style={{
                                        fontSize: 18,
                                        color: 'var(--text-primary-inverted)',
                                    }}
                                />
                            ) : (
                                'Delete'
                            )}
                        </Button>
                    </div>
                </>
            )}
        </form>
    );
};
