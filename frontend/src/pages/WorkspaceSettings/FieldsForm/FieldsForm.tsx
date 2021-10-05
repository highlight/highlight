import { useEditProjectMutation, useGetProjectQuery } from '@graph/hooks';
import { namedOperations } from '@graph/operations';
import { useParams } from '@util/react-router/useParams';
import { message } from 'antd';
import classNames from 'classnames/bind';
import React from 'react';
import { useForm } from 'react-hook-form';

import commonStyles from '../../../Common.module.scss';
import Button from '../../../components/Button/Button/Button';
import { CircularSpinner } from '../../../components/Loading/Loading';
import styles from './FieldsForm.module.scss';

type Inputs = {
    name: string;
    email: string;
};

export const FieldsForm = () => {
    const { project_id } = useParams<{ project_id: string }>();
    const { register, handleSubmit, errors } = useForm<Inputs>();
    const { data } = useGetProjectQuery({
        variables: { id: project_id },
    });
    const [
        editProject,
        { data: editData, loading: editLoading },
    ] = useEditProjectMutation({
        refetchQueries: [
            namedOperations.Query.GetProjects,
            namedOperations.Query.GetProject,
        ],
    });

    const onSubmit = (inputs: Inputs) => {
        editProject({
            variables: {
                id: project_id,
                name: inputs.name,
                billing_email: inputs.email,
            },
        }).then(() => {
            message.success('Updated project fields!', 5);
        });
    };
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.fieldRow}>
                <label className={styles.fieldKey}>Name</label>
                <input
                    defaultValue={
                        editData?.editProject?.name || data?.project?.name
                    }
                    className={commonStyles.input}
                    name="name"
                    ref={register({ required: true })}
                />
            </div>
            <div className={styles.fieldRow}>
                <label className={styles.fieldKey}>Billing Email</label>
                <input
                    defaultValue={
                        (editData?.editProject?.billing_email ||
                            data?.project?.billing_email) ??
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
                <Button
                    trackingId="ProjectUpdate"
                    htmlType="submit"
                    type="primary"
                    className={classNames(
                        commonStyles.submitButton,
                        styles.saveButton
                    )}
                >
                    {editLoading ? (
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
