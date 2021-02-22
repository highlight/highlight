import React from 'react';
import { useParams } from 'react-router-dom';
import { Button } from 'antd';
import styles from './ErrorsPage.module.scss';
import { useGetErrorsQuery } from '../../graph/generated/hooks';

export const ErrorsPage = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const { data } = useGetErrorsQuery({
        variables: { organization_id: organization_id },
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
                {data?.errors?.map((u, index) => (
                    <div key={index}>
                        <p>{u?.event}</p>
                        <p>{u?.column_number}</p>
                        <p>
                            {u?.trace?.map((t, i) => (
                                <p key={i}>JSON.stringify(t)</p>
                            ))}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};
