import { namedOperations } from '@graph/operations';
import { useParams } from '@util/react-router/useParams';
import { Skeleton } from 'antd';
import classNames from 'classnames/bind';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Redirect } from 'react-router-dom';

import commonStyles from '../../../Common.module.scss';
import Button from '../../../components/Button/Button/Button';
import { CircularSpinner } from '../../../components/Loading/Loading';
import {
    useDeleteProjectMutation,
    useGetProjectQuery,
} from '../../../graph/generated/hooks';
import styles from './DangerForm.module.scss';

type Inputs = {
    text: string;
};

export const DangerForm = () => {
    const { project_id } = useParams<{ project_id: string }>();
    const { loading, data } = useGetProjectQuery({
        variables: { id: project_id },
    });

    const [
        deleteProject,
        { loading: deleteLoading, data: deleteData },
    ] = useDeleteProjectMutation({
        refetchQueries: [namedOperations.Query.GetProjects],
    });

    const { register, handleSubmit, errors } = useForm<Inputs>();
    const onSubmit = () => {
        deleteProject({ variables: { id: project_id } });
    };
    if (deleteData?.deleteProject) {
        return <Redirect to={`/`} />;
    }
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
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
                        <input
                            placeholder={`Please type '${data?.project?.name}'`}
                            className={commonStyles.input}
                            name="text"
                            ref={register({
                                required: true,
                                validate: (value) =>
                                    value === data?.project?.name,
                            })}
                        />
                        <Button
                            trackingId="DeleteWorkspace"
                            danger
                            type="primary"
                            className={classNames(
                                commonStyles.submitButton,
                                styles.deleteButton
                            )}
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
                        <div className={commonStyles.errorMessage}>
                            {errors.text && 'Entered the incorrect text!'}
                        </div>
                    </div>
                </>
            )}
        </form>
    );
};
