import React, { useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { useMutation, gql } from '@apollo/client';
import { useForm } from 'react-hook-form';
import { CircularSpinner } from '../../components/Spinner/Spinner';
import { client } from '../../util/graph';

import styles from './NewWorkspace.module.css';
import commonStyles from '../../Common.module.css';

type Inputs = {
    name: string;
};

export const NewWorkspacePage = () => {
    const { register, handleSubmit, errors, setError } = useForm<Inputs>();
    const [createOrganization, { loading, data, error }] = useMutation<
        { createOrganization: { id: number; name: string } },
        { name: string }
    >(
        gql`
            mutation CreateOrganization($name: String!) {
                createOrganization(name: $name) {
                    id
                    name
                }
            }
        `
    );

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

    if (data?.createOrganization.id) {
        return <Redirect to={`/${data.createOrganization.id}/setup`} />;
    }

    return (
        <div className={styles.boxWrapper}>
            <div className={styles.box}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className={styles.title}>Create a Workspace</div>
                    <div className={styles.subTitle}>
                        Enter the name of your workspace and you'll be good to
                        go!
                    </div>
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
                    <button className={commonStyles.submitButton} type="submit">
                        {loading ? (
                            <CircularSpinner
                                style={{ fontSize: 18, color: 'white' }}
                            />
                        ) : (
                            'Create Workspace'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};
