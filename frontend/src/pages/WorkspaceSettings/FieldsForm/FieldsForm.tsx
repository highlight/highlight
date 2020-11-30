import React, { useEffect } from 'react';

import { useForm } from 'react-hook-form';

import styles from './FieldsForm.module.css';
import commonStyles from '../../../Common.module.css';
import classNames from 'classnames/bind';
import { useMutation, gql, useQuery } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { CircularSpinner } from '../../../components/Spinner/Spinner';
import { message } from 'antd';

type Inputs = {
    name: string;
    email: string;
};

export const FieldsForm = () => {
    const { organization_id } = useParams();
    const { register, handleSubmit, errors } = useForm<Inputs>();
    const { loading, data } = useQuery<
        { organization: { name: string; billing_email: string } },
        { id: number }
    >(
        gql`
            query GetOrganization($id: ID!) {
                organization(id: $id) {
                    name
                    billing_email
                }
            }
        `,
        { variables: { id: organization_id } }
    );
    const [
        editOrganization,
        { data: editData, loading: editLoading },
    ] = useMutation<
        { editOrganization: { billing_email: string; name: string } },
        { id: number; name?: string; billing_email?: string }
    >(
        gql`
            mutation EditOrganization(
                $id: ID!
                $name: String
                $billing_email: String
            ) {
                editOrganization(
                    id: $id
                    name: $name
                    billing_email: $billing_email
                ) {
                    name
                    billing_email
                }
            }
        `,
        { refetchQueries: ['GetOrganizations', 'GetOrganization'] }
    );

    const onSubmit = (inputs: Inputs) => {
        editOrganization({
            variables: {
                id: organization_id,
                name: inputs.name,
                billing_email: inputs.email,
            },
        }).then(() => {
            message.success('Updated workspace fields!', 5);
        });
    };
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.fieldRow}>
                <div className={styles.fieldKey}>Name</div>
                <input
                    defaultValue={
                        editData?.editOrganization.name ||
                        data?.organization.name
                    }
                    className={commonStyles.input}
                    name="name"
                    ref={register({ required: true })}
                />
            </div>
            <div className={styles.fieldRow}>
                <div className={styles.fieldKey}>Billing Email</div>
                <input
                    defaultValue={
                        editData?.editOrganization.billing_email ||
                        data?.organization.billing_email
                    }
                    className={commonStyles.input}
                    placeholder={'Billing Email'}
                    type="email"
                    name="email"
                    ref={register({ required: true })}
                />
            </div>
            <div className={commonStyles.errorMessage}>
                {errors.email && 'Enter an email yo!'}
            </div>
            <div className={styles.fieldRow}>
                <div className={styles.fieldKey} />
                <button
                    type="submit"
                    className={classNames(
                        commonStyles.submitButton,
                        styles.saveButton
                    )}
                >
                    {editLoading ? (
                        <CircularSpinner
                            style={{ fontSize: 18, color: 'white' }}
                        />
                    ) : (
                        'Save'
                    )}
                </button>
            </div>
        </form>
    );
};
