import React, { useState } from 'react';
import { Button } from 'antd';
import styles from './ErrorsPage.module.scss';
import { ErrorFeed } from './ErrorFeed/ErrorFeed';
import {
    SearchContext,
    SearchParams,
} from '../Sessions/SearchContext/SearchContext';
import { ErrorSearchSidebar } from './ErrorSearchSidebar/ErrorSearchSidebar';
import { ErrorSegmentSidebar } from './ErrorSegmentSidebar/ErrorSegmentSidebar';

export const ErrorsPage = () => {
    const [segmentName, setSegmentName] = useState<string | null>(null);
    const [searchParams, setSearchParams] = useState<SearchParams>({
        user_properties: [],
        identified: false,
    });
    const [existingParams, setExistingParams] = useState<SearchParams>({
        user_properties: [],
        identified: false,
    });
    const throwError = (): void => {
        throw new Error('This error is from a throw');
    };

    const consoleError = (): void => {
        console.error('This error was from the console');
    };

    return (
        <SearchContext.Provider
            value={{
                searchParams,
                setSearchParams,
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
        </SearchContext.Provider>
    );
};
