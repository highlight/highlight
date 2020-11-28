import React, { useEffect } from 'react';

import { useForm } from 'react-hook-form';

import styles from './FieldsForm.module.css';
import commonStyles from '../../../Common.module.css';
import classNames from 'classnames/bind';
import { useMutation, gql } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { CircularSpinner } from '../../../components/Spinner/Spinner';

type Inputs = {
    name: string;
    email: string;
};

export const FieldsForm = () => {
    const { organization_id } = useParams();
    const { register, handleSubmit, errors } = useForm<Inputs>();
    const [editOrganization, { loading, data }] = useMutation<
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

    useEffect(() => {
        editOrganization({ variables: { id: organization_id } });
    }, [editOrganization, organization_id]);

    const onSubmit = (inputs: Inputs) => {
        editOrganization({
            variables: {
                id: organization_id,
                name: inputs.name,
                billing_email: inputs.email,
            },
        });
    };
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.fieldRow}>
                <div className={styles.fieldKey}>Name</div>
                <input
                    defaultValue={data?.editOrganization.name}
                    className={commonStyles.input}
                    name="name"
                    ref={register({ required: true })}
                />
            </div>
            <div className={styles.fieldRow}>
                <div className={styles.fieldKey}>Billing Email</div>
                <input
                    defaultValue={data?.editOrganization.billing_email}
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
                    {loading ? (
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
