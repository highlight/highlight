import React from 'react';
import commonStyles from '../../../Common.module.scss';
import styles from './DangerForm.module.scss';
import { useForm } from 'react-hook-form';
import classNames from 'classnames/bind';
import { useParams, Redirect } from 'react-router-dom';
import { CircularSpinner } from '../../../components/Loading/Loading';
import { Skeleton } from 'antd';
import {
    useDeleteOrganizationMutation,
    useGetOrganizationQuery,
} from '../../../graph/generated/hooks';
import Button from '../../../components/Button/Button/Button';

type Inputs = {
    text: string;
};

export const DangerForm = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const { loading, data } = useGetOrganizationQuery({
        variables: { id: organization_id },
    });

    const [
        deleteOrganization,
        { loading: deleteLoading, data: deleteData },
    ] = useDeleteOrganizationMutation({ refetchQueries: ['GetOrganizations'] });

    const { register, handleSubmit, errors } = useForm<Inputs>();
    const onSubmit = () => {
        deleteOrganization({ variables: { id: organization_id } });
    };
    if (deleteData?.deleteOrganization) {
        return <Redirect to={`/`} />;
    }
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            {loading ? (
                <Skeleton />
            ) : (
                <>
                    <div className={styles.dangerSubTitle}>
                        This will immediately remove all team members and
                        projects, and cancel your subscription. Please type '
                        {`${data?.organization?.name}`}' to confirm.
                    </div>
                    <div className={styles.dangerRow}>
                        <input
                            placeholder={`Please type '${data?.organization?.name}'`}
                            className={commonStyles.input}
                            name="text"
                            ref={register({
                                required: true,
                                validate: (value) =>
                                    value === data?.organization?.name,
                            })}
                        />
                        <Button
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
