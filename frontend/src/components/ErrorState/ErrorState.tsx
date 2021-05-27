import React, { useState } from 'react';

import { auth } from '../../util/auth';
import { client } from '../../util/graph';
import Button from '../Button/Button/Button';
import ElevatedCard from '../ElevatedCard/ElevatedCard';
import styles from './ErrorState.module.scss';

export const ErrorState = ({
    message,
    errorString,
}: {
    message: string;
    errorString: string;
}) => {
    const [showError, setShowError] = useState(false);
    return (
        <div className={styles.errorWrapper}>
            <ElevatedCard title="Woops, something's wrong!">
                <p className={styles.errorBody}>
                    {message}
                    <span
                        className={styles.expandButton}
                        onClick={() => setShowError((t) => !t)}
                    >
                        {showError ? 'show less' : 'show more'}
                    </span>
                </p>
                {showError && (
                    <code className={styles.errorBody}>{errorString}</code>
                )}
                <div className={styles.buttonGroup}>
                    <a href={'https://app.highlight.run'}>
                        <Button type="primary">Go to my Account</Button>
                    </a>
                    <Button
                        style={{ marginLeft: 10 }}
                        onClick={async () => {
                            try {
                                auth.signOut();
                            } catch (e) {
                                console.log(e);
                            }
                            client.cache.reset();
                        }}
                    >
                        Login as a different User
                    </Button>
                </div>
            </ElevatedCard>
        </div>
    );
};
