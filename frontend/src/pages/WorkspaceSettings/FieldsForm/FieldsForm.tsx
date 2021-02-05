import React from 'react';

import { useForm } from 'react-hook-form';

import styles from './FieldsForm.module.scss';
import commonStyles from '../../../Common.module.scss';
import classNames from 'classnames/bind';
import { useParams } from 'react-router-dom';
import { CircularSpinner } from '../../../components/Spinner/Spinner';
import { message } from 'antd';
import {
    useEditOrganizationMutation,
    useGetOrganizationQuery,
} from '../../../graph/generated/hooks';

type Inputs = {
    name: string;
    email: string;
};

export const FieldsForm = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const { register, handleSubmit, errors } = useForm<Inputs>();
    const { data } = useGetOrganizationQuery({
        variables: { id: organization_id },
    });
    const [
        editOrganization,
        { data: editData, loading: editLoading },
    ] = useEditOrganizationMutation({
        refetchQueries: ['GetOrganizations', 'GetOrganization'],
    });

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
                        editData?.editOrganization?.name ||
                        data?.organization?.name
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
                        (editData?.editOrganization?.billing_email ||
                            data?.organization?.billing_email) ??
                        ''
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
