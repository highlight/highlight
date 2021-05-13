import React, { useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { CircularSpinner } from '../../components/Loading/Loading';
import { client } from '../../util/graph';

import styles from './NewWorkspace.module.scss';
import commonStyles from '../../Common.module.scss';
import { useCreateOrganizationMutation } from '../../graph/generated/hooks';
import Button from '../../components/Button/Button/Button';

type Inputs = {
    name: string;
};

export const NewWorkspacePage = () => {
    const { register, handleSubmit, errors, setError } = useForm<Inputs>();
    const [
        createOrganization,
        { loading, data, error },
    ] = useCreateOrganizationMutation();

    useEffect(() => {
        if (error) {
            setError('name', {
                type: 'request error',
                message: error?.message,
            });
        }
    }, [setError, error]);

    const onSubmit = (data: Inputs) => {
        createOrganization({ variables: { name: data.name } }).then(() =>
            client.cache.reset()
        );
    };

    if (data?.createOrganization?.id) {
        return <Redirect to={`/${data.createOrganization.id}/setup`} />;
    }

    return (
        <div className={styles.box}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <h2 className={styles.title}>Create a Workspace</h2>
                <p className={styles.subTitle}>
                    Enter the name of your workspace and you'll be good to go!
                </p>
                <input
                    placeholder={'Workspace Name'}
                    name="name"
                    ref={register({ required: true })}
                    className={commonStyles.input}
                />
                <div className={commonStyles.errorMessage}>
                    {errors.name &&
                        'Error with workspace name ' + errors.name.message}
                </div>
                <Button
                    type="primary"
                    className={commonStyles.submitButton}
                    htmlType="submit"
                >
                    {loading ? (
                        <CircularSpinner
                            style={{
                                fontSize: 18,
                                color: 'var(--text-primary-inverted)',
                            }}
                        />
                    ) : (
                        'Create Workspace'
                    )}
                </Button>
            </form>
        </div>
    );
};
