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
        <div className={styles.errorsBody}>
            <div className={styles.leftPanel}>
                <div className={styles.advancedText}>
                    <Button
                        type="primary"
                        style={{ background: 'red' }}
                        onClick={throwError}
                    >
                        Throw Error
                    </Button>{' '}
                    <br></br>
                    <Button
                        type="primary"
                        style={{ background: 'green' }}
                        onClick={consoleError}
                    >
                        Console Error
                    </Button>{' '}
                </div>
            </div>
            <div className={styles.centerPanel}>
                {data?.errors?.map((u, index) => {
                    return <p key={index}>{JSON.stringify(u)}</p>;
                })}
            </div>
        </div>
    );
};
