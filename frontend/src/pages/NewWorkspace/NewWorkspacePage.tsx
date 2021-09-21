import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Redirect } from 'react-router-dom';

import commonStyles from '../../Common.module.scss';
import Button from '../../components/Button/Button/Button';
import { CircularSpinner } from '../../components/Loading/Loading';
import { useCreateOrganizationMutation } from '../../graph/generated/hooks';
import { client } from '../../util/graph';
import styles from './NewWorkspace.module.scss';

type Inputs = {
    name: string;
};

const NewWorkspacePage = () => {
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
                <h2 className={styles.title}>Create a Project</h2>
                <p className={styles.subTitle}>
                    Enter the name of your project and you'll be good to go!
                </p>
                <input
                    placeholder={'Workspace Name'}
                    name="name"
                    ref={register({ required: true })}
                    className={commonStyles.input}
                />
                <div className={commonStyles.errorMessage}>
                    {errors.name &&
                        'Error with project name ' + errors.name.message}
                </div>
                <Button
                    trackingId="CreateProject"
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
                        'Create Project'
                    )}
                </Button>
            </form>
        </div>
    );
};

export default NewWorkspacePage;
