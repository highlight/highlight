import React from 'react';
import { Button } from 'antd';
import styles from './ErrorsPage.module.scss';
import { ErrorFeed } from './ErrorFeed/ErrorFeed';

export const ErrorsPage = () => {
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
                <div className={styles.errorsSection}>
                    <ErrorFeed />
                </div>
            </div>
        </div>
    );
};
