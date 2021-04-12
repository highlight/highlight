import React from 'react';
import { auth } from '../../util/auth';
import { client } from '../../util/graph';
import PrimaryButton from '../Button/PrimaryButton/PrimaryButton';
import SecondaryButton from '../Button/SecondaryButton/SecondaryButton';

import styles from './ErrorState.module.scss';

export const ErrorState = ({ message }: { message: string }) => {
    return (
        <div className={styles.errorWrapper}>
            <div className={styles.errorContent}>
                <h2 className={styles.errorTitle}>Woops, something's wrong!</h2>
                <p className={styles.errorBody}>{message}</p>
                <a href={'https://app.highlight.run'}>
                    <PrimaryButton>Go to my Account</PrimaryButton>
                </a>
                <SecondaryButton
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
                </SecondaryButton>
            </div>
        </div>
    );
};
