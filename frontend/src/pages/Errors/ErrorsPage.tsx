import React, { useState } from 'react';
import { Button } from 'antd';
import styles from './ErrorsPage.module.scss';
import { ErrorFeed } from './ErrorFeed/ErrorFeed';
import {
    ErrorSearchContext,
    ErrorSearchParams,
} from './ErrorSearchContext/ErrorSearchContext';
import { ErrorSearchSidebar } from './ErrorSearchSidebar/ErrorSearchSidebar';
import { ErrorSegmentSidebar } from './ErrorSegmentSidebar/ErrorSegmentSidebar';

export const ErrorsPage = () => {
    const [segmentName, setSegmentName] = useState<string | null>(null);
    const [
        errorSearchParams,
        setErrorSearchParams,
    ] = useState<ErrorSearchParams>({});
    const [existingParams, setExistingParams] = useState<ErrorSearchParams>({});
    const throwError = (): void => {
        throw new Error('This error is from a throw');
    };

    const consoleError = (): void => {
        console.error('This error was from the console');
    };

    return (
        <ErrorSearchContext.Provider
            value={{
                errorSearchParams,
                setErrorSearchParams,
                existingParams,
                setExistingParams,
                segmentName,
                setSegmentName,
            }}
        >
            <div className={styles.errorsBody}>
                <div className={styles.leftPanel}>
                    <ErrorSegmentSidebar />
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
                <div className={styles.rightPanel}>
                    <ErrorSearchSidebar />
                </div>
            </div>
        </ErrorSearchContext.Provider>
    );
};
