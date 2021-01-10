import React from 'react';
import commonStyles from '../../../Common.module.scss';
import styles from './DangerForm.module.scss';
import { useForm } from 'react-hook-form';
import classNames from 'classnames/bind';
import { gql, useQuery, useMutation } from '@apollo/client';
import { useParams, Redirect } from 'react-router-dom';
import { CircularSpinner } from '../../../components/Spinner/Spinner';
import { Skeleton } from 'antd';

type Inputs = {
    text: string;
};

export const DangerForm = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const { loading, data } = useQuery<
        { organization: { name: string } },
        { id: number }
    >(
        gql`
            query GetOrganization($id: ID!) {
                organization(id: $id) {
                    name
                }
            }
        `,
        { variables: { id: parseInt(organization_id) } }
    );
    const [
        deleteOrganization,
        { loading: deleteLoading, data: deleteData },
    ] = useMutation<{ deleteOrganization: boolean }, { id: number }>(
        gql`
            mutation DeleteOrganization($id: ID!) {
                deleteOrganization(id: $id)
            }
        `,
        { refetchQueries: ['GetOrganizations'] }
    );
    const { register, handleSubmit, errors } = useForm<Inputs>();
    const onSubmit = () => {
        deleteOrganization({ variables: { id: parseInt(organization_id) } });
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
                        {`${data?.organization.name}`}' to confirm.
                    </div>
                        <div className={styles.dangerRow}>
                            <input
                                placeholder={`Please type '${data?.organization.name}'`}
                                className={commonStyles.input}
                                name="text"
                                ref={register({
                                    required: true,
                                    validate: (value) =>
                                        value === data?.organization.name,
                                })}
                            />
                            <button
                                className={classNames(
                                    commonStyles.submitButton,
                                    styles.deleteButton
                                )}
                            >
                                {deleteLoading ? (
                                    <CircularSpinner
                                        style={{ fontSize: 18, color: 'white' }}
                                    />
                                ) : (
                                        'Delete'
                                    )}
                            </button>
                            <div className={commonStyles.errorMessage}>
                                {errors.text && 'Entered the incorrect text!'}
                            </div>
                        </div>
                    </>
                )}
        </form>
    );
};
