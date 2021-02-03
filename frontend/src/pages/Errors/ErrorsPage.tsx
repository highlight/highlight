import React from 'react';
import { useParams } from 'react-router-dom';
import { Button } from 'antd';
import styles from './ErrorsPage.module.scss';
import { useErrorsQuery } from '../../graph/generated/hooks';

export const ErrorsPage = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const { data } = useErrorsQuery({
        variables: { organization_id: organization_id },
        pollInterval: 5000,
    });

    const throwError = (): void => {
        throw new Error('This error is from a throw');
    };

    const consoleError = (): void => {
        console.error('This error was from the console');
    };

    return (
        <div>
            <div className={styles.advancedText}>
                <Button type="primary" onClick={throwError}>
                    Throw Error
                </Button>
                <Button type="primary" onClick={consoleError}>
                    Console Error
                </Button>
            </div>
            <div className={styles.errorText}>
                {data?.errors?.map((u) => {
                    return <p>{JSON.stringify(u)}</p>;
                })}
            </div>
        </div>
    );
};
